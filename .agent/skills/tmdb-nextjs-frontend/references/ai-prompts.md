# AI collaboration reference

Use AI assistance to accelerate implementation, but retain human review and
control.

## Preferred workflow

1. Provide the agent with the task, relevant files, and expected behavior.
2. Ask for a concise implementation plan.
3. Review the plan against existing architecture and documentation.
4. Implement in small increments.
5. Ask for tests and validation commands.
6. Review the diff, run checks locally, and adapt the result to project style.

## Prompt patterns

For a feature:

> Implement [behavior] in [area]. Follow the existing patterns in [files].
> Add appropriate tests. Identify assumptions and required validation.

For a bug:

> Reproduce and explain the likely cause of [issue]. Add a regression test,
> then propose the smallest fix.

For refactoring:

> Refactor [area] without changing observable behavior. Preserve tests and
> explain any necessary test updates.

For accessibility:

> Review [component] for keyboard, semantic, focus, and screen-reader issues.
> Propose accessible improvements and tests.

## Guardrails

- Do not accept unverified claims about passing tests.
- Do not allow broad rewrites without explicit approval.
- Do not introduce dependencies without justification.
- Do not treat generated code as reviewed code.
- Always inspect the diff and run the relevant project checks.
