export interface DNDSettingsData {
  enabled: boolean; // Active / désactive le mode DND
  schedule?: string | null; // Exemple: "22-08", null si pas de planning
  keywords?: string[]; // Liste de mots clés pour déclencher le DND
  autoReply?: string | null; // Message automatique
}

export interface DNDSettingsResponse extends DNDSettingsData {
  id: number; 
  userId: number; 
  conversationId?: string | null; 
  createdAt: string; 
  updatedAt: string; // Timestamp modification
}
