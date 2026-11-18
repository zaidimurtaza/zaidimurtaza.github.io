"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { layers } from "@/content/showcase";

/*
  The full stack as an exploded isometric tower: six plates (interface → infrastructure),
  each carrying its own procedural "components", with requests (cobalt packets) falling
  through every layer. ~1.2k triangles in total, no textures except a 64px shadow blob.
*/

type Props = {
  active: string | null;
  onHover: (id: string | null) => void;
  running: boolean;
  reducedMotion: boolean;
  explodeRef: React.RefObject<number>; // 0..1, driven by scroll
  labelRefs: React.RefObject<(HTMLElement | null)[]>;
  onReady?: () => void;
};

const COBALT = new THREE.Color("#2f3cf5");
const INK = new THREE.Color("#1b1e25");
const PLATE = new THREE.Color("#fbfbf7");
const PLATE_ACTIVE = new THREE.Color("#e9ebff");
const SIZE = 3; // plate width/depth
const THICK = 0.14;
const PACKETS = 14;

type Part = [x: number, z: number, w: number, h: number, d: number];

// One deterministic component layout per layer, in plate-local coordinates.
function partsFor(id: string): Part[] {
  const p: Part[] = [];
  switch (id) {
    case "interface": // window frames: a header bar and a card grid
      p.push([0, -1.05, 2.5, 0.06, 0.3]);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) p.push([-0.85 + i * 0.85, -0.25 + j * 0.85, 0.66, 0.08 + j * 0.04, 0.6]);
      break;
    case "agents": // a ring of tools around a core
      p.push([0, 0, 0.6, 0.34, 0.6]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        p.push([Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0.26, 0.16, 0.26]);
      }
      break;
    case "api": // rows of endpoints
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) p.push([-0.85 + c * 0.85, -1 + r * 0.66, 0.62, 0.07 + ((r + c) % 3) * 0.05, 0.36]);
      break;
    case "jobs": // queues of varying depth
      for (let i = 0; i < 5; i++) p.push([-1.0 + i * 0.5, 0.25 - (i % 3) * 0.25, 0.3, 0.1, 1.2 + (i % 3) * 0.3]);
      break;
    case "data": // database columns
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) p.push([-0.8 + c * 0.8, -0.8 + r * 0.8, 0.42, 0.18 + ((r * 3 + c) % 4) * 0.09, 0.42]);
      break;
    case "infra": // rack units
      for (let i = 0; i < 6; i++) p.push([0, -1.1 + i * 0.44, 2.4, 0.08, 0.3]);
      break;
  }
  return p;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  grd.addColorStop(0, "rgba(0,0,0,0.55)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Layer({
  index,
  id,
  active,
  onHover,
  groupRef,
  geos,
}: {
  index: number;
  id: string;
  active: boolean;
  onHover: Props["onHover"];
  groupRef: (g: THREE.Group | null) => void;
  geos: { plate: THREE.BoxGeometry; edges: THREE.EdgesGeometry; unit: THREE.BoxGeometry };
}) {
  const parts = useMemo(() => partsFor(id), [id]);
  const partsRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = partsRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    parts.forEach(([x, z, w, h, d], i) => {
      m.compose(new THREE.Vector3(x, THICK / 2 + h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [parts]);


  return (
    <group ref={groupRef} position={[0, (2.5 - index) * 0.5, 0]}>
      <mesh
        geometry={geos.plate}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <meshStandardMaterial color={active ? PLATE_ACTIVE : PLATE} roughness={0.85} metalness={0} />
      </mesh>
      <lineSegments geometry={geos.edges} raycast={() => null}>
        <lineBasicMaterial color={active ? COBALT : INK} transparent opacity={active ? 0.9 : 0.38} />
      </lineSegments>
      <instancedMesh ref={partsRef} args={[geos.unit, undefined, parts.length]} raycast={() => null}>
        <meshStandardMaterial color={active ? COBALT : INK} roughness={0.6} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

function Tower({ active, onHover, reducedMotion, explodeRef, labelRefs }: Omit<Props, "running" | "onReady">) {
  const spin = useRef<THREE.Group>(null);
  const layerGroups = useRef<(THREE.Group | null)[]>([]);
  const packetsRef = useRef<THREE.InstancedMesh>(null);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const geos = useMemo(() => {
    const plate = new THREE.BoxGeometry(SIZE, THICK, SIZE);
    return { plate, edges: new THREE.EdgesGeometry(plate), unit: new THREE.BoxGeometry(1, 1, 1) };
  }, []);
  const packetGeo = useMemo(() => new THREE.BoxGeometry(0.09, 0.09, 0.09), []);
  const shadow = useMemo(() => shadowTexture(), []);

  useEffect(
    () => () => {
      geos.plate.dispose();
      geos.edges.dispose();
      geos.unit.dispose();
      packetGeo.dispose();
      shadow.dispose();
    },
    [geos, packetGeo, shadow],
  );

  // Fit the orthographic camera to the canvas on resize (done in the frame loop, where three objects are mutable).
  const fitted = useRef("");
  useEffect(() => invalidate(), [size, invalidate]);

  const sim = useRef({
    explode: 0.35,
    intro: 0, // seconds since mount, drives the build-in
    dragging: false,
    lastX: 0,
    vel: 0,
    rot: -0.25,
    packets: Array.from({ length: PACKETS }, (_, i) => ({
      x: ((i * 0.37) % 1) * 2.2 - 1.1,
      z: ((i * 0.61) % 1) * 2.2 - 1.1,
      t: (i / PACKETS) * 1.0,
      speed: 0.18 + ((i * 7) % 5) * 0.03,
    })),
  });

  // Drag to turn, with inertia.
  useEffect(() => {
    const el = gl.domElement;
    const s = sim.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.vel = (e.clientX - s.lastX) * 0.008;
      s.rot += s.vel;
      s.lastX = e.clientX;
      invalidate();
    };
    const up = () => (s.dragging = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, invalidate]);

  const v = useMemo(() => new THREE.Vector3(), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state, dt) => {
    const key = `${size.width}x${size.height}`;
    if (fitted.current !== key) {
      const cam = state.camera as THREE.OrthographicCamera;
      cam.zoom = Math.min(size.width / (size.width < 520 ? 7.2 : 9.6), size.height / 7.4);
      cam.updateProjectionMatrix();
      fitted.current = key;
    }
    const s = sim.current;
    const step = Math.min(dt, 0.05);

    // Explode: scroll drives it; hovering a layer opens it a little more.
    const target = Math.min(1, (explodeRef.current ?? 0) + (active ? 0.18 : 0));
    s.explode = THREE.MathUtils.damp(s.explode, 0.3 + target * 0.7, 5, step);
    const gap = 0.36 + s.explode * 0.62;
    const top = ((layers.length - 1) / 2) * gap;

    // Build-in: plates drop into place one by one, top to bottom.
    s.intro = Math.min(s.intro + step, 30);
    layerGroups.current.forEach((g, i) => {
      if (!g) return;
      const p = reducedMotion ? 1 : THREE.MathUtils.clamp((s.intro - 0.15 - i * 0.13) / 0.65, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      g.visible = p > 0;
      g.position.y = top - i * gap + (1 - e) * 2.4;
      // The focused layer swivels out like a drawer.
      const on = layers[i].id === active;
      g.position.x = THREE.MathUtils.damp(g.position.x, on ? -0.5 : 0, 7, step);
      g.position.z = THREE.MathUtils.damp(g.position.z, on ? 0.35 : 0, 7, step);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, on ? 0.38 : 0, 6, step);
    });
    const built = reducedMotion || s.intro > 0.15 + layers.length * 0.13 + 0.5;

    // Rotation: idle spin unless reduced motion; drag adds inertia.
    if (!s.dragging) {
      s.vel *= 0.93;
      s.rot += s.vel + (reducedMotion || active ? 0 : step * 0.06);
    }
    if (spin.current) spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, s.rot, 6, step);

    // Requests falling through the stack.
    const mesh = packetsRef.current;
    if (mesh) {
      mesh.visible = built;
      const span = top * 2 + 0.6;
      s.packets.forEach((p, i) => {
        if (!reducedMotion) p.t = (p.t + step * p.speed) % 1;
        v.set(p.x, top + 0.35 - p.t * span, p.z);
        m.compose(v, q, one);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    // Pin the DOM labels next to each plate (rotation-invariant: plate centre + fixed screen offset).
    const labels = labelRefs.current;
    if (labels) {
      const halfW = (SIZE * Math.SQRT2 * 0.5 * (state.camera as THREE.OrthographicCamera).zoom) / 1;
      // Every label is faintly visible once the tower is built; the focused one is full strength.
      const base = built ? 0.42 + Math.min(1, Math.max(0, (s.explode - 0.5) / 0.3)) * 0.28 : 0;
      layerGroups.current.forEach((g, i) => {
        const el = labels[i];
        if (!g || !el) return;
        g.getWorldPosition(v).project(state.camera);
        const x = ((v.x + 1) / 2) * size.width + halfW + 14;
        const y = ((1 - v.y) / 2) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%)`;
        el.style.opacity = String(layers[i].id === active && built ? 1 : base);
      });
    }
  });

  return (
    <group position={[-1.05, -0.1, 1.05]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, -2.25, 0]} raycast={() => null}>
        <planeGeometry args={[6.2, 6.2]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.5} />
      </mesh>
      <group ref={spin}>
        {layers.map((l, i) => (
          <Layer
            key={l.id}
            index={i}
            id={l.id}
            active={active === l.id}
            onHover={onHover}
            geos={geos}
            groupRef={(g) => {
              layerGroups.current[i] = g;
            }}
          />
        ))}
        <instancedMesh ref={packetsRef} args={[packetGeo, undefined, PACKETS]} raycast={() => null}>
          <meshBasicMaterial color={COBALT} />
        </instancedMesh>
      </group>
    </group>
  );
}

export default function StackScene(props: Props) {
  const { running, onReady, ...rest } = props;
  return (
    <Canvas
      className="stage-canvas"
      orthographic
      flat
      dpr={[1, 1.5]}
      frameloop={running ? "always" : "demand"}
      camera={{ position: [7, 5.6, 7], zoom: 60, near: 0.1, far: 60 }}
      gl={{ powerPreference: "low-power", antialias: true, alpha: true, stencil: false }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, 0, 0);
        onReady?.();
      }}
      onPointerMissed={() => rest.onHover(null)}
      aria-hidden="true"
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 9, 2]} intensity={1.5} />
      <directionalLight position={[-6, 2, 5]} intensity={0.35} color="#c9d0ff" />
      <Tower {...rest} />
    </Canvas>
  );
}
