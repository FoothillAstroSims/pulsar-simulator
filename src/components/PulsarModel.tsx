import { useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/Addons.js";

// Pulsar parameters
export interface PulsarModelProps {
	pulsarPhase: number;
	pulsarPeriod: number;
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
	pulsarBeamAngle: number;
	cameraPosition: [number, number, number];
	isAnimating: boolean;
	orbitControlsEnabled: boolean;
	onPulsarPhaseChange?: (phase: number) => void;
	onCameraPositionChange?: (pos: [number, number, number]) => void;
}

// Parameters and methods to expose to the parent node
export interface PulsarModelRef {
	resetCamera: () => void;
}

// Default pulsar parameter values
export const pulsarPhaseDefault = 0.0;
export const pulsarPeriodDefault = 25.0;
export const pulsarAxisInclinationXDefault = 0.0;
export const pulsarAxisInclinationYDefault = 0.0;
export const pulsarAxisInclinationZDefault = 0.0;
export const pulsarBeamLatitudeDefault = 0.0;
export const pulsarBeamAngleDefault = Math.PI / 24;
export const isAnimatingDefault = true;
export const orbitControlsEnabledDefault = true;

// Pulsar model constants
const pulsarBodyRadius = 5;
const pulsarBodyWidthSeg = 64;
const pulsarBodyHeightSeg = 32;
const pulsarBodyColor = "#3f70bf";

const pulsarBeamHeight = 20;
const pulsarBeamRadSeg = 32;
const pulsarBeamHeightSeg = 4;
const pulsarBeamColor = "#ffffff";
const pulsarBeamTransparency = 0.5;

const pulsarAxisColor = "#ffffff";
const pulsarAxisLineWidth = 2;

const pulsarEquatorColor = "#ffffff";
const pulsarEquatorLineWidth = 2;

const createPulsarBeamGeometry = (radius: number) =>
	new THREE.ConeGeometry(
		radius,
		pulsarBeamHeight,
		pulsarBeamRadSeg,
		pulsarBeamHeightSeg,
		true,
	).translate(0, -pulsarBeamHeight / 2 - pulsarBodyRadius, 0);
const setPulsarBeamsRotation = (
	beam1: THREE.Mesh,
	beam2: THREE.Mesh,
	latitude: number,
): void => {
	beam1.rotation.set(0, 0, Math.PI / 2 + latitude);
	beam2.rotation.set(0, 0, latitude - Math.PI / 2);
};

export const cameraPositionXDefault = 0.0;
export const cameraPositionYDefault = 0.0;
export const cameraPositionZDefault = 1.5 * pulsarBeamHeight;
const lightDirectionDefault: [number, number, number] = [
	pulsarBodyRadius * 2,
	pulsarBodyRadius * 2,
	pulsarBodyRadius * 2,
];

export function PulsarModel(
	props: PulsarModelProps & {
		ref?: React.RefObject<PulsarModelRef | null>;
	},
) {
	const {
		ref,
		pulsarPhase,
		pulsarPeriod,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		pulsarBeamAngle,
		cameraPosition,
		isAnimating,
		orbitControlsEnabled,
		onPulsarPhaseChange,
		onCameraPositionChange,
	} = props;

	const mountRef = useRef<HTMLDivElement | null>(null);
	const modelRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		orbitControls: OrbitControls;
		startAnimation: () => void;
		stopAnimation: () => void;
	} | null>(null);
	const pulsarParamsRef = useRef<PulsarModelProps>({
		pulsarPhase: pulsarPhase,
		pulsarPeriod: pulsarPeriod,
		pulsarAxisInclination: pulsarAxisInclination,
		pulsarBeamLatitude: pulsarBeamLatitude,
		pulsarBeamAngle: pulsarBeamAngle,
		cameraPosition: cameraPosition,
		isAnimating: isAnimating,
		orbitControlsEnabled: orbitControlsEnabled,
		onPulsarPhaseChange: onPulsarPhaseChange,
		onCameraPositionChange: onCameraPositionChange,
	});

	// Initialize Three.js pulsar model and animation
	useEffect(() => {
		// DOM mount node reference
		const mountNode = mountRef.current;
		if (!mountNode) return;

		mountNode.focus();
		let width = mountNode.clientWidth;
		let height = mountNode.clientHeight;
		let frameID: number;

		// Pulsar parameters
		const pulsarParams = pulsarParamsRef.current;

		// Scene
		const scene = new THREE.Scene();

		// Axes: +x = red, +y = green, +z = blue
		const axesHelper = new THREE.AxesHelper(100);
		axesHelper.name = "axesHelper";
		scene.add(axesHelper);

		// Lighting
		const lightAmbient = new THREE.AmbientLight(0xffffff, 0.2);
		lightAmbient.name = "lightAmbient";
		scene.add(lightAmbient);

		const lightDirectional = new THREE.DirectionalLight(0xffffff, 5);
		lightDirectional.name = "lightDirectional";
		lightDirectional.position.set(...lightDirectionDefault);
		lightDirectional.target.position.set(0, 0, 0);
		scene.add(lightDirectional);
		scene.add(lightDirectional.target);

		// const lightHelper = new THREE.DirectionalLightHelper(lightDirectional);
		// lightHelper.name = "lightDirectionalHelper";
		// scene.add(lightHelper);

		// Pulsar
		const pulsar = new THREE.Group();
		pulsar.name = "pulsar";

		// Main body
		const pulsarBodyGeometry = new THREE.SphereGeometry(
			pulsarBodyRadius,
			pulsarBodyWidthSeg,
			pulsarBodyHeightSeg,
		);
		const pulsarBodyMaterial = new THREE.MeshPhongMaterial({
			color: pulsarBodyColor,
		});
		const pulsarBody = new THREE.Mesh(pulsarBodyGeometry, pulsarBodyMaterial);
		pulsarBody.name = "pulsarBody";
		pulsar.add(pulsarBody);

		// Axis of rotation
		const pulsarAxisPoints = [
			new THREE.Vector3(0, pulsarBodyRadius * 2, 0),
			new THREE.Vector3(0, -pulsarBodyRadius * 2, 0),
		];
		const pulsarAxisGeometry = new LineGeometry().setFromPoints(
			pulsarAxisPoints,
		);
		const pulsarAxisMaterial = new LineMaterial({
			color: pulsarAxisColor,
			linewidth: pulsarAxisLineWidth,
		});
		const pulsarAxis = new Line2(pulsarAxisGeometry, pulsarAxisMaterial);
		pulsarAxis.name = "pulsarAxis";

		// Equator
		const pulsarEquatorPoints = new THREE.ArcCurve(
			0,
			0,
			pulsarBodyRadius,
		).getSpacedPoints(64);
		pulsarEquatorPoints.push(pulsarEquatorPoints[0]);
		const pulsarEquatorGeometry = new LineGeometry().setFromPoints(
			pulsarEquatorPoints,
		);
		const pulsarEquatorMaterial = new LineMaterial({
			color: pulsarEquatorColor,
			linewidth: pulsarEquatorLineWidth,
		});
		const pulsarEquator = new Line2(
			pulsarEquatorGeometry,
			pulsarEquatorMaterial,
		);
		pulsarEquator.name = "pulsarEquator";
		pulsarEquator.rotation.set(Math.PI / 2, 0, 0);
		pulsar.add(pulsarEquator);
		pulsar.add(pulsarAxis);

		// Beams
		const pulsarBeamRadius =
			pulsarBeamHeight * Math.tan(pulsarParams.pulsarBeamAngle);
		const pulsarBeamGeometry = createPulsarBeamGeometry(pulsarBeamRadius);
		const pulsarBeamMaterial = new THREE.MeshBasicMaterial({
			color: pulsarBeamColor,
			side: THREE.DoubleSide,
			transparent: pulsarBeamTransparency <= 1.0,
			opacity: pulsarBeamTransparency,
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

		// Wrapper to help with axial tilt
		const pulsarAxisDirectionWrapper = new THREE.Group();
		pulsarAxisDirectionWrapper.name = "pulsarAxisDirectionWrapper";
		pulsarAxisDirectionWrapper.add(pulsar);
		pulsarAxisDirectionWrapper.rotation.set(
			...pulsarParams.pulsarAxisInclination,
		);
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
		orbitControls.enabled = pulsarParams.orbitControlsEnabled;

		const cameraPosition = new THREE.Vector3();
		const emitCameraPosition = () => {
			cameraPosition.copy(camera.position);
			pulsarParams.onCameraPositionChange?.(cameraPosition.clone().toArray());

			console.log(`Camera position: ${cameraPosition.toArray()}`);
		};
		orbitControls.addEventListener("change", emitCameraPosition);
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
		const animate = () => {
			if (pulsarParams.isAnimating) {
				pulsarParams.pulsarPhase =
					(pulsarParams.pulsarPhase + 1.0 / pulsarParams.pulsarPeriod) %
					(2 * Math.PI);
				pulsar.rotation.y = pulsarParams.pulsarPhase;
				pulsarParams.onPulsarPhaseChange?.(pulsarParams.pulsarPhase);
			}

			orbitControls.update();
			renderScene();
			frameID = window.requestAnimationFrame(animate);
		};

		const startAnimation = () => {
			if (!frameID) {
				frameID = requestAnimationFrame(animate);
			}
			orbitControls.update();
		};

		const stopAnimation = () => {
			cancelAnimationFrame(frameID);
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
			orbitControls.removeEventListener("change", emitCameraPosition);
			window.removeEventListener("resize", handleResize);
			mountNode.removeChild(renderer.domElement);
		};
	}, []);

	// Expose certain parameters and methods to the parent node
	useImperativeHandle(
		ref,
		() => ({
			// Reset camera to original position
			resetCamera: () => {
				modelRef.current?.orbitControls.reset();
			},
		}),
		[],
	);

	// Animation start/stop
	useEffect(() => {
		pulsarParamsRef.current.isAnimating = isAnimating;

		if (isAnimating) {
			modelRef.current?.startAnimation();
			console.log("Animation started");
		} else {
			modelRef.current?.stopAnimation();
			console.log("Animation stopped");
		}
	}, [isAnimating]);

	useEffect(() => {
		pulsarParamsRef.current.orbitControlsEnabled = orbitControlsEnabled;

		const { orbitControls } = modelRef.current ?? {};
		if (orbitControls) {
			// eslint-disable-next-line react-hooks/immutability
			orbitControls.enabled = orbitControlsEnabled;
		}
	}, [orbitControlsEnabled]);

	useEffect(() => {
		pulsarParamsRef.current.cameraPosition = cameraPosition;

		const { scene, camera, renderer, orbitControls } = modelRef.current ?? {};

		if (scene && camera && renderer && orbitControls) {
			camera.position.set(...cameraPosition);
			renderer.render(scene, camera);
		}
	}, [cameraPosition]);

	// Change pulsar phase when animation is stopped
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
		if (pulsarAxisInclination !== undefined) {
			pulsarParamsRef.current.pulsarAxisInclination = pulsarAxisInclination;

			const { scene, camera, renderer } = modelRef.current ?? {};

			if (scene && camera && renderer) {
				const pulsarAxisDirectionWrapper = scene.getObjectByName(
					"pulsarAxisDirectionWrapper",
				) as THREE.Group;
				pulsarAxisDirectionWrapper.rotation.set(...pulsarAxisInclination);

				renderer.render(scene, camera);
			}
		}
	}, [pulsarAxisInclination]);

	// Change pulsar beam angle
	useEffect(() => {
		if (pulsarBeamAngle !== undefined) {
			pulsarParamsRef.current.pulsarBeamAngle = pulsarBeamAngle;

			const { scene, camera, renderer } = modelRef.current ?? {};

			if (scene && camera && renderer) {
				const pulsarBeamRadius = pulsarBeamHeight * Math.tan(pulsarBeamAngle);
				const pulsarBeams = scene.getObjectByName("pulsarBeams")
					?.children as THREE.Mesh<THREE.ConeGeometry>[];
				pulsarBeams.forEach((pulsarBeam) => {
					pulsarBeam.geometry.dispose();
					pulsarBeam.geometry = createPulsarBeamGeometry(pulsarBeamRadius);
				});

				renderer.render(scene, camera);
			}
		}
	}, [pulsarBeamAngle]);

	// Display debug info about the model
	useEffect(() => {
		const { scene } = modelRef.current ?? {};
		const pulsarBeamDirection = new THREE.Vector3(0, 1, 0);
		const pulsarBeamQuaternion = new THREE.Quaternion();

		if (scene) {
			const pulsarBeam1 = scene.getObjectByName("pulsarBeam1") as THREE.Mesh;
			pulsarBeam1.getWorldQuaternion(pulsarBeamQuaternion);
			pulsarBeamDirection.applyQuaternion(pulsarBeamQuaternion);

			console.log(
				`Pulsar beam direction: ${pulsarBeamDirection.toArray().map((x) => x.toFixed(3))}`,
			);
		}
	});

	return <div id="pulsar-model" ref={mountRef} />;
}
