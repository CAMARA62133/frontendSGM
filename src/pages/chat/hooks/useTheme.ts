import { useState, useEffect } from "react";
import type { Theme } from "../types/theme.type";

const defaultTheme: Theme = {
  primary: "#0891b2",
  secondary: "#ec4899",
  background: "#f9fafb",
  messageBg: "#ffffff",
};

export const useTheme = (conversationId: string | null) => {
  const [themes, setThemes] = useState<Record<string, Theme>>(() => {
    const saved = localStorage.getItem("chat-themes");
    return saved ? JSON.parse(saved) : {};
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    if (conversationId && themes[conversationId]) {
      setCurrentTheme(themes[conversationId]);
    } else {
      setCurrentTheme(defaultTheme);
    }
  }, [conversationId, themes]);

  const saveTheme = (conversationId: string, theme: Partial<Theme>) => {
    const newTheme = { ...currentTheme, ...theme };
    const newThemes = { ...themes, [conversationId]: newTheme };
    setThemes(newThemes);
    localStorage.setItem("chat-themes", JSON.stringify(newThemes));
    setCurrentTheme(newTheme);
  };

  return { currentTheme, saveTheme, themes };
};
