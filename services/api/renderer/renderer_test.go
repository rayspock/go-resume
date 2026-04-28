package renderer

import (
	"strings"
	"testing"

	"github.com/rayspock/go-resume/model"
)

func sampleResume() *model.Resume {
	return &model.Resume{
		SelectedTemplate: 1,
		Headings:         map[string]string{"work": "Experience"},
		Basics: model.Basics{
			Name:      "Jane Doe",
			Email:     "jane@example.com",
			Summaries: []string{"Backend engineer."},
			Location:  model.Location{Address: "Berlin"},
		},
		Skills: []model.Skill{
			{Name: "Stack", Keywords: []string{"Go", "Docker"}},
		},
		Work: []model.Work{
			{
				Company:    "Acme",
				Position:   "Engineer",
				StartDate:  "Jan 2020",
				EndDate:    "Present",
				Highlights: []string{"Built things."},
			},
		},
		Sections: []string{"profile", "skills", "work"},
	}
}

func TestNew_Success(t *testing.T) {
	r, err := New()
	if err != nil {
		t.Fatalf("New() error: %v", err)
	}
	if len(r.templates) == 0 {
		t.Fatal("expected at least one parsed template")
	}
}

func TestRender_ClassicContainsName(t *testing.T) {
	r, err := New()
	if err != nil {
		t.Fatalf("New(): %v", err)
	}

	html, err := r.Render(sampleResume(), "classic.html")
	if err != nil {
		t.Fatalf("Render(): %v", err)
	}

	if !strings.Contains(html, "Jane Doe") {
		t.Error("rendered HTML does not contain the name")
	}
	if !strings.Contains(html, "jane@example.com") {
		t.Error("rendered HTML does not contain the email")
	}
}

func TestRender_CustomHeading(t *testing.T) {
	r, err := New()
	if err != nil {
		t.Fatalf("New(): %v", err)
	}

	html, err := r.Render(sampleResume(), "classic.html")
	if err != nil {
		t.Fatalf("Render(): %v", err)
	}

	if !strings.Contains(html, "Experience") {
		t.Error("rendered HTML does not contain custom heading 'Experience'")
	}
}

func TestRender_FallbackTemplate(t *testing.T) {
	r, err := New()
	if err != nil {
		t.Fatalf("New(): %v", err)
	}

	html, err := r.Render(sampleResume(), "nonexistent.html")
	if err != nil {
		t.Fatalf("Render() should fall back, got error: %v", err)
	}

	if !strings.Contains(html, "Jane Doe") {
		t.Error("fallback did not render correctly")
	}
}

func TestRender_SectionOrdering(t *testing.T) {
	r, err := New()
	if err != nil {
		t.Fatalf("New(): %v", err)
	}

	resume := sampleResume()
	resume.Sections = []string{"skills", "work", "profile"}

	html, err := r.Render(resume, "classic.html")
	if err != nil {
		t.Fatalf("Render(): %v", err)
	}

	skillsIdx := strings.Index(html, "Go")
	workIdx := strings.Index(html, "Acme")
	summaryIdx := strings.Index(html, "Backend engineer")

	if skillsIdx == -1 || workIdx == -1 || summaryIdx == -1 {
		t.Fatal("one or more sections not found in output")
	}

	if !(skillsIdx < workIdx && workIdx < summaryIdx) {
		t.Errorf("sections not in expected order: skills(%d) < work(%d) < profile(%d)", skillsIdx, workIdx, summaryIdx)
	}
}
