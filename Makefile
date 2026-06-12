.PHONY: setup dev test clean docker-build docker-up lint

setup:
	pip install -r requirements.txt
	python scripts/init_db.py

dev:
	uvicorn backend.main:app --reload --host 0.0.0.0 --port 8080

test:
	pytest tests/ -v --asyncio-mode=auto

test-cov:
	pytest tests/ -v --cov=backend --cov-report=html

lint:
	flake8 backend/ --max-line-length=120

docker-build:
	docker build -t jasper-hive:v11 .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	rm -f *.db
	rm -rf chroma_db/
	rm -rf __pycache__/
	rm -rf backups/
	rm -rf .coverage htmlcov/
