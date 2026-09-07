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

# ── 1. Eksik Sistem Paketlerini Otomatik Kur ──
echo -e "${CYAN}[1/4]${NC} Sistem gereksinimleri kontrol ediliyor..."
NEEDS_INSTALL=0

if ! command -v python3 &>/dev/null; then NEEDS_INSTALL=1; fi
if ! command -v npm &>/dev/null; then NEEDS_INSTALL=1; fi
if ! command -v ffmpeg &>/dev/null; then NEEDS_INSTALL=1; fi

# Python venv kontrolü (Debian/Ubuntu/Mint'te python3-venv ayrı pakettir)
if command -v python3 &>/dev/null; then
    if ! python3 -m venv --help &>/dev/null; then
        NEEDS_INSTALL=1
    fi
fi

if [ $NEEDS_INSTALL -eq 1 ]; then
    echo -e "${YELLOW}  Eksik sistem paketleri tespit edildi (Python, Node.js, FFmpeg vb.).${NC}"
    echo -e "${YELLOW}  Kurulum için yönetici izni (sudo) şifreniz istenebilir...${NC}"
    
    if command -v apt-get &>/dev/null; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-venv python3-pip nodejs npm curl ffmpeg
    elif command -v dnf &>/dev/null; then
        sudo dnf install -y python3 python3-pip nodejs npm curl ffmpeg
    elif command -v pacman &>/dev/null; then
        sudo pacman -Sy --noconfirm python python-pip nodejs npm curl ffmpeg
    elif command -v zypper &>/dev/null; then
        sudo zypper install -y python3 python3-pip nodejs npm curl ffmpeg
    else
        echo -e "${RED}✘ Desteklenmeyen paket yöneticisi! Lütfen şu paketleri manuel kurun:${NC}"
        echo -e "python3, python3-venv, pip, nodejs, npm, ffmpeg"
        exit 1
    fi
    echo -e "  ${GREEN}✔${NC} Sistem paketleri başarıyla kuruldu."
else
    echo -e "  ${GREEN}✔${NC} Gerekli tüm sistem araçları zaten kurulu."
fi

# ── 2. Backend Kurulumu ──
echo -e "${CYAN}[2/4]${NC} Backend (API) hazırlanıyor..."
VENV_DIR="$BACKEND_DIR/venv"
VENV_PY="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"
VENV_UVICORN="$VENV_DIR/bin/uvicorn"

if [ ! -d "$VENV_DIR" ]; then
    echo -e "  ${YELLOW}→${NC} Python sanal ortamı (venv) oluşturuluyor..."
    python3 -m venv "$VENV_DIR" || {
        echo -e "${RED}✘ Sanal ortam oluşturulamadı! Lütfen sisteminizde python3-venv paketinin kurulu olduğundan emin olun.${NC}"
        exit 1
    }
fi

# Paketlerin (FastAPI, yt-dlp vb.) varlığını kontrol et
if ! "$VENV_PY" -c "import fastapi, yt_dlp, youtube_transcript_api" 2>/dev/null; then
    echo -e "  ${YELLOW}→${NC} Python kütüphaneleri indiriliyor..."
    "$VENV_PIP" install -q -r "$BACKEND_DIR/requirements.txt" || {
        echo -e "${RED}✘ Python paketleri kurulamadı!${NC}"
        exit 1
    }
else
    echo -e "  ${GREEN}✔${NC} Python paketleri hazır."
fi

# ── 3. Frontend Kurulumu ──
echo -e "${CYAN}[3/4]${NC} Frontend (Arayüz) hazırlanıyor..."
if [ ! -d "$FRONTEND_DIR/node_modules" ] || [ ! -d "$FRONTEND_DIR/node_modules/vite" ]; then
    echo -e "  ${YELLOW}→${NC} React ve bağımlılıkları indiriliyor..."
    npm install --prefix "$FRONTEND_DIR" --silent || {
        echo -e "${RED}✘ npm paketleri kurulamadı!${NC}"
        exit 1
    }
else
    echo -e "  ${GREEN}✔${NC} Frontend paketleri hazır."
fi

# ── 4. Sunucuları Başlat ──
echo -e "${CYAN}[4/4]${NC} Servisler ayağa kaldırılıyor..."
echo ""

# Backend'i doğrudan venv içindeki uvicorn binary'si ile başlatıyoruz (Böylece global komut çakışmaları önlenir)
"$VENV_UVICORN" main:app --host 0.0.0.0 --port 8000 --app-dir "$BACKEND_DIR" &
BACKEND_PID=$!

# Frontend'i başlat
npm run dev --prefix "$FRONTEND_DIR" &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✔ TubiScribe Kullanıma Hazır!${NC}"
echo -e ""
echo -e "  ${CYAN}TubiScribe Arayüzü →${NC} http://localhost:5173"
echo -e "  ${CYAN}Backend (API)      →${NC} http://localhost:8000"
echo -e "  ${CYAN}API Dokümanı       →${NC} http://localhost:8000/docs"
echo -e ""
echo -e "  ${YELLOW}Uygulamayı kapatmak için bu terminalde Ctrl+C yapın.${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

wait
