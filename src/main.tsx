// =========================
// POINT D'ENTRÉE DE L'APPLICATION
// =========================

// Import de React StrictMode pour détecter les problèmes potentiels dans l'application
import { StrictMode } from "react";

// Import de createRoot pour créer la racine de rendu dans React 18+
import { createRoot } from "react-dom/client";

// Import du fichier CSS global
import "./index.css";

// Import du composant principal de l'application
import App from "./App.tsx";

// Récupération de l'élément HTML où l'application sera montée
const rootElement = document.getElementById("root");

// Création de la racine React et rendu de l'application
createRoot(rootElement!).render(
  <StrictMode>
    {/* App est le composant principal qui contient toutes les routes et le layout */}
    <App />
  </StrictMode>
); 
