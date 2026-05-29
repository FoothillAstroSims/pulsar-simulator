import { useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/Addons.js";

// Methods to pass to the parent node ref
export interface PulsarViewRef {
	resetCamera: () => void;
}

// Pulsar parameters
export interface PulsarParamsRef {
	isAnimating: boolean;
	pulsarPeriod: number;
	pulsarAxialTilt: number;
	pulsarBeamLatitude: number;
	pulsarBeamAngle: number;
}

// Default pulsar parameter values
export const isAnimatingDefault = true;
export const pulsarPeriodDefault = 50.0;
export const pulsarAxialTiltDefault = 0.0;
export const pulsarBeamLatitudeDefault = 0.0;
export const pulsarBeamAngleDefault = Math.PI / 24;

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

export function PulsarView(
	props: PulsarParamsRef & {
		ref: React.RefObject<PulsarViewRef | null>;
	},
) {
	const {
		ref,
		isAnimating,
		pulsarPeriod,
		pulsarAxialTilt,
		pulsarBeamLatitude,
		pulsarBeamAngle,
	} = props;

	const mountRef = useRef<HTMLDivElement | null>(null);
	const modelRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.Camera;
		renderer: THREE.WebGLRenderer;
		orbitControls: OrbitControls;
	} | null>(null);
	const controlsAnimationRef = useRef<{
		startAnimation: () => void;
		stopAnimation: () => void;
	} | null>(null);
	const pulsarParamsRef = useRef<PulsarParamsRef>({
		isAnimating: isAnimating ?? isAnimatingDefault,
		pulsarPeriod: pulsarPeriod ?? pulsarPeriodDefault,
		pulsarAxialTilt: pulsarAxialTilt ?? pulsarAxialTiltDefault,
		pulsarBeamLatitude: pulsarBeamLatitude ?? pulsarBeamLatitudeDefault,
		pulsarBeamAngle: pulsarBeamAngle ?? pulsarBeamAngleDefault,
	});

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

		// // Axes
		// const axesHelper = new THREE.AxesHelper(100);
		// axesHelper.name = "axesHelper";
		// scene.add(axesHelper);

		// Lighting
		const lightAmbient = new THREE.AmbientLight(0xffffff, 0.2);
		lightAmbient.name = "lightAmbient";
		scene.add(lightAmbient);

		const lightDirectional = new THREE.DirectionalLight(0xffffff, 5);
		lightDirectional.name = "lightDirectional";
		lightDirectional.position.set(
			pulsarBodyRadius * 2,
			pulsarBodyRadius * 2,
			pulsarBodyRadius * 2,
		);
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
		const pulsarBeamGeometry = new THREE.ConeGeometry(
			pulsarBeamRadius,
			pulsarBeamHeight,
			pulsarBeamRadSeg,
			pulsarBeamHeightSeg,
			true,
		).translate(0, -pulsarBeamHeight / 2 - pulsarBodyRadius, 0);
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
		pulsarBeam1.rotation.set(
			0,
			0,
			-pulsarParams.pulsarBeamLatitude - Math.PI / 2,
		);
		pulsarBeam2.rotation.set(
			0,
			0,
			Math.PI / 2 - pulsarParams.pulsarBeamLatitude,
		);

		const pulsarBeams = new THREE.Group();
		pulsarBeams.name = "pulsarBeams";
		pulsarBeams.add(pulsarBeam1);
		pulsarBeams.add(pulsarBeam2);
		pulsar.add(pulsarBeams);

		// Wrapper to help with axial tilt
		const pulsarAxialTiltWrapper = new THREE.Group();
		pulsarAxialTiltWrapper.name = "pulsarAxialTiltWrapper";
		pulsarAxialTiltWrapper.add(pulsar);
		pulsarAxialTiltWrapper.rotation.set(0, 0, pulsarParams.pulsarAxialTilt);
		scene.add(pulsarAxialTiltWrapper);

		// Camera
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0, 0, pulsarBeamHeight * 1.5);
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
		orbitControls.update();
		// TODO: Create on-screen buttons to rotate camera

		// Scene reference to access scene elements outside of initial rendering
		modelRef.current = {
			scene,
			camera,
			renderer,
			orbitControls,
		};

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
			pulsar.rotateY(1.0 / pulsarParams.pulsarPeriod);
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

		controlsAnimationRef.current = { startAnimation, stopAnimation };

		// Add the rendered canvas to the DOM and start animation
		mountNode.appendChild(renderer.domElement);
		window.addEventListener("resize", handleResize);
		if (pulsarParams.isAnimating) startAnimation();
		console.log("Animation loaded");

		// Cleanup
		return () => {
			orbitControls.removeEventListener("change", renderScene);
			window.removeEventListener("resize", handleResize);
			mountNode.removeChild(renderer.domElement);
		};
	}, []);

	// Expose certain controls to the parent node
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
		if (isAnimating) {
			controlsAnimationRef.current?.startAnimation();
			console.log("Animation started");
		} else {
			controlsAnimationRef.current?.stopAnimation();
			console.log("Animation stopped");
		}
	}, [isAnimating]);

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

			const scene = modelRef.current?.scene;
			const camera = modelRef.current?.camera;
			const renderer = modelRef.current?.renderer;

			if (
				scene !== undefined &&
				camera !== undefined &&
				renderer !== undefined
			) {
				const pulsarBeam1 = scene.getObjectByName("pulsarBeam1") as THREE.Mesh;
				const pulsarBeam2 = scene.getObjectByName("pulsarBeam2") as THREE.Mesh;
				pulsarBeam1.rotation.set(0, 0, -pulsarBeamLatitude - Math.PI / 2);
				pulsarBeam2.rotation.set(0, 0, Math.PI / 2 - pulsarBeamLatitude);

				renderer.render(scene, camera);
			}
		}
	}, [pulsarBeamLatitude]);

	// Change pulsar axial tilt
	useEffect(() => {
		if (pulsarAxialTilt !== undefined) {
			pulsarParamsRef.current.pulsarAxialTilt = pulsarAxialTilt;

			const scene = modelRef.current?.scene;
			const camera = modelRef.current?.camera;
			const renderer = modelRef.current?.renderer;

			if (
				scene !== undefined &&
				camera !== undefined &&
				renderer !== undefined
			) {
				const pulsarAxialTiltWrapper = scene.getObjectByName(
					"pulsarAxialTiltWrapper",
				) as THREE.Group;
				pulsarAxialTiltWrapper.rotation.z = pulsarAxialTilt;

				renderer.render(scene, camera);
			}
		}
	}, [pulsarAxialTilt]);

	// Change pulsar beam angle
	useEffect(() => {
		if (pulsarBeamAngle !== undefined) {
			pulsarParamsRef.current.pulsarBeamAngle = pulsarBeamAngle;

			const scene = modelRef.current?.scene;
			const camera = modelRef.current?.camera;
			const renderer = modelRef.current?.renderer;

			if (
				scene !== undefined &&
				camera !== undefined &&
				renderer !== undefined
			) {
				const pulsarBeamRadius = pulsarBeamHeight * Math.tan(pulsarBeamAngle);
				const pulsarBeams = scene.getObjectByName("pulsarBeams")
					?.children as THREE.Mesh<THREE.ConeGeometry>[];
				pulsarBeams.forEach((pulsarBeam) => {
					pulsarBeam.geometry.dispose();
					pulsarBeam.geometry = new THREE.ConeGeometry(
						pulsarBeamRadius,
						pulsarBeamHeight,
						pulsarBeamRadSeg,
						pulsarBeamHeightSeg,
						true,
					).translate(0, -pulsarBeamHeight / 2 - pulsarBodyRadius, 0);
				});

				renderer.render(scene, camera);
			}
		}
	}, [pulsarBeamAngle]);

	return <div id="pulsar-model" ref={mountRef} />;
}
