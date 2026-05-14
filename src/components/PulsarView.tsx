import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function PulsarView(props) {
	const mount = useRef(null);

	const controlsAnimation = useRef(null);
	const [isAnimating, setIsAnimating] = useState(true);

	useEffect(() => {
		const mountNode = mount.current;
		let width = mountNode.clientWidth;
		let height = mountNode.clientHeight;
		let frameID: number | null;

		// Scene
		const scene = new THREE.Scene();
		const light = new THREE.DirectionalLight(0xffffff, 1);
		const lightHelper = new THREE.DirectionalLightHelper(light);
		light.position.set(25, 0, 0);
		light.target.position.set(-10, 0, 0);
		scene.add(light);
		scene.add(light.target);
		scene.add(lightHelper);

		// Pulsar
		const pulsarBodyRadius = 15;
		const pulsarBodyWidthSeg = 32;
		const pulsarBodyHeightSeg = 16;

		const pulsarBodyGeometry = new THREE.SphereGeometry(
			pulsarBodyRadius,
			pulsarBodyWidthSeg,
			pulsarBodyHeightSeg,
		);
		const pulsarBodyMaterial = new THREE.MeshBasicMaterial({
			color: "#3f70bf",
		});
		const pulsarBody = new THREE.Mesh(pulsarBodyGeometry, pulsarBodyMaterial);
		scene.add(pulsarBody);

		// Camera
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.z = 50;

		// Renderer
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);

		const renderScene = () => renderer.render(scene, camera);

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
			pulsarBody.rotation.x += 0.01;
			pulsarBody.rotation.z += 0.01;
			renderScene();
			frameID = window.requestAnimationFrame(animate);
		};

		const startAnimation = () => {
			if (!frameID) {
				frameID = requestAnimationFrame(animate);
			}
		};

		const stopAnimation = () => {
			cancelAnimationFrame(frameID);
			frameID = null;
		};

		controlsAnimation.current = { startAnimation, stopAnimation };

		// Add the rendered canvas to the DOM and start animation
		mountNode.appendChild(renderer.domElement);
		window.addEventListener("resize", handleResize);
		startAnimation();

		// Cleanup
		return () => {
			stopAnimation();
			window.removeEventListener("resize", handleResize);
			mountNode.removeChild(renderer.domElement);

			scene.remove(pulsarBody);
			pulsarBodyGeometry.dispose();
			pulsarBodyMaterial.dispose();
		};
	}, []);

	const setAnimation = () => {
		if (!isAnimating) {
			controlsAnimation.current.startAnimation();
			setIsAnimating(true);
		} else {
			controlsAnimation.current.stopAnimation();
			setIsAnimating(false);
		}
	};

	return (
		<div
			ref={mount}
			style={{ width: "100%", height: "100vh" }}
			onClick={setAnimation}
		/>
	);
}
