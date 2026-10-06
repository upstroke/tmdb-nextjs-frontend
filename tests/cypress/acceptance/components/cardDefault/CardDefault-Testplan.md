# CardDefault Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** CardDefault (Movie/TV Show Card)
- **Version:** 1.0
- **Date:** 2026-10-06
- **Test Type:** Acceptance Testing (Cypress E2E)

### 2. Introduction

The purpose of this test plan is to validate the CardDefault component from a user's perspective. The tests ensure that movie and TV show cards render correctly with proper title, rating, and poster display, including edge cases like missing posters and null ratings.

### 3. Test Items

- `CardDefault.jsx` — Reusable card component for movies and TV shows
- Title display (movie.title vs tv.name)
- Rating display (vote_average with N/A fallback)
- Poster image rendering
- Missing poster placeholder
- Null/undefined rating handling
- Card click interaction

### 4. Features to be tested

- Movie card renders with correct title from fixture data
- TV show card renders with correct name from fixture data
- Rating displays vote_average value correctly
- Missing poster (poster_path: null) shows placeholder styling
- Null rating displays "N/A" fallback text
- Card is clickable (navigation trigger)
- Component mounts successfully with both 'movie' and 'tv' type props

### 5. Features not to be tested

- Detailed styling and CSS classes are covered by visual regression tests
- Navigation routing logic is covered by e2e tests
- TMDB API data fetching is covered by integration tests
- Responsive behavior is covered by separate viewport tests
- ARIA attributes are covered by accessibility tests

### 6. Approach

- **Tool:** Cypress E2E Testing
- **Syntax:** Mocha/Chai
- **Navigation:** `cy.visitWithLocale()` + `cy.interceptTmdb()`
- **Selectors:** Testing Library (`cy.findByTestId()`)
- **Test Design Technique:** Equivalence Partitioning & Boundary Value Analysis (ISTQB Black-Box)
- **Tags:** `@carddefault`, `@acceptance`, `@black-box`, `@regression`
- **Test File:** `tests/cypress/acceptance/components/cardDefault/cardDefault.spec.js`
- **POM File:** `tests/cypress/POM/CardDefault.js`

### 7. Item Pass/Fail Criteria

- **Pass:** All test steps are successful, no errors occur in the browser console, and the expected content is visible.
- **Fail:** At least one test step or assertion fails, or the component fails to mount.

---

## Decision Table (Test Coverage Matrix)

| Test Variant / Feature                        | Acceptance Test |
|-----------------------------------------------|-----------------|
| **Movie card renders title**                  | ✅ TC-CARD-001  |
| **TV show card renders name**                 | ✅ TC-CARD-002  |
| **Rating displays vote_average**              | ✅ TC-CARD-003  |
| **Missing poster shows placeholder**          | ✅ TC-CARD-004  |
| **Null rating displays N/A**                  | ✅ TC-CARD-005  |
| **Card is clickable**                         | ✅ TC-CARD-006  |

### Legend

| Symbol | Meaning                                            |
|--------|----------------------------------------------------|
| ✅     | Test case implemented or planned for this viewport |

### Rationale

- Title rendering validates the primary content display for both media types.
- Rating display with fallback ensures graceful degradation for incomplete data.
- Missing poster handling prevents broken image icons.
- Click interaction validates the card's primary user action.

---

## Derived Test Cases

### TC-CARD-001: Movie card renders title from fixture

**Feature:** F-CARD (CardDefault Component)  
**Module:** Acceptance Testing  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@carddefault`, `@acceptance`, `@black-box`, `@regression`

| Step | Action                                      | Expected Result                                         |
|------|---------------------------------------------|---------------------------------------------------------|
| 1    | Load fixture `tmdb_movies_popular.json`     | Fixture data is available                               |
| 2    | Mount CardDefault with first movie result   | Component mounts successfully                           |
| 3    | Verify title element                        | Title contains movie.title value                        |
| 4    | Verify rating element                       | Rating contains movie.vote_average value                |

### TC-CARD-002: TV show card renders name from fixture

**Feature:** F-CARD (CardDefault Component)  
**Module:** Acceptance Testing  
**Priority:** High  
**Type:** Functional (Black-Box)  
**Tags:** `@carddefault`, `@acceptance`, `@black-box`, `@regression`

| Step | Action                                      | Expected Result                                         |
|------|---------------------------------------------|---------------------------------------------------------|
| 1    | Load fixture `tmdb_tv_popular.json`         | Fixture data is available                               |
| 2    | Mount CardDefault with first TV result      | Component mounts successfully                           |
| 3    | Verify title element                        | Title contains tv.name value                            |

### TC-CARD-003: Rating displays vote_average correctly

**Feature:** F-CARD (CardDefault Component)  
**Module:** Acceptance Testing  
**Priority:** High  
**Type:** Functional (Black-Box)

| Step | Action                                      | Expected Result                                         |
|------|---------------------------------------------|---------------------------------------------------------|
| 1    | Load fixture `tmdb_movies_popular.json`     | Fixture data is available                               |
| 2    | Mount CardDefault with movie data           | Component mounts successfully                           |
| 3    | Verify rating element                       | Rating text contains the vote_average numeric value     |

### TC-CARD-004: Missing poster shows placeholder

**Feature:** F-CARD (CardDefault Component)  
**Module:** Acceptance Testing  
**Priority:** Medium  
**Type:** Functional (Black-Box)

| Step | Action                                                 | Expected Result                                 |
|------|--------------------------------------------------------|-------------------------------------------------|
| 1    | Load fixture `tmdb_movies_popular.json`                | Fixture data is available                       |
| 2    | Modify movie data: set poster_path to null             | Movie has no poster path                        |
| 3    | Mount CardDefault with modified movie data             | Component mounts successfully                   |
| 4    | Verify poster element                                  | Poster has class 'poster-placeholder'           |

### TC-CARD-005: Null rating displays N/A fallback

**Feature:** F-CARD (CardDefault Component)  
**Module:** Acceptance Testing  
**Priority:** Medium  
**Type:** Functional (Black-Box)

| Step | Action                                                 | Expected Result                                 |
|------|--------------------------------------------------------|-------------------------------------------------|
| 1    | Load fixture `tmdb_movies_popular.json`                | Fixture data is available                       |
| 2    | Modify movie data: set vote_average to null            | Movie has null rating                           |
| 3    | Mount CardDefault with modified movie data             | Component mounts successfully                   |
| 4    | Verify rating element                                  | Rating text contains "N/A"                      |

### TC-CARD-006: Card is clickable

**Feature:** F-CARD (CardDefault Component)  
**Module:** Acceptance Testing  
**Priority:** Medium  
**Type:** Functional (Black-Box)

| Step | Action                                                 | Expected Result                                 |
|------|--------------------------------------------------------|-------------------------------------------------|
| 1    | Load fixture `tmdb_movies_popular.json`                | Fixture data is available                       |
| 2    | Mount CardDefault with movie data                      | Component mounts successfully                   |
| 3    | Click on the card                                      | Click event is triggered                        |
| 4    | Verify card state                                      | Card responds to click interaction              |

---

## Gherkin User Stories

### Feature: CardDefault Component (F-CARD)

**As** a visitor of the TMDB website  
**I want** to see movie and TV show cards with proper information on the homepage  
**So that** I can identify and select content I'm interested in

Background:
  Given the TMDB API is mocked with fixture data
  And I am on the homepage

@TC-CARD-001
Scenario: Movie cards display title and rating on homepage
  Given I navigate to the homepage with locale "en-US"
  And the movie popular API returns fixture data
  When the homepage loads
  Then the first movie card should display the movie title
  And the first movie card should display the vote average

@TC-CARD-002
Scenario: TV show cards display name on homepage
  Given I navigate to the homepage with locale "en-US"
  And the TV popular API returns fixture data
  When the homepage loads
  Then the first TV show card should display the show name

@TC-CARD-003
Scenario: Cards handle missing poster gracefully
  Given the movie popular API returns data with null poster_path
  When the homepage loads
  Then the affected card should show a placeholder instead of broken image

@TC-CARD-004
Scenario: Cards handle null rating gracefully
  Given the movie popular API returns data with null vote_average
  When the homepage loads
  Then the affected card should display "N/A" for rating

@TC-CARD-005
Scenario: Clicking a card navigates to detail page
  Given I navigate to the homepage with locale "en-US"
  When I click on the first movie card
  Then I should be navigated to the movie detail page

---

## Test File Structure

```
tests/
├── cypress/
│   ├── acceptance/
│   │   └── components/
│   │       └── cardDefault/
│   │           ├── CardDefault-Testplan.md  # This test plan
│   │           └── cardDefault.spec.js      # Test implementation
│   └── POM/
│       └── CardDefault.js                   # Page Object Model
```
