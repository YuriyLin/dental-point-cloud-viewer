# Interactive 3D Dental Viewer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new section in the React frontend featuring an interactive 3D dental model viewer that renders colorized AI predictions (Feature 5), displays real-time English tooth names via mouse hover raycasting (Feature 1), and provides buttons to extract or isolate specific teeth/gums using metadata labels (Feature 2).

**Architecture:** This historical plan describes the `InteractiveViewer.tsx` implementation in the `dental-point-cloud-viewer` app. It uses the `three` library for WebGL rendering via an imperative hook mounted to a `div` ref. Hover events are captured via `Raycaster`, looking up the intersected triangle's face index against metadata to map to FDI and English names. The current implementation has been simplified into the mesh / point-cloud workbench described in the repository README.

**Tech Stack:** React 19, Vite, TypeScript, `three` (including `PLYLoader`, `OrbitControls`) and project-local CSS tokens.

---

### Task 1: Scaffolding the 3D Component & PLY Loading (Feature 5: Semantic Rendering)

**Files:**
- Create: `components/InteractiveViewer.tsx`
- Modify: `App.tsx` (import and add the new `<InteractiveViewer />` section)
- Add: `public/sample_mesh.ply` and `public/sample_labels.json` (as dummy loaded files for testing)

**Step 1: Write the failing test / skeleton**
- Create the basic React functional component skeleton returning a full-width `min-h-[600px] relative` div.
- Initialize an empty scene, camera, and WebGLRenderer inside a `useEffect`.

**Step 2: Add lighting and OrbitControls**
- Add AmbientLight and DirectionalLight so the 3D model looks premium and shaded.
- Add `OrbitControls` to allow the user to pan/zoom/rotate the jaw.

**Step 3: Load the PLY model with Vertex Colors**
- Import `PLYLoader` from `three/addons/loaders/PLYLoader.js`.
- Load a sample PLY. Enable `vertexColors: true` on a `MeshStandardMaterial`.
- Mount the mesh to the scene, center it, and adjust the camera zoom.
- Verify that "Feature 5: Semantic Visual Rendering" works by seeing the colorized Jaw on the screen.

**Step 4: Connect to Main App**
- Import `InteractiveViewer` into `App.tsx` and place it as a distinct UI section.
- Commit: `feat: add basic 3d PLY viewer with vertex colors`

---

### Task 2: Setup Raycasting and Hover Tooltip (Feature 1: FDI to English Name)

**Files:**
- Modify: `components/InteractiveViewer.tsx`
- Create: `services/fdiMap.ts`

**Step 1: Map FDI codes to English Names**
- Create a dictionary mapping FDI constants to correct English nomenclature (e.g., `11`: "Upper Right Central Incisor", `21`: "Upper Left Central Incisor", etc.).

**Step 2: Load the JSON Metadata Array**
- In `InteractiveViewer.tsx`, fetch or import the `sample_labels.json` containing `"upper_seg_label": [0, 0, 11, ...]`.
- Save this array to a local variable or Ref accessible within the `three` render loop.

**Step 3: Setup the Raycaster on MouseMove**
- Attach a `pointermove` event listener to the canvas.
- Instantiate `THREE.Raycaster()` and update mouse `x/y` normalized device coordinates.

**Step 4: Intersect Face and Display Tooltip State**
- During the mouse event, `raycaster.intersectObject(mesh)` to find intersections.
- If hit, extract `hit.faceIndex`.
- Lookup `fdi = upper_seg_label[hit.faceIndex]`.
- If `fdi > 0`, use `fdiMap` to get the English description. Update React State variables `[hoveredTooth, setHoveredTooth]` and `[tooltipPos, setTooltipPos]`.
- Map the tooltip DIV to `tooltipPos` floating over the canvas with Tailwind styling (dark background, white text, glassmorphism), updating instantly!
- Commit: `feat: implement raycast hover tooltip with english tooth nomenclature`

---

### Task 3: Gum and Tooth Isolation Controls (Feature 2)

**Files:**
- Modify: `components/InteractiveViewer.tsx`

**Step 1: Add HTML Controls Interface**
- Create floating UI buttons over the canvas (e.g., "Show All", "Hide Gums", "Isolate Hovered Tooth").

**Step 2: Modify Vertex/Material Colors for Isolation**
- Extract the mesh's `BufferGeometry.attributes.color`.
- When "Hide Gums" is clicked (FDI == 0), loop through the JSON array. For every face `i` that equals `0`, modify the corresponding 3 vertices of that face (`i*3`, `i*3+1`, `i*3+2`) in the geometry directly to make it transparent or gray matching background.
- (Alternative logic: use `THREE.MeshBasicMaterial({ vertexColors: true, transparent: true })` and manipulate alpha values in a float32 array per vertex).

**Step 3: Trigger Geometry Update**
- Call `mesh.geometry.attributes.color.needsUpdate = true` so WebGL re-renders the altered colors.
- Ensure transitions between states are fully functional and fast.
- Commit: `feat: add toggle controls for extracting and isolating teeth vs gums`
