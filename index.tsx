import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

// --- MediaPipe Helper ---
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// --- Procedural Texture Generator ---
const TextureGenerator = {
  createGasGiant: (colors: string[]) => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Background
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, size, size);

    // Bands
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    colors.forEach((c, i) => {
        gradient.addColorStop(i / (colors.length - 1), c);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Turbulence / Storms
    for (let i = 0; i < 50; i++) {
        const y = Math.random() * size;
        const h = Math.random() * 50 + 10;
        ctx.fillStyle = `rgba(255,255,255, ${Math.random() * 0.1})`;
        ctx.fillRect(0, y, size, h);
    }
    
    // Storm Eye (Great Red Spot style) if red/brown
    if (colors[0].includes('4a4036')) {
         ctx.beginPath();
         ctx.ellipse(size * 0.7, size * 0.6, 60, 40, 0, 0, Math.PI * 2);
         ctx.fillStyle = 'rgba(100, 50, 20, 0.3)';
         ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  },

  drawContinents: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const w = width;
      const h = height;

      // Helper to add noise to lines so they look like coastlines
      const jaggedLine = (x1: number, y1: number, x2: number, y2: number) => {
          const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
          const steps = Math.max(5, dist / 5);
          for(let i=0; i<=steps; i++) {
              const t = i/steps;
              const nX = x1 + (x2-x1)*t + (Math.random()-0.5)*10;
              const nY = y1 + (y2-y1)*t + (Math.random()-0.5)*10;
              ctx.lineTo(nX, nY);
          }
      };

      // Fill Background with a base noise for better coverage
      ctx.fillStyle = 'rgba(45, 90, 39, 0.1)'; 
      ctx.fillRect(0,0,w,h);

      ctx.fillStyle = '#2d5a27';

      // North America (More massive)
      ctx.beginPath();
      ctx.moveTo(w*0.05, h*0.1);
      jaggedLine(w*0.05, h*0.1, w*0.4, h*0.1); 
      jaggedLine(w*0.4, h*0.1, w*0.45, h*0.35); // East coast
      jaggedLine(w*0.45, h*0.35, w*0.30, h*0.55); // Gulf
      jaggedLine(w*0.30, h*0.55, w*0.25, h*0.45); 
      jaggedLine(w*0.25, h*0.45, w*0.15, h*0.40); 
      jaggedLine(w*0.15, h*0.40, w*0.05, h*0.1);
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.moveTo(w*0.32, h*0.50);
      jaggedLine(w*0.32, h*0.50, w*0.45, h*0.55); 
      jaggedLine(w*0.45, h*0.55, w*0.38, h*0.90); // Tip
      jaggedLine(w*0.38, h*0.90, w*0.28, h*0.60); 
      ctx.fill();

      // Eurasia (Huge block)
      ctx.beginPath();
      ctx.moveTo(w*0.45, h*0.1); 
      jaggedLine(w*0.45, h*0.1, w*0.98, h*0.12); // Russia top
      jaggedLine(w*0.98, h*0.12, w*0.92, h*0.50); // Asia east
      jaggedLine(w*0.92, h*0.50, w*0.75, h*0.60); // India
      jaggedLine(w*0.75, h*0.60, w*0.60, h*0.50); 
      jaggedLine(w*0.60, h*0.50, w*0.50, h*0.35); 
      jaggedLine(w*0.50, h*0.35, w*0.45, h*0.1);
      ctx.fill();

      // Africa
      ctx.beginPath();
      ctx.moveTo(w*0.48, h*0.40); 
      jaggedLine(w*0.48, h*0.40, w*0.65, h*0.40); 
      jaggedLine(w*0.65, h*0.40, w*0.70, h*0.65); 
      jaggedLine(w*0.70, h*0.65, w*0.55, h*0.85); // South tip
      jaggedLine(w*0.55, h*0.85, w*0.48, h*0.60); 
      ctx.fill();

      // Australia
      ctx.beginPath();
      const cx = w*0.85, cy = h*0.75;
      for(let i=0; i<12; i++) {
          const ang = (i/12)*Math.PI*2;
          const r = 50 + Math.random()*20;
          ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
      }
      ctx.fill();

      // Antarctica (Full bottom strip)
      ctx.fillStyle = '#eeeeee';
      ctx.beginPath();
      ctx.fillRect(0, h*0.92, w, h*0.08);
      
      // Arctic (Top strip irregular)
      ctx.beginPath();
      for(let i=0; i<=20; i++) {
          const x = (i/20)*w;
          const y = (Math.random()*0.05 + 0.02)*h;
          ctx.lineTo(x, y);
      }
      ctx.lineTo(w, 0);
      ctx.lineTo(0, 0);
      ctx.fill();
  },

  createEarthTextures: () => {
    const size = 2048; 
    
    // 1. Diffuse Map (Color)
    const canvasColor = document.createElement('canvas');
    canvasColor.width = size; canvasColor.height = size;
    const ctxColor = canvasColor.getContext('2d');
    
    if (ctxColor) {
        // Ocean Base
        const oceanGrad = ctxColor.createLinearGradient(0,0,0,size);
        oceanGrad.addColorStop(0, '#0b1638');
        oceanGrad.addColorStop(0.5, '#1e3c7e');
        oceanGrad.addColorStop(1, '#0b1638');
        ctxColor.fillStyle = oceanGrad;
        ctxColor.fillRect(0, 0, size, size);

        // Land
        ctxColor.fillStyle = '#2d5a27'; // Forest Green
        TextureGenerator.drawContinents(ctxColor, size, size);

        // Texture Details (Noise)
        const imageData = ctxColor.getImageData(0,0,size,size);
        const data = imageData.data;
        for(let i=0; i<data.length; i+=4) {
            if(Math.random() > 0.95) {
                const noise = (Math.random() - 0.5) * 20;
                data[i] += noise;
                data[i+1] += noise;
                data[i+2] += noise;
            }
        }
        ctxColor.putImageData(imageData, 0, 0);

        // Deserts / Mountains overlap
        ctxColor.globalCompositeOperation = 'source-atop';
        ctxColor.fillStyle = '#6b5b3e'; // Brown
        for(let i=0; i<80; i++) {
             const x = Math.random() * size;
             const y = size * 0.3 + Math.random() * size * 0.4; 
             const r = Math.random() * 60;
             ctxColor.beginPath(); ctxColor.arc(x,y,r,0,Math.PI*2); ctxColor.fill();
        }
    }

    // 2. Specular Map (Ocean shiny, Land matte)
    const canvasSpec = document.createElement('canvas');
    canvasSpec.width = size; canvasSpec.height = size;
    const ctxSpec = canvasSpec.getContext('2d');
    
    if (ctxSpec) {
        // Ocean is White (High Specular)
        ctxSpec.fillStyle = '#ffffff';
        ctxSpec.fillRect(0,0,size,size);
        
        // Land is Black (Low Specular)
        ctxSpec.fillStyle = '#111111'; // Slightly reflective land
        ctxSpec.globalCompositeOperation = 'source-over';
        TextureGenerator.drawContinents(ctxSpec, size, size);
    }

    return {
        map: new THREE.CanvasTexture(canvasColor),
        specularMap: new THREE.CanvasTexture(canvasSpec)
    };
  },

  createTerrestrial: (baseColor: string, featureColor: string, type: 'crater' | 'mars') => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Base
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    if (type === 'crater') {
        // Craters
        for(let i=0; i<400; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 10 + 2;
            ctx.fillStyle = featureColor; 
            ctx.globalAlpha = Math.random() * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fill();
        }
    } else if (type === 'mars') {
        // Rusty dusty look
        ctx.fillStyle = featureColor;
        for(let i=0; i<1000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 20;
            ctx.globalAlpha = 0.05;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fill();
        }
        // Polar caps for Mars too
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(size/2, 0, 80, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(size/2, size, 80, 0, Math.PI*2); ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  },

  createAtmosphere: (color: string) => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);
      
      // Transparent base
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0,0,size,size);
      
      // Clouds
      ctx.fillStyle = color;
      for(let i=0; i<200; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const w = Math.random() * 300 + 50;
          const h = Math.random() * 50 + 20;
          ctx.globalAlpha = Math.random() * 0.4;
          ctx.beginPath();
          ctx.ellipse(x, y, w, h, 0, 0, Math.PI*2);
          ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
  },

  createRing: (innerColor: string, outerColor: string) => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const centerX = size / 2;
    const centerY = size / 2;
    
    // Gradient covers from 0 to radius (size/2)
    // We want the ring to exist from approx 0.25 to 0.5 of canvas size
    const gradient = ctx.createRadialGradient(centerX, centerY, size * 0.2, centerX, centerY, size * 0.5);
    
    // Transparent center
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    
    // Inner Ring Start
    gradient.addColorStop(0.1, innerColor); 
    gradient.addColorStop(0.4, outerColor);
    
    // Cassini Division
    gradient.addColorStop(0.6, 'rgba(0,0,0,0.8)'); 
    
    // Outer Ring
    gradient.addColorStop(0.7, outerColor);
    gradient.addColorStop(0.9, innerColor);
    
    // Edge
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,size,size);

    // Dust Lines
    for(let i=0; i<100; i++) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        const r = (size * 0.25) + Math.random() * (size * 0.25);
        ctx.arc(centerX, centerY, r, 0, Math.PI*2);
        ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    // REMOVED ROTATION - This was causing misalignment
    return tex;
  }
};

// --- Planet Configuration ---
type MoonConfig = {
    name: string;
    size: number;
    color: string;
    distance: number;
    speed: number;
};

type PlanetConfig = {
  name: string;
  size: number;
  type: string;
  desc: string;
  hasRings?: boolean;
  moons?: MoonConfig[];
  gen: () => {
    mat: THREE.Material;
    cloudTex?: THREE.Texture;
    ringTex?: THREE.Texture;
  };
};

const PLANETS: PlanetConfig[] = [
  { 
    name: "MERCURY", 
    size: 1.5, 
    type: "Terrestrial", 
    desc: "The Swift Planet",
    gen: () => {
        const tex = TextureGenerator.createTerrestrial('#706c6c', '#4a4848', 'crater');
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.1 });
        return { mat };
    }
  },
  { 
    name: "VENUS", 
    size: 3.8, 
    type: "Terrestrial", 
    desc: "Morning Star",
    gen: () => {
        const tex = TextureGenerator.createGasGiant(['#e6cca3', '#d4b480', '#e6cca3']); 
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.0 });
        return { mat };
    }
  },
  { 
    name: "EARTH", 
    size: 4.0, 
    type: "Terrestrial", 
    desc: "Our Home",
    moons: [
        { name: "Moon", size: 1.0, color: "#cccccc", distance: 8, speed: 0.005 }
    ],
    gen: () => {
        const { map, specularMap } = TextureGenerator.createEarthTextures();
        const mat = new THREE.MeshPhongMaterial({ 
            map: map,
            specularMap: specularMap,
            specular: new THREE.Color(0x333333),
            shininess: 15,
            bumpMap: map, 
            bumpScale: 0.05
        });
        
        const cloudTex = TextureGenerator.createAtmosphere('#ffffff');
        return { mat, cloudTex };
    }
  },
  { 
    name: "MARS", 
    size: 2.1, 
    type: "Terrestrial", 
    desc: "The Red Planet",
    moons: [
        { name: "Phobos", size: 0.3, color: "#8a310a", distance: 4, speed: 0.02 },
        { name: "Deimos", size: 0.2, color: "#706c6c", distance: 6, speed: 0.015 }
    ],
    gen: () => {
        const tex = TextureGenerator.createTerrestrial('#c1440e', '#8a310a', 'mars');
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.1 });
        return { mat };
    }
  },
  { 
    name: "JUPITER", 
    size: 11.0, 
    type: "Gas Giant", 
    desc: "King of Planets",
    moons: [
        { name: "Io", size: 0.8, color: "#e3d04f", distance: 16, speed: 0.03 },
        { name: "Europa", size: 0.7, color: "#d6eaf2", distance: 20, speed: 0.025 },
        { name: "Ganymede", size: 1.2, color: "#9c8e7e", distance: 26, speed: 0.015 },
        { name: "Callisto", size: 1.1, color: "#5c5042", distance: 32, speed: 0.01 }
    ],
    gen: () => {
        const tex = TextureGenerator.createGasGiant(['#4a4036', '#9e8973', '#d9cbb6', '#856c54', '#5e4e40']);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.0 });
        return { mat };
    }
  },
  { 
    name: "SATURN", 
    size: 9.0, 
    type: "Gas Giant", 
    desc: "Ringed Beauty",
    hasRings: true,
    moons: [
        { name: "Titan", size: 1.3, color: "#e3c966", distance: 24, speed: 0.02 }
    ],
    gen: () => {
        const tex = TextureGenerator.createGasGiant(['#ceb8b8', '#ead6b8', '#dcc591', '#bfb297']);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
        const ringTex = TextureGenerator.createRing('#dac49a', '#8a795d');
        return { mat, ringTex };
    }
  },
  { 
    name: "URANUS", 
    size: 4.0, 
    type: "Ice Giant", 
    desc: "The Bull's Eye",
    hasRings: true,
    gen: () => {
        const tex = TextureGenerator.createGasGiant(['#d1e7e7', '#b9d6d6']);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
        const ringTex = TextureGenerator.createRing('#ffffff', '#aaddff');
        return { mat, ringTex };
    }
  },
  { 
    name: "NEPTUNE", 
    size: 3.9, 
    type: "Ice Giant", 
    desc: "The Big Blue",
    gen: () => {
        const tex = TextureGenerator.createGasGiant(['#3a489e', '#5063c9', '#3a489e']);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
        return { mat };
    }
  }
];

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const [loading, setLoading] = useState(true);
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(2);
  const [gestureStatus, setGestureStatus] = useState("Waiting for hand...");

  const planetIndexRef = useRef(2);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const moonPivotsRef = useRef<THREE.Group[]>([]);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  
  // Default zoomed out position (65 is fairly far for these planet sizes)
  const zoomRef = useRef(65);
  
  const swipeCooldownRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);

  useEffect(() => {
    planetIndexRef.current = currentPlanetIndex;
  }, [currentPlanetIndex]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 5000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i=0; i<starsCount*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 800;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({
        size: 0.5, 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const starMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starMesh);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 65; // Default far zoom

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // High Contrast Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(50, 20, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3); // Increased ambient slightly
    scene.add(ambientLight);
    
    const rimLight = new THREE.SpotLight(0x5555ff, 1);
    rimLight.position.set(-50, 50, -20);
    rimLight.lookAt(0,0,0);
    scene.add(rimLight);

    // Planet Container
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);
    planetGroupRef.current = planetGroup;

    // --- Planet Factory ---
    const createPlanet = (index: number) => {
        // Clear
        while(planetGroup.children.length > 0){ 
            const obj = planetGroup.children[0];
            planetGroup.remove(obj);
            if((obj as any).geometry) (obj as any).geometry.dispose();
            if((obj as any).material) (obj as any).material.dispose();
        }
        moonPivotsRef.current = [];

        const data = PLANETS[index];
        const genData = data.gen();
        
        // Main Sphere
        const geometry = new THREE.SphereGeometry(data.size, 128, 128);
        const mesh = new THREE.Mesh(geometry, genData.mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Fix for texture seam mapping on sphere
        mesh.rotation.y = -Math.PI / 2;
        
        planetGroup.add(mesh);

        // Atmosphere (Earth/Venus)
        if (genData.cloudTex) {
            const cloudGeo = new THREE.SphereGeometry(data.size * 1.015, 128, 128);
            const cloudMat = new THREE.MeshPhongMaterial({
                map: genData.cloudTex,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false,
                shininess: 0
            });
            const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
            mesh.add(cloudMesh);
            (cloudMesh as any).userData = { rotate: true };
        }

        // Rings
        if (data.hasRings && genData.ringTex) {
            // Adjust geometry to match texture mapping
            // Texture Inner Radius ~0.2 (Normalized UV 0.2 from center)
            // Texture Outer Radius ~0.5 (Normalized UV 0.5 from center)
            
            // We want geometry 1.25 * size to 2.5 * size
            // Diameter mapping logic:
            // 2.5 radius = 5.0 diameter.
            
            const innerR = data.size * 1.3;
            const outerR = data.size * 2.5;
            const ringGeo = new THREE.RingGeometry(innerR, outerR, 128);
            
            const pos = ringGeo.attributes.position;
            const uv = ringGeo.attributes.uv;
            
            // Map the geometry radius to the texture UVs
            // We want outerR to map to UV 0.5 (edge of texture)
            // So we divide by (outerR * 2)
            const mapScale = outerR * 2;
            
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                // Center UV is 0.5, 0.5
                uv.setXY(i, (x / mapScale) + 0.5, (y / mapScale) + 0.5); 
            }
            
            // Switch to Phong + Emissive for high visibility
            const ringMat = new THREE.MeshPhongMaterial({
                map: genData.ringTex,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1.0,      
                color: 0xffffff,
                emissive: 0x222222, 
                emissiveMap: genData.ringTex, 
                emissiveIntensity: 0.5, 
                specular: 0x111111,
                shininess: 10,
                depthWrite: false, // Prevents z-fighting opacity issues
                alphaTest: 0.2     // CRITICAL: allows ring to cast correct shadows!
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.receiveShadow = true;
            ringMesh.castShadow = true;
            ringMesh.rotation.x = Math.PI / 2;
            ringMesh.rotation.y = -0.1;
            mesh.add(ringMesh);
        }

        // Moons
        if (data.moons) {
            data.moons.forEach(moon => {
                const pivot = new THREE.Group();
                planetGroup.add(pivot); 
                
                const moonGeo = new THREE.SphereGeometry(moon.size, 32, 32);
                const moonMat = new THREE.MeshStandardMaterial({ 
                    color: moon.color, 
                    roughness: 0.9 
                });
                
                const moonTex = TextureGenerator.createTerrestrial(moon.color, '#000000', 'crater');
                moonMat.map = moonTex;

                const moonMesh = new THREE.Mesh(moonGeo, moonMat);
                moonMesh.position.x = moon.distance;
                moonMesh.castShadow = true;
                moonMesh.receiveShadow = true;
                
                pivot.add(moonMesh);
                
                // Tilt orbit slightly
                pivot.rotation.x = Math.random() * 0.5 - 0.25;
                pivot.rotation.z = Math.random() * 0.5 - 0.25;
                
                (pivot as any).userData = { speed: moon.speed };
                moonPivotsRef.current.push(pivot);
            });
        }
    };

    createPlanet(currentPlanetIndex);

    // --- Interaction Visualizer ---
    const cursorGeo = new THREE.RingGeometry(0.5, 0.6, 32);
    const cursorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
    cursorMesh.position.z = 15;
    scene.add(cursorMesh);

    // --- MediaPipe Setup ---
    let hands: any;
    let cameraUtils: any;
    
    const startMediaPipe = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        // @ts-ignore
        const Hands = window.Hands;
        // @ts-ignore
        const Camera = window.Camera;

        hands = new Hands({locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            
            // Raw coordinates (0-1)
            const rawX = 1 - indexTip.x;
            const rawY = indexTip.y;
            
            // Map hand position to rotation
            // Center is (0.5, 0.5). Range is -0.5 to 0.5
            const x = (rawX - 0.5) * 2; // -1 to 1
            const y = (rawY - 0.5) * 2; // -1 to 1

            const vec = new THREE.Vector3(x * 15, -y * 10, 0);
            cursorMesh.position.copy(camera.position).add(new THREE.Vector3(0,0,-15)).add(vec);

            // Smoother rotation speed
            targetRotationRef.current.y += x * 0.03;
            targetRotationRef.current.x += y * 0.03;

            // --- Swipe Logic ---
            const deltaX = rawX - lastXRef.current;
            velocityRef.current = deltaX;
            lastXRef.current = rawX;

            const SWIPE_THRESHOLD = 0.08; 
            
            if (swipeCooldownRef.current <= 0) {
                if (velocityRef.current > SWIPE_THRESHOLD) {
                    setGestureStatus("<<< SWIPE LEFT");
                    changePlanet(-1);
                    swipeCooldownRef.current = 40; // slightly longer cooldown
                } else if (velocityRef.current < -SWIPE_THRESHOLD) {
                    setGestureStatus("SWIPE RIGHT >>>");
                    changePlanet(1);
                    swipeCooldownRef.current = 40;
                } else {
                    setGestureStatus("Tracking...");
                }
            } else {
                swipeCooldownRef.current--;
            }

            // --- Zoom Logic ---
            const dx = indexTip.x - thumbTip.x;
            const dy = indexTip.y - thumbTip.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Calibration for 8-10 inches distance
            // When hand is close (8-10 inches), it occupies more screen space.
            // A "pinch" might be dist=0.05, an "open" might be dist=0.3.
            
            const minZoom = 20; // Closest
            const maxZoom = 80; // Farthest (Default)
            
            // Map dist (approx 0.02 to 0.3) to Zoom (80 to 20)
            let normalizedDist = (dist - 0.02) / (0.25 - 0.02);
            normalizedDist = Math.max(0, Math.min(1, normalizedDist)); // Clamp 0-1
            
            // Invert: 0 (pinched) -> 1 (spread)
            // We want Pinched -> Far (80), Spread -> Close (20)
            const targetZ = maxZoom - (normalizedDist * (maxZoom - minZoom));
            
            // Smooth zoom interpolation
            zoomRef.current += (targetZ - zoomRef.current) * 0.08;

          } else {
             setGestureStatus("No hand detected");
             velocityRef.current = 0;
             // Slowly drift back to default zoom if hand lost
             zoomRef.current += (65 - zoomRef.current) * 0.02;
          }
        });

        if (videoRef.current) {
            cameraUtils = new Camera(videoRef.current, {
                onFrame: async () => {
                    await hands.send({image: videoRef.current});
                },
                width: 640,
                height: 480
            });
            cameraUtils.start();
        }
        setLoading(false);
      } catch (e) {
        console.error("MediaPipe failed", e);
        setLoading(false);
      }
    };

    const changePlanet = (dir: number) => {
        let newIndex = planetIndexRef.current + dir;
        if (newIndex < 0) newIndex = PLANETS.length - 1;
        if (newIndex >= PLANETS.length) newIndex = 0;
        
        setCurrentPlanetIndex(newIndex);
        createPlanet(newIndex);
        
        if (planetGroupRef.current) {
            planetGroupRef.current.rotation.set(0,0,0);
            targetRotationRef.current = { x: 0, y: 0 };
        }
    };

    startMediaPipe();

    const handleMouseMove = (e: MouseEvent) => {
        if (loading) return;
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        targetRotationRef.current.y += x * 0.02;
        targetRotationRef.current.x += y * 0.02;
    };
    
    const handleClick = () => {
         changePlanet(1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (planetGroupRef.current) {
          // Add heavy damping for realistic planet weight
          planetGroupRef.current.rotation.y += (targetRotationRef.current.y - planetGroupRef.current.rotation.y) * 0.05;
          planetGroupRef.current.rotation.x += (targetRotationRef.current.x - planetGroupRef.current.rotation.x) * 0.05;
          
          // Slow constant rotation
          targetRotationRef.current.y += 0.0005;

          // Animate Clouds
          planetGroupRef.current.children.forEach(child => {
              if (child.children.length > 0) {
                  child.children.forEach(grandchild => {
                      if ((grandchild as any).userData?.rotate) {
                          grandchild.rotation.y += 0.0003;
                      }
                  });
              }
          });
      }

      // Animate Moons
      moonPivotsRef.current.forEach(pivot => {
          pivot.rotation.y += (pivot as any).userData.speed;
      });

      // Smooth camera zoom
      camera.position.z += (zoomRef.current - camera.position.z) * 0.1;

      const time = Date.now() * 0.005;
      const scale = 1 + Math.sin(time) * 0.1;
      cursorMesh.scale.set(scale, scale, 1);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if(containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };

  }, []);

  const currentPlanet = PLANETS[currentPlanetIndex];

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && <div className="loader">INITIALIZING TELESCOPE...</div>}
      
      {!loading && (
        <>
            <div className="hud">
                <h1>{currentPlanet.name}</h1>
                <p>{currentPlanet.type} // {currentPlanet.desc}</p>
                {currentPlanet.moons && <p style={{fontSize: '0.9em', color:'#ccc'}}>Moons: {currentPlanet.moons.map(m => m.name).join(', ')}</p>}
                <p style={{fontSize: '0.8em', color: '#00ffff', marginTop: '10px'}}>{gestureStatus}</p>
            </div>
            
            <div className="instructions">
                HAND CONTROLS:<br/>
                <b>SWIPE FAST</b> to Switch Planets<br/>
                <b>MOVE SLOWLY</b> to Rotate<br/>
                <b>PINCH / SPREAD</b> to Zoom<br/>
                <br/>
                MOUSE:<br/>
                Click to Switch • Move to Rotate
            </div>
        </>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);