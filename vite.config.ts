import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	base: "https://foothillastrosims.github.io/pulsar-simulator/",
	plugins: [react()],
});
