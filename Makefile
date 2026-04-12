.PHONY: api-build api-run api-test api-lint web-dev web-build web-lint dev help

## ── Go API ────────────────────────────────────────────────────────────────
api-build: ## Build the Go API binary
	$(MAKE) -C services/api build

api-run: ## Run the Go API (PORT defaults to 8080)
	$(MAKE) -C services/api run

api-test: ## Test the Go API
	$(MAKE) -C services/api test

api-lint: ## Lint the Go API
	$(MAKE) -C services/api lint

## ── Next.js web ───────────────────────────────────────────────────────────
web-dev: ## Start the Next.js dev server
	pnpm --filter web dev

web-build: ## Build the Next.js app for production
	pnpm --filter web build

web-lint: ## Lint the Next.js app
	pnpm --filter web lint

web-lint-fix: ## Fix linting issues in the Next.js app
	pnpm --filter web lint --fix

## ── Combined ──────────────────────────────────────────────────────────────
dev: ## Start both API and web dev servers in parallel
	$(MAKE) -j2 api-run web-dev

## ── Help ──────────────────────────────────────────────────────────────────
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
