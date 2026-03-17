import React from "react";

// Interface pour les commandes
interface Command {
  name: string;
  description: string;
  args: string;
}

const COMMANDS: Command[] = [
  { name: "/gif", description: "Envoyer un GIF", args: "<recherche>" },
  {
    name: "/poll",
    description: "Créer un sondage",
    args: "<question> | <option1> | <option2>",
  },
  {
    name: "/todo",
    description: "Assigner une tâche",
    args: "<tâche> @utilisateur",
  },
  { name: "/remind", description: "Rappel", args: "me in <temps>" },
  { name: "/weather", description: "Météo", args: "<ville>" },
  { name: "/ask", description: "Question à l'IA", args: "<question>" },
  { name: "/help", description: "Aide", args: "" },
];

interface CommandSuggestionsProps {
  input: string;
  onSelect: (command: string) => void;
}

const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({
  input,
  onSelect,
}) => {
  // Ne rien afficher si ce n'est pas une commande
  if (!input.startsWith("/")) return null;

  // Filtrer les commandes en fonction de l'input
  const filtered = COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(input.toLowerCase()),
  );

  // Ne rien afficher si aucune commande ne correspond
  if (filtered.length === 0) return null;

  // Gestionnaire de clic avec typage explicite
  const handleCommandClick = (cmd: Command) => () => {
    onSelect(cmd.name + " ");
  };

  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border rounded-lg shadow-lg overflow-hidden z-50">
      {filtered.map((cmd) => (
        <div
          key={cmd.name}
          onClick={handleCommandClick(cmd)}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCommandClick(cmd)();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-600 text-sm font-medium">
              {cmd.name}
            </span>
            {cmd.args && (
              <span className="text-xs text-gray-400 font-mono">
                {cmd.args}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{cmd.description}</span>
        </div>
      ))}
    </div>
  );
};

export default CommandSuggestions;
