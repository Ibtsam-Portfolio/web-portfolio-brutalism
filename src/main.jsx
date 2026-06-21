import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Roast from "./Roast";
import RoastBrutalist from "./RoastBrutalist";
import "../tokens.css";
import "../fonts.css";
import "../styles.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/roast" element={<Roast />} />
        <Route path="/roast-brutalist" element={<RoastBrutalist />} />
        <Route path="/" element={<App />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
