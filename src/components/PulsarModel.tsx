import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/Addons.js";
import {
	LIGHT_DIRECTION_DEFAULT,
	PULSAR_AXIS_COLOR,
	PULSAR_AXIS_LINE_WIDTH,
	PULSAR_BEAM_COLOR,
	PULSAR_BEAM_TRANS,
	PULSAR_BODY_COLOR,
	PULSAR_BODY_HEIGHT_SEG,
	PULSAR_BODY_RADIUS,
	PULSAR_BODY_WIDTH_SEG,
	PULSAR_EQUATOR_COLOR,
	PULSAR_EQUATOR_LINE_WIDTH,
	pulsarPhaseRadToDeg,
	SHOW_DEBUG,
	type Triplet,
} from "./pulsar-config";
import {
	createPulsarBeamGeometry,
	getMeshDirection,
	getPulsarBeamDirection,
	setPulsarBeamsRotation,
} from "./pulsar-utils";

/**
 * Interface type for the required properties of the PulsarModel component
 */
export interface PulsarModelProps {
	/** Rotation around the pulsar's axis, in radians */
	pulsarPhase: number;
	/** Number of seconds for the pulsar to make one revolution around its axis */
	pulsarPeriod: number;
	/** Euler angles, in radians, representing the rotation of the pulsar axis */
	pulsarAxisEuler: Triplet;
	/** Latitude of the pulsar beams i.e. the azimuthal angle measured from the equator, in radians */
	pulsarBeamLatitude: number;
	/** Radius of the pulsar beams */
	pulsarBeamRadius: number;
	/** Position of the camera. Also doubles as the direction the camera is facing, since it always looks at the origin */
	cameraPosition: Triplet;
	/** Toggles animation */
	isAnimating: boolean;
}
/**
 * Basic, simplified 3D model of a spinning pulsar emitting radio waves, made with Three.js.
 */
export function PulsarModel(
	props: PulsarModelProps & {
		ref?: React.RefObject<Record<string, unknown> | null>; // Reference to the node containing the model
		orbitControlsEnabled?: boolean; // Orbit controls toggle
		showAxesHelper?: boolean; // Axes toggle
		showPulsarEquator?: boolean;
		showPulsarAxis?: boolean;
		directionalLightEnabled?: boolean;
		onPulsarPhaseChange?: (phase: number) => void; // Callback for when the pulsar phase changes. Used to update the pulsar phase state in the parent node
		onCameraPositionChange?: (pos: Triplet) => void; // Callback for when the camera position/direction changes. Used to update the camera position state in the parent node
		onPulsarBeamDirectionChange?: (dir: Triplet) => void; // Callback for when the pulsar beam direction changes. Used to report the beam direction to the parent node through state management. Not currently used due to performance issues
	},
) {
	const {
		ref,
		pulsarPhase,
		pulsarPeriod,
		pulsarAxisEuler,
		pulsarBeamLatitude,
		pulsarBeamRadius,
		cameraPosition,
		isAnimating,
		orbitControlsEnabled,
		showAxesHelper,
		showPulsarEquator,
		showPulsarAxis,
		directionalLightEnabled,
		onPulsarPhaseChange,
		onPulsarBeamDirectionChange,
		onCameraPositionChange,
	} = props;

	const mountRef = useRef<HTMLDivElement | null>(null); // HTML div element that the Three.js model will be rendered inside
	const modelRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		orbitControls: OrbitControls;
		startAnimation: () => void;
		stopAnimation: () => void;
	} | null>(null); // References to model elements and parameters
	const pulsarParamsRef = useRef({
		pulsarPhase: pulsarPhase,
		pulsarPeriod: pulsarPeriod,
		pulsarAxisEuler: pulsarAxisEuler,
		pulsarBeamLatitude: pulsarBeamLatitude,
		pulsarBeamRadius: pulsarBeamRadius,
		cameraPosition: cameraPosition,
		isAnimating: isAnimating,
		orbitControlsEnabled: orbitControlsEnabled,
		showAxesHelper: showAxesHelper,
		showPulsarEquator: showPulsarEquator,
		showPulsarAxis: showPulsarAxis,
		directionalLightEnabled: directionalLightEnabled,
		onPulsarPhaseChange: onPulsarPhaseChange,
		onPulsarBeamDirectionChange: onPulsarBeamDirectionChange,
		onCameraPositionChange: onCameraPositionChange,
	}); // Pulsar parameters reference

	// Initialize Three.js pulsar model and animation
	useEffect(() => {
		// DOM mount node reference
		const mountNode = mountRef.current;
		if (!mountNode) return;

		let width = mountNode.clientWidth;
		let height = mountNode.clientHeight;
		let frameID: number;
		let lastFrameTime: number | undefined;

		// Pulsar parameters
		const pulsarParams = pulsarParamsRef.current;

		// Scene
		const scene = new THREE.Scene();

		// Axes: +x = red, +y = green, +z = blue
		const axesHelper = new THREE.AxesHelper(100);
		axesHelper.name = "axesHelper";
		axesHelper.visible = pulsarParams.showAxesHelper ?? false;
		scene.add(axesHelper);

		// Lighting
		const lightAmbient = new THREE.AmbientLight(0xffffff, 0.2);
		lightAmbient.name = "lightAmbient";
		scene.add(lightAmbient);

		const lightDirectional = new THREE.DirectionalLight(0xffffff, 5);
		lightDirectional.name = "lightDirectional";
		lightDirectional.position.set(...LIGHT_DIRECTION_DEFAULT);
		lightDirectional.target.position.set(0, 0, 0);
		lightDirectional.visible = pulsarParams.directionalLightEnabled ?? true;
		scene.add(lightDirectional);
		scene.add(lightDirectional.target);

		// // Show the direction of the directional lighting
		// const lightHelper = new THREE.DirectionalLightHelper(lightDirectional);
		// lightHelper.name = "lightDirectionalHelper";
		// scene.add(lightHelper);

		// Pulsar model
		const pulsar = new THREE.Group();
		pulsar.name = "pulsar";

		// Main pulsar body
		const pulsarBodyGeometry = new THREE.SphereGeometry(
			PULSAR_BODY_RADIUS,
			PULSAR_BODY_WIDTH_SEG,
			PULSAR_BODY_HEIGHT_SEG,
		);
		const pulsarBodyMaterial = new THREE.MeshPhongMaterial({
			color: PULSAR_BODY_COLOR,
		});
		const pulsarBody = new THREE.Mesh(pulsarBodyGeometry, pulsarBodyMaterial);
		pulsarBody.name = "pulsarBody";
		pulsar.add(pulsarBody);

		// Axis of rotation
		const pulsarAxisPoints = [
			new THREE.Vector3(0, PULSAR_BODY_RADIUS * 2, 0),
			new THREE.Vector3(0, -PULSAR_BODY_RADIUS * 2, 0),
		];
		const pulsarAxisGeometry = new LineGeometry().setFromPoints(
			pulsarAxisPoints,
		);
		const pulsarAxisMaterial = new LineMaterial({
			color: PULSAR_AXIS_COLOR,
			linewidth: PULSAR_AXIS_LINE_WIDTH,
		});
		const pulsarAxis = new Line2(pulsarAxisGeometry, pulsarAxisMaterial);
		pulsarAxis.name = "pulsarAxis";
		pulsarAxis.visible = pulsarParams.showPulsarAxis ?? true;
		pulsar.add(pulsarAxis);

		// Equator
		const pulsarEquatorPoints = new THREE.ArcCurve(
			0,
			0,
			PULSAR_BODY_RADIUS,
		).getSpacedPoints(64);
		pulsarEquatorPoints.push(pulsarEquatorPoints[0]);
		const pulsarEquatorGeometry = new LineGeometry().setFromPoints(
			pulsarEquatorPoints,
		);
		const pulsarEquatorMaterial = new LineMaterial({
			color: PULSAR_EQUATOR_COLOR,
			linewidth: PULSAR_EQUATOR_LINE_WIDTH,
		});
		const pulsarEquator = new Line2(
			pulsarEquatorGeometry,
			pulsarEquatorMaterial,
		);
		pulsarEquator.name = "pulsarEquator";
		pulsarEquator.rotation.set(Math.PI / 2, 0, 0);
		pulsarEquator.visible = pulsarParams.showPulsarEquator ?? true;
		pulsar.add(pulsarEquator);

		// Beams
		const pulsarBeamGeometry = createPulsarBeamGeometry(
			pulsarParams.pulsarBeamRadius,
		);
		const pulsarBeamMaterial = new THREE.MeshBasicMaterial({
			color: PULSAR_BEAM_COLOR,
			side: THREE.DoubleSide,
			transparent: PULSAR_BEAM_TRANS <= 1.0,
			opacity: PULSAR_BEAM_TRANS,
		});
		const pulsarBeam1 = new THREE.Mesh(pulsarBeamGeometry, pulsarBeamMaterial);
		const pulsarBeam2 = new THREE.Mesh(pulsarBeamGeometry, pulsarBeamMaterial);
		pulsarBeam1.name = "pulsarBeam1";
		pulsarBeam2.name = "pulsarBeam2";
		setPulsarBeamsRotation(
			pulsarBeam1,
			pulsarBeam2,
			pulsarParams.pulsarBeamLatitude,
		);

		// pulsarBeam1.material = pulsarBeam1.material.clone();
		// pulsarBeam1.material.color.set("red");

		const pulsarBeams = new THREE.Group();
		pulsarBeams.name = "pulsarBeams";
		pulsarBeams.add(pulsarBeam1);
		pulsarBeams.add(pulsarBeam2);
		pulsar.add(pulsarBeams);

		pulsar.rotation.y = pulsarParams.pulsarPhase;

		// Wrapper for axis direction
		const pulsarAxisDirectionWrapper = new THREE.Group();
		pulsarAxisDirectionWrapper.name = "pulsarAxisDirectionWrapper";
		pulsarAxisDirectionWrapper.add(pulsar);
		pulsarAxisDirectionWrapper.rotation.set(...pulsarParams.pulsarAxisEuler);
		scene.add(pulsarAxisDirectionWrapper);

		// Camera
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(...pulsarParams.cameraPosition);
		camera.lookAt(0, 0, 0);

		// Renderer
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
		renderer.setPixelRatio(window.devicePixelRatio);

		// Render scene helper function
		const renderScene = () => renderer.render(scene, camera);

		// Orbital controls
		const orbitControls = new OrbitControls(camera, renderer.domElement);
		orbitControls.enablePan = false;
		orbitControls.rotateSpeed = 2;
		orbitControls.listenToKeyEvents(window);
		orbitControls.addEventListener("change", renderScene);

		// Report the camera position to the parent node using the provided callback function
		const cameraPosition = new THREE.Vector3();
		const reportCameraPosition = () => {
			cameraPosition.copy(camera.position);
			pulsarParams.onCameraPositionChange?.(cameraPosition.clone().toArray());
			console.log(`Camera position: ${cameraPosition.toArray()}`);
		};
		orbitControls.addEventListener("change", reportCameraPosition);

		orbitControls.enabled = pulsarParams.orbitControlsEnabled ?? false;
		orbitControls.update();
		// TODO: Create on-screen buttons to rotate camera

		// Handling window resizing
		const handleResize = () => {
			width = mountNode.clientWidth;
			height = mountNode.clientHeight;
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderScene();
		};

		// Animation
		const animate = (time: number) => {
			// Get time elapsed since the last animation frame
			const dt =
				lastFrameTime === undefined ? 0 : (time - lastFrameTime) / 1000;
			lastFrameTime = time;

			if (pulsarParams.isAnimating) {
				// Rotate pulsar in real time
				pulsarParams.pulsarPhase =
					(pulsarParams.pulsarPhase +
						(2 * Math.PI * dt) / pulsarParams.pulsarPeriod) %
					(2 * Math.PI);
				pulsar.rotation.y = pulsarParams.pulsarPhase;

				pulsarParams.onPulsarPhaseChange?.(
					pulsarPhaseRadToDeg(pulsarParams.pulsarPhase),
				); // Report pulsar phase to parent
				pulsarParams.onPulsarBeamDirectionChange?.(
					getMeshDirection(pulsarBeam1, [0, 1, 0]),
				); // Report pulsar beam direction to parent

				// console.log(`Phase: ${pulsarParams.pulsarPhase}`);
			}

			orbitControls.update();
			renderScene();
			frameID = window.requestAnimationFrame(animate);
		};

		const startAnimation = () => {
			if (!frameID) {
				lastFrameTime = undefined;
				frameID = window.requestAnimationFrame(animate);
			}
			orbitControls.update();
		};

		const stopAnimation = () => {
			window.cancelAnimationFrame(frameID);
			frameID = 0;
			orbitControls.update();
		};

		// Scene reference to access and manipulate scene elements outside of initial rendering
		modelRef.current = {
			scene,
			camera,
			renderer,
			orbitControls,
			startAnimation,
			stopAnimation,
		};

		// Add the rendered canvas to the DOM and start animation
		mountNode.appendChild(renderer.domElement);
		window.addEventListener("resize", handleResize);
		console.log("Animation loaded");

		// Cleanup
		return () => {
			cancelAnimationFrame(frameID);
			orbitControls.removeEventListener("change", renderScene);
			orbitControls.removeEventListener("change", reportCameraPosition);
			window.removeEventListener("resize", handleResize);
			mountNode.removeChild(renderer.domElement);
		};
	}, []);

	// Expose parameters and methods through the ref prop
	useEffect(() => {
		if (!ref) return;

		ref.current = {
			// Reset camera to original position
			resetCamera: () => {
				modelRef.current?.orbitControls.reset();
			},

			// Get RGBA values for a pixel rendered at the specified coordinates on the canvas
			// Used for testing purposes
			getPixelRGBA: (x: number, y: number) => {
				const { scene, camera, renderer } = modelRef.current ?? {};
				const mountNode = mountRef.current;

				if (!(scene && camera && renderer && mountNode)) return;

				const renderTarget = new THREE.WebGLRenderTarget(
					mountNode.clientWidth,
					mountNode.clientHeight,
				);

				renderer.setRenderTarget(renderTarget);
				renderer.render(scene, camera);
				renderer.setRenderTarget(null);

				const buffer = new Uint8Array(4);
				renderer.readRenderTargetPixels(renderTarget, x, y, 1, 1, buffer);

				return buffer;
			},
		};

		return () => {
			ref.current = null;
		};
	}, [ref]);

	// Animation start/stop
	useEffect(() => {
		pulsarParamsRef.current.isAnimating = isAnimating;

		if (isAnimating) {
			modelRef.current?.startAnimation();
			// console.log("Animation started");
		} else {
			modelRef.current?.stopAnimation();
			// console.log("Animation stopped");
		}
	}, [isAnimating]);

	// Enable/disable orbit controls i.e. lock camera
	useEffect(() => {
		pulsarParamsRef.current.orbitControlsEnabled = orbitControlsEnabled;

		const { orbitControls } = modelRef.current ?? {};
		if (orbitControls) {
			// eslint-disable-next-line react-hooks/immutability
			orbitControls.enabled = orbitControlsEnabled ?? false;
		}
	}, [orbitControlsEnabled]);

	// Show/hide axes helper
	useEffect(() => {
		pulsarParamsRef.current.showAxesHelper = showAxesHelper;

		const { scene, camera, renderer } = modelRef.current ?? {};
		if (scene && camera && renderer) {
			const axesHelper = scene.getObjectByName(
				"axesHelper",
			) as THREE.AxesHelper;
			axesHelper.visible = showAxesHelper ?? false;

			renderer.render(scene, camera);
		}
	}, [showAxesHelper]);

	// Show/hide pulsar equator
	useEffect(() => {
		pulsarParamsRef.current.showPulsarEquator = showPulsarEquator;

		const { scene, camera, renderer } = modelRef.current ?? {};
		if (scene && camera && renderer) {
			const pulsarEquator = scene.getObjectByName("pulsarEquator") as Line2;
			pulsarEquator.visible = showPulsarEquator ?? true;

			renderer.render(scene, camera);
		}
	}, [showPulsarEquator]);

	// Show/hide pulsar axis
	useEffect(() => {
		pulsarParamsRef.current.showPulsarAxis = showPulsarAxis;

		const { scene, camera, renderer } = modelRef.current ?? {};
		if (scene && camera && renderer) {
			const pulsarAxis = scene.getObjectByName("pulsarAxis") as Line2;
			pulsarAxis.visible = showPulsarAxis ?? true;

			renderer.render(scene, camera);
		}
	}, [showPulsarAxis]);

	// Change camera position from props if orbit controls are not enabled
	useEffect(() => {
		pulsarParamsRef.current.cameraPosition = cameraPosition;
		if (pulsarParamsRef.current.orbitControlsEnabled) return;

		const { scene, camera, renderer } = modelRef.current ?? {};

		if (scene && camera && renderer) {
			camera.position.set(...cameraPosition);
			renderer.render(scene, camera);
		}
	}, [cameraPosition]);

	// Change pulsar phase from props when animation is stopped
	useEffect(() => {
		if (pulsarPhase === undefined) return;
		if (pulsarParamsRef.current.isAnimating) return;

		pulsarParamsRef.current.pulsarPhase = pulsarPhase;

		const { scene, camera, renderer } = modelRef.current ?? {};
		if (scene && camera && renderer) {
			const pulsar = scene.getObjectByName("pulsar") as THREE.Group;
			pulsar.rotation.y = pulsarPhase;
			renderer.render(scene, camera);
		}
	}, [pulsarPhase]);

	// Change pulsar period
	useEffect(() => {
		if (pulsarPeriod !== undefined) {
			pulsarParamsRef.current.pulsarPeriod = pulsarPeriod;
		}
	}, [pulsarPeriod]);

	// TODO: Implement mouse dragging to change beam latitude and axial tilt

	// Change pulsar beam latitude
	useEffect(() => {
		if (pulsarBeamLatitude !== undefined) {
			pulsarParamsRef.current.pulsarBeamLatitude = pulsarBeamLatitude;

			const { scene, camera, renderer } = modelRef.current ?? {};

			if (scene && camera && renderer) {
				const pulsarBeam1 = scene.getObjectByName("pulsarBeam1") as THREE.Mesh;
				const pulsarBeam2 = scene.getObjectByName("pulsarBeam2") as THREE.Mesh;
				setPulsarBeamsRotation(pulsarBeam1, pulsarBeam2, pulsarBeamLatitude);

				renderer.render(scene, camera);
			}
		}
	}, [pulsarBeamLatitude]);

	// Change pulsar axis of rotation
	useEffect(() => {
		if (pulsarAxisEuler !== undefined) {
			pulsarParamsRef.current.pulsarAxisEuler = pulsarAxisEuler;

			const { scene, camera, renderer } = modelRef.current ?? {};

			if (scene && camera && renderer) {
				const pulsarAxisDirectionWrapper = scene.getObjectByName(
					"pulsarAxisDirectionWrapper",
				) as THREE.Group;
				pulsarAxisDirectionWrapper.rotation.set(...pulsarAxisEuler);

				renderer.render(scene, camera);
			}
		}
	}, [pulsarAxisEuler]);

	// Change pulsar beam radius
	useEffect(() => {
		if (pulsarBeamRadius !== undefined) {
			pulsarParamsRef.current.pulsarBeamRadius = pulsarBeamRadius;

			const { scene, camera, renderer } = modelRef.current ?? {};

			if (scene && camera && renderer) {
				// Mesh geometries cannot be changed after they are created, so we must recreate the geometry wholesale
				const pulsarBeams = scene.getObjectByName("pulsarBeams")
					?.children as THREE.Mesh<THREE.ConeGeometry>[];
				pulsarBeams.forEach((pulsarBeam) => {
					pulsarBeam.geometry.dispose();
					pulsarBeam.geometry = createPulsarBeamGeometry(pulsarBeamRadius);
				});

				renderer.render(scene, camera);
			}
		}
	}, [pulsarBeamRadius]);

	// Display debug info about the model
	useEffect(() => {
		if (SHOW_DEBUG) {
			const { scene } = modelRef.current ?? {};

			if (scene) {
				const pulsarBeam1 = scene.getObjectByName("pulsarBeam1") as THREE.Mesh;
				const dir = getMeshDirection(pulsarBeam1, [0, 1, 0]);
				console.log(`Pulsar beam direction: ${dir.map((x) => x.toFixed(5))}`);
				console.log(
					`getPulsarBeamDirection: ${getPulsarBeamDirection(pulsarPhase, pulsarAxisEuler, pulsarBeamLatitude).map((x) => x.toFixed(5))}`,
				);
			}
		}
	}, [pulsarPhase, pulsarAxisEuler, pulsarBeamLatitude]);

	return (
		<div
			className={`pulsar-model${orbitControlsEnabled ? " orbit-controls" : ""}`}
			style={{ width: "100%", height: "100%", minWidth: 0, minHeight: 0 }}
			ref={mountRef}
		/>
	);
}
