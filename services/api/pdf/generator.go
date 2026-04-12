package pdf

import (
	"context"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

const defaultTimeout = 30 * time.Second

// Generator converts HTML strings to PDF bytes using a headless Chrome instance.
type Generator struct {
	timeout time.Duration
}

// New returns a Generator with an optional custom timeout.
// Pass 0 to use the default (30 s).
func New(timeout time.Duration) *Generator {
	if timeout <= 0 {
		timeout = defaultTimeout
	}
	return &Generator{timeout: timeout}
}

// GeneratePDF renders htmlContent inside headless Chrome and returns the raw
// PDF bytes. A fresh browser context is created (and destroyed) per call so
// there is no shared browser state between requests.
func (g *Generator) GeneratePDF(ctx context.Context, htmlContent string) ([]byte, error) {
	// Encode HTML as a data URL so chromedp can navigate to it without a server.
	encoded := base64.StdEncoding.EncodeToString([]byte(htmlContent))
	dataURL := "data:text/html;base64," + encoded

	// Each request gets its own allocator + context to avoid cross-request leaks.
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

	tabCtx, cancelTimeout := context.WithTimeout(tabCtx, g.timeout)
	defer cancelTimeout()

	var pdfBuf []byte
	if err := chromedp.Run(tabCtx,
		chromedp.Navigate(dataURL),
		// Wait until the document body is present and fonts / CSS are applied.
		chromedp.WaitReady("body", chromedp.ByQuery),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			pdfBuf, _, err = page.PrintToPDF().
				WithPrintBackground(true).
				// A4 dimensions in inches
				WithPaperWidth(8.27).
				WithPaperHeight(11.69).
				WithMarginTop(0).
				WithMarginBottom(0).
				WithMarginLeft(0).
				WithMarginRight(0).
				WithPreferCSSPageSize(true).
				Do(ctx)
			return err
		}),
	); err != nil {
		return nil, fmt.Errorf("chromedp run: %w", err)
	}

	return pdfBuf, nil
}
