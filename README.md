# Cubex

Cubex is a 3D cube project built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and Zustand.

The goal is not only to render a Rubik's-style cube. Cubex has two product directions:

- **Play mode**: a clean 3x3 cube trainer for mixing, solving, move practice, and solving guides.
- **Friend mode**: a toy-like Cubex character with arms, legs, face expressions, actions, chat, and dialogue animation.

## Current Features

### Play Mode

- Real 3x3 cube model without character parts.
- Mouse drag support for basic cube moves.
- Manual move controls for `U`, `D`, `R`, `L`, `F`, and `B` turns.
- Mix cube and reset to solved state.
- Move history.
- Quick solving guide tabs:
  - CFOP / Fridrich
  - ZBLL
  - OLL
  - PLL

### Friend Mode

- Cubex character version with cube body, arms, legs, face, and logo.
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
- Smooth appearance/disappearance of friend parts when switching modes.

### Customize Mode

- Color presets.
- Per-face color controls.
- Custom Cubex logo on the white center face.

## Tech Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand

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

## Project Structure

```text
src/
  App.tsx                    Main application shell and mode UI
  components/
    RubiksCube.tsx           3D cube, friend rig, pointer controls, animations
    Cubie.tsx                Individual cube piece rendering
  store/
    useCubeStore.ts          Cube state, modes, moves, presets, chat/action state
  index.css                  App layout and UI styles
```

## Notes

The current cube move system is a first practical implementation. Moves update cube state instantly, and mouse dragging maps to basic quarter turns. A later version should add smoother slice-turn animation and more accurate face-drag detection.

The Cubex character is currently built directly with Three.js primitives. A future version can replace or enhance the character with a Blender `.glb` model while keeping the same app state and mode structure.

## Roadmap

- Smooth animated slice turns.
- More accurate mouse/touch gesture mapping.
- Real scramble generation and inverse solve playback.
- Better solving guide flows with step-by-step highlighting.
- Algorithm player for notation like `R U R' U'`.
- More expressive Cubex animations.
- Blender model integration.
- Persistent custom cube styles.
