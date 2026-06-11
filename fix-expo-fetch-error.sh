#!/bin/bash
# 🔧 EXPO FETCH ERROR - QUICK FIX SCRIPT
# Run this if you encounter TypeError: fetch failed again

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/frontend/mobile" && pwd)"
cd "$PROJECT_DIR"

echo "=============================================="
echo "🔧 EXPO FETCH ERROR FIX SCRIPT"
echo "=============================================="
echo ""
echo "Working directory: $PROJECT_DIR"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Clean npm cache
echo "${YELLOW}[1/5]${NC} Cleaning npm cache..."
npm cache clean --force > /dev/null 2>&1
echo "${GREEN}✓${NC} npm cache cleaned"
echo ""

# Step 2: Remove node_modules and package-lock
echo "${YELLOW}[2/5]${NC} Removing old dependencies..."
rm -rf node_modules package-lock.json .expo
echo "${GREEN}✓${NC} Cleaned node_modules, package-lock.json, .expo"
echo ""

# Step 3: Reinstall fresh dependencies
echo "${YELLOW}[3/5]${NC} Reinstalling dependencies..."
npm install
echo "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 4: Optional - Upgrade outdated packages
echo "${YELLOW}[4/5]${NC} Check expo doctor..."
npx expo-doctor 2>&1 | head -20 || true
echo ""

# Step 5: Ready to start
echo "${YELLOW}[5/5]${NC} Ready to start Expo"
echo ""
echo "${GREEN}✅ FIX COMPLETE!${NC}"
echo ""
echo "To start your app, run:"
echo "  ${GREEN}npm start${NC}"
echo ""
echo "Or with options:"
echo "  npm run start:offline     (no network validation)"
echo "  npm run start:lan         (LAN only)"
echo "  npm run start:tunnel      (tunnel for remote testing)"
echo ""

# Ask to start now
read -p "Start Expo now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Starting Expo..."
  npm start
else
  echo "Skipped. Run 'npm start' when ready."
fi
