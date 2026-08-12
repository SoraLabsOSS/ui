<div align="center">

# Sora UI

A fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, and Motion.

[![GitHub stars](https://img.shields.io/github/stars/SoraLabsOSS/ui?style=flat-square)](https://github.com/SoraLabsOSS/ui/stargazers)
[![License: MIT](https://img.shields.io/github/license/SoraLabsOSS/ui?style=flat-square)](./LICENSE.md)

</div>

## Documentation

Visit [ui.soralabs.io.vn](https://ui.soralabs.io.vn/docs) to view the documentation.

## Local development

```bash
bun install
bun run dev:www    # http://localhost:3000
```

**No `.env` file is required** to browse docs, blog, the components catalog, or use Ask AI locally. Copy [`apps/www/.env.example`](./apps/www/.env.example) only when you need optional features:

| Feature | Variables |
|---------|-----------|
| Sign-in (Google / GitHub) | `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth client ids/secrets |
| Bookmarks | `DATABASE_URL` + session (above) |
| Redis rate limits / cache | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Better Auth Sentinel | `BETTER_AUTH_API_KEY`, `NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL` |
| Custom Ask AI endpoint | `AI_SEARCH_CHAT_URL` (defaults to the public docs search instance) |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` |

Production deployments must set `BETTER_AUTH_SECRET` and `DATABASE_URL` at minimum.

## Contributing

Visit our [contributing guide](./CONTRIBUTING.md) to learn how to contribute.

Adding a documented component (registry + docs preview flow): see [apps/www/registry/README.md](./apps/www/registry/README.md).

## Code of Conduct

This project follows a Code of Conduct to help create a welcoming community.
Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## License

Licensed under the [MIT license](./LICENSE.md).
