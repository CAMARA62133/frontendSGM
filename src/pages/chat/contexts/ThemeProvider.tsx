import React, { useState, useEffect } from "react";
import { ThemeContext, defaultTheme } from "./ThemeContext";
import type { Theme } from "../types/theme.type";


export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themes, setThemes] = useState<Record<string, Theme>>(() => {
    try {
      const saved = localStorage.getItem("chat-themes");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Erreur chargement des thèmes:", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chat-themes", JSON.stringify(themes));
    } catch (error) {
      console.error("Erreur sauvegarde des thèmes:", error);
    }
  }, [themes]);

  const setTheme = (conversationId: string, theme: Partial<Theme>) => {
    setThemes((prev) => ({
      ...prev,
      [conversationId]: { ...defaultTheme, ...prev[conversationId], ...theme },
    }));
  };

  const getTheme = (conversationId: string | null): Theme => {
    if (!conversationId) return defaultTheme;
    return themes[conversationId] || defaultTheme;
  };

  return (
    <ThemeContext.Provider value={{ themes, setTheme, getTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
