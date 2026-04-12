package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/rayspock/go-resume/handler"
	"github.com/rayspock/go-resume/pdf"
	"github.com/rayspock/go-resume/renderer"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	r, err := renderer.New()
	if err != nil {
		logger.Error("failed to initialise renderer", "error", err)
		os.Exit(1)
	}

	pdfGen := pdf.New(30 * time.Second)

	mux := http.NewServeMux()
	h := handler.New(r, pdfGen, 45*time.Second)
	h.RegisterRoutes(mux)

	addr := listenAddr()
	logger.Info("server starting", "addr", addr)

	srv := &http.Server{
		Addr:         addr,
		Handler:      logMiddleware(logger, corsMiddleware(mux)),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func listenAddr() string {
	if port := os.Getenv("PORT"); port != "" {
		return ":" + port
	}
	return ":8080"
}

// corsMiddleware sets permissive CORS headers for the configured allowed origin.
func corsMiddleware(next http.Handler) http.Handler {
	origin := os.Getenv("ALLOWED_ORIGIN")
	if origin == "" {
		origin = "http://localhost:3000"
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// logMiddleware logs method, path, and latency for every request.
func logMiddleware(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rw, r)
		logger.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.status,
			"duration", time.Since(start).String(),
		)
	})
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}
