# Windows Desktop Project

This folder contains a Windows desktop wrapper for the VEE Agency app using Electron.

## Prerequisites (on Windows)

- Node.js 18+ (LTS recommended)
- npm

## Run desktop app locally

1. Open terminal in this folder.
2. Install dependencies:
   - npm install
3. Build and copy web app assets from project root:
   - npm run prepare:web
4. Start desktop app:
   - npm run start

## Build a Windows executable

Run:

- npm run dist:win

Output executable will be created in:

- release/VEE-Agency-v1.exe

## Notes

- The packaging script creates a portable x64 .exe target.
- To distribute to users, share the generated .exe from the release folder.
