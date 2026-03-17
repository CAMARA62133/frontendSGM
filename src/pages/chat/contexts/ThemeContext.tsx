import { createContext } from "react";
import type { Theme } from "../types/theme.type";



export interface ThemeContextType {
  themes: Record<string, Theme>;
  setTheme: (conversationId: string, theme: Partial<Theme>) => void;
  getTheme: (conversationId: string | null) => Theme;
}

export const defaultTheme: Theme = {
  primary: "#0891b2",
  secondary: "#ec4899",
  background: "#f9fafb",
  messageBg: "#ffffff",
};

export const ThemeContext = createContext<ThemeContextType>({
  themes: {},
  setTheme: () => {},
  getTheme: () => defaultTheme,
});
