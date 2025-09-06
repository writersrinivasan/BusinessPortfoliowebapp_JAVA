# Contributing to Lifestyle Manager

We love your input! We want to make contributing to Lifestyle Manager as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Issues

We use GitHub issues to track public bugs. Report a bug by opening a new issue. It's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Coding Style Guidelines

### JavaScript

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Prefer const over let where possible
- Use camelCase for variables and functions
- Use PascalCase for classes
- Add JSDoc comments for functions

### HTML/CSS

- Use 2 spaces for indentation
- Use semantic HTML elements
- Follow BEM naming convention for CSS classes

## Testing Guidelines

- Write tests for all new features
- Maintain or improve test coverage
- Test both success and failure scenarios

## Documentation Guidelines

- Keep documentation up-to-date with code changes
- Document all public APIs
- Use clear, concise language

## Commit Message Guidelines

We follow conventional commits format:

```
type(scope): short description

longer description if needed
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example: `feat(habits): add streak calculation function`

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).

## References

This document was adapted from [Good-CONTRIBUTING.md-template.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426).
