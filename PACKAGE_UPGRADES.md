# 📦 PACKAGE UPGRADES - EXPO 55 COMPATIBILITY

## Run when Metro Bundler finishes successfully

After Expo starts and runs successfully, upgrade these packages to match Expo 55:

### ONE-LINE COMMAND (Copy-Paste)
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

npm install \
  expo-constants@~55.0.14 \
  expo-haptics@~55.0.14 \
  expo-image-picker@~55.0.18 \
  expo-linking@~55.0.13 \
  expo-media-library@~55.0.14 \
  expo-notifications@~55.0.19 \
  expo-status-bar@~55.0.5 \
  react@19.2.0 \
  react-native@0.83.4 \
  react-native-gesture-handler@~2.30.0 \
  react-native-pager-view@8.0.0 \
  react-native-reanimated@4.2.1 \
  react-native-screens@~4.23.0 \
  react-native-worklets@0.7.2 \
  @types/react@~19.2.10 \
  --save
```

### BY CATEGORY (If above fails)

#### Expo Packages (Most Important)
```bash
npm install \
  expo-constants@~55.0.14 \
  expo-haptics@~55.0.14 \
  expo-image-picker@~55.0.18 \
  expo-linking@~55.0.13 \
  expo-media-library@~55.0.14 \
  expo-notifications@~55.0.19 \
  expo-status-bar@~55.0.5 \
  --save
```

#### React Packages  
```bash
npm install \
  react@19.2.0 \
  react-native@0.83.4 \
  --save
```

#### Navigation & UI Libraries
```bash
npm install \
  react-native-gesture-handler@~2.30.0 \
  react-native-pager-view@8.0.0 \
  react-native-reanimated@4.2.1 \
  react-native-screens@~4.23.0 \
  --save
```

#### Other
```bash
npm install \
  react-native-worklets@0.7.2 \
  @types/react@~19.2.10 \
  --save
```

---

## INDIVIDUAL UPGRADES (If one fails)

```bash
# Expo packages
npm install expo-constants@~55.0.14 --save
npm install expo-haptics@~55.0.14 --save
npm install expo-image-picker@~55.0.18 --save
npm install expo-linking@~55.0.13 --save
npm install expo-media-library@~55.0.14 --save
npm install expo-notifications@~55.0.19 --save
npm install expo-status-bar@~55.0.5 --save

# React
npm install react@19.2.0 --save
npm install react-native@0.83.4 --save

# Navigation
npm install react-native-gesture-handler@~2.30.0 --save
npm install react-native-pager-view@8.0.0 --save
npm install react-native-reanimated@4.2.1 --save
npm install react-native-screens@~4.23.0 --save

# Other
npm install react-native-worklets@0.7.2 --save
npm install @types/react@~19.2.10 --save
```

---

## AFTER UPGRADING

```bash
# Test again
npm start

# If issues, run doctor
npm run doctor

# Auto-fix issues
npm run doctor:fix
```

---

## IF SOMETHING BREAKS

```bash
# Revert to working state
git checkout package.json package-lock.json
rm -rf node_modules
npm install
npm start

# Only install one package at a time if broken
npm install expo-constants@~55.0.14 --save
npm start  # Test each one
```

**Note**: These upgrades should be done AFTER confirming Expo starts successfully.
