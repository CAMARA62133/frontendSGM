import { communicationService } from "./communicationService";

// Types pour les retours des commandes
export interface GifCommand {
  type: "gif";
  search: string;
}

export interface PollCommand {
  type: "poll";
  question: string;
  options: string[];
}

export interface TodoCommand {
  type: "todo";
  task: string;
  assignee?: string;
}

export interface ReminderCommand {
  type: "reminder";
  message: string;
  delay: number;
}

export interface WeatherCommand {
  type: "weather";
  city: string;
}

export interface HelpCommand {
  type: "help";
  commands: string[];
}

export interface AICommand {
  type: "ai";
  answer: string;
}

export type CommandResult =
  | GifCommand
  | PollCommand
  | TodoCommand
  | ReminderCommand
  | WeatherCommand
  | HelpCommand
  | AICommand
  | null;

// Type pour les multiplicateurs de temps
type TimeUnit = "m" | "h" | "d";

const timeMultipliers: Record<TimeUnit, number> = {
  m: 60,
  h: 3600,
  d: 86400,
};

export const commandService = {
  async parseCommand(input: string): Promise<CommandResult> {
    const parts = input.slice(1).split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (command) {
      case "gif":
        return { type: "gif", search: args };

      case "poll": {
        const [question, ...options] = args.split("|");
        return {
          type: "poll",
          question: question?.trim() || "",
          options: options.map((opt) => opt.trim()).filter((opt) => opt !== ""),
        };
      }

      case "todo": {
        const [task, assignee] = args.split("@");
        return {
          type: "todo",
          task: task?.trim() || "",
          assignee: assignee?.trim(),
        };
      }

      case "remind": {
        const match = args.match(/me in (\d+)([mhd])/);
        if (match) {
          // SOLUTION 1: Utiliser un underscore pour indiquer que la valeur n'est pas utilisée
          const [, value, unit] = match;
          const seconds = parseInt(value) * timeMultipliers[unit as TimeUnit];
          return {
            type: "reminder",
            message: args.replace(/me in \d+[mhd]/, "").trim(),
            delay: seconds * 1000,
          };
        }
        return null;
      }

      case "weather":
        return { type: "weather", city: args };

      case "help":
        return {
          type: "help",
          commands: [
            "/gif [search] - Envoyer un GIF",
            "/poll [question] | [option1] | [option2] - Créer un sondage",
            "/todo [tâche] @[user] - Assigner une tâche",
            "/remind me in [temps] - Créer un rappel",
            "/weather [ville] - Météo",
            "/ask [question] - Poser une question à l'IA",
          ],
        };

      case "ask": {
        const answer = await communicationService.askAI({ question: args });
        return { type: "ai", answer: answer.answer };
      }

      default:
        return null;
    }
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("word") || mimetype.includes("document")) return "📝";
    if (mimetype.includes("excel") || mimetype.includes("sheet")) return "📊";
    if (mimetype.includes("zip") || mimetype.includes("compressed"))
      return "🗜️";
    return "📎";
  },
};
