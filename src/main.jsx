import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ConnectionCheck from "./components/ConnectionCheck.jsx";

const checkingConnection =
  new URLSearchParams(window.location.search).get("connection-check") === "1";
createRoot(document.getElementById("root")).render(
  checkingConnection ? <ConnectionCheck /> : <App />,
);
