# Waez — a personal portfolio

A one-page, English-language portfolio with a pink paper background, a layered paper sky, animated rabbits, and inline project case studies. Built with Astro. All fonts and visual assets are self-hosted.

**Refined preview:** http://127.0.0.1:4322/. This is a separate Git repository. The original portfolio remains in the parent directory, with its preview on port 4321.

Deployment is pending the owner's approval of the preview. The prepared GitHub Pages project path is `/waez-portfolio-v2/`; the workflow can only be started manually.

## Development

Use Node.js 24 (see `.nvmrc`).

```sh
npm ci
npm run dev
```

## Build and verify

```sh
npm run check
npm run build
npm test
node scripts/verify-scale.mjs
```

`dist/` is the finished static site. No Node.js process, database, account, API key, or external asset service is needed to serve it.

## Add a project

Create a Markdown file in `src/content/projects/`. Its filename becomes the permanent anchor: `my-project.md` → `/#my-project`.

```yaml
---
title: Your project name
order: 2
year: 2026
category: Databases
summary: A short, concrete explanation of the problem and result.
contribution: What you personally designed or implemented.
stack:
  - Python
  - SQL
repository: https://github.com/onewaez/your-repository
presentation: editorial
draft: true
---
```

Write the case study below the frontmatter. Describe the problem, your decisions, evidence, and limitations. The supplied example is a draft: change `draft` to `false` when the real content is ready. Never publish the example's placeholder repository URL.

- Give each published project a **unique, increasing `order`**. The new project is appended before About and Contact. Existing projects keep their positions when edited.
- `presentation: editorial` gives a typographic cover. For an image cover, use `presentation: image`, `image: ./projects/your-project/cover.webp`, and a meaningful `imageAlt`. Put the file in `public/projects/your-project/`.
- `presentation: network` is specifically the 784 → 128 → 10 Fashion Classifier diagram. Use it only for this architecture.
- Optional `caption` describes the figure. Optional `demo` adds a link to an externally hosted demo.
- All case studies stay in the main document, using native `<details>`. Links to project anchors open the corresponding case study when JavaScript is available. With JavaScript off, the visitor can still expand any project manually.

Source pushes do not publish the site. After the owner approves the preview, use the manual Pages workflow. See [HOSTING.md](HOSTING.md) for GitHub Pages and other hosts.

## Identity and styling

- Name, introduction, contact links: `src/pages/index.astro`.
- Palette, layout, responsive styles: `src/styles/global.css`.
- Paper cloud artwork and sky composition: `src/components/PaperCloud.astro` and `src/components/CloudField.astro`.
- Rabbits and the closing scene: `src/components/PaperRabbit.astro` and `src/components/RabbitGarden.astro`.
- Scene styling and animation: `src/styles/scenes.css` and `src/scripts/interactions.ts`.
- Project content: `src/content/projects/`.

The paper texture and clouds are original SVG assets. Fonts use the SIL Open Font License; notices are included under `public/licenses/` and are included in the static build.

## Motion and accessibility

Clouds float at different depths and part as the page scrolls, with reduced travel on smaller screens. The closing garden has rabbits that breathe, blink, twitch their ears, and make small hops, plus swaying paper flowers. Animations pause when their scene is off screen. Text remains visible throughout scroll transitions.

The header's pause icon and the footer's **Pause motion** control stay synchronized and remember the choice locally. All decorative animation also respects `prefers-reduced-motion`. Keyboard navigation, native disclosures, a skip link, visible focus, and print styles are included. JavaScript-only controls remain hidden when scripts are unavailable; the native project disclosure still works.

## Checks

`npm test` validates the built HTML's navigation, unique IDs, native case studies, deployment metadata, and asset references. The scale script builds isolated copies with 5 and 20 fixture projects; fixtures never enter the production content or `dist/`.
