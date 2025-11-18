import React from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  User,
  Shield,
  Crown,
} from "lucide-react";
import type { User as UserType } from "../../models/User";

// ==========================
// Props du composant
// ==========================
interface Props {
  isOpen: boolean; // Contrôle si le modal est affiché
  onClose: () => void; // Fonction pour fermer le modal
  user: UserType | null; // Utilisateur à afficher
}

// ==========================
// Composant principal : UserDetail
// Affiche les détails d'un utilisateur dans un modal
// ==========================
const UserDetail: React.FC<Props> = ({ isOpen, onClose, user }) => {
  // Si le modal est fermé ou aucun utilisateur sélectionné, ne rien afficher
  if (!isOpen || !user) return null;

  // --------------------------
  // Fonctions utilitaires
  // --------------------------

  // Retourne la classe CSS selon l'état actif ou inactif
  const getStatusClass = (isActif?: boolean) =>
    isActif
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-red-100 text-red-800 border border-red-200";

  // Retourne la classe CSS selon le type d'utilisateur
  const getTypeClass = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-pink-100 text-pink-800 border border-pink-200";
      case "directeur":
        return "bg-cyan-100 text-cyan-800 border border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Retourne l'icône correspondant au type d'utilisateur
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <Shield size={16} className="text-pink-600" />;
      case "directeur":
        return <Crown size={16} className="text-cyan-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  // Traduction lisible du type d'utilisateur
  const translateType = (type: string) => {
    switch (type) {
      case "admin":
        return "Administrateur";
      case "directeur":
        return "Directeur";
      case "user":
        return "Utilisateur";
      default:
        return type;
    }
  };

  // Formatage des dates en français
  // formatDate.ts
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --------------------------
  // Rendu du composant
  // --------------------------
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Modal principal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* ---------- Header ---------- */}
        <div className="bg-cyan-500 rounded-t-2xl px-6 py-5 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Détails de l'utilisateur</h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Avatar + Nom + Email */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-cyan-500 font-bold text-xl border-2 border-white">
              {user.prenom[0]}
              {user.nom[0]}
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user.prenom} {user.nom}
              </h3>
              <p className="text-cyan-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* ---------- Contenu ---------- */}
        <div className="p-6 space-y-6">
          {/* Statut et type */}
          <div className="flex gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
                user.isActif
              )}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  user.isActif ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {user.isActif ? "Actif" : "Inactif"}
            </span>

            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getTypeClass(
                user.type
              )}`}
            >
              {getTypeIcon(user.type)}
              {translateType(user.type)}
            </span>
          </div>

          {/* Informations personnelles et localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <SectionTitle title="Informations personnelles" color="cyan" />

              <InfoItem
                icon={<Mail size={18} className="text-cyan-500" />}
                label="Email"
                value={user.email}
              />
              {user.telephone && (
                <InfoItem
                  icon={<Phone size={18} className="text-cyan-500" />}
                  label="Téléphone"
                  value={user.telephone}
                />
              )}
              {user.adresse && (
                <InfoItem
                  icon={<MapPin size={18} className="text-cyan-500" />}
                  label="Adresse"
                  value={user.adresse}
                />
              )}
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <SectionTitle title="Localisation" color="pink" />

              <InfoItem
                icon={<MapPin size={18} className="text-pink-500" />}
                label="Région"
                value={user.region}
              />
              <InfoItem
                icon={<MapPin size={18} className="text-pink-500" />}
                label="Pays"
                value={user.pays}
              />
              <InfoItem
                icon={<Building size={18} className="text-pink-500" />}
                label="Établissement"
                value={user.etablissement}
              />
            </div>
          </div>

          {/* Historique des dates */}
          {(user.createdAt || user.updatedAt) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Historique</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.createdAt && (
                  <InfoItem
                    icon={<Calendar size={16} className="text-gray-500" />}
                    label="Date de création"
                    value={formatDate(user.createdAt)}
                  />
                )}
                {user.updatedAt && (
                  <InfoItem
                    icon={<Calendar size={16} className="text-gray-500" />}
                    label="Dernière modification"
                    value={formatDate(user.updatedAt)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---------- Footer ---------- */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================
// Composant réutilisable : InfoItem
// Affiche une ligne d'information avec icône, label et valeur
// ==========================
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
    {icon}
    <div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  </div>
);

// ==========================
// Composant réutilisable : SectionTitle
// Titre de section avec couleur dynamique
// ==========================
interface SectionTitleProps {
  title: string;
  color: "cyan" | "pink";
}
const SectionTitle: React.FC<SectionTitleProps> = ({ title, color }) => (
  <h4 className={`font-semibold border-b border-${color}-200 pb-2 text-${color}-700`}>
    {title}
  </h4>
);

export default UserDetail;
