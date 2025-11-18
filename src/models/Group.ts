export interface Group {
  id: number; // identifiant unique du groupe
  name: string; // nom du groupe
  isPrivate: boolean; // true si le groupe est privé
  creatorId: number; // id de l'utilisateur qui a créé le groupe
  createdAt?: string; // date de création
  updatedAt?: string; // date de mise à jour
}
