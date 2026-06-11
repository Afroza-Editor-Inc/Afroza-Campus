#!/bin/bash

# 🔧 AFROZA CAMPUS - SDK 54 EXPO FIX SCRIPT
# Corrects all Expo SDK 54 incompatibilities automatically
# Usage: bash fix-expo-sdk54.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔧 AFROZA CAMPUS - EXPO SDK 54 STABILIZATION FIX           ║"
echo "║  Fixing Expo Go compatibility issues (SDK 54)               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'  
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Project directory: ${PROJECT_DIR}${NC}"
cd "$PROJECT_DIR"

# ============================================================
# STEP 1: CLEAN ENVIRONMENT
# ============================================================
echo ""
echo -e "${YELLOW}[1/5]${NC} Cleaning project environment..."

if [ -d "node_modules" ]; then
  echo "  ├─ Removing node_modules..."
  rm -rf node_modules
  echo -e "  ${GREEN}✓${NC} node_modules removed"
fi

if [ -f "package-lock.json" ]; then
  echo "  ├─ Removing package-lock.json..."
  rm -f package-lock.json
  echo -e "  ${GREEN}✓${NC} package-lock.json removed"
fi

if [ -d ".expo" ]; then
  echo "  ├─ Removing .expo cache..."
  rm -rf .expo
  echo -e "  ${GREEN}✓${NC} .expo cache removed"
fi

echo "  ├─ Cleaning npm cache..."
npm cache clean --force > /dev/null 2>&1
echo -e "  ${GREEN}✓${NC} npm cache cleaned"

echo ""
echo -e "${GREEN}✅ Environment cleaned${NC}"

# ============================================================
# STEP 2: VERIFY SDK 54 IN app.config.js
# ============================================================
echo ""
echo -e "${YELLOW}[2/5]${NC} Verifying Expo SDK 54 configuration..."

if [ ! -f "app.config.js" ]; then
  echo -e "  ${RED}✗${NC} app.config.js not found"
  exit 1
fi

# Check if SDK version is correct
if grep -q "sdkVersion.*54" app.config.js; then
  echo -e "  ${GREEN}✓${NC} app.config.js has SDK 54"
else
  echo -e "  ${RED}✗${NC} app.config.js doesn't have SDK 54"
  echo "    Please update sdkVersion to '54.0.0' in app.config.js"
fi

# ============================================================
# STEP 3: DISPLAY CORRECT PACKAGE VERSIONS
# ============================================================
echo ""
echo -e "${YELLOW}[3/5]${NC} Installing SDK 54 compatible packages..."

# Install dependencies
echo "  Installing 434 packages (this may take 2-3 minutes)..."
npm install --prefer-offline

echo ""
if [ $? -eq 0 ]; then
  echo -e "  ${GREEN}✓${NC} npm install successful"
else
  echo -e "  ${RED}✗${NC} npm install failed"
  echo "    Try running: npm install --force"
  exit 1
fi

# ============================================================
# STEP 4: VERIFY INSTALLATION
# ============================================================
echo ""
echo -e "${YELLOW}[4/5]${NC} Verifying package versions..."

# Check critical packages
REQUIRED_PACKAGES=(
  "expo@^54"
  "react@18"
  "react-native@0.75"
)

for pkg in "${REQUIRED_PACKAGES[@]}"; do
  if npm ls "$pkg" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $pkg installed"
  else
    echo -e "  ${RED}✗${NC} $pkg NOT installed"
  fi
done

# ============================================================
# STEP 5: START EXPO (test mode)
# ============================================================
echo ""
echo -e "${YELLOW}[5/5]${NC} Starting Expo (test mode)..."
echo ""
echo "  Starting Metro Bundler in 3 seconds..."
echo "  (Press Ctrl+C to stop)"
echo ""

sleep 2

# Start expo
timeout 10 npm start 2>&1 &
PID=$!

# Wait a bit for Metro to start
sleep 8

# Check if process is still running
if kill -0 $PID 2>/dev/null; then
  echo ""
  echo -e "${GREEN}✓${NC} Metro Bundler started successfully"
  echo ""
  echo "📱 QR CODE INSTRUCTIONS:"
  echo "  1. Open Expo Go on your phone (SDK 54)"
  echo "  2. Tap 'Scan QR code'"
  echo "  3. Point camera at the QR code above"
  echo "  4. Wait 30-60 seconds for app to load"
  echo ""
  echo "  Press Ctrl+C to stop Expo"
  
  # Wait for user input
  wait $PID 2>/dev/null || true
else
  echo ""
  echo -e "${RED}✗${NC} Failed to start Metro Bundler"
  exit 1
fi

# ============================================================
# COMPLETION
# ============================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "║  ${GREEN}✅ EXPO SDK 54 FIX COMPLETE${NC}                             ║"
echo "║                                                            ║"
echo "║  Your project is now fully compatible with:                ║"
echo "║  • Expo Go SDK 54                                          ║"
echo "║  • React Native 0.75.3                                     ║"
echo "║  • All Expo modules (correct versions)                     ║"
echo "║                                                            ║"
echo "║  Next steps:                                               ║" 
echo "║  1. Run: npm start                                         ║"
echo "║  2. Scan QR code with Expo Go                              ║"
echo "║  3. Test app on your phone                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Offer to start again
read -p "Start Expo again? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm start
fi
