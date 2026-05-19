import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ColorGUIHelper } from "./utils";

export default function PulsarView(props) {
	const mount = useRef(null);

	const controlsAnimation = useRef<Record<string, () => void>>(null);
	const [isAnimating, setIsAnimating] = useState(true);

	useEffect(() => {
		// DOM mount node
		const mountNode = mount.current;
		mountNode.focus();
		let width = mountNode.clientWidth;
		let height = mountNode.clientHeight;
		let frameID: number | null;

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
		const pulsarRotationRateDefault = 0.01;

		// Main body
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
		pulsarBeam1.rotation.set(0, 0, -Math.PI / 2);
		pulsarBeam2.rotation.set(0, 0, Math.PI / 2);
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
		controlsOrbital.addEventListener("change", renderScene);
		controlsOrbital.update();

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
		const guiParams = {
			pulsarRotationRate: pulsarRotationRateDefault,
		};

		const animate = () => {
			pulsarBody.rotation.y += guiParams.pulsarRotationRate;
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
			frameID = null;
			controlsOrbital.update();
		};

		controlsAnimation.current = { startAnimation, pauseAnimation };

		// GUI to change parameters
		const gui = new GUI();
		gui
			.addColor(new ColorGUIHelper(lightDirectional, "color"), "value")
			.name("color");
		const guiPulsarRotation = gui
			.add(pulsarBody.rotation, "y", 0, 2 * Math.PI)
			.name("Pulsar rotation")
			.listen();
		guiPulsarRotation.onChange((value) => {
			if (value >= 2 * Math.PI) {
				pulsarBody.rotation.y = 0;
				guiPulsarRotation.updateDisplay();
			}
		});
		gui
			.add(guiParams, "pulsarRotationRate", 0, 0.02, 0.0001)
			.name("Pulsar rotation rate");
		gui.onChange(renderScene);

		// Add the rendered canvas to the DOM and start animation
		mountNode.appendChild(renderer.domElement);
		window.addEventListener("resize", handleResize);
		startAnimation();
		console.log("Animation loaded");

		// Cleanup
		return () => {
			pauseAnimation();
			controlsOrbital.removeEventListener("change", renderScene);
			window.removeEventListener("resize", handleResize);
			mountNode.removeChild(renderer.domElement);

			scene.remove(pulsarBody);
			pulsarBodyGeometry.dispose();
			pulsarBodyMaterial.dispose();
		};
	}, []);

	const toggleAnimationListener = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code === "Space") {
			if (!isAnimating) {
				controlsAnimation.current?.startAnimation();
				setIsAnimating(true);
				console.log("Start animation");
			} else {
				controlsAnimation.current?.pauseAnimation();
				setIsAnimating(false);
				console.log("Stop animation");
			}
		}
	};

	return (
		<div
			tabIndex={0}
			ref={mount}
			style={{ width: "100%", height: "100vh", cursor: "move" }}
			onKeyDown={toggleAnimationListener}
		/>
	);
}
