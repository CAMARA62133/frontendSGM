import type { User } from "./User";

export interface Group {
  id: number;
  name: string;
  isPrivate: boolean;
  creatorId: number;
  createdAt?: string;
  updatedAt?: string;

  // 🟢 AJOUTE CETTE PROPRIÉTÉ :
  // On utilise "Users" avec une majuscule car c'est la convention
  // par défaut de Sequelize que tu sembles utiliser.
  Users?: User[];
}
