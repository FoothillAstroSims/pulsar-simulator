import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function PulsarView(props: {
	isAnimating?: boolean;
	pulsarRotationRate?: number; // TODO: Change to period
	pulsarBeamLatitude?: number;
}) {
	const { isAnimating, pulsarBeamLatitude, pulsarRotationRate } = props;
	const pulsarParamsRef = useRef({
		isAnimating: isAnimating ?? true,
		pulsarRotationRate: pulsarRotationRate ?? 0.01,
		pulsarBeamLatitude: pulsarBeamLatitude ?? 0,
	});

	const mountRef = useRef<HTMLElement | null>(null);
	const controlsAnimationRef = useRef<Record<string, () => void>>(null);

	useEffect(() => {
		const pulsarParams = pulsarParamsRef.current;

		// DOM mount node
		const mountNode = mountRef.current;
		if (!mountNode) return; // Check if the element has rendered

		mountNode.focus();
		let width = mountNode.clientWidth;
		let height = mountNode.clientHeight;
		let frameID: number;

		// Scene
		const scene = new THREE.Scene();

		// Axes
		const axesHelper = new THREE.AxesHelper(100);
		scene.add(axesHelper);

		// Lighting
		const lightAmbient = new THREE.AmbientLight(0xffffff, 0.2);
		scene.add(lightAmbient);

		const lightDirectional = new THREE.DirectionalLight(0xffffff, 5);
		lightDirectional.position.set(10, 10, 0);
		lightDirectional.target.position.set(0, 0, 0);
		scene.add(lightDirectional);
		scene.add(lightDirectional.target);

		const lightHelper = new THREE.DirectionalLightHelper(lightDirectional);
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

		// Main body
		// TODO: Implement changing the axis of rotation
		const pulsarBody = new THREE.Group();
		const pulsarBodyGeometry = new THREE.SphereGeometry(
			pulsarBodyRadius,
			pulsarBodyWidthSeg,
			pulsarBodyHeightSeg,
		);
		const pulsarBodyMaterial = new THREE.MeshPhongMaterial({
			color: "#3f70bf",
		});
		pulsarBody.add(new THREE.Mesh(pulsarBodyGeometry, pulsarBodyMaterial));

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
		pulsarBeam1.rotation.set(
			0,
			0,
			-Math.PI / 2 + pulsarParams.pulsarBeamLatitude,
		);
		pulsarBeam2.rotation.set(
			0,
			0,
			Math.PI / 2 - pulsarParams.pulsarBeamLatitude,
		);
		pulsarBody.add(pulsarBeam1);
		pulsarBody.add(pulsarBeam2);

		scene.add(pulsarBody);

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
		pulsarEquator.rotation.set(Math.PI / 2, 0, 0);
		scene.add(pulsarEquator);

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
			pulsarBody.rotation.y += pulsarParams.pulsarRotationRate;
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
		if (pulsarRotationRate !== undefined) {
			pulsarParamsRef.current.pulsarRotationRate = pulsarRotationRate;
		}
	}, [pulsarRotationRate]);

	useEffect(() => {
		if (isAnimating) {
			controlsAnimationRef.current?.startAnimation();
			console.log("Start animation");
		} else {
			controlsAnimationRef.current?.pauseAnimation();
			console.log("Stop animation");
		}
	}, [isAnimating]);

	return <div id="pulsar-model" ref={mountRef} />;
}
