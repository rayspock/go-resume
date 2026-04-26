// Command thumbgen renders each resume template with sample data and captures
// a PNG thumbnail via headless Chrome. Run it whenever a template's HTML or CSS
// changes so the frontend previews stay in sync.
//
// Usage:
//
//	go run ./cmd/thumbgen                         # default output to ../../apps/web/public/templates/
//	go run ./cmd/thumbgen -out /path/to/dir       # custom output directory
package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/chromedp/chromedp"

	"github.com/rayspock/go-resume/handler"
	"github.com/rayspock/go-resume/model"
	"github.com/rayspock/go-resume/renderer"
)

// sampleResume returns representative data so every template section is populated.
func sampleResume(templateID int) *model.Resume {
	return &model.Resume{
		SelectedTemplate: templateID,
		Headings: map[string]string{
			"summary":   "Summary",
			"skills":    "Skills",
			"work":      "Experience",
			"projects":  "Projects",
			"education": "Education",
			"awards":    "Awards",
		},
		Basics: model.Basics{
			Name:    "Jane Doe",
			Email:   "jane@example.com",
			Website: "janedoe.dev",
			Location: model.Location{
				Address: "San Francisco, CA",
			},
			Summaries: []string{
				"Experienced software engineer with a strong background in distributed systems, cloud infrastructure, and full-stack development. Passionate about building reliable, scalable products.",
			},
		},
		Skills: []model.Skill{
			{Name: "Languages", Keywords: []string{"Go", "TypeScript", "Python", "SQL"}},
			{Name: "Tools", Keywords: []string{"Docker", "Kubernetes", "AWS", "PostgreSQL"}},
		},
		Work: []model.Work{
			{
				Company:   "Acme Corp",
				Location:  "San Francisco, CA",
				Position:  "Senior Software Engineer",
				StartDate: "Jan 2021",
				EndDate:   "Present",
				Highlights: []string{
					"Architected event-driven microservices handling 5k req/s.",
					"Led migration from monolith to Kubernetes, reducing deploy time by 60%.",
				},
			},
			{
				Company:   "Widgets Inc",
				Location:  "New York, NY",
				Position:  "Software Engineer",
				StartDate: "Jun 2018",
				EndDate:   "Dec 2020",
				Highlights: []string{
					"Built real-time analytics dashboard using React and Go.",
					"Reduced API latency by 40% through query optimisation.",
				},
			},
		},
		Projects: []model.Project{
			{
				Name:        "Open Source CLI",
				Keywords:    []string{"Go", "CLI"},
				Description: "A developer productivity tool downloaded 10k+ times.",
				URL:         "https://github.com/janedoe/cli",
			},
		},
		Education: []model.Education{
			{
				Institution: "University of California",
				Location:    "Berkeley, CA",
				StudyType:   "BSc Computer Science",
				Area:        "Distributed Systems",
				StartDate:   "Sep 2014",
				EndDate:     "Jun 2018",
				GPA:         "3.9 / 4.0",
			},
		},
		Awards: []model.Award{
			{
				Title:   "Hackathon Winner",
				Date:    "Mar 2023",
				Awarder: "TechCrunch Disrupt",
				Summary: "First place for best developer tool.",
			},
		},
		Sections: []string{
			"profile", "skills", "work", "projects", "education", "awards",
		},
	}
}

func main() {
	outDir := flag.String("out", "", "Output directory for thumbnails (default: ../../apps/web/public/templates/)")
	flag.Parse()

	if *outDir == "" {
		// Relative to services/api/ — the expected working directory when
		// running via `make thumbs` or `go run ./cmd/thumbgen`.
		*outDir = "../../apps/web/public/templates"
	}

	if err := os.MkdirAll(*outDir, 0o755); err != nil {
		log.Fatalf("create output dir: %v", err)
	}

	r, err := renderer.New()
	if err != nil {
		log.Fatalf("init renderer: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	for _, tmpl := range handler.Templates {
		resume := sampleResume(tmpl.ID)
		html, err := r.Render(resume, tmpl.File)
		if err != nil {
			log.Fatalf("render template %s: %v", tmpl.File, err)
		}

		png, err := captureScreenshot(ctx, html)
		if err != nil {
			log.Fatalf("screenshot template %s: %v", tmpl.File, err)
		}

		// Filename: classic.html → classic.png
		name := strings.TrimSuffix(tmpl.File, filepath.Ext(tmpl.File)) + ".png"
		outPath := filepath.Join(*outDir, name)
		if err := os.WriteFile(outPath, png, 0o644); err != nil {
			log.Fatalf("write %s: %v", outPath, err)
		}
		log.Printf("✓ %s → %s (%d KB)", tmpl.File, outPath, len(png)/1024)
	}

	log.Println("done — all thumbnails generated")
}

// captureScreenshot renders the HTML in headless Chrome at A4-ish viewport and
// captures a full-page screenshot as PNG.
func captureScreenshot(ctx context.Context, html string) ([]byte, error) {
	allocCtx, cancelAlloc := chromedp.NewExecAllocator(ctx, append(
		chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
	)...)
	defer cancelAlloc()

	tabCtx, cancelTab := chromedp.NewContext(allocCtx)
	defer cancelTab()

	// Use a base64 data URL to avoid URL-length limits with large HTML.
	encoded := base64.StdEncoding.EncodeToString([]byte(html))
	dataURL := "data:text/html;base64," + encoded

	var buf []byte
	if err := chromedp.Run(tabCtx,
		// A4 width ≈ 794px at 96 DPI; use taller viewport to capture full page.
		chromedp.EmulateViewport(794, 1123),
		chromedp.Navigate(dataURL),
		chromedp.WaitReady("body", chromedp.ByQuery),
		// Small delay to let fonts render.
		chromedp.Sleep(500*time.Millisecond),
		chromedp.CaptureScreenshot(&buf),
	); err != nil {
		return nil, fmt.Errorf("chromedp screenshot: %w", err)
	}

	return buf, nil
}
