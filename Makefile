.PHONY: help install install-backend install-frontend dev dev-backend dev-frontend dev-docker \
        test test-backend test-frontend \
        build build-frontend clean \
        docker-up docker-down docker-restart docker-build \
        lint lint-backend lint-frontend format setup

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)LocalForge Makefile$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  make <target>"
	@echo ""
	@echo "$(YELLOW)Development targets:$(NC)"
	@echo "  $(BLUE)dev$(NC)              Start both backend (FastAPI) and frontend (Vite) in development mode"
	@echo "  $(BLUE)dev-backend$(NC)     Start backend only (http://localhost:8000)"
	@echo "  $(BLUE)dev-frontend$(NC)    Start frontend only (http://localhost:5173)"
	@echo "  $(BLUE)dev-docker$(NC)       Start Docker containers (backend + frontend)"
	@echo ""
	@echo "$(YELLOW)Testing targets:$(NC)"
	@echo "  $(BLUE)test$(NC)             Run all tests (backend + frontend)"
	@echo "  $(BLUE)test-backend$(NC)      Run backend tests with pytest"
	@echo "  $(BLUE)test-frontend$(NC)     Run frontend tests with Vitest"
	@echo "  $(BLUE)test-coverage$(NC)   Run tests with coverage report"
	@echo ""
	@echo "$(YELLOW)Build targets:$(NC)"
	@echo "  $(BLUE)build$(NC)           Build frontend for production"
	@echo "  $(BLUE)build-frontend$(NC)   Build frontend only"
	@echo "  $(BLUE)clean$(NC)           Clean build artifacts and dependencies"
	@echo ""
	@echo "$(YELLOW)Docker targets:$(NC)"
	@echo "  $(BLUE)docker-up$(NC)         Start Docker containers with .env file"
	@echo "  $(BLUE)docker-down$(NC)       Stop and remove Docker containers"
	@echo "  $(BLUE)docker-restart$(NC)   Restart Docker containers"
	@echo "  $(BLUE)docker-build$(NC)      Rebuild Docker images"
	@echo "  $(BLUE)docker-logs$(NC)      Show Docker container logs"
	@echo ""
	@echo "$(YELLOW)Code quality targets:$(NC)"
	@echo "  $(BLUE)lint$(NC)             Run all linters (backend + frontend)"
	@echo "  $(BLUE)lint-backend$(NC)      Run backend linters (ruff, mypy)"
	@echo "  $(BLUE)lint-frontend$(NC)     Run frontend linters (eslint)"
	@echo "  $(BLUE)format$(NC)           Format all code (backend + frontend)"
	@echo ""
	@echo "$(YELLOW)Utility targets:$(NC)"
	@echo "  $(BLUE)install$(NC)         Install all dependencies"
	@echo "  $(BLUE)install-backend$(NC)  Install backend dependencies (uv sync)"
	@echo "  $(BLUE)install-frontend$(NC) Install frontend dependencies (npm install)"
	@echo "  $(BLUE)setup$(NC)            Initial project setup (install + .env creation)"
	@echo ""
	@echo "$(YELLOW)Example:$(NC)"
	@echo "  $(BLUE)make dev$(NC)              # Start both servers"
	@echo "  $(BLUE)make test$(NC)             # Run all tests"
	@echo "  $(BLUE)make docker-up$(NC)         # Start Docker with .env"

# ============================================================================
# Development
# ============================================================================

dev: ## Start both backend and frontend locally
	@echo "$(BLUE)Starting backend and frontend...$(NC)"
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend: ## Start backend only (FastAPI on port 8000)
	@echo "$(BLUE)Starting backend with environment variables...$(NC)"
	@if [ -f .env ]; then \
		set -a && . .env && cd apps/backend && uv run fastapi dev; \
	else \
		echo "$(RED)Error: .env file not found$(NC)"; \
		echo "$(YELLOW)Run: cp .env.example .env$(NC)"; \
		exit 1; \
	fi

dev-frontend: ## Start frontend only (Vite on port 5173)
	@echo "$(BLUE)Starting frontend...$(NC)"
	@cd apps/frontend && npm run dev

dev-docker: ## Start Docker containers (backend + frontend)
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found$(NC)"; \
		echo "$(YELLOW)Run: cp .env.example .env$(NC)"; \
		exit 1; \
	fi
	@docker compose up -d

# ============================================================================
# Setup
# ============================================================================

setup: ## Initial project setup (install dependencies and create .env from example)
	@echo "$(BLUE)Setting up LocalForge...$(NC)"
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	@cd apps/backend && uv sync --group dev
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd apps/frontend && npm install
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env from .env.example...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ Created .env file - please edit with your values$(NC)"; \
	else \
		echo "$(GREEN)✓ .env file already exists$(NC)"; \
	fi

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend Python dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@cd apps/backend && uv sync --group dev

install-frontend: ## Install frontend Node.js dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@cd apps/frontend && npm install

# ============================================================================
# Testing
# ============================================================================

test: test-backend test-frontend ## Run all tests (backend + frontend)
	@$(MAKE) -j2 test-backend test-frontend

test-backend: ## Run backend tests with pytest
	@echo "$(BLUE)Running backend tests...$(NC)"
	@cd apps/backend && uv run pytest

test-frontend: ## Run frontend tests with Vitest
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd apps/frontend && npm test -- --run

test-coverage: ## Run tests with coverage report
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	@cd apps/backend && uv run pytest --cov=app --cov-report=html --cov-report=term
	@cd apps/frontend && npm test -- --run --coverage

# ============================================================================
# Building
# ============================================================================

build: build-frontend ## Build all (frontend only)

build-frontend: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	@cd apps/frontend && npm run build

clean: ## Clean build artifacts and dependencies
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@cd apps/frontend && rm -rf node_modules dist
	@cd apps/backend && rm -rf .venv
	@echo "$(GREEN)✓ Clean complete$(NC)"

# ============================================================================
# Docker
# ============================================================================

docker-up: ## Start Docker containers
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found$(NC)"; \
		echo "$(YELLOW)Run: cp .env.example .env$(NC)"; \
		exit 1; \
	fi
	@docker compose up -d --build
	@echo "$(GREEN)✓ Docker containers started$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend:  http://localhost:8000$(NC)"
	@echo "$(YELLOW)API Health: curl http://localhost:8000/api/health$(NC)"

docker-down: ## Stop and remove Docker containers
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	@docker compose down
	@echo "$(GREEN)✓ Docker containers stopped$(NC)"

docker-restart: ## Restart Docker containers
	@echo "$(BLUE)Restarting Docker containers...$(NC)"
	@docker compose restart
	@echo "$(GREEN)✓ Docker containers restarted$(NC)"

docker-build: ## Rebuild Docker images without starting
	@echo "$(BLUE)Rebuilding Docker images...$(NC)"
	@docker compose build --no-cache
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-logs: ## Show Docker container logs
	@echo "$(BLUE)Showing Docker logs (Ctrl+C to exit)...$(NC)"
	@docker compose logs -f

# ============================================================================
# Code Quality
# ============================================================================

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Run backend linters (ruff, mypy)
	@echo "$(BLUE)Linting backend...$(NC)"
	@cd apps/backend && uv run ruff check .
	@cd apps/backend && uv run mypy app/

lint-frontend: ## Run frontend linter
	@echo "$(BLUE)Linting frontend...$(NC)"
	@cd apps/frontend && npm run lint

format: ## Format all code (backend + frontend)
	@echo "$(BLUE)Formatting backend...$(NC)"
	@cd apps/backend && uv run ruff format app/
	@echo "$(BLUE)Formatting frontend...$(NC)"
	@cd apps/frontend && npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

# ============================================================================
# Environment helpers
# ============================================================================

check-env:
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found$(NC)"; \
		echo "$(YELLOW)Run: cp .env.example .env$(NC)"; \
		exit 1; \
	fi

ensure-pid:
	@mkdir -p .run
