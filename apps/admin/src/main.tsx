import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="shell"><h1>PRIME ADMIN</h1><p>Administration and POS foundation.</p><p className="muted">Greenfield operator surface.</p></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
