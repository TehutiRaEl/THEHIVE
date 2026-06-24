.PHONY: setup dev test clean docker-build docker-up backup tier3-check

setup:
	pip install -r requirements.txt
	python scripts/init_db.py
	@echo "✅ Setup complete. Run 'make dev' to start the hive."

dev:
	python jasper_v9_complete.py

test:
	pytest tests/ -v --cov=backend --cov-report=term-missing

test-unit:
	pytest tests/unit/ -v

test-integration:
	pytest tests/integration/ -v

docker-build:
	docker build -t jasper-hive:v9 -f Dockerfile .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

backup:
	python scripts/backup.py

clean:
	rm -f *.db
	rm -rf chroma_db/
	rm -rf __pycache__/
	rm -rf backups/*.db

# ─── Tier 3 Targets ──────────────────────────────────────────
tier3-check:
	@echo "🔍 Checking Tier 3 services..."
	@curl -s http://localhost:8080/tier3/status | python -m json.tool || echo "❌ Tier 3 services not responding"

tier3-quantum:
	@echo "🔬 Testing Quantum Bridge..."
	@curl -s http://localhost:8080/quantum/qrng?n_bits=16 | python -m json.tool

tier3-sheaf:
	@echo "🔐 Testing Sheaf Guild..."
	@curl -s http://localhost:8080/sheaf/guilds | python -m json.tool

tier3-pubsub:
	@echo "📡 Testing IPFS PubSub..."
	@curl -s http://localhost:8080/pubsub/channels | python -m json.tool

tier3-arena:
	@echo "⚔️ Testing Arena Renderer..."
	@curl -s "http://localhost:8080/arena/render/voxels/TEST_COLONY?ticks=3" | python -m json.tool

tier3-tesseract:
	@echo "🧊 Testing Tesseract Model..."
	@curl -s http://localhost:8080/tesseract_model/status | python -m json.tool

tier3-all: tier3-check tier3-quantum tier3-sheaf tier3-pubsub tier3-arena tier3-tesseract

# ─── Health Check ────────────────────────────────────────────
health:
	@curl -s http://localhost:8080/health | python -m json.tool

board:
	@curl -s http://localhost:8080/v9/board | python -m json.tool
