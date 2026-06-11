#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Ensure Node 20 is used
nvm use 20

# Get current directory
cd "$(dirname "$0")"

echo "=== Afroza Campus Mobile - Clean Install & Start ==="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Step 1: Clean
echo "Step 1/5: Cleaning installation artifacts..."
rm -rf node_modules package-loc json .expo dist
npm cache clean --force
echo "✅ Clean complete"
echo ""

# Step 2: Install deps
echo "Step 2/5: Installing dependencies..."
npm install
echo "✅ npm install complete"
echo ""

# Step 3: Align Expo SDK 54
echo "Step 3/5: Aligning Expo SDK 54 modules..."
npx expo install \
  react \
  react-native \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-safe-area-context \
  react-native-screens \
  react-native-worklets \
  @expo/vector-icons \
  expo-av \
  expo-constants \
  expo-haptics \
  expo-image-picker \
  expo-linking \
  expo-media-library \
  expo-notifications \
  expo-status-bar
echo "✅ SDK 54 modules aligned"
echo ""

# Step 4: Test Metro/Node compatibility
echo "Step 4/5: Testing Array.toReversed() support..."
node -e 'console.log("✅ node:", [1,2,3].toReversed())'
echo ""

# Step 5: Start Metro
echo "Step 5/5: Starting Metro Bundler..."
npm start
