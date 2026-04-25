package renderer

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"

	"github.com/rayspock/go-resume/model"
)

// newTemplateFuncs returns helpers available inside every template.
func newTemplateFuncs() template.FuncMap {
	return template.FuncMap{
		"heading": func(r *model.Resume, key, fallback string) string {
			if r.Headings != nil {
				if h, ok := r.Headings[key]; ok && h != "" {
					return h
				}
			}
			return fallback
		},
	}
}

//go:embed templates/*.html
var templateFS embed.FS

// Renderer holds parsed templates and renders resume HTML.
type Renderer struct {
	templates map[string]*template.Template
}

// New parses all embedded templates and returns a ready Renderer.
func New() (*Renderer, error) {
	r := &Renderer{
		templates: make(map[string]*template.Template),
	}

	entries, err := templateFS.ReadDir("templates")
	if err != nil {
		return nil, fmt.Errorf("read templates dir: %w", err)
	}

	funcs := newTemplateFuncs()
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		t, err := template.New(name).Funcs(funcs).ParseFS(templateFS, "templates/"+name)
		if err != nil {
			return nil, fmt.Errorf("parse template %s: %w", name, err)
		}
		r.templates[name] = t
	}

	return r, nil
}

// Render produces an HTML string for the given resume.
// templateName is the filename (e.g. "classic.html").
// Falls back to "classic.html" when the requested template is not found.
func (r *Renderer) Render(resume *model.Resume, templateName string) (string, error) {
	t, ok := r.templates[templateName]
	if !ok {
		t, ok = r.templates["classic.html"]
		if !ok {
			return "", fmt.Errorf("template %q not found and no fallback available", templateName)
		}
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, resume); err != nil {
		return "", fmt.Errorf("execute template: %w", err)
	}
	return buf.String(), nil
}
