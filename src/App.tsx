// Importation des routes principales de l'application
import AppRoutes from "./Routes/Index";

/**
 * Composant principal de l'application
 *
 * Ce composant sert de point d'entrée pour l'application React.
 * Il inclut toutes les routes définies dans AppRoutes.
 */
function App() {
  return (
    <>
      {/* Routes principales de l'application */}
      <AppRoutes />
    </>
  );
}

// Exportation du composant pour pouvoir l'utiliser dans index.tsx
export default App;
