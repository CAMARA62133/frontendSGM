import { useEffect, useState, useRef, useCallback } from "react";
import { CheckCircle, AlertTriangle, X, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
  showProgress?: boolean;
  onClose: (isConfirm?: boolean) => void; // ✅ Typé pour accepter l'argument
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function Toast({
  message,
  type = "success",
  duration = 4000,
  position = "top-center",
  showProgress = true,
  onClose,
  onConfirm,
  confirmLabel = "Rester",
  cancelLabel = "Quitter",
}: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const actionTaken = useRef(false);

  // ✅ triggerClose accepte maintenant l'argument et le transmet à onClose
  const triggerClose = useCallback(
    (isConfirm: boolean = false) => {
      setIsVisible(false);
      setTimeout(() => onClose(isConfirm), 300);
    },
    [onClose],
  );

  useEffect(() => {
    setIsVisible(true);
    actionTaken.current = false;

    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(prev - 100 / (duration / 10), 0));
      }, 10);

      const timer = setTimeout(() => {
        if (!actionTaken.current) triggerClose(false);
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [duration, triggerClose]);

  const handleConfirm = () => {
    actionTaken.current = true;
    onConfirm?.();
    triggerClose(true); // ✅ Informe le parent que c'est une confirmation
  };

  const handleManualCancel = () => {
    actionTaken.current = true;
    triggerClose(false); // ✅ Informe le parent que c'est une annulation
  };

  // Couleurs plus douces (Pastel léger avec texte foncé pour le contraste)
  const bgStyles = {
    success: "bg-white border-emerald-200 text-emerald-900",
    error: "bg-white border-red-200 text-red-900",
    warning: "bg-white border-amber-200 text-amber-900",
    info: "bg-white border-blue-200 text-blue-900",
  };

  // Couleurs pour les icônes uniquement
  const iconColors = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  const positionStyles = {
    "top-center": "top-5 left-1/2 -translate-x-1/2",
    "top-right": "top-5 right-5",
    "bottom-center": "bottom-5 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-5 right-5",
  };

  return (
    <div
      className={`fixed z-[9999] flex flex-col max-w-sm w-full mx-4 rounded-xl shadow-lg border transition-all duration-300 ease-in-out transform
        ${isVisible ? "translate-y-0 opacity-100 scale-100" : (position.includes("top") ? "-translate-y-4" : "translate-y-4") + " opacity-0 scale-95"} 
        ${bgStyles[type]} 
        ${positionStyles[position]}`}
      role="alert"
    >
      <div className="flex items-center p-4 space-x-3">
        {/* Icône avec sa propre couleur */}
        <span className={`flex-shrink-0 ${iconColors[type]}`}>
          <Icon className="w-5 h-5" />
        </span>

        <div className="flex-1">
          <p className="text-sm font-medium leading-snug">{message}</p>

          {type === "warning" && (
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleConfirm}
                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
              >
                {confirmLabel}
              </button>
              <button
                onClick={handleManualCancel}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {cancelLabel}
              </button>
            </div>
          )}
        </div>

        {/* Bouton X plus discret */}
        <button
          onClick={handleManualCancel}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barre de progression ultra-fine et discrète */}
      {showProgress && duration > 0 && (
        <div className="h-1 w-full bg-gray-50 rounded-b-xl overflow-hidden">
          <div
            className={`h-full transition-all duration-[10ms] ease-linear ${iconColors[type].replace("text", "bg")}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
