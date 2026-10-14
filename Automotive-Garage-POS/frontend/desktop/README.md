# Garage POS — Desktop Client (Electron)

This folder contains the desktop packaging and native window manager for Windows (.exe), macOS (.dmg), and Linux (.AppImage).

## Architecture
The desktop client acts as a native shell communicating with the backend over HTTP/REST:
```text
Desktop Client (Electron) ────(HTTP/REST JSON)────► Backend API (Node.js/Express) ────► SQLite DB
```

## Running Desktop
```bash
cd desktop
npm install
npm run start
```

## Building Production Installers
```bash
npm run build
```
Generates Windows, macOS, and Linux installers in `desktop/dist/`.
