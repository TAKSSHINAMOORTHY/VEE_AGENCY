import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App.tsx";
import "./index.css";

const globalCapacitor = (globalThis as typeof globalThis & { Capacitor?: { triggerEvent?: () => boolean } }).Capacitor
	?? ((globalThis as typeof globalThis & { Capacitor?: { triggerEvent?: () => boolean } }).Capacitor = {});

if (typeof globalCapacitor.triggerEvent !== "function") {
	globalCapacitor.triggerEvent = () => false;
}

window.addEventListener("error", (event) => {
	const message = event.error instanceof Error ? event.error.stack ?? event.error.message : event.message;
	console.error("GlobalError", message);
});

window.addEventListener("unhandledrejection", (event) => {
	const reason = event.reason instanceof Error ? event.reason.stack ?? event.reason.message : event.reason;
	console.error("UnhandledRejection", reason);
});

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

void (async () => {
	if (!Capacitor.isNativePlatform()) return;
	document.documentElement.style.setProperty("--status-bar-offset", "24px");
})();
