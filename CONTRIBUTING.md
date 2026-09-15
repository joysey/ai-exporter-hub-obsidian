# Contributing to AI Exporter Hub

Thanks for helping improve AI Exporter Hub. Bug reports, documentation fixes, tests, and focused pull requests are welcome.

## Before opening an issue

- Search existing issues first.
- Include the plugin version, Obsidian version, operating system, and clear reproduction steps.
- Use a minimal test vault when possible.
- Remove private conversations, credentials, vault paths, and other sensitive data from screenshots and logs.

## Development

Use Node.js 20 or later.

```bash
npm install
npm run dev
```

Before submitting a pull request, run:

```bash
npm run check
```

This runs linting, TypeScript checks, automated tests, and the production build.

## Pull requests

- Open an issue before starting a large or user-facing change.
- Keep each pull request focused on one concern.
- Add or update tests for behavior changes.
- Keep Markdown files as the source of truth.
- Use Obsidian's public APIs for vault operations.
- Preserve local-first behavior and avoid unnecessary network dependencies.
- Update the README when behavior, privacy, compatibility, or installation changes.

## Privacy and external services

Do not add telemetry, background uploads, or an external service without discussing the change first. Any feature that sends vault content outside Obsidian must be opt-in, clearly disclosed, and designed to avoid accidental disclosure.

## License

By contributing, you agree that your contribution will be licensed under the project's [MIT License](./LICENSE).
