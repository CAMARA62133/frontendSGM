import type { FC } from "react";
import {
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CornerUpLeft,
  CornerUpRight,
  Maximize2,
} from "lucide-react";

/**
 * 🔹 Props du composant Toolbar
 */
interface ToolbarProps {
  /** Fonction pour exécuter une commande (bold, italic, link, etc.) */
  executeCommand: (command: string, value?: string) => void;
  /** Désactive tous les boutons si true */
  disabled?: boolean;
}

/**
 * 🔹 Configuration des boutons de la toolbar
 * type:
 * - "divider" => séparation visuelle
 * - "select" => dropdown
 * - "list-dropdown" / "align-dropdown" => menus déroulants spécifiques
 * - "color" / "bgcolor" => couleur texte / fond
 */
const toolbarButtons = [
  // Undo / Redo
  {
    command: "undo",
    icon: <CornerUpLeft className="w-4 h-4" />,
    title: "Annuler (Ctrl+Z)",
  },
  {
    command: "redo",
    icon: <CornerUpRight className="w-4 h-4" />,
    title: "Rétablir (Ctrl+Y)",
  },
  { type: "divider" },

  // Mise en forme de base
  { command: "bold", label: "B", title: "Gras", className: "font-extrabold" },
  { command: "italic", label: "I", title: "Italique", className: "italic" },
  {
    command: "underline",
    label: "U",
    title: "Souligner",
    className: "underline",
  },
  {
    command: "strikeThrough",
    label: "S",
    title: "Barré",
    className: "line-through",
  },
  { type: "divider" },

  // Lien et image
  {
    command: "createLink",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.886l2.348 2.348"
        />
      </svg>
    ),
    title: "Insérer un lien",
    args: "prompt",
  },
  {
    command: "insertImage",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Insérer une image",
    args: "prompt",
  },
  { type: "divider" },

  // Listes
  {
    type: "list-dropdown",
    command: "insertUnorderedList",
    icon: <List className="w-4 h-4" />,
    title: "Liste à puces",
  },
  {
    type: "list-dropdown",
    command: "insertOrderedList",
    icon: <ListOrdered className="w-4 h-4" />,
    title: "Liste numérotée",
  },
  { type: "divider" },

  // Alignement
  {
    type: "align-dropdown",
    commands: ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull"],
    icons: [
      <AlignLeft className="w-4 h-4" />,
      <AlignCenter className="w-4 h-4" />,
      <AlignRight className="w-4 h-4" />,
      <AlignJustify className="w-4 h-4" />,
    ],
    titles: [
      "Aligner à gauche",
      "Aligner au centre",
      "Aligner à droite",
      "Justifier",
    ],
  },
  { type: "divider" },

  // Sélecteurs de format et taille
  {
    type: "select",
    command: "formatBlock",
    options: [
      "Paragraphe",
      "Titre 1 (H1)",
      "Titre 2 (H2)",
      "Citation (BLOCKQUOTE)",
    ],
  },
  {
    type: "select",
    command: "fontSize",
    options: ["Petit (1)", "Normal (3)", "Grand (5)", "Très grand (7)"],
  },
  { type: "divider" },

  // Couleurs
  {
    command: "foreColor",
    label: "A",
    title: "Couleur du texte",
    type: "color",
  },
  {
    command: "hiliteColor",
    label: "A",
    title: "Couleur de fond",
    type: "bgcolor",
  },
  { type: "divider" },

  // Plein écran
  {
    command: "fullscreen",
    icon: <Maximize2 className="w-4 h-4" />,
    title: "Plein écran",
  },
];

/**
 * 🔹 Composant Toolbar
 */
const Toolbar: FC<ToolbarProps> = ({ executeCommand, disabled }) => {
  /**
   * Gérer l'exécution d'une commande
   * @param command Commande à exécuter
   * @param args Argument supplémentaire (ex: prompt)
   */
  const handleAction = (command: string, args?: string) => {
    if (disabled) return;

    if (args === "prompt") {
      // Demande à l'utilisateur une valeur (URL ou image)
      const value = prompt(
        command === "createLink"
          ? "Entrez l'URL pour le lien :"
          : "Entrez l'URL de l'image :"
      );
      if (value) executeCommand(command, value);
    } else {
      executeCommand(command, args);
    }
  };

  /**
   * Traduire l'option sélectionnée en valeur utilisable pour execCommand
   */
  const getCommandValue = (command: string, option: string): string => {
    if (command === "formatBlock") {
      if (option.includes("Paragraphe")) return "p";
      if (option.includes("Titre 1")) return "h1";
      if (option.includes("Titre 2")) return "h2";
      if (option.includes("Citation")) return "blockquote";
    }
    if (command === "fontSize") {
      const match = option.match(/\((\d+)\)/);
      return match ? match[1] : "3";
    }
    return option;
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2.5 bg-gray-50 border-b border-gray-200">
      {toolbarButtons.map((btn, index) => {
        // --------------- Divider ----------------
        if (btn.type === "divider")
          return <div key={index} className="w-px h-6 bg-gray-300 mx-1.5" />;

        // --------------- Select (Dropdown) ----------------
        if (btn.type === "select") {
          return (
            <select
              key={index}
              className="px-2.5 py-1.5 h-9 border border-gray-300 text-gray-700 text-sm rounded-lg bg-white hover:border-blue-500 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              onChange={(e) =>
                executeCommand(
                  btn.command!,
                  getCommandValue(btn.command!, e.target.value)
                )
              }
              defaultValue=""
              disabled={disabled}
            >
              <option value="" disabled>
                {btn.command === "formatBlock" ? "Format" : "Taille"}
              </option>
              {btn.options!.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }

        // --------------- Dropdown List / Align ----------------
        if (btn.type === "list-dropdown" || btn.type === "align-dropdown") {
          return (
            <div key={index} className="relative group">
              <button
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 hover:shadow-sm rounded-lg transition-all duration-200 active:scale-95"
                title={btn.title || "Alignement"}
                onClick={() => handleAction(btn.command!)}
                disabled={disabled}
              >
                {btn.icon || btn.icons?.[0]}
                {btn.type === "align-dropdown" && (
                  <svg
                    className="w-3 h-3 ml-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {btn.type === "align-dropdown" && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {btn.commands!.map((cmd, i) => (
                    <button
                      key={cmd}
                      className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      onClick={() => handleAction(cmd)}
                      title={btn.titles![i]}
                      disabled={disabled}
                    >
                      {btn.icons![i]}
                      <span className="text-sm whitespace-nowrap">
                        {btn.titles![i]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // --------------- Color / Background ----------------
        if (btn.type === "color" || btn.type === "bgcolor") {
          return (
            <label
              key={index}
              className="relative w-9 h-9 flex items-center justify-center cursor-pointer rounded-lg hover:bg-gray-200 hover:shadow-sm transition-all duration-200 group"
              title={btn.title}
            >
              <span
                className={`text-base font-bold text-gray-700 ${
                  btn.className || ""
                } ${
                  btn.type === "bgcolor" ? "bg-yellow-200 px-1 rounded" : ""
                }`}
              >
                {btn.label}
              </span>
              <input
                type="color"
                className="absolute opacity-0 w-full h-full cursor-pointer"
                onChange={(e) => executeCommand(btn.command!, e.target.value)}
                disabled={disabled}
              />
              <div className="absolute bottom-1.5 w-4 h-0.5 bg-blue-500 group-hover:bg-blue-600 transition-colors" />
            </label>
          );
        }

        // --------------- Boutons classiques ----------------
        return (
          <button
            key={index}
            className={`w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 hover:shadow-sm rounded-lg transition-all duration-200 active:scale-95 ${
              btn.className || ""
            }`}
            title={btn.title}
            onClick={() => handleAction(btn.command!, btn.args)}
            disabled={disabled}
          >
            {btn.icon || (
              <span className="text-sm font-semibold">{btn.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Toolbar;
