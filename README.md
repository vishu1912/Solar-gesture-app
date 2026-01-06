## My Prompt

I Built this using the below prompt with further enhancements to get here. You will need to adjust things as per your liking to enhance

**Prompt:**
"Create a comprehensive, single-file React application (index.tsx) acting as a "Realistic 3D Solar System Explorer".
Technical Requirements:
Framework: React 18+ with index.html.
3D Engine: Three.js (use import * as THREE from 'three').
Computer Vision: MediaPipe Hands (load scripts dynamically via a helper function to avoid bundler errors).
Styling: Full-screen, dark, cinematic CSS embedded in index.html.
Feature Specifications:
High-Fidelity Procedural Textures (Canvas API):
No External Images: All textures must be generated at runtime using HTML5 Canvas.
Gas Giants: Create banded gradients with noise/turbulence (Jupiter, Saturn, Uranus, Neptune).
Earth: Draw irregular polygon shapes for realistic continents (not random blobs). Generate a Specular Map (Oceans=White/Shiny, Land=Black/Matte) for realistic sun reflection.
Rings: Draw radial gradients for Saturn/Uranus. Crucial: Set Material depthWrite: false, alphaTest: 0.2, and side: DoubleSide to prevent rendering artifacts (black squares/transparency glitches).
3D Solar System Scene:
Lighting: Strong Directional Light ("Sun") + weak Ambient Light.
Planets: Array containing Mercury through Neptune. Support moons (orbiting child spheres) and rings.
Moons: Include specific moons for context (Io, Europa, Titan, Luna).
Visuals: Use MeshPhongMaterial or StandardMaterial with the generated textures.
Responsive Hand Gesture Engine (MediaPipe):
Initialization: Load MediaPipe Hands from CDN. Map the Index Finger Tip to a 3D cursor.
Swipe Navigation (Critical Update): Calculate deltaX (change in X position). Use a Low Threshold (approx 0.03) so normal-speed swipes trigger the action reliably. Add a 500ms cooldown to prevent double-swipes.
Swipe Left: Next Planet.
Swipe Right: Previous Planet.
Rotate Control: Map hand XY position to planet rotation (add inertia/damping for a heavy feel).
Zoom Control: Calculate distance between Thumb and Index finger.
Pinch (< 0.05) = Zoom In.
Spread (> 0.2) = Zoom Out.
Calibrate for comfortable usage at 8-10 inches from camera.
UI / HUD:
Overlay a futuristic text display showing the Planet Name, Type, and Moons.
Display a "Gesture Debugger" (e.g., "Status: SWIPE DETECTED") to help the user.
Robustness Rules:
Use useRef for Three.js instances.
Handle "No Hand Detected" by slowly auto-rotating the planet.
Prevent syntax errors by ensuring all Canvas contexts checks (if (!ctx) return) are strict."

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rmu26zfuXcHxSIO_DJjrV84p4UD6fNvy

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
