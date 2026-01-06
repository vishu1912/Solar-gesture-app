## I Built this using the below prompt with further enhancements to get here. Ignore my rambling to google:

“Create a single-file HTML application using Three.js and MediaPipe Hands.
Render a set of 3D floating words made entirely of glowing particles.
Implement webcam hand tracking.”
And the result?
A full particle-based 3D word cloud
Real-time hand gesture controls (pinch, point, grab, turbulence)
Physics—momentum, springs, interactions
All generated from a single prompt inside Google AI Studio
Gemini 3 Flash Preview
Ran for 46s
lightbulb
Thought for 41 seconds
To implement this interactive 3D particle application, I will use Three.js for the rendering engine and MediaPipe Hands for the computer vision component.
Specification
Architecture:
Framework: React (contained within index.tsx).
3D Engine: Three.js.
Input: Webcam via MediaPipe Hands (with mouse fallback).
Loading: Dynamic script injection for MediaPipe dependencies to ensure standalone execution without complex bundler configuration.
Visual Design:
Theme: Dark, cyber/futuristic aesthetics.
Particles: Thousands of glowing particles forming 3D words.
Color Palette: Cyan, Magenta, Electric Blue gradients based on position or velocity.
Feedback: A visual cursor (glowing orb) tracks the hand/mouse position in 3D space.
Core Features:
Text Generation: A canvas-based sampler will convert text strings ("FUTURE", "INTERACTIVE", "PARTICLES") into coordinate arrays for particles.
Physics Engine: Custom verlet-like integration or velocity-based physics.
Home Force: Particles are attracted to their original text position.
Mouse/Hand Repulsion: A "force field" around the cursor scatters particles.
Pinch Attraction: When pinching (thumb+index), the force field inverts, acting as a magnet/gravity well.
Hand Tracking:
Uses MediaPipe Hands solution.
Maps 2D video coordinates to the 3D scene plane.
Detects "Pinch" gesture (distance between finger tip and thumb tip).
Files to Update:
metadata.json: Request camera permissions.
index.html: Define entry point.
index.tsx: Contains all logic (Three.js setup, MediaPipe integration, Physics loop).
Code Changes
metadata.json
check_circle
index.html
check_circle
index.tsx
check_circle
User
Can we make this the entire setup showing the solar system, you can scroll the hand fast to switch between planets, zoom or slowly scroll to rotate each planet etc?
Gemini 3 Flash Preview
Ran for 79s
lightbulb
Thought for 68 seconds
To transform the application into a gesture-controlled Solar System explorer, I will update index.tsx to replace the particle text engine with a 3D planetary rendering system.
Changes
index.tsx:
Scene: Replaced particle text with a high-quality 3D planetary viewer.
Lighting: Added a "Sun" light source for dramatic orbital lighting.
Planets: Modeled Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune using procedural geometry and materials (including rings for Saturn/Uranus).
Gesture Engine:
Swipe (Fast Move): detects high-velocity hand movement on the X-axis to switch planets.
Rotate (Slow Move): maps hand position to the planet's rotation.
Zoom (Pinch): maps the distance between thumb and index finger to the camera zoom level.
UI: Added an HTML overlay to display the current planet's name and details.
index.html: Updated the title.
metadata.json: (No changes required, permissions remain the same).
Here is the code:
index.html
check_circle
index.tsx
check_circle
User
Rn they are just balls add proper colors please, make them look more realisitic as seen in astro apps etc?
Gemini 3 Flash Preview
Ran for 296s
lightbulb
Thought for 45 seconds
To make the planets look realistic without loading large external texture files, I will implement a Procedural Texture Generator using the HTML5 Canvas API. This allows us to generate high-resolution diffuse maps, roughness maps, and ring textures on the fly.
Changes
index.tsx:
Texture Generation System: Added a TextureGenerator object with methods to create:
Gas Giant Textures: Uses complex gradients and noise for Jupiter/Saturn banding.
Terrestrial Textures: Uses multi-layered noise for craters (Mercury/Moon) and continents (Earth/Mars).
Atmosphere Textures: Generates swirling cloud maps for Venus and Earth.
Ring Textures: Generates gradients with alpha transparency gaps for Saturn/Uranus.
Material Upgrade: Switched to MeshStandardMaterial with generated roughness and metalness maps for realistic lighting response.
Lighting: Adjusted the Sun light intensity and ambient light to create higher contrast (day/night side).
Earth Specifics: Added a specular map so oceans reflect sunlight while land remains matte.
index.html:
Added a subtle CSS gradient background to blend with the 3D starfield.
Here is the updated code:
index.tsx
check_circle
index.html
check_circle
Analyzed errors for 119 seconds
lightbulb
Thought for 115 seconds
index.tsx
check_circle
User
I like it, but lets make the rings more prominent for planets that have rings, showing moons for jupiter etc and other things we know so far. And only if possible to have more accurate earth? So when rotating I can see things like continents etc. Be able to see the moon too floating etc?
Gemini 3 Flash Preview
Ran for 93s
lightbulb
Thought for 22 seconds
To add realistic moons, prominent rings, and a better Earth texture, I will upgrade the TextureGenerator with more sophisticated drawing logic (adding polar caps and irregular continents) and introduce a moon system into the planet configuration.
Specification
Moons System:
Update PlanetConfig to include an optional moons array.
Each moon defines its size, distance from the planet, orbital speed, and color.
In the Three.js scene graph, moons are parented to a "Pivot" object centered on the planet, allowing them to orbit independently.
Jupiter: Added Io, Europa, Ganymede, Callisto.
Earth: Added The Moon (Luna).
Saturn: Added Titan.
Enhanced Rings:
Increased ring size and opacity.
Improved the gradient generation to have distinct "gaps" (Cassini division style).
Ensured rings cast and receive shadows for depth.
Improved Earth Texture:
New createEarth method in TextureGenerator.
Base: Deep ocean blue.
Continents: Uses a noise-like layering of irregular polygons to simulate landmasses (green/brown) instead of simple circles.
Poles: Added distinct white polar ice caps at the top and bottom.
Clouds: Kept the separate atmospheric cloud layer for depth.
Visual Polish:
Adjusted ambient lighting to ensure the dark side of moons isn't pitch black.
Added a subtle emission to the sun-side of textures for better visibility.
Code Changes
Updated files:
index.tsx
index.tsx
check_circle
User
Earth can be more realistic :(. Cmon do your magic? Maybe add the entire map on top of the sphere and cover it completely? Isn't that possible? And by default always keep planets way zoomed out so user can zoom in slowly and is not too zoomed in. Basically I want to keep my hands no farther than 8-10 inches from the laptop for everything to work good
Gemini 3 Flash Preview
Ran for 179s
lightbulb
Thought for 83 seconds
To satisfy the request for a more realistic Earth and better zoom/hand ergonomics, I will make the following significant updates:
"Hand-Painted" Earth Texture: Instead of random blobs, I will implement a canvas drawing routine that roughly sketches the actual shapes of the continents (North/South America, Eurasia, Africa, Australia, Antarctica).
Specular Mapping: I'll generate a matching "shininess" map where oceans are white (shiny) and land is black (matte), so sunlight glints off the water realistically.
Ergonomic Zoom & Sensitivity:
Default Zoom: The camera will start further back (z=65), giving a grand view of the planet.
Calibrated Sensitivity: I will adjust the MediaPipe mapping so typical hand gestures at 8-10 inches work comfortably without needing to stretch your arm.
Smoother Controls: Increased damping on rotation for a "heavy", premium feel.
Code Changes
Updated files:
index.tsx
index.tsx
check_circle
User
Im seeing the planets with rings will sometime show like a blank space??
Screenshot 2025-12-08 at 10.29.18 PM.png
Screenshot 2025-12-08 at 10.29.18 PM.png
Gemini 3 Flash Preview
Ran for 206s
lightbulb
Thought for 100 seconds
To fix the issue where the planetary rings cause "blank spaces" (likely rendering artifacts where the transparent parts of the ring obscure the planet behind them) and to improve the Earth's realism, I will update index.tsx.
Changes Made
Ring Rendering Fix (depthWrite: false):
Set depthWrite: false on the Ring Material. This ensures that the transparent pixels of the ring do not write to the depth buffer, preventing them from "punching holes" in the planet rendering behind them.
Added alphaTest: 0.1 to the texture loader configuration (if applicable) or material settings to help with shadow generation, ensuring the shadow matches the ring shape and not the square geometry.
Realistic Earth Texture Upgrade:
Refined the drawContinents function to generate a more complete and connected landmass covering, reducing the "sparse islands" look.
Added a polar grid check to ensure ice caps render cleanly without gaps.
Shadow Improvement:
The depthWrite: false combined with standard transparency often solves the "blocky artifact" issue on the planet's surface.
Here is the updated code:
index.tsx
check_circle
User
Again I feel like the rings aren't as visible on planets with rings, especially Saturn. make it more prominent please and for other planets too where it should really be visible from all angles not just with light or with rotation
Gemini 3 Flash Preview
Ran for 135s
lightbulb
Thought for 44 seconds
To make the rings significantly more prominent and visible from all angles, I will update the material to use Emissive Lighting. This means the rings will emit their own faint light, ensuring they don't disappear in shadows or at dark angles. I will also increase the density of the ring texture itself so it appears more solid.
Changes
Ring Material Upgrade: Switched from MeshStandardMaterial to MeshPhongMaterial.
Added emissive and emissiveMap: The rings now glow slightly using their own texture color, making them pop against the black background even when the sun isn't directly hitting them.
Increased opacity to 1.0 (relying on the texture alpha for transparency).
Texture Generator Tweaks:
Made the ring gradient bands thicker and more opaque.
Reduced the transparency of the "gaps" so the ring looks like a cohesive massive structure rather than faint wisps.
index.tsx
check_circle
User
Where have you seen Saturn like this bro? This is happening for Uranus toooooo :(
Screenshot 2025-12-08 at 10.37.38 PM.png
Screenshot 2025-12-08 at 10.37.38 PM.png
Gemini 3 Flash Preview
Ran for 178s
lightbulb
Thought for 76 seconds
To fix the visual glitches with the rings (the "blank space" or misaligned appearance) and improve the overall realism of Saturn and Uranus:
Fix Texture Rotation Bug: The TextureGenerator was rotating the ring texture by 90 degrees (Math.PI / 2). Because the texture center wasn't explicitly managed, this shifted the ring pattern off-center, causing it to appear cut off or like a "blank space" across the geometry. I will remove this rotation.
Align Geometry & Texture: I will tighten the relationship between the ring's 3D geometry and the procedural texture's gradient stops. This ensures the rings start close to the planet and extend to the edge without wasting polygons on invisible transparent areas.
Fix Shadows: I will enable alphaTest on the ring material. This tells the 3D engine to discard transparent pixels when calculating shadows, ensuring the rings cast proper, shaped shadows on the planet instead of a solid rectangular block.
Code Changes
Updated files:
index.tsx
Removed tex.rotation from createRing to fix misalignment.
Added alphaTest: 0.2 to Ring Material to fix shadow artifacts (rings now cast proper shadows).
Adjusted Ring Geometry radii and UV mapping math for a tighter fit.
Tweaked Ring Texture gradient to be fuller and more visible.
Increased ring geometry segments for smoother curves.

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
