import React from "react";
import { createRoot } from "react-dom/client";
import PDP from "./PDP";

const rootElement = document.getElementById("pdp-root");
if (rootElement) {
  createRoot(rootElement).render(<PDP />);
}
