#!/bin/bash
set -e

# ─────────────────────────────────────────────
#  TubiScribe — Tek Komutla Kur ve Çalıştır
# ─────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔════════════════════════════════════╗"
echo "  ║         TubiScribe v1.0            ║"
echo "  ║   YouTube Transkript Motoru        ║"
echo "  ╚════════════════════════════════════╝"
echo -e "${NC}"

cleanup() {
    echo -e "\n${YELLOW}Sunucular kapatılıyor...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Temiz çıkış yapıldı.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── 1. Python kontrolü ──
echo -e "${CYAN}[1/5]${NC} Python kontrol ediliyor..."
if command -v python3 &>/dev/null; then
    PY=$(command -v python3)
    echo -e "  ${GREEN}✔${NC} Python bulundu: $($PY --version)"
else
    echo -e "  ${RED}✘ Python3 bulunamadı. Lütfen kurun: sudo apt install python3 python3-venv${NC}"
    exit 1
fi

# ── 2. Node.js kontrolü ──
echo -e "${CYAN}[2/5]${NC} Node.js kontrol ediliyor..."
if command -v node &>/dev/null; then
    echo -e "  ${GREEN}✔${NC} Node.js bulundu: $(node --version)"
else
    echo -e "  ${RED}✘ Node.js bulunamadı. Lütfen kurun: https://nodejs.org${NC}"
    exit 1
fi

# ── 3. Backend kurulumu ──
echo -e "${CYAN}[3/5]${NC} Backend kuruluyor..."
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "  ${YELLOW}→${NC} Sanal ortam oluşturuluyor..."
    $PY -m venv "$BACKEND_DIR/venv"
fi

source "$BACKEND_DIR/venv/bin/activate"

# Paketlerin kurulu olup olmadığını kontrol et
if ! python3 -c "import fastapi, yt_dlp, youtube_transcript_api" 2>/dev/null; then
    echo -e "  ${YELLOW}→${NC} Python paketleri kuruluyor..."
    pip install -q -r "$BACKEND_DIR/requirements.txt"
else
    echo -e "  ${GREEN}✔${NC} Python paketleri zaten kurulu"
fi

# ── 4. Frontend kurulumu ──
echo -e "${CYAN}[4/5]${NC} Frontend kuruluyor..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "  ${YELLOW}→${NC} npm paketleri kuruluyor..."
    npm install --prefix "$FRONTEND_DIR" --silent
else
    echo -e "  ${GREEN}✔${NC} npm paketleri zaten kurulu"
fi

# ── 5. Sunucuları başlat ──
echo -e "${CYAN}[5/5]${NC} Sunucular başlatılıyor..."
echo ""

# Backend
source "$BACKEND_DIR/venv/bin/activate"
uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir "$BACKEND_DIR" &
BACKEND_PID=$!

# Frontend
npm run dev --prefix "$FRONTEND_DIR" &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✔ TubiScribe hazır!${NC}"
echo -e ""
echo -e "  ${CYAN}Backend  →${NC} http://localhost:8000"
echo -e "  ${CYAN}Frontend →${NC} http://localhost:5173"
echo -e "  ${CYAN}API Docs →${NC} http://localhost:8000/docs"
echo -e ""
echo -e "  ${YELLOW}Kapatmak için: Ctrl+C${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

wait
