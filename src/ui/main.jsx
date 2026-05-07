import React from "react";
import { createRoot } from "react-dom/client";
import QuestionnaireApp from "./QuestionnaireApp.jsx";
import "./questionnaire.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QuestionnaireApp />
  </React.StrictMode>
);
