import React from "react";
import { createRoot } from "react-dom/client";
import HostApp from "./HostApp.jsx";
import PlayApp from "./PlayApp.jsx";

const racine = createRoot(document.getElementById("root"));
const chemin = window.location.pathname.replace(/\/+$/, "");
racine.render(chemin.startsWith("/play") ? React.createElement(PlayApp) : React.createElement(HostApp));
