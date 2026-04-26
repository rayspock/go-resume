# GitHub Copilot Instructions

## Project overview

`go-resume` is a monorepo resume builder. The **Go API** (`services/api`) converts
structured JSON resume data into a PDF using headless Chrome via **chromedp**. The
**Next.js 16 frontend** (`apps/web`) provides a live editor that previews the resume and
triggers PDF generation via the API.

## Repository layout

```
go-resume/
├── Makefile                           # Root task runner (api-* and web-* targets)
├── pnpm-workspace.yaml                # pnpm monorepo definition
├── .agents/skills/                    # Go coding skills (from samber/cc-skills-golang)
├── apps/
│   └── web/                           # Next.js frontend (App Router)
│       ├── app/
│       │   ├── page.tsx               # Landing page (server component)
│       │   ├── editor/page.tsx        # Resume editor (client component)
│       │   ├── icon.png               # Browser tab icon (32×32)
│       │   ├── apple-icon.png         # Apple touch icon (180×180)
│       │   └── favicon.ico            # Favicon (48×48)
│       ├── components/
│       │   ├── editors/               # Section editors (Profile, Skills, Experience, Awards, …)
│       │   ├── SectionNav.tsx         # Left sidebar section navigation
│       │   ├── ResumePreview.tsx      # Live iframe preview
│       │   ├── ImportJsonDialog.tsx    # JSON import dialog
│       │   ├── SkillListInput.tsx     # Tag-style skill keyword input
│       │   └── ui/                    # shadcn/ui primitives
│       ├── lib/
│       │   ├── api.ts                 # PDF + preview API client
│       │   └── config.ts              # App name and constants
│       └── biome.json                 # Biome linter/formatter config
└── services/
    └── api/                           # Go HTTP service
        ├── main.go                    # Server bootstrap, logging middleware
        ├── model/resume.go            # Domain types – source of truth for JSON shape
        ├── renderer/
        │   ├── renderer.go            # Parses & executes html/template files; heading() helper
        │   └── templates/classic.html # A4-styled resume template (CSS embedded)
        ├── pdf/generator.go           # chromedp integration; one Chrome context per request
        └── handler/resume.go          # HTTP handler for POST /resume/pdf and /resume/html
```

## Agent skills

Go coding skills from [`samber/cc-skills-golang`](https://github.com/samber/cc-skills-golang)
are installed in `.agents/skills/`. They provide domain-specific guidance for
error handling, testing, naming, concurrency, security, and more. Skills are
loaded on demand when a task matches their description.

To update skills:

```bash
git clone --depth 1 https://github.com/samber/cc-skills-golang.git /tmp/cc-skills-golang
rm -rf .agents/skills/golang-*
cp -r /tmp/cc-skills-golang/skills/* .agents/skills/
rm -rf /tmp/cc-skills-golang
```

## Coding conventions

### Go (services/api)

- **Go version**: target the version declared in `go.mod`.
- **Error handling**: always wrap errors with `fmt.Errorf("context: %w", err)`;
  never swallow them silently.
- **No global state**: dependencies (`Renderer`, `Generator`, `Handler`) are
  constructed in `main.go` and injected — do not add package-level vars.
- **Interfaces over concretions**: depend on the `handler.PDFGenerator` interface
  rather than `*pdf.Generator` directly, to keep the handler testable.
- **Context discipline**: every long-running operation must accept and respect a
  `context.Context`; use `context.WithTimeout` at the boundary (handler or
  generator level).
- **Comments**: only comment non-obvious logic; avoid restating what the code
  already says.

### TypeScript / React (apps/web)

- **Linter & formatter**: use **Biome** exclusively — never ESLint or Prettier.
  Run `pnpm lint` (`biome check .`) and `pnpm check` (`biome check --write .`).
  Never add `eslint-disable` or `eslint-disable-line` comments — they have no
  effect. Use `// biome-ignore` when a suppression is genuinely needed.
- **No `dangerouslySetInnerHTML`**: when embedding server-generated HTML (e.g.
  resume preview), use an `<iframe srcDoc={html}>` so the template's styles are
  fully isolated from Tailwind preflight and the surrounding app.
- **No `as` type assertions on untrusted data**: never cast `JSON.parse()` output
  with `as SomeType`. Use the `isResumeData()` type guard from `lib/api.ts` to
  validate the shape at runtime. This applies to `localStorage`, file imports,
  and any other external JSON source. Prefer a hand-written type guard for simple
  shapes; introduce Zod only if the schema grows significantly complex.
- **Component split**: keep server components (landing page) and client components
  (`"use client"` — editor, form, preview) clearly separated.
- **Single state source**: the editor page owns the resume state via `useReducer`;
  section editors and preview are pure props-driven components.
- **API client**: all backend calls go through `lib/api.ts`; never fetch directly
  from components.
- **Section editors**: each section (Profile, Skills, Experience, Projects,
  Education, Awards) has its own editor component in `components/editors/`. Each includes
  an editable `SectionHeading` that updates `resume.headings[key]`.
- **Favicons and icons**: placed in `app/` using the Next.js file convention
  (`favicon.ico`, `icon.png`, `apple-icon.png`) — no manual `<link>` tags needed.

## Keeping docs current

After any structural change (new files, renamed components, new Makefile targets,
new fields, new endpoints), update **both**:

- `README.md` — repository layout tree, API examples, Makefile table, extending table.
- `.github/copilot-instructions.md` — repository layout tree, coding conventions,
  extending recipes, Makefile tables, dependencies table.

## Extending the project

### Adding a new resume template

1. Create `renderer/templates/<name>.html` — it receives a `*model.Resume`.
2. Map a `selectedTemplate` integer to the new filename in
   `handler/resume.go:templateForID`.
3. Use `{{ heading $ "key" "Default" }}` for section titles so headings are customisable.
4. Any custom template functions go in `renderer/renderer.go:newTemplateFuncs`.

### Adding new resume fields

1. Add the field to the appropriate struct in `model/resume.go`.
2. Reference it in the relevant template(s).
3. Update `ResumeData` in `apps/web/lib/api.ts` to mirror the new shape.
4. Update the relevant editor component in `apps/web/components/editors/`.

### Adding a new section heading

1. Add the key to the `headings` map in the initial resume state (`editor/page.tsx`).
2. Use `<SectionHeading headingKey="key" defaultLabel="Label" />` in the editor.
3. Use `{{ heading $ "key" "Label" }}` in the template.

### Adding a new endpoint

1. Write a new handler method on `*handler.ResumeHandler` (or a new handler
   struct wired in `main.go`).
2. Register it in `RegisterRoutes`.

### Adding a new page (frontend)

1. Create `apps/web/app/<route>/page.tsx`.
2. Default to server component; add `"use client"` only if the page needs
   interactivity or browser APIs.

## Makefile targets (quick reference)

### Root

| Target | Purpose |
|---|---|
| `make dev` | Start API (:8080) + web (:3000) in parallel |
| `make lint` | Lint both API and web |
| `make lint-fix` | Fix lint issues in both API and web |
| `make api-run` | Run Go API only |
| `make api-build` | Compile Go binary |
| `make api-test` | Run Go tests with race detector |
| `make api-lint` | Lint Go code (vet + fmt check) |
| `make api-lint-fix` | Auto-format Go source files |
| `make web-dev` | Start Next.js dev server |
| `make web-build` | Build Next.js for production |
| `make web-lint` | Lint frontend via Biome |
| `make web-lint-fix` | Fix linting issues via Biome |

### services/api (run inside `services/api/`)

| Target | Purpose |
|---|---|
| `make build` | Compile binary into `./bin/` |
| `make run` | `go run .` (PORT defaults to 8080) |
| `make test` | Run tests with race detector |
| `make fmt` | Format source with `gofmt` |
| `make vet` | Static analysis via `go vet` |
| `make lint` | Lint via `go vet` + format check |
| `make tidy` | Tidy and verify modules |
| `make clean` | Remove `./bin/` |

## Testing guidance

- Unit-test the renderer in isolation by calling `renderer.Render` and asserting
  the HTML contains expected strings.
- Mock `PDFGenerator` to test the handler without spawning Chrome.
- Integration tests that actually generate a PDF should be tagged
  `//go:build integration` and skipped in CI unless Chrome is available.

## Dependencies

### Go

| Package | Purpose |
|---|---|
| `github.com/chromedp/chromedp` | Headless Chrome control |
| `github.com/chromedp/cdproto` | Chrome DevTools Protocol types |

### Frontend

| Package | Purpose |
|---|---|
| `next` (16.x) | React framework (App Router, Turbopack) |
| `react` (19.x) | UI library |
| `@biomejs/biome` | Linting + formatting (replaces ESLint + Prettier) |
| `tailwindcss` (4.x) | Utility-first CSS |
| `shadcn/ui` | Accessible UI components |
| `lucide-react` | Icons |
