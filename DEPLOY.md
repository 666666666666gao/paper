# Deploy

This project is a static Vite site and can be shared publicly with GitHub Pages.

## GitHub Pages

1. Create a GitHub repository named `paper`.
2. Push this project to the repository's `main` branch.
3. In GitHub, open `Settings -> Pages`.
4. Set the source to `GitHub Actions`.
5. After the GitHub Action finishes, the site will be available at:

```text
https://666666666666gao.github.io/paper/
```

The site already uses this Vite base path:

```ts
base: '/paper/'
```

If you use a different repository name, update `vite.config.ts` to match:

```ts
base: '/YOUR_REPO_NAME/'
```

## Manual Check Before Publishing

Run:

```bash
npm run lint
npm run build
```

The built files will be in `dist/`.

## Other Hosts

For Vercel, Netlify, Cloudflare Pages, or a custom domain root, change `base` in
`vite.config.ts` to `/`.

For this repository, the public URL is:

```text
https://666666666666gao.github.io/paper/
```
