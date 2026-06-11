#!/bin/bash

# Script de démarrage rapide - Afroza Campus Mobile App
# Usage: ./quick-start.sh

set -e

echo "🚀 Afroza Campus Mobile - Quick Start"
echo "======================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Vérifier Node.js
echo -e "${YELLOW}[1/4]${NC} Vérification de Node.js..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js v20+ requis. Actuel: $(node --version)${NC}"
    echo ""
    echo "Exécuter:"
    echo "  nvm install 20"
    echo "  nvm use 20"
    exit 1
else
    echo -e "${GREEN}✅ Node.js $(node --version) OK${NC}"
fi

# 2. Installer dépendances root
echo ""
echo -e "${YELLOW}[2/4]${NC} Installation des dépendances root..."
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps > /dev/null 2>&1
    echo -e "${GREEN}✅ Dépendances root installées${NC}"
else
    echo -e "${GREEN}✅ Dépendances root déjà présentes${NC}"
fi

# 3. Naviguer au frontend mobile
echo ""
echo -e "${YELLOW}[3/4]${NC} Préparation du frontend mobile..."
cd frontend/mobile

if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps > /dev/null 2>&1
    echo -e "${GREEN}✅ Dépendances mobile installées${NC}"
else
    echo -e "${GREEN}✅ Dépendances mobile déjà présentes${NC}"
fi

# 4. Lancer le serveur
echo ""
echo -e "${YELLOW}[4/4]${NC} Démarrage de Metro Bundler..."
echo ""
echo -e "${GREEN}✅ Tout est prêt!${NC}"
echo ""
echo "Exécution: npm start"
echo ""

npm start
