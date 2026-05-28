import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/Addons.js";

// Default pulsar parameter values
export const pulsarPeriodDefault = 50.0;
export const pulsarAxialTiltDefault = Math.PI / 4;
export const pulsarBeamLatitudeDefault = 0.0;

export function PulsarView(props: {
	isAnimating?: boolean;
	pulsarPeriod?: number;
	pulsarAxialTilt?: number;
	pulsarBeamLatitude?: number;
}) {
	const { isAnimating, pulsarPeriod, pulsarAxialTilt, pulsarBeamLatitude } =
		props;
	const pulsarParamsRef = useRef({
		isAnimating: isAnimating ?? true,
		pulsarPeriod: pulsarPeriod ?? pulsarPeriodDefault,
		pulsarAxialTilt: pulsarAxialTilt ?? pulsarAxialTiltDefault,
		pulsarBeamLatitude: pulsarBeamLatitude ?? pulsarBeamLatitudeDefault,
	});

	const mountRef = useRef<HTMLDivElement | null>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.Camera;
		renderer: THREE.WebGLRenderer;
	} | null>(null);
	const controlsAnimationRef = useRef<Record<string, () => void>>(null);

	useEffect(() => {
		// DOM mount node
		const mountNode = mountRef.current;
		if (!mountNode) return; // Check if the element has rendered

		mountNode.focus();
		let width = mountNode.clientWidth;
		let height = mountNode.clientHeight;
		let frameID: number;

		// Pulsar parameters
		const pulsarParams = pulsarParamsRef.current;

		// Scene
		const scene = new THREE.Scene();

		// Axes
		const axesHelper = new THREE.AxesHelper(100);
		axesHelper.name = "axesHelper";
		scene.add(axesHelper);

		// Lighting
		const lightAmbient = new THREE.AmbientLight(0xffffff, 0.2);
		lightAmbient.name = "lightAmbient";
		scene.add(lightAmbient);

		const lightDirectional = new THREE.DirectionalLight(0xffffff, 5);
		lightDirectional.name = "lightDirectional";
		lightDirectional.position.set(10, 10, 0);
		lightDirectional.target.position.set(0, 0, 0);
		scene.add(lightDirectional);
		scene.add(lightDirectional.target);

		const lightHelper = new THREE.DirectionalLightHelper(lightDirectional);
		lightHelper.name = "lightDirectionalHelper";
		scene.add(lightHelper);

		// Pulsar
		const pulsarBodyRadius = 5;
		const pulsarBodyWidthSeg = 64;
		const pulsarBodyHeightSeg = 32;
		const pulsarBeamRadius = 1;
		const pulsarBeamHeight = 20;
		const pulsarBeamRadSeg = 32;
		const pulsarBeamHeightSeg = 4;
		const pulsarBeamColor = "#ffffff";

		const pulsar = new THREE.Group();
		pulsar.name = "pulsar";

		// Main body
		// TODO: Implement changing the axis of rotation
		const pulsarBodyGeometry = new THREE.SphereGeometry(
			pulsarBodyRadius,
			pulsarBodyWidthSeg,
			pulsarBodyHeightSeg,
		);
		const pulsarBodyMaterial = new THREE.MeshPhongMaterial({
			color: "#3f70bf",
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
			color: "white",
			linewidth: 2,
		});
		const pulsarAxis = new Line2(pulsarAxisGeometry, pulsarAxisMaterial);
		pulsarAxis.name = "pulsarAxis";
		pulsar.add(pulsarAxis);

		// Beams
		const pulsarBeamGeometry = new THREE.ConeGeometry(
			pulsarBeamRadius,
			pulsarBeamHeight,
			pulsarBeamRadSeg,
			pulsarBeamHeightSeg,
			true,
		);
		pulsarBeamGeometry.translate(0, -pulsarBeamHeight / 2, 0);
		const pulsarBeamMaterial = new THREE.MeshBasicMaterial({
			color: pulsarBeamColor,
			side: THREE.DoubleSide,
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

		// Equator
		const pulsarEquatorGeometry = new THREE.BufferGeometry().setFromPoints(
			new THREE.ArcCurve(0, 0, pulsarBodyRadius + 0.01).getSpacedPoints(64),
		);
		const pulsarEquatorMaterial = new THREE.LineBasicMaterial({
			color: "#ffffff",
			linewidth: 100,
		});
		const pulsarEquator = new THREE.LineLoop(
			pulsarEquatorGeometry,
			pulsarEquatorMaterial,
		);
		pulsarEquator.name = "pulsarEquator";
		pulsarEquator.rotation.set(Math.PI / 2, 0, 0);
		pulsar.add(pulsarEquator);

		// Wrapper to help with axial tilt
		const pulsarAxialTiltWrapper = new THREE.Group();
		pulsarAxialTiltWrapper.name = "pulsarAxialTiltWrapper";
		pulsarAxialTiltWrapper.add(pulsar);
		pulsarAxialTiltWrapper.rotation.set(0, 0, pulsarParams.pulsarAxialTilt);
		scene.add(pulsarAxialTiltWrapper);

		// Camera
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(pulsarBeamHeight, 0, pulsarBeamHeight);
		camera.lookAt(0, 0, 0);

		// Renderer
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
		renderer.setPixelRatio(window.devicePixelRatio);

		// Render scene helper function
		const renderScene = () => renderer.render(scene, camera);

		// Update scene reference to access scene elements outside of initial rendering
		sceneRef.current = {
			scene,
			camera,
			renderer,
		};

		// Orbital controls
		const controlsOrbital = new OrbitControls(camera, renderer.domElement);
		controlsOrbital.enablePan = false;
		controlsOrbital.rotateSpeed = 2;
		controlsOrbital.listenToKeyEvents(window);
		controlsOrbital.addEventListener("change", renderScene);
		controlsOrbital.update();
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
			pulsar.rotateY(1.0 / pulsarParams.pulsarPeriod);
			controlsOrbital.update();
			renderScene();
			frameID = window.requestAnimationFrame(animate);
		};

		const startAnimation = () => {
			if (!frameID) {
				frameID = requestAnimationFrame(animate);
			}
			controlsOrbital.update();
		};

		const pauseAnimation = () => {
			cancelAnimationFrame(frameID);
			frameID = 0;
			controlsOrbital.update();
		};

		controlsAnimationRef.current = { startAnimation, pauseAnimation };

		// Add the rendered canvas to the DOM and start animation
		mountNode.appendChild(renderer.domElement);
		window.addEventListener("resize", handleResize);
		if (pulsarParams.isAnimating) startAnimation();
		console.log("Animation loaded");

		// Cleanup
		return () => {
			controlsOrbital.removeEventListener("change", renderScene);
			window.removeEventListener("resize", handleResize);
			mountNode.removeChild(renderer.domElement);
		};
	}, []);

	useEffect(() => {
		if (isAnimating) {
			controlsAnimationRef.current?.startAnimation();
			console.log("Start animation");
		} else {
			controlsAnimationRef.current?.pauseAnimation();
			console.log("Stop animation");
		}
	}, [isAnimating]);

	useEffect(() => {
		if (pulsarPeriod !== undefined) {
			pulsarParamsRef.current.pulsarPeriod = pulsarPeriod;
		}
	}, [pulsarPeriod]);

	useEffect(() => {
		if (pulsarBeamLatitude !== undefined) {
			pulsarParamsRef.current.pulsarBeamLatitude = pulsarBeamLatitude;

			const scene = sceneRef.current?.scene;
			const camera = sceneRef.current?.camera;
			const renderer = sceneRef.current?.renderer;

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

	useEffect(() => {
		if (pulsarAxialTilt !== undefined) {
			pulsarParamsRef.current.pulsarAxialTilt = pulsarAxialTilt;

			const scene = sceneRef.current?.scene;
			const camera = sceneRef.current?.camera;
			const renderer = sceneRef.current?.renderer;

			if (
				scene !== undefined &&
				camera !== undefined &&
				renderer !== undefined
			) {
				const pulsarAxialTiltWrapper = scene.getObjectByName("pulsarAxialTiltWrapper") as THREE.Group;
				pulsarAxialTiltWrapper.rotation.z = pulsarAxialTilt;

				renderer.render(scene, camera);
			}
		}
	}, [pulsarAxialTilt]);

	return <div id="pulsar-model" ref={mountRef} />;
}
