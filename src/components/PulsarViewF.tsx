// Conversion of Three.js PulsarView into React Three Fiber, generated with Claude Code running Opus 4.7
// DO NOT USE IN PRODUCTION, this is just something to help me figure out how to use React Three Fiber
import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ColorGUIHelper } from "./utils";

// Corresponds to: the inner contents of the Three.js `useEffect` setup
// (scene graph + animation loop). In R3F this is split into a declarative
// scene component (rendered inside <Canvas>) and the outer component that
// owns the <Canvas> and the DOM-level concerns (keyboard listener, GUI).
function PulsarScene(props: {
	isAnimating: boolean;
	guiParamsRef: React.MutableRefObject<{ pulsarRotationRate: number }>;
	pulsarBodyRef: React.MutableRefObject<THREE.Group | null>;
	directionalLightRef: React.MutableRefObject<THREE.DirectionalLight | null>;
}) {
	const { isAnimating, guiParamsRef, pulsarBodyRef, directionalLightRef } =
		props;

	// Pulsar parameters (corresponds to: the `pulsarBody*` / `pulsarBeam*`
	// constants in the original Three.js component)
	const pulsarBodyRadius = 5;
	const pulsarBodyWidthSeg = 64;
	const pulsarBodyHeightSeg = 32;
	const pulsarBeamRadius = 1;
	const pulsarBeamHeight = 20;
	const pulsarBeamRadSeg = 32;
	const pulsarBeamHeightSeg = 4;
	const pulsarBeamColor = "#ffffff";

	// Corresponds to: `pulsarBeamGeometry.translate(0, -pulsarBeamHeight / 2, 0)`
	// Pre-shifts the cone's geometry so its tip sits at the origin.
	const pulsarBeamGeometry = useMemo(() => {
		const geom = new THREE.ConeGeometry(
			pulsarBeamRadius,
			pulsarBeamHeight,
			pulsarBeamRadSeg,
			pulsarBeamHeightSeg,
			true,
		);
		geom.translate(0, -pulsarBeamHeight / 2, 0);
		return geom;
	}, []);

	// Corresponds to: `new THREE.BufferGeometry().setFromPoints(
	//   new THREE.ArcCurve(0, 0, pulsarBodyRadius + 0.01).getSpacedPoints(64))`
	const pulsarEquatorPoints = useMemo(() => {
		return new THREE.ArcCurve(0, 0, pulsarBodyRadius + 0.01).getSpacedPoints(
			64,
		);
	}, []);

	// Corresponds to: `new THREE.DirectionalLightHelper(lightDirectional)`.
	// drei doesn't expose this as a JSX element so we attach it imperatively
	// once the directional light ref is available.
	const { scene } = useThree();
	useEffect(() => {
		if (!directionalLightRef.current) return;
		const helper = new THREE.DirectionalLightHelper(
			directionalLightRef.current,
		);
		scene.add(helper);
		return () => {
			scene.remove(helper);
			helper.dispose();
		};
	}, [scene, directionalLightRef]);

	// Corresponds to: the `animate` function — incrementing
	// `pulsarBody.rotation.y` each frame. `useFrame` is R3F's per-frame hook
	// and replaces the manual `requestAnimationFrame` loop.
	useFrame(() => {
		if (!isAnimating) return;
		if (pulsarBodyRef.current) {
			pulsarBodyRef.current.rotation.y +=
				guiParamsRef.current.pulsarRotationRate;
		}
	});

	return (
		<>
			{/* Corresponds to: `new THREE.AxesHelper(100)` */}
			<axesHelper args={[100]} />

			{/* Corresponds to: `new THREE.AmbientLight(0xffffff, 0.2)` */}
			<ambientLight color={0xffffff} intensity={0.2} />

			{/* Corresponds to: `new THREE.DirectionalLight(0xffffff, 5)` with
			    position (10, 10, 0) and target at origin. The directional light
			    helper is added imperatively in the effect above. */}
			<directionalLight
				ref={directionalLightRef}
				color={0xffffff}
				intensity={5}
				position={[10, 10, 0]}
				target-position={[0, 0, 0]}
			/>

			{/* Corresponds to: `const pulsarBody = new THREE.Group(); ...
			    scene.add(pulsarBody)` containing the body sphere + two beams */}
			<group ref={pulsarBodyRef}>
				{/* Corresponds to: the pulsar body Mesh built from
				    `pulsarBodyGeometry` + `pulsarBodyMaterial` */}
				<mesh>
					<sphereGeometry
						args={[pulsarBodyRadius, pulsarBodyWidthSeg, pulsarBodyHeightSeg]}
					/>
					<meshPhongMaterial color="#3f70bf" />
				</mesh>

				{/* Corresponds to: `pulsarBeam1` — cone rotated by -PI/2 around Z */}
				<mesh geometry={pulsarBeamGeometry} rotation={[0, 0, -Math.PI / 2]}>
					<meshBasicMaterial color={pulsarBeamColor} side={THREE.DoubleSide} />
				</mesh>

				{/* Corresponds to: `pulsarBeam2` — cone rotated by +PI/2 around Z */}
				<mesh geometry={pulsarBeamGeometry} rotation={[0, 0, Math.PI / 2]}>
					<meshBasicMaterial color={pulsarBeamColor} side={THREE.DoubleSide} />
				</mesh>
			</group>

			{/* Corresponds to: `pulsarEquator` (THREE.LineLoop) rotated PI/2
			    around X. Uses drei's <Line> which wraps Line2/LineGeometry. */}
			<Line
				points={pulsarEquatorPoints}
				color="#ffffff"
				lineWidth={2}
				rotation={[Math.PI / 2, 0, 0]}
			/>

			{/* Corresponds to: `new OrbitControls(camera, renderer.domElement)` */}
			<OrbitControls />
		</>
	);
}

export default function PulsarViewF(props: {
	pulsarRotation?: number;
	pulsarRotationRate?: number;
}) {
	const { pulsarRotation, pulsarRotationRate } = props;

	// Corresponds to: the `pulsarBeamHeight` constant being reused for the
	// initial camera position in the original component.
	const pulsarBeamHeight = 20;
	const pulsarRotationRateDefault = 0.01;

	// Corresponds to: `controlsAnimationRef` plus the local `isAnimating`
	// state in the original. R3F renders continuously by default, so we
	// gate the rotation update inside `useFrame` on this flag rather than
	// starting/stopping a raf loop.
	const [isAnimating, setIsAnimating] = useState(true);

	// Corresponds to: the `guiParams` object in the original — mutated by
	// lil-gui and read inside the animation loop.
	const guiParamsRef = useRef({
		pulsarRotationRate: pulsarRotationRateDefault,
	});

	// Corresponds to: references to the `pulsarBody` group and
	// `lightDirectional` light that the GUI mutates directly.
	const pulsarBodyRef = useRef<THREE.Group | null>(null);
	const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

	// Corresponds to: the lil-gui setup block in the original useEffect.
	// We wait until the refs are populated (after the Canvas mounts its
	// scene) before wiring up the GUI to those objects.
	useEffect(() => {
		// Poll until refs are ready, since the Canvas mounts asynchronously.
		let cancelled = false;
		let gui: GUI | null = null;

		const setupGui = () => {
			if (cancelled) return;
			if (!pulsarBodyRef.current || !directionalLightRef.current) {
				requestAnimationFrame(setupGui);
				return;
			}

			gui = new GUI();

			// Corresponds to: gui.addColor(new ColorGUIHelper(lightDirectional,
			// "color"), "value").name("color")
			gui
				.addColor(
					new ColorGUIHelper(directionalLightRef.current, "color"),
					"value",
				)
				.name("color");

			// Corresponds to: gui.add(pulsarBody.rotation, "y", 0, 2*PI)
			//   .name("Pulsar rotation").listen() + the onChange wrap-around
			const guiPulsarRotation = gui
				.add(pulsarBodyRef.current.rotation, "y", 0, 2 * Math.PI)
				.name("Pulsar rotation")
				.listen();
			guiPulsarRotation.onChange((value: number) => {
				if (value >= 2 * Math.PI && pulsarBodyRef.current) {
					pulsarBodyRef.current.rotation.y = 0;
					guiPulsarRotation.updateDisplay();
				}
			});

			// Corresponds to: gui.add(guiParams, "pulsarRotationRate",
			// 0, 0.02, 0.0001).name("Pulsar rotation rate")
			gui
				.add(guiParamsRef.current, "pulsarRotationRate", 0, 0.02, 0.0001)
				.name("Pulsar rotation rate");

			// In the original: `gui.onChange(renderScene)`. R3F drives the
			// render loop continuously via `useFrame`, so no manual re-render
			// is needed when GUI values change.
		};

		setupGui();

		// Corresponds to: cleanup tearing down the GUI alongside the renderer.
		return () => {
			cancelled = true;
			if (gui) gui.destroy();
		};
	}, []);

	// Corresponds to: `toggleAnimationListener` — Space toggles animation.
	const toggleAnimationListener = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code === "Space") {
			setIsAnimating((prev) => {
				const next = !prev;
				console.log(next ? "Start animation" : "Stop animation");
				return next;
			});
		}
	};

	// Corresponds to: the returned <div ref={mountRef} ...> wrapper.
	// The <Canvas> takes over the role of `renderer` + scene + camera +
	// window resize handling (R3F observes the parent size automatically).
	return (
		<div tabIndex={0} id="pulsar-model" onKeyDown={toggleAnimationListener}>
			{/* Corresponds to: `new THREE.PerspectiveCamera(75, w/h, 0.1, 1000)`
			    with position (pulsarBeamHeight, 0, pulsarBeamHeight) looking
			    at the origin. */}
			<Canvas
				camera={{
					fov: 75,
					near: 0.1,
					far: 1000,
					position: [pulsarBeamHeight, 0, pulsarBeamHeight],
				}}
			>
				<PulsarScene
					isAnimating={isAnimating}
					guiParamsRef={guiParamsRef}
					pulsarBodyRef={pulsarBodyRef}
					directionalLightRef={directionalLightRef}
				/>
			</Canvas>
		</div>
	);
}
