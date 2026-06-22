import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					environment: "node",
					include: ["tests/*.test.ts"],
					exclude: ["tests/*.test.tsx", "**/node_modules/**"],
				},
			},
			{
				extends: true,
				test: {
					name: "browser",
					include: ["tests/*.test.tsx"],
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [
							{ browser: "chromium" },
							// { browser: "firefox" }
						],
					},
				},
			},
		],
	},
});
