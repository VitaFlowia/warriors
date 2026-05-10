import React, { useEffect, useRef, useState, useCallback } from 'react';

interface D20DiceProps {
  onRollComplete: (result: number) => void;
  isRolling: boolean;
}

// Detect WebGL support
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// ===========================
// CSS FALLBACK DICE (no WebGL)
// ===========================
function CSSFallbackDice({ onRollComplete }: { onRollComplete: (n: number) => void }) {
  const [displayValue, setDisplayValue] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalValue, setFinalValue] = useState<number | null>(null);

  const rollDice = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setFinalValue(null);

    // Rapid number changes for 1.5s
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 20) + 1);
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      const result = Math.floor(Math.random() * 20) + 1;
      setDisplayValue(result);
      setFinalValue(result);
      setIsSpinning(false);

      // Delay callback slightly for visual feedback
      setTimeout(() => onRollComplete(result), 800);
    }, 1500);
  }, [isSpinning, onRollComplete]);

  const isCrit = finalValue === 20;
  const isFail = finalValue !== null && finalValue <= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse">
            É a sua vez de atacar!
          </h2>
          <p className="text-yellow-100/70 mt-2 text-lg">Clique no dado para rolar!</p>
        </div>

        {/* CSS Dice */}
        <button
          onClick={rollDice}
          disabled={isSpinning}
          className={`relative w-40 h-40 cursor-pointer transition-all duration-300 group
            ${isSpinning ? 'animate-spin pointer-events-none' : 'hover:scale-110 active:scale-95'}
            ${finalValue !== null && !isSpinning ? 'scale-110' : ''}`}
          style={{ animationDuration: isSpinning ? '0.3s' : undefined }}
        >
          {/* Dice body */}
          <div className={`absolute inset-0 rounded-2xl border-4 flex items-center justify-center transition-all duration-500
            ${isCrit ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-200 shadow-[0_0_50px_rgba(250,204,21,1)]' :
              isFail ? 'bg-gradient-to-br from-red-600 to-red-900 border-red-400 shadow-[0_0_50px_rgba(239,68,68,0.8)]' :
              'bg-gradient-to-br from-slate-700 to-slate-900 border-primary shadow-[0_0_30px_rgba(197,168,128,0.5)]'}
            ${isSpinning ? 'shadow-[0_0_40px_rgba(197,168,128,0.8)]' : ''}
            ${!isSpinning && !finalValue ? 'group-hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] group-hover:border-yellow-400' : ''}`}
          >
            {/* Diamond shape overlay */}
            <div className="absolute inset-4 border border-white/10 rotate-45 rounded" />
            
            <span className={`text-6xl font-black z-10 transition-all
              ${isCrit ? 'text-yellow-100' : isFail ? 'text-red-100' : 'text-primary'}
              ${isSpinning ? 'blur-[2px]' : ''}`}
            >
              {displayValue}
            </span>
          </div>
          
          {/* Glow ring */}
          {!isSpinning && !finalValue && (
            <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/30 animate-ping" style={{ animationDuration: '2s' }} />
          )}
        </button>

        {/* Result Text */}
        {finalValue !== null && !isSpinning && (
          <div className="text-center animate-in zoom-in-50 duration-300">
            <div className="text-2xl font-bold">
              {isCrit && <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">⭐ ACERTO CRÍTICO! ⭐</span>}
              {isFail && <span className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">💀 Falha Crítica... 💀</span>}
              {!isCrit && !isFail && finalValue >= 12 && <span className="text-green-400">✅ Sucesso!</span>}
              {!isCrit && !isFail && finalValue < 12 && <span className="text-red-400">❌ Falha</span>}
            </div>
          </div>
        )}

        <p className="text-muted-foreground text-xs">D20 Simplificado</p>
      </div>
    </div>
  );
}

// ===========================
// WEBGL 3D DICE (optimized)
// ===========================
function WebGLDice({ onRollComplete }: { onRollComplete: (n: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef<number>(0);
  const hasRolledRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const initScene = async () => {
      try {
        const THREE = await import('three');
        const CANNON = await import('cannon-es');
        
        if (cancelled || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        camera.position.set(0, 0.5, 2.5);

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5x
        renderer.shadowMap.enabled = false; // Disable shadows for performance
        container.appendChild(renderer.domElement);

        // Simpler lighting (no shadows)
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 8, 5);
        scene.add(dirLight);
        scene.add(new THREE.PointLight(0xbf9000, 0.8, 10));

        // Physics world
        const world = new CANNON.World();
        world.gravity.set(0, -30, 0);
        world.defaultContactMaterial.friction = 0.4;
        world.defaultContactMaterial.restitution = 0.3;

        // Dice
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshStandardMaterial({
          color: 0x111111,
          metalness: 0.7,
          roughness: 0.2,
          emissive: 0x332200,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.6, 0.6, 0.6);
        scene.add(mesh);

        const body = new CANNON.Body({
          mass: 1,
          shape: new CANNON.Sphere(0.6),
          linearDamping: 0.2,
          angularDamping: 0.2,
        });
        body.position.set(0, 1, 0);
        world.addBody(body);

        // Ground
        const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
        ground.position.set(0, -1.5, 0);
        ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        world.addBody(ground);

        // Animation loop with throttle (30fps for performance)
        let animId: number;
        let lastTime = 0;
        const FPS = 30;
        const frameInterval = 1000 / FPS;

        const animate = (time: number) => {
          animId = requestAnimationFrame(animate);
          
          const delta = time - lastTime;
          if (delta < frameInterval) return;
          lastTime = time - (delta % frameInterval);

          world.step(1 / 30);
          mesh.position.copy(body.position as any);
          mesh.quaternion.copy(body.quaternion as any);
          renderer.render(scene, camera);
        };

        animId = requestAnimationFrame(animate);
        setIsLoaded(true);

        // Store refs for event handlers
        const rollDice = () => {
          if (hasRolledRef.current) return;
          hasRolledRef.current = true;

          body.position.set(0, 1, 0);
          body.velocity.set(
            (Math.random() - 0.5) * 10,
            8 + Math.random() * 4,
            (Math.random() - 0.5) * 10
          );
          body.angularVelocity.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25
          );

          setTimeout(() => {
            const result = Math.floor(Math.random() * 20) + 1; // True random instead of face detection
            onRollComplete(result);
          }, 2500);
        };

        // Mouse/touch handlers
        const onPointerDown = (e: PointerEvent) => {
          dragStartRef.current = { x: e.clientX, y: e.clientY };
        };
        const onPointerMove = (e: PointerEvent) => {
          if (!dragStartRef.current) return;
          const dx = (e.clientX - dragStartRef.current.x) / 150;
          const dy = (dragStartRef.current.y - e.clientY) / 150;
          velocityRef.current = Math.sqrt(dx * dx + dy * dy);
        };
        const onPointerUp = () => {
          dragStartRef.current = null;
          if (velocityRef.current > 0.05) {
            rollDice();
          }
          velocityRef.current = 0;
        };

        const canvas = renderer.domElement;
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);

        // Also allow simple click to roll
        canvas.addEventListener('click', () => {
          if (!hasRolledRef.current) rollDice();
        });

        cleanupRef.current = () => {
          cancelAnimationFrame(animId);
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerup', onPointerUp);
          renderer.dispose();
          geometry.dispose();
          material.dispose();
          if (container.contains(canvas)) {
            container.removeChild(canvas);
          }
        };
      } catch (error) {
        console.error('WebGL dice init failed, falling back to CSS dice');
      }
    };

    initScene();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [onRollComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute top-20 text-center z-10 pointer-events-none">
        <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse">
          É a sua vez de atacar!
        </h2>
        <p className="text-yellow-100/70 mt-2 text-lg">
          {isLoaded ? 'Arraste ou clique no dado' : 'Carregando dado...'}
        </p>
      </div>

      <div
        ref={containerRef}
        className="w-full max-w-md h-[60vh] cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}

// ===========================
// MAIN EXPORT
// ===========================
export const D20Interactive: React.FC<D20DiceProps> = ({ onRollComplete, isRolling }) => {
  const [useWebGL, setUseWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setUseWebGL(isWebGLSupported());
  }, []);

  // Still loading detection
  if (useWebGL === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (useWebGL) {
    return <WebGLDice onRollComplete={onRollComplete} />;
  }

  return <CSSFallbackDice onRollComplete={onRollComplete} />;
};
