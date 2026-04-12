BINARY    := go-resume
MODULE    := github.com/rayspock/go-resume
BUILD_DIR := bin
PORT      ?= 8080

# Go tool flags
GOFLAGS   := -trimpath
LDFLAGS   := -s -w

.PHONY: all build run test lint fmt vet tidy clean help

all: build ## Default: build the binary

## ── Build ─────────────────────────────────────────────────────────────────
build: ## Build the binary into ./bin/
	@mkdir -p $(BUILD_DIR)
	go build $(GOFLAGS) -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(BINARY) .

## ── Run ───────────────────────────────────────────────────────────────────
run: ## Run the service directly with go run (PORT defaults to 8080)
	PORT=$(PORT) go run .

run-bin: build ## Build then run the compiled binary
	PORT=$(PORT) ./$(BUILD_DIR)/$(BINARY)

## ── Code quality ──────────────────────────────────────────────────────────
test: ## Run all tests
	go test ./... -v -race -timeout 60s

vet: ## Run go vet
	go vet ./...

fmt: ## Format all Go source files
	gofmt -w -s .

lint: ## Run golangci-lint (must be installed: https://golangci-lint.run)
	golangci-lint run ./...

tidy: ## Tidy and verify go.mod / go.sum
	go mod tidy
	go mod verify

## ── Maintenance ───────────────────────────────────────────────────────────
clean: ## Remove build artefacts
	rm -rf $(BUILD_DIR)

## ── Help ──────────────────────────────────────────────────────────────────
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
