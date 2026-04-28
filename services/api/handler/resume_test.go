package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/rayspock/go-resume/model"
	"github.com/rayspock/go-resume/renderer"
)

// --- TemplateForID -----------------------------------------------------------

func TestTemplateForID_Known(t *testing.T) {
	for _, tmpl := range Templates {
		got := TemplateForID(tmpl.ID)
		if got != tmpl.File {
			t.Errorf("TemplateForID(%d) = %q, want %q", tmpl.ID, got, tmpl.File)
		}
	}
}

func TestTemplateForID_UnknownFallback(t *testing.T) {
	got := TemplateForID(9999)
	if got != "classic.html" {
		t.Errorf("TemplateForID(9999) = %q, want %q", got, "classic.html")
	}
}

func TestTemplateForID_LegacyID(t *testing.T) {
	got := TemplateForID(10)
	if got != "classic.html" {
		t.Errorf("TemplateForID(10) = %q, want %q (legacy fallback)", got, "classic.html")
	}
}

// --- mock PDF generator ------------------------------------------------------

type mockPDFGenerator struct {
	pdf []byte
	err error
}

func (m *mockPDFGenerator) GeneratePDF(_ context.Context, _ string) ([]byte, error) {
	return m.pdf, m.err
}

// --- helpers -----------------------------------------------------------------

func newTestHandler(t *testing.T, pdfGen PDFGenerator) *ResumeHandler {
	t.Helper()
	r, err := renderer.New()
	if err != nil {
		t.Fatalf("renderer.New(): %v", err)
	}
	return New(r, pdfGen, 5*time.Second)
}

func sampleResume() model.Resume {
	return model.Resume{
		SelectedTemplate: 1,
		Basics: model.Basics{
			Name:      "Test User",
			Email:     "test@example.com",
			Summaries: []string{"A summary."},
			Location:  model.Location{Address: "London"},
		},
		Skills: []model.Skill{
			{Name: "Languages", Keywords: []string{"Go", "TypeScript"}},
		},
		Sections: []string{"profile", "skills"},
	}
}

// --- RenderHTML --------------------------------------------------------------

func TestRenderHTML_Success(t *testing.T) {
	h := newTestHandler(t, &mockPDFGenerator{})

	body, _ := json.Marshal(sampleResume())
	req := httptest.NewRequest(http.MethodPost, "/resume/html", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.RenderHTML(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want %d", resp.StatusCode, http.StatusOK)
	}
	if ct := resp.Header.Get("Content-Type"); !strings.HasPrefix(ct, "text/html") {
		t.Errorf("Content-Type = %q, want text/html", ct)
	}

	html, _ := io.ReadAll(resp.Body)
	if !strings.Contains(string(html), "Test User") {
		t.Error("rendered HTML does not contain the resume name")
	}
}

func TestRenderHTML_InvalidJSON(t *testing.T) {
	h := newTestHandler(t, &mockPDFGenerator{})

	req := httptest.NewRequest(http.MethodPost, "/resume/html", strings.NewReader("{bad"))
	w := httptest.NewRecorder()

	h.RenderHTML(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

// --- GeneratePDF -------------------------------------------------------------

func TestGeneratePDF_Success(t *testing.T) {
	fakePDF := []byte("%PDF-1.4 fake")
	h := newTestHandler(t, &mockPDFGenerator{pdf: fakePDF})

	body, _ := json.Marshal(sampleResume())
	req := httptest.NewRequest(http.MethodPost, "/resume/pdf", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.GeneratePDF(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want %d", resp.StatusCode, http.StatusOK)
	}
	if ct := resp.Header.Get("Content-Type"); ct != "application/pdf" {
		t.Errorf("Content-Type = %q, want application/pdf", ct)
	}
	if cd := resp.Header.Get("Content-Disposition"); !strings.Contains(cd, "resume.pdf") {
		t.Errorf("Content-Disposition = %q, want to contain resume.pdf", cd)
	}

	got, _ := io.ReadAll(resp.Body)
	if !bytes.Equal(got, fakePDF) {
		t.Error("response body does not match expected PDF bytes")
	}
}

func TestGeneratePDF_InvalidJSON(t *testing.T) {
	h := newTestHandler(t, &mockPDFGenerator{})

	req := httptest.NewRequest(http.MethodPost, "/resume/pdf", strings.NewReader("not json"))
	w := httptest.NewRecorder()

	h.GeneratePDF(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestGeneratePDF_GeneratorError(t *testing.T) {
	h := newTestHandler(t, &mockPDFGenerator{err: fmt.Errorf("chrome crashed")})

	body, _ := json.Marshal(sampleResume())
	req := httptest.NewRequest(http.MethodPost, "/resume/pdf", bytes.NewReader(body))
	w := httptest.NewRecorder()

	h.GeneratePDF(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status = %d, want %d", w.Code, http.StatusInternalServerError)
	}
}

// --- New (default timeout) ---------------------------------------------------

func TestNew_DefaultTimeout(t *testing.T) {
	r, err := renderer.New()
	if err != nil {
		t.Fatalf("renderer.New(): %v", err)
	}
	h := New(r, &mockPDFGenerator{}, 0)
	if h.requestTimeout != 45*time.Second {
		t.Errorf("requestTimeout = %v, want 45s", h.requestTimeout)
	}
}

// --- RegisterRoutes ----------------------------------------------------------

func TestRegisterRoutes(t *testing.T) {
	h := newTestHandler(t, &mockPDFGenerator{pdf: []byte("ok")})
	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	body, _ := json.Marshal(sampleResume())

	for _, path := range []string{"/resume/pdf", "/resume/html"} {
		req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(body))
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("POST %s: status = %d, want %d", path, w.Code, http.StatusOK)
		}
	}
}
