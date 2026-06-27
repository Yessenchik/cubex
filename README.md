# Cubex

Cubex is a 3D Rubik's-style cube experience built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and Zustand.

The project has two connected identities:

- **Play Mode**: a clean cube trainer for mixing, practicing notation, exploring solving guides, and interacting with a realistic 3x3 cube.
- **Friend Mode**: a toy-like cube companion with arms, legs, face animation, chat replies, moods, and actions.

The bigger idea is to make Cubex feel less like a static cube demo and more like a small product with personality: part trainer, part toy, part future interactive companion.

## What Cubex Is

Cubex is not just a rotating cube on a webpage. It is a foundation for a cube-centered app where the same 3D object can behave as:

- a real trainer cube with clean controls and solving tools;
- a customizable branded cube with a logo on the white center face;
- a character that can talk, react, move, and eventually use richer animation or AI behavior;
- a future bridge between hand-built Three.js primitives and imported Blender models.

## Current Features

### Play Mode

- Real 3x3 cube model made from individual cubies.
- Animated slice turns for outer and middle moves.
- Move queue so manual moves and scrambles animate in order.
- Mouse drag gestures for visible-face slice rotation.
- Manual notation buttons:
  - `U`, `D`, `R`, `L`, `F`, `B`
  - `M`, `E`, `S`
  - prime variants for each move
- Mix cube and solved-state reset.
- Move history.
- Quick solving guide tabs for:
  - CFOP / Fridrich
  - ZBLL
  - OLL
  - PLL
- Brand logo attached to the original white center sticker, so it follows the real cube face.

### Friend Mode

- Cubex character version with cube body, arms, legs, and face.
- Fixed friendly pose.
- Toy actions:
  - Wave
  - Jump
  - Spin
  - Thinking
  - Talking
  - Idle
- Chat input with simple local replies.
- Dialogue bubble above Cubex with typing animation.
- Smooth character-part presence when switching between friend and play modes.

### Customize Mode

- Color presets.
- Per-face color controls.
- Brand styling preserved on the white center face.

### Loading Experience

- Mini cube loader.
- Loader is an overlay while the app and Three.js scene mount behind it.
- Loader waits for the scene to render before disappearing.

## Tech Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Docker + Nginx for production serving

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Docker

Build and run Cubex with Docker:

```bash
docker build -t cubex .
docker run --rm -p 8080:80 cubex
```

Open:

```text
http://localhost:8080
```

Or use Docker Compose:

```bash
docker compose up --build
```

The production container builds the Vite app with Node and serves the static files through Nginx.

## Project Structure

```text
src/
  App.tsx                    Small application shell and loader coordination
  components/
    ControlPanel.tsx         Right-side modes, trainer, friend, and customize UI
    CubexFriend.tsx          Friend face, limbs, and dialogue components
    CubexLoader.tsx          Mini cube loading overlay
    CubexScene.tsx           React Three Fiber canvas, lights, environment, shadows
    Cubie.tsx                Individual cubie rendering, stickers, center logo
    RubiksCube.tsx           Main 3D scene orchestration and animation loop
    SceneReadySignal.tsx     Reports when the 3D scene has rendered
  data/
    appData.ts               Mode lists, move buttons, editable faces, solving guides
  scene/
    cubeGestures.ts          Drag gesture interpretation and turn animation helpers
  store/
    cubeModel.ts             Pure cube model, moves, stickers, scramble generation
    useCubeStore.ts          Zustand app state and actions
  types/
    cube.ts                  Shared domain types
  index.css                  Layout, panel, scene, loader, and control styling
```

## Architecture Notes

The cube state is sticker-based: each cubie tracks which original face color is currently visible on each side. This keeps colors stable through turns and makes the white center logo belong to the actual cube face instead of floating in the scene.

The store handles app state and move queues. Pure cube transformations live in `cubeModel.ts`, while gesture interpretation lives in `cubeGestures.ts`. This keeps the 3D scene focused on rendering and animation.

## Roadmap

- Improve touch gestures for mobile.
- Add algorithm playback for strings like `R U R' U'`.
- Add inverse solve playback after scrambling.
- Expand solving guides into step-by-step interactive training.
- Persist custom colors and presets.
- Replace or enhance the friend character with a Blender `.glb` model.
- Add richer Cubex personality, memory, and conversation behavior.
