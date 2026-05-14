import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import PulsarView from "./components/PulsarView.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<PulsarView />
	</StrictMode>,
);
