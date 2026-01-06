I Built this using the below prompt with further enhancements to get here. You will need to adjust things as per your liking to enhance.<br>

To get started Login at https://aistudio.google.com/apps and use the below prompt. I used Gemini 3 Flash Preview

# Use Prompt

'''Create a comprehensive, single-file React application (index.tsx) acting as a "Realistic 3D Solar System Explorer". <br>
Technical Requirements: <br>
Framework: React 18+ with index.html.<br>
3D Engine: Three.js (use import * as THREE from 'three').<br>
Computer Vision: MediaPipe Hands (load scripts dynamically via a helper function to avoid bundler errors).<br>
Styling: Full-screen, dark, cinematic CSS embedded in index.html.<br>
Feature Specifications: <br>
High-Fidelity Procedural Textures (Canvas API):
No External Images: All textures must be generated at runtime using HTML5 Canvas.<br>
Gas Giants: Create banded gradients with noise/turbulence (Jupiter, Saturn, Uranus, Neptune).<br>
Earth: Draw irregular polygon shapes for realistic continents (not random blobs). Generate a Specular Map (Oceans=White/Shiny, Land=Black/Matte) for realistic sun reflection.<br>
Rings: Draw radial gradients for Saturn/Uranus. Crucial: Set Material depthWrite: false, alphaTest: 0.2, and side: DoubleSide to prevent rendering artifacts (black squares/transparency glitches).<br>
3D Solar System Scene: <br>
Lighting: Strong Directional Light ("Sun") + weak Ambient Light.<br>
Planets: Array containing Mercury through Neptune. Support moons (orbiting child spheres) and rings.<br>
Moons: Include specific moons for context (Io, Europa, Titan, Luna).<br>
Visuals: Use MeshPhongMaterial or StandardMaterial with the generated textures.<br>
Responsive Hand Gesture Engine (MediaPipe):<br>
Initialization: Load MediaPipe Hands from CDN. Map the Index Finger Tip to a 3D cursor.<br>
Swipe Navigation (Critical Update): Calculate deltaX (change in X position). Use a Low Threshold (approx 0.03) so normal-speed swipes trigger the action reliably. Add a 500ms cooldown to prevent double-swipes.<br>
Swipe Left: Next Planet.<br>
Swipe Right: Previous Planet.<br>
Rotate Control: Map hand XY position to planet rotation (add inertia/damping for a heavy feel).<br>
Zoom Control: Calculate distance between Thumb and Index finger.<br>
Pinch (< 0.05) = Zoom In.<br>
Spread (> 0.2) = Zoom Out.<br>
Calibrate for comfortable usage at 8-10 inches from camera.<br>
UI / HUD:<br>
Overlay a futuristic text display showing the Planet Name, Type, and Moons.<br>
Display a "Gesture Debugger" (e.g., "Status: SWIPE DETECTED") to help the user.<br>
Robustness Rules:<br>
Use useRef for Three.js instances.<br>
Handle "No Hand Detected" by slowly auto-rotating the planet.<br>
Prevent syntax errors by ensuring all Canvas contexts checks (if (!ctx) return) are strict.'''

# Try it Out Here

Open app in AI Studio: https://ai.studio/apps/drive/1rmu26zfuXcHxSIO_DJjrV84p4UD6fNvy
