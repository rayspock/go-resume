# go-resume

A monorepo resume builder — a Next.js frontend for editing resumes live, backed by a Go service that renders them to PDF via headless Chrome.

## Repository layout

```
go-resume/
├── Makefile                       # Root task runner for both services
├── pnpm-workspace.yaml            # pnpm monorepo definition
├── apps/
│   └── web/                       # Next.js frontend (App Router)
│       ├── app/
│       │   ├── page.tsx           # Landing page (server component)
│       │   └── editor/page.tsx    # Resume editor (client component)
│       ├── components/            # ResumeForm, ResumePreview, …
│       └── lib/api.ts             # PDF generation API client
└── services/
    └── api/                       # Go HTTP service
        ├── main.go                # Server bootstrap, logging middleware
        ├── model/resume.go        # Domain types (Resume, Basics, Work, …)
        ├── renderer/              # html/template engine + templates
        ├── pdf/generator.go       # chromedp → headless Chrome → PDF bytes
        └── handler/resume.go      # HTTP handler, request parsing
```

## Prerequisites

* Go 1.22+
* Google Chrome (or Chromium) installed and on your `PATH`
* Node.js 18+ and [pnpm](https://pnpm.io)
* `make`

## Getting started

Install frontend dependencies (one-time):

```bash
pnpm install
```

## Root Makefile targets

```
  dev            Start both API and web dev servers in parallel
  api-run        Run the Go API (PORT defaults to 8080)
  api-build      Build the Go API binary
  api-test       Run Go tests with race detector
  api-lint       Lint the Go API via golangci-lint
  web-dev        Start the Next.js dev server
  web-build      Build the Next.js app for production
  web-lint       Lint the Next.js app
  help           Show this help message
```

Run `make help` to see the same list at any time.

## Running locally

```bash
make dev               # start API (:8080) + web (:3000) in parallel
make api-run           # Go API only
make web-dev           # Next.js only
PORT=9090 make api-run # custom port
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

## API

### `POST /resume/pdf`

**Request body** – `application/json`:

```json
{
  "selectedTemplate": 1,
  "headings": { "work": "Experience" },
  "basics": {
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "website": "example.com",
    "location": { "address": "London" },
    "summaries": ["Backend engineer specialising in Go microservices."]
  },
  "skills": [
    { "name": "Stack", "keywords": ["Go", "TypeScript", "React", "Docker", "AWS"] }
  ],
  "work": [
    {
      "company": "Acme Corp",
      "position": "Senior Engineer",
      "location": "London",
      "startDate": "Jan 2022",
      "endDate": "Present",
      "highlights": ["Built X, resulting in Y% improvement."]
    }
  ],
  "projects": [
    {
      "name": "Cool Project",
      "keywords": ["Go"],
      "description": "A useful tool.",
      "url": "https://github.com/example/project"
    }
  ],
  "education": [
    {
      "institution": "University of Example",
      "area": "Computer Science",
      "studyType": "BSc",
      "startDate": "2012",
      "endDate": "2016"
    }
  ],
  "sections": ["templates", "profile", "skills", "work", "projects", "education"]
}
```

**Response** – `application/pdf` with `Content-Disposition: attachment; filename="resume.pdf"`.

### Quick test with curl

```bash
curl -X POST http://localhost:8080/resume/pdf \
  -H "Content-Type: application/json" \
  -d @example.local.json \
  -o services/api/output/resume.local.pdf
```

> **Local-only files** — any file matching `*.local.json` or `*.pdf` is git-ignored.
> The `output/` directory is tracked via a `.gitkeep` placeholder so it exists after a fresh clone.
> Copy the JSON payload above into `<name>.local.json` to experiment without
> accidentally committing test data or generated PDFs.

## Extending

| Goal | Where to change |
|---|---|
| Add a new template | Drop a `*.html` file in `renderer/templates/` and map its ID in `handler/resume.go:templateForID` |
| Add new resume fields | Extend structs in `model/resume.go`, reference them in the template |
| Swap PDF backend | Implement the `handler.PDFGenerator` interface |
| Add a new page | Create `apps/web/app/<route>/page.tsx` |
| Add database / persistence | Wire a repository layer in `main.go` and inject into handlers |

## Copilot instructions

Project-specific guidance for GitHub Copilot lives in
[`.github/copilot-instructions.md`](.github/copilot-instructions.md).
It covers coding conventions, extension patterns, and testing guidance.
