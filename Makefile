.PHONY: help install migrate server shell superuser clean test logs status stop deploy deploy-api deploy-web

BACKEND_DIR = client2
VENV = $(BACKEND_DIR)/venv
PYTHON = $(VENV)/bin/python
PIP = $(VENV)/bin/pip
MANAGE = $(PYTHON) $(BACKEND_DIR)/manage.py

help:
	@echo "Print Duka - Development Commands"
	@echo "=================================="
	@echo "make install       - Install Python dependencies"
	@echo "make migrate       - Run database migrations"
	@echo "make server        - Start Django development server"
	@echo "make superuser     - Create Django superuser"
	@echo "make shell         - Open Django shell"
	@echo "make logs          - Show server logs"
	@echo "make status        - Check if server is running"
	@echo "make stop          - Stop Django server"
	@echo "make clean         - Clean Python cache files"
	@echo "make test          - Run tests"
	@echo ""
	@echo "Deployment"
	@echo "----------"
	@echo "make deploy        - Deploy both API and web to Railway"
	@echo "make deploy-api    - Deploy Django API to Railway"
	@echo "make deploy-web    - Deploy Next.js web to Railway"

install:
	@echo "Installing Python dependencies..."
	cd $(BACKEND_DIR) && python3 -m venv venv
	$(PIP) install --upgrade pip
	$(PIP) install -r $(BACKEND_DIR)/requirements.txt
	$(PIP) install Django djangorestframework djangorestframework-simplejwt
	$(PIP) install python-decouple dj-database-url django-cors-headers
	$(PIP) install drf-yasg django-filter psycopg2-binary python-dotenv
	$(PIP) install celery django-celery-results whitenoise django-jazzmin
	$(PIP) install pillow requests faker gunicorn python-quickbooks intuit-oauth
	@echo "✅ Dependencies installed successfully"

migrate:
	@echo "Running database migrations..."
	$(MANAGE) migrate
	@echo "✅ Migrations completed"

server:
	@echo "Starting Django development server on http://localhost:8000"
	@echo "Swagger API: http://localhost:8000/swagger/"
	@echo "Admin Panel: http://localhost:8000/admin/ (admin/admin123)"
	@echo "Press Ctrl+C to stop the server"
	@echo ""
	$(MANAGE) runserver 0.0.0.0:8000

superuser:
	@echo "Creating superuser..."
	$(MANAGE) createsuperuser

shell:
	@echo "Opening Django shell..."
	$(MANAGE) shell

logs:
	@tail -f $(BACKEND_DIR)/logs/*.log 2>/dev/null || echo "No logs found"

status:
	@echo "Checking server status..."
	@ss -tuln | grep 8000 && echo "✅ Server is running on port 8000" || echo "❌ Server is not running"

stop:
	@echo "Stopping Django server..."
	@pkill -f "manage.py runserver" && echo "✅ Server stopped" || echo "Server not running"

clean:
	@echo "Cleaning Python cache files..."
	find $(BACKEND_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find $(BACKEND_DIR) -type f -name "*.pyc" -delete 2>/dev/null || true
	find $(BACKEND_DIR) -type f -name "*.pyo" -delete 2>/dev/null || true
	@echo "✅ Cache cleaned"

test:
	@echo "Running tests..."
	$(MANAGE) test

deploy-api:
	@echo "Deploying Django API to Railway..."
	cd $(BACKEND_DIR) && railway up --detach
	@echo "✅ API deployment triggered"

deploy-web:
	@echo "Deploying Next.js web to Railway..."
	cd web && railway up --detach
	@echo "✅ Web deployment triggered"

deploy: deploy-api deploy-web
	@echo "✅ Both services deployed"
