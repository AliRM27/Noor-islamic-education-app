# Noor — Islamic Education App for Children 🌙

**نُور** (*Noor* — Arabic for "Light") — A mobile app teaching the Arabic alphabet to Muslim children aged 4–8.

## Tech Stack
| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo 56) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens) |
| Audio | expo-speech (TTS placeholder) |
| State | Zustand |

## Project Structure
```
islamic-education-app/
├── app/          # Expo React Native app
├── backend/      # Node.js + Express API
└── README.md
```

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI + secrets
npm run dev            # Starts on http://localhost:3000
```

### 2. Seed the Database (28 Letters)
```bash
cd backend
npm run seed
```

### 3. Run the Expo App
```bash
cd app
npm install
npx expo start
```
Then open in **Expo Go** on your phone, or press `i` for iOS Simulator / `a` for Android.

## Environment Variables (backend/.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/noor
# Replace with your MongoDB Atlas URI when ready
JWT_SECRET=<generate a secure random string>
JWT_REFRESH_SECRET=<generate a different secure random string>
```

## Design Colors
| Color | Hex | Usage |
|---|---|---|
| Deep Teal | `#1B6B5A` | Primary |
| Warm Gold | `#D4A843` | Accent |
| Soft Cream | `#FBF7F0` | Background |
| Near-Black | `#1A1A1A` | Text |
| Success Green | `#4CAF7D` | Correct answer |

## Fonts
- Arabic: **Noto Naskh Arabic** (Google Fonts) — beautiful Naskh calligraphy
- English/UI: **Nunito** (Google Fonts) — rounded, child-friendly

## Content
28 Arabic letters seeded into MongoDB with:
- Letter character + all 4 forms (isolated/initial/medial/final)
- English & Arabic names
- 1 lesson per letter → 4 exercise types each:
  1. **Listen & Tap** — hear the letter, tap the correct one
  2. **Match Name** — see the letter, pick the correct name
  3. **Tracing** — trace the letter with your finger
  4. **Tap Letter** — find the letter from a grid

## Gamification
- 🌟 **Stars**: 1–3 per lesson (accuracy-based: 90%+ = 3 stars)
- 🪙 **Coins**: 10/20/30 per lesson (by stars earned)
- 🔥 **Streak**: Daily lesson streak tracker

## Phase 2 (TODO)
- Parent account (email + password)
- Avatar shop (spend coins)
- Push notifications
- App Store + Google Play submission

*Stack: React Native (Expo) · Node.js/Express · MongoDB*
*Target: Children aged 4–8 · Launch market: Germany*
