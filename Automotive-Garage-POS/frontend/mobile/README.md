# Garage POS — Mobile Client (Capacitor)

This folder contains mobile client packaging for iOS and Android tablets and smartphones used by garage technicians on the shop floor.

## Mobile Architecture
Mobile mechanics capture inspection photos, check job cards, and look up vehicle history via the Backend REST API:
```text
Mobile Tablet/Phone ────(HTTP/REST JSON)────► Backend API (Node.js/Express) ────► SQLite DB
```

## Running Mobile
```bash
cd mobile
npm install
npm run sync
npm run android   # Opens Android Studio
npm run ios       # Opens Xcode on macOS
```
