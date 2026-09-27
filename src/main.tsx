import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installNativeBehaviour } from "./lib/native";
import { registerAppSW } from "./lib/registerSW";

installNativeBehaviour();

createRoot(document.getElementById("root")!).render(<App />);

registerAppSW();
