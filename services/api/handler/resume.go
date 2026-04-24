package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/rayspock/go-resume/model"
	"github.com/rayspock/go-resume/renderer"
)

// PDFGenerator is the interface the handler depends on, making it easy to swap
// or mock the PDF backend in tests.
type PDFGenerator interface {
	GeneratePDF(ctx context.Context, html string) ([]byte, error)
}

// ResumeHandler handles HTTP requests for resume operations.
type ResumeHandler struct {
	renderer *renderer.Renderer
	pdf      PDFGenerator
	// requestTimeout caps the total time spent per HTTP request.
	requestTimeout time.Duration
}

// New wires up the handler. Pass 0 for requestTimeout to use 45 s.
func New(r *renderer.Renderer, g PDFGenerator, requestTimeout time.Duration) *ResumeHandler {
	if requestTimeout <= 0 {
		requestTimeout = 45 * time.Second
	}
	return &ResumeHandler{renderer: r, pdf: g, requestTimeout: requestTimeout}
}

// RegisterRoutes attaches routes to the provided mux.
func (h *ResumeHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /resume/pdf", h.GeneratePDF)
	mux.HandleFunc("POST /resume/html", h.RenderHTML)
}

// GeneratePDF handles POST /resume/pdf.
func (h *ResumeHandler) GeneratePDF(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.requestTimeout)
	defer cancel()

	var resume model.Resume
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&resume); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %s", err), http.StatusBadRequest)
		return
	}

	templateName := templateForID(resume.SelectedTemplate)

	html, err := h.renderer.Render(&resume, templateName)
	if err != nil {
		http.Error(w, fmt.Sprintf("render template: %s", err), http.StatusInternalServerError)
		return
	}

	pdfBytes, err := h.pdf.GeneratePDF(ctx, html)
	if err != nil {
		http.Error(w, fmt.Sprintf("generate pdf: %s", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=\"resume.pdf\"")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(pdfBytes)
}

// templateForID maps a selectedTemplate integer to a template filename.
// Unknown IDs fall back to the classic template.
func templateForID(id int) string {
	templates := map[int]string{
		1:  "classic.html",
		10: "classic.html",
	}
	if name, ok := templates[id]; ok {
		return name
	}
	return "classic.html"
}

// RenderHTML handles POST /resume/html — returns the rendered HTML for live preview.
func (h *ResumeHandler) RenderHTML(w http.ResponseWriter, r *http.Request) {
	var resume model.Resume
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&resume); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %s", err), http.StatusBadRequest)
		return
	}

	templateName := templateForID(resume.SelectedTemplate)

	html, err := h.renderer.Render(&resume, templateName)
	if err != nil {
		http.Error(w, fmt.Sprintf("render template: %s", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	_, _ = fmt.Fprint(w, html)
}
