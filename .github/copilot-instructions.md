# GitHub Copilot Instructions

## Project overview

`go-resume` is a Go HTTP service that converts structured JSON resume data into a
PDF using headless Chrome via **chromedp**. The HTML is rendered with Go's
`html/template` package and then printed to PDF with Chrome's `PrintToPDF`
DevTools command.

## Repository layout

```
go-resume/
├── main.go                        # Server bootstrap, logging middleware
├── Makefile                       # Build / run / test targets
├── model/resume.go                # Domain types – source of truth for JSON shape
├── renderer/
│   ├── renderer.go                # Parses & executes html/template files
│   └── templates/classic.html    # A4-styled resume template (CSS embedded)
├── pdf/generator.go               # chromedp integration; one Chrome context per request
└── handler/resume.go              # HTTP handler for POST /resume/pdf
```

## Coding conventions

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

## Extending the project

### Adding a new resume template

1. Create `renderer/templates/<name>.html` — it receives a `*model.Resume`.
2. Map a `selectedTemplate` integer to the new filename in
   `handler/resume.go:templateForID`.
3. Any custom template functions go in `renderer/renderer.go:templateFuncs`.

### Adding new resume fields

1. Add the field to the appropriate struct in `model/resume.go`.
2. Reference it in the relevant template(s).
3. No other layers need to change.

### Adding a new endpoint

1. Write a new handler method on `*handler.ResumeHandler` (or a new handler
   struct wired in `main.go`).
2. Register it in `RegisterRoutes`.

## Makefile targets (quick reference)

| Target | Purpose |
|---|---|
| `make build` | Compile binary into `./bin/` |
| `make run` | `go run .` with live reload friendly |
| `make test` | Run tests with race detector |
| `make fmt` | Format source with `gofmt` |
| `make vet` | Static analysis via `go vet` |
| `make lint` | Full lint via `golangci-lint` |
| `make tidy` | Tidy and verify modules |
| `make clean` | Remove `./bin/` |

## Testing guidance

- Unit-test the renderer in isolation by calling `renderer.Render` and asserting
  the HTML contains expected strings.
- Mock `PDFGenerator` to test the handler without spawning Chrome.
- Integration tests that actually generate a PDF should be tagged
  `//go:build integration` and skipped in CI unless Chrome is available.

## Dependencies

| Package | Purpose |
|---|---|
| `github.com/chromedp/chromedp` | Headless Chrome control |
| `github.com/chromedp/cdproto` | Chrome DevTools Protocol types |

All other functionality uses the Go standard library.
