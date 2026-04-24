#!/bin/bash

# ============================================================
# AI Public Records Search Agent - Start Script
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     AI Public Records Search Agent                  ║"
echo "║     Intelligent GovTech Platform                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Kill processes on ports 3000 and 3001 ----
echo -e "${YELLOW}[1/7] Cleaning up used ports...${NC}"
for PORT in 3000 3001; do
  PID=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "  Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null || true
    sleep 1
  fi
done
echo -e "${GREEN}  Ports 3000 and 3001 are free.${NC}"

# ---- Check for .env file ----
echo -e "${YELLOW}[2/7] Checking environment configuration...${NC}"
ENV_FILE="$(dirname "$0")/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}  ERROR: .env file not found!${NC}"
  echo -e "  Please create .env file with your configuration."
  exit 1
fi
echo -e "${GREEN}  .env file found.${NC}"

# ---- Check PostgreSQL ----
echo -e "${YELLOW}[3/7] Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -q 2>/dev/null; then
    echo -e "${GREEN}  PostgreSQL is running.${NC}"
  else
    echo -e "${CYAN}  Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -q 2>/dev/null; then
      echo -e "${GREEN}  PostgreSQL started.${NC}"
    else
      echo -e "${RED}  WARNING: PostgreSQL may not be running. Please start it manually.${NC}"
    fi
  fi
else
  echo -e "${YELLOW}  pg_isready not found. Assuming PostgreSQL is running.${NC}"
fi

# ---- Create database if not exists ----
echo -e "${YELLOW}[4/7] Setting up database...${NC}"
source "$ENV_FILE" 2>/dev/null || true
DB_NAME="${DB_NAME:-public_records_db}"
DB_USER="${DB_USER:-postgres}"

# Try to create the database (ignore errors if it already exists)
createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null && echo -e "${GREEN}  Database '$DB_NAME' created.${NC}" || echo -e "${CYAN}  Database '$DB_NAME' already exists.${NC}"

# ---- Install dependencies ----
echo -e "${YELLOW}[5/7] Installing dependencies...${NC}"
cd "$(dirname "$0")"

echo -e "  Installing backend dependencies..."
cd backend
npm install --silent 2>&1 | tail -1
cd ..

echo -e "  Installing frontend dependencies..."
cd frontend
npm install --silent 2>&1 | tail -1
cd ..

echo -e "${GREEN}  Dependencies installed.${NC}"

# ---- Seed database ----
echo -e "${YELLOW}[6/7] Seeding database with sample data...${NC}"
cd backend
node seeds/seed.js
cd ..
echo -e "${GREEN}  Database seeded successfully.${NC}"

# ---- Start applications with hot reload ----
echo -e "${YELLOW}[7/7] Starting applications with hot reload...${NC}"
echo ""
echo -e "${CYAN}  Backend:  http://localhost:3001 (nodemon - auto reload)${NC}"
echo -e "${CYAN}  Frontend: http://localhost:3000 (react-scripts - auto reload)${NC}"
echo ""
echo -e "${PURPLE}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Application is starting...${NC}"
echo -e "${GREEN}  Login: admin@publicrecords.gov / admin123${NC}"
echo -e "${PURPLE}══════════════════════════════════════════════════════${NC}"
echo ""

# Start backend with nodemon (hot reload)
cd "$(dirname "$0")/backend"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend (built-in hot reload with react-scripts)
cd "$(dirname "$0")/frontend"
BROWSER=none PORT=3000 npm start &
FRONTEND_PID=$!

# Trap to kill both on exit
trap "echo -e '\n${YELLOW}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo -e "${GREEN}Both servers started. Press Ctrl+C to stop.${NC}"
echo ""

# Wait for both processes
wait
