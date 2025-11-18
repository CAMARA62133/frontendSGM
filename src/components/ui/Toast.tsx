import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

/**
 * 🔹 Props du composant Toast
 */
interface ToastProps {
  /** Message à afficher */
  message: string;
  /** Type de notification */
  type?: "success" | "error" | "warning" | "info";
  /** Durée en ms avant fermeture automatique */
  duration?: number;
  /** Position de la notification */
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
  /** Afficher ou non la barre de progression */
  showProgress?: boolean;
  /** Callback lorsqu'on ferme le toast */
  onClose: () => void;
}

/**
 * 🔹 Composant Toast
 * Affiche une notification avec animation, type et barre de progression
 */
export default function Toast({
  message,
  type = "success",
  duration = 4000,
  position = "top-center",
  showProgress = true,
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState(100); // pour la barre de progression
  const [isVisible, setIsVisible] = useState(false); // état pour animation apparition/disparition

  /**
   * 🔹 useEffect principal
   * - Affiche le toast
   * - Décrémente la barre de progression si activée
   * - Ferme automatiquement après "duration"
   */
  useEffect(() => {
    setIsVisible(true); // affiche le toast

    // Gestion du toast si durée > 0
    if (duration > 0) {
      if (showProgress) {
        // Intervalle pour réduire la barre de progression
        const interval = setInterval(() => {
          setProgress((prev) => Math.max(prev - 100 / (duration / 50), 0));
        }, 50);

        // Timeout pour fermer le toast
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // attendre l'animation avant de supprimer
        }, duration);

        return () => {
          clearInterval(interval);
          clearTimeout(timer);
        };
      } else {
        // Si pas de barre de progression
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [duration, showProgress, onClose]);

  /**
   * 🔹 Sélection de l'icône selon le type
   */
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  /**
   * 🔹 Styles selon le type de notification
   */
  const getTypeStyles = () =>
    ({
      success: "bg-emerald-500 border-emerald-400",
      error: "bg-red-500 border-red-400",
      warning: "bg-amber-500 border-amber-400",
      info: "bg-blue-500 border-blue-400",
    }[type]);

  /**
   * 🔹 Styles selon la position du toast
   */
  const getPositionStyles = () =>
    ({
      "top-center": "top-5 left-1/2 -translate-x-1/2",
      "top-right": "top-5 right-5",
      "bottom-center": "bottom-5 left-1/2 -translate-x-1/2",
      "bottom-right": "bottom-5 right-5",
    }[position]);

  /**
   * 🔹 Fonction pour fermer manuellement le toast
   */
  const handleClose = () => {
    setIsVisible(false); // déclenche animation de disparition
    setTimeout(onClose, 300); // supprime le toast après animation
  };

  return (
    <div
      className={`fixed z-50 flex items-center max-w-sm w-full mx-4 px-4 py-3 rounded-lg shadow-lg border text-white backdrop-blur-sm transition-all duration-300 ease-in-out transform
        ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : position?.includes("top")
            ? "-translate-y-2 opacity-0 scale-95"
            : "translate-y-2 opacity-0 scale-95"
        } 
        ${getTypeStyles()} ${getPositionStyles()}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Contenu du toast */}
      <div className="flex items-center space-x-3 flex-1">
        {/* Icône */}
        <span className="flex-shrink-0">{getIcon()}</span>
        {/* Message */}
        <span className="text-sm font-medium leading-relaxed">{message}</span>
      </div>

      {/* Bouton pour fermer */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barre de progression */}
      {showProgress && duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
