# Page Object Model (POM)

This guide describes how the Page Object Model is used in the Cypress acceptance tests of this project.

Read this file whenever you create or modify acceptance tests that interact with a specific page or shared UI region.

## What POM is and why we use it

The Page Object Model is a pattern that separates **where and how** you interact with the UI from **what** you assert about it.

Without POM, every spec file contains raw `cy.get()` selectors scattered across it. When a selector changes, every test that references it must be updated.

With POM, a page object owns all selectors and interaction methods for a page or component. Tests only call those methods. When a selector changes, you update one place.

Benefits in this project:

- Selector changes require edits in one file, not many spec files.
- Test intent is expressed through named methods, not CSS selectors.
- Shared UI regions such as the header are encapsulated in one object and reused across all page objects.

## Directory structure

Page objects live under `tests/pages/`:

```text
tests/
  pages/
    BasePage.js     # Shared navigation helpers; extended by all page objects
    HeaderPage.js   # Global header; composed into page objects as this.header
    HomePage.js     # Homepage (locale root)
```

Page objects are plain JavaScript classes. There are no framework dependencies beyond the globally available `cy` object provided by Cypress.

## Base classes and composition

### BasePage

All page objects extend `BasePage`. It provides:

| Method | Description |
|---|---|
| `visit()` | Navigate using `cy.visitLocale(locale, path)` |
| `assertLocaleInUrl()` | Assert the locale prefix is in the current URL |
| `assertMainExists()` | Assert the `<main>` landmark is present |

```js
export class BasePage {
  constructor(locale, path) {
    this.locale = locale;
    this.path = path;
  }

  visit() {
    cy.visitLocale(this.locale, this.path);
    return this;
  }
}
```

### HeaderPage

`HeaderPage` encapsulates the global site header. Because the header is shared across all pages, it is **composed** into page objects as `this.header` rather than inherited.

```js
// Inside HomePage constructor:
this.header = new HeaderPage();

// In a spec:
home.header.assertVisible();
home.header.assertLanguageSwitcherExists();
```

Add new header selectors and assertion methods to `HeaderPage.js` when you need to test additional header behaviour.

### Page-specific objects

Each route gets its own page object that extends `BasePage`.

```js
import { BasePage } from './BasePage.js';
import { HeaderPage } from './HeaderPage.js';

export class MoviesPage extends BasePage {
  constructor(locale) {
    super(locale, '/movies');
    this.header = new HeaderPage();
  }

  get movieCards() {
    return cy.get('[data-testid="media-card"]');
  }

  assertMovieCardsExist() {
    this.movieCards.should('have.length.greaterThan', 0);
    return this;
  }
}
```

## Using page objects in spec files

Import the page object, instantiate it in `beforeEach`, and call its methods in each `it` block.

```js
import { HomePage } from '../../pages/HomePage.js';

describe('Navigation', () => {
  const locale = Cypress.env('DEFAULT_LOCALE') ?? 'en-US';
  let home;

  beforeEach(() => {
    home = new HomePage(locale);
    home.visit();
  });

  it('loads the homepage without errors', () => {
    home.assertMainExists();
  });

  it('displays a visible header', () => {
    home.header.assertVisible();
  });
});
```

## Naming conventions

| Item | Convention | Example |
|---|---|---|
| Class name | PascalCase, `Page` suffix | `HomePage`, `MoviesPage` |
| File name | matches class name | `HomePage.js` |
| Element getter | noun, returns `Cypress.Chainable` | `get movieCards()` |
| Assertion method | starts with `assert` | `assertMovieCardsExist()` |
| Action method | starts with a verb | `openLanguageSwitcher()` |
| Method return | return `this` for chainability | `home.visit().assertMainExists()` |

## What belongs in a page object

**Put in the page object:**

- Element getters (`get root()`, `get movieCards()`)
- Assertion methods (`assertVisible()`, `assertCardsExist()`)
- Action methods (`openLanguageSwitcher()`, `clickFirstCard()`)
- Navigation methods (via `visit()` inherited from `BasePage`)

**Do not put in the page object:**

- `describe` or `it` blocks — those stay in spec files
- Test data or fixtures — those live in `tests/fixtures/`
- Assertions about business logic that is better verified at integration level

## Selectors

Use selectors in this priority order:

1. `data-testid` attributes — most stable, unaffected by style or copy changes
2. ARIA roles and accessible names — e.g. `cy.findByRole('button', { name: /search/i })`
3. Visible text via `cy.contains()` — stable as long as copy does not change
4. CSS class or tag selectors — last resort; fragile when styles are refactored

Never use `:nth-child()` or index-based selectors in page objects.

## Adding a new page object

1. Create `tests/pages/<Name>Page.js`.
2. Extend `BasePage` with the correct `locale` and `path`.
3. Compose `HeaderPage` as `this.header` if the page includes the global header.
4. Add element getters and methods for the features you need to test.
5. Import and instantiate the page object in your spec file.
6. Update this document if you introduce a new pattern.
