# go-resume

A minimal Go backend that generates PDF resumes from structured JSON input.

## Architecture

```
go-resume/
├── main.go                    # HTTP server bootstrap, logging middleware
├── model/
│   └── resume.go              # Domain types (Resume, Basics, Work, …)
├── renderer/
│   ├── renderer.go            # html/template engine, embed templates
│   └── templates/
│       └── classic.html       # A4-styled HTML resume template
├── pdf/
│   └── generator.go           # chromedp → headless Chrome → PDF bytes
└── handler/
    └── resume.go              # HTTP handler, request parsing, response writing
```

## Prerequisites

* Go 1.22+
* Google Chrome (or Chromium) installed and on your `PATH`
* `make`

## Makefile targets

```
  build          Compile binary into ./bin/
  run            go run . (PORT defaults to 8080)
  run-bin        Build then run the compiled binary
  test           Run all tests with race detector
  fmt            Format source with gofmt
  vet            Static analysis via go vet
  lint           Full lint via golangci-lint (must be installed)
  tidy           Tidy and verify go.mod / go.sum
  clean          Remove ./bin/
```

Run `make help` to see the same list at any time.

## Running locally

```bash
make run               # go run . on :8080
PORT=9090 make run     # custom port
make run-bin           # compile first, then execute ./bin/go-resume
```

## API

### `POST /resume/pdf`

**Request body** – `application/json`:

```json
{
  "selectedTemplate": 10,
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
  -o output/resume.local.pdf
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
| Add database / persistence | Wire a repository layer in `main.go` and inject into handlers |

## Copilot instructions

Project-specific guidance for GitHub Copilot lives in
[`.github/copilot-instructions.md`](.github/copilot-instructions.md).
It covers coding conventions, extension patterns, and testing guidance.
