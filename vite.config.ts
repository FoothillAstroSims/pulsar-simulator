import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => {
	const repo = "pulsar-simulator";
	const branch = process.env.VITE_BRANCH_NAME || "";
	const base =
		branch && branch !== "main" ? `/${repo}/branch/${branch}/` : `/${repo}/`;

	return {
		base: base,
		plugins: [react()],
	};
});
