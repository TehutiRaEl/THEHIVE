#!/bin/bash
# Setup Script — Sovereign Hive v11.0
# Initial setup with virtual environment and dependencies.

set -e

echo "==================================="
echo "🍄 SOVEREIGN HIVE v11.0 — Setup"
echo "==================================="

# ─── Check Python ─────────────────────────────────────────────
echo "🐍 Checking Python version..."
if ! command -v python3.11 &> /dev/null; then
    echo "⚠️ Python 3.11 not found. Installing..."
    sudo apt update && sudo apt install python3.11 python3.11-venv python3.11-dev -y
fi

PYTHON_VERSION=$(python3.11 --version 2>&1)
echo "✅ $PYTHON_VERSION"

# ─── Virtual Environment ──────────────────────────────────────
echo "📦 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3.11 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# ─── Activate ──────────────────────────────────────────────────
source venv/bin/activate
echo "✅ Virtual environment activated"

# ─── Install Dependencies ─────────────────────────────────────
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencies installed"

# ─── Initialize Database ─────────────────────────────────────
echo "🗄️ Initializing database..."
python -c "from backend.core.db import init_db; init_db()"
echo "✅ Database initialized"

# ─── Create Directories ──────────────────────────────────────
echo "📁 Creating directories..."
mkdir -p data chroma_db logs backups
echo "✅ Directories created"

# ─── Environment File ─────────────────────────────────────────
echo "🔐 Setting up environment..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ .env.local created from example"
        echo "⚠️ Edit .env.local with your configuration"
    else
        echo "⚠️ No .env.local.example found. Creating default..."
        cat > .env.local << EOF
JASPER_API_KEY=$(openssl rand -hex 16)
JWT_SECRET_KEY=$(openssl rand -hex 32)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b
LLM_PROVIDER=auto
DB_PATH=jasper_memory.db
EOF
        echo "✅ .env.local created with random keys"
    fi
else
    echo "✅ .env.local already exists"
fi

# ─── Health Check ─────────────────────────────────────────────
echo "🏥 Running health check..."
python scripts/healthcheck.py
echo "✅ Health check passed"

echo ""
echo "==================================="
echo "✅ Setup Complete!"
echo "==================================="
echo ""
echo "🚀 To start the hive:"
echo "  source venv/bin/activate"
echo "  make dev"
echo ""
echo "📊 To run tests:"
echo "  make test"
echo ""
echo "🐳 To deploy with Docker:"
echo "  make docker-build"
echo "  make docker-up"
echo "==================================="
