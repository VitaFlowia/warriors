import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

interface D20DiceProps {
  onRollComplete: (result: number) => void;
  isRolling: boolean;
}

export const D20Interactive: React.FC<D20DiceProps> = ({ onRollComplete, isRolling }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const diceBodyRef = useRef<CANNON.Body | null>(null);
  const diceMeshRef = useRef<THREE.Mesh | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragForceRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const velocityRef = useRef<number>(0);

  const createD20Geometry = () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < positionAttribute.count; i++) {
      const pos = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
      pos.normalize();
      positionAttribute.setXYZ(i, pos.x, pos.y, pos.z);
    }

    geometry.computeVertexNormals();
    return geometry;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x1a0f2e); // Removed to allow transparency
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 2.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const accentLight = new THREE.PointLight(0xbf9000, 1);
    accentLight.position.set(-3, 2, 3);
    scene.add(accentLight);

    const world = new CANNON.World();
    world.gravity.set(0, -30, 0);
    world.defaultContactMaterial.friction = 0.4;
    world.defaultContactMaterial.restitution = 0.3;
    worldRef.current = world;

    const diceGeometry = createD20Geometry();
    const diceMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111, // Dark onyx/slate
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x332200, // Very dark gold emissive
    });
    const diceMesh = new THREE.Mesh(diceGeometry, diceMaterial);
    diceMesh.castShadow = true;
    diceMesh.receiveShadow = true;
    diceMesh.scale.set(0.6, 0.6, 0.6);
    scene.add(diceMesh);
    diceMeshRef.current = diceMesh;

    const diceShape = new CANNON.Sphere(0.6);
    const diceBody = new CANNON.Body({
      mass: 1,
      shape: diceShape,
      linearDamping: 0.2,
      angularDamping: 0.2,
    });
    diceBody.position.set(0, 1, 0);
    world.addBody(diceBody);
    diceBodyRef.current = diceBody;

    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({ mass: 0, shape: planeShape });
    planeBody.position.set(0, -1.5, 0);
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    world.addBody(planeBody);

    const wallShape = new CANNON.Plane();
    [-4, 4].forEach((x) => {
      const wallBody = new CANNON.Body({ mass: 0, shape: wallShape });
      wallBody.position.set(x, 0, 0);
      wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
      world.addBody(wallBody);
    });

    [-4, 4].forEach((z) => {
      const wallBody = new CANNON.Body({ mass: 0, shape: wallShape });
      wallBody.position.set(0, 0, z);
      wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      world.addBody(wallBody);
    });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      world.step(1 / 60);

      if (diceMesh && diceBody) {
        diceMesh.position.copy(diceBody.position as any);
        diceMesh.quaternion.copy(diceBody.quaternion as any);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      diceGeometry.dispose();
      diceMaterial.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const detectDiceFace = (): number => {
    if (!diceMeshRef.current) return 1;

    const rotation = diceMeshRef.current.quaternion;
    const euler = new THREE.Euler().setFromQuaternion(rotation);

    const x = ((euler.x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const y = ((euler.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    const faceIndex = Math.floor((x / Math.PI) * 10 + (y / Math.PI) * 10) % 20;
    return Math.max(1, faceIndex + 1);
  };

  const rollDice = () => {
    if (!diceBodyRef.current || isRolling) return;

    const body = diceBodyRef.current;
    body.position.set(0, 1, 0);
    body.velocity.set(
      dragForceRef.current.x * 8,
      Math.abs(dragForceRef.current.y) * 8 + 5,
      dragForceRef.current.z * 8
    );
    body.angularVelocity.set(
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 25
    );

    dragForceRef.current = { x: 0, y: 0, z: 0 };

    setTimeout(() => {
      const faceResult = detectDiceFace();
      onRollComplete(faceResult);
    }, 2500);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;

    const dx = (e.clientX - dragStartRef.current.x) / 150;
    const dy = (dragStartRef.current.y - e.clientY) / 150;

    dragForceRef.current = { x: dx, y: dy, z: (Math.random() - 0.5) * 0.3 };
    velocityRef.current = Math.sqrt(dx * dx + dy * dy);

    if (diceMeshRef.current) {
      const scale = 0.6 + velocityRef.current * 0.05;
      diceMeshRef.current.scale.set(scale, scale, scale);
    }
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    if (diceMeshRef.current) {
      diceMeshRef.current.scale.set(0.6, 0.6, 0.6);
    }
    if (velocityRef.current > 0.1) {
      rollDice();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute top-20 text-center z-10 pointer-events-none">
        <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse">
          É a sua vez de atacar!
        </h2>
        <p className="text-yellow-100/70 mt-2 text-lg">Toque e arraste o dado mágico</p>
      </div>

      <div
        ref={containerRef}
        className="w-full max-w-md h-[60vh] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => handleMouseDown(e.touches[0] as any)}
        onTouchMove={(e) => handleMouseMove(e.touches[0] as any)}
        onTouchEnd={handleMouseUp}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
