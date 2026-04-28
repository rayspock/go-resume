package model

import (
	"encoding/json"
	"testing"
)

func TestResume_RoundTrip(t *testing.T) {
	original := Resume{
		SelectedTemplate: 1,
		Headings:         map[string]string{"work": "Experience"},
		Basics: Basics{
			Name:      "Test User",
			Email:     "test@example.com",
			Summaries: []string{"A summary."},
			Location:  Location{Address: "London"},
		},
		Skills: []Skill{
			{Name: "Stack", Keywords: []string{"Go"}},
		},
		Work: []Work{
			{Company: "Acme", Position: "Dev", StartDate: "Jan 2020", EndDate: "Present", Highlights: []string{"Built stuff."}},
		},
		Projects: []Project{
			{Name: "Bot", Description: "A bot", Keywords: []string{"Go"}, URL: "https://example.com"},
		},
		Education: []Education{
			{Institution: "Uni", Area: "CS", StudyType: "BSc", StartDate: "2016", EndDate: "2020"},
		},
		Awards: []Award{
			{Title: "Best Dev", Date: "2023", Summary: "Won it", Awarder: "Corp"},
		},
		Sections: []string{"profile", "skills", "work"},
	}

	data, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("Marshal: %v", err)
	}

	var decoded Resume
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Unmarshal: %v", err)
	}

	if decoded.Basics.Name != original.Basics.Name {
		t.Errorf("Name = %q, want %q", decoded.Basics.Name, original.Basics.Name)
	}
	if decoded.SelectedTemplate != original.SelectedTemplate {
		t.Errorf("SelectedTemplate = %d, want %d", decoded.SelectedTemplate, original.SelectedTemplate)
	}
	if len(decoded.Skills) != len(original.Skills) {
		t.Errorf("Skills length = %d, want %d", len(decoded.Skills), len(original.Skills))
	}
	if len(decoded.Work) != len(original.Work) {
		t.Errorf("Work length = %d, want %d", len(decoded.Work), len(original.Work))
	}
	if len(decoded.Projects) != len(original.Projects) {
		t.Errorf("Projects length = %d, want %d", len(decoded.Projects), len(original.Projects))
	}
	if len(decoded.Education) != len(original.Education) {
		t.Errorf("Education length = %d, want %d", len(decoded.Education), len(original.Education))
	}
	if len(decoded.Awards) != len(original.Awards) {
		t.Errorf("Awards length = %d, want %d", len(decoded.Awards), len(original.Awards))
	}
	if len(decoded.Sections) != len(original.Sections) {
		t.Errorf("Sections length = %d, want %d", len(decoded.Sections), len(original.Sections))
	}
}

func TestResume_UnmarshalMinimal(t *testing.T) {
	raw := `{"selectedTemplate":1,"basics":{"name":"Min"}}`
	var r Resume
	if err := json.Unmarshal([]byte(raw), &r); err != nil {
		t.Fatalf("Unmarshal: %v", err)
	}
	if r.Basics.Name != "Min" {
		t.Errorf("Name = %q, want %q", r.Basics.Name, "Min")
	}
	if r.Skills != nil {
		t.Errorf("Skills = %v, want nil", r.Skills)
	}
}

func TestResume_HeadingsAccess(t *testing.T) {
	r := Resume{
		Headings: map[string]string{"work": "Employment"},
	}
	if h, ok := r.Headings["work"]; !ok || h != "Employment" {
		t.Errorf("Headings[work] = %q, %v", h, ok)
	}
	if _, ok := r.Headings["missing"]; ok {
		t.Error("expected missing key to not exist")
	}
}
