import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="shell"><h1>PRIME</h1><p>Telegram Enterprise Commerce</p><p className="muted">Greenfield storefront foundation.</p></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
