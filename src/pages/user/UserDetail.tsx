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
// ==========================
const UserDetail: React.FC<Props> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  // --------------------------
  // Fonctions utilitaires
  // --------------------------

  const getStatusClass = (isActif?: boolean) =>
    isActif
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-red-100 text-red-800 border border-red-200";

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

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white shadow-inner">
              {user.photo ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${user.photo}`}
                  alt={`${user.prenom} ${user.nom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-cyan-500 font-bold text-xl uppercase">
                  {user.prenom[0]}
                  {user.nom[0]}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wide">
                {user.prenom} {user.nom}
              </h3>
              <p className="text-cyan-50 opacity-90 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* ---------- Contenu ---------- */}
        <div className="p-6 space-y-6">
          {/* Statut et type */}
          <div className="flex gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(user.isActif)}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${user.isActif ? "bg-green-500" : "bg-red-500"}`}
              />
              {user.isActif ? "Actif" : "Inactif"}
            </span>

            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getTypeClass(user.type)}`}
            >
              {getTypeIcon(user.type)}
              {translateType(user.type)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <SectionTitle title="Informations personnelles" color="cyan" />
              <InfoItem
                icon={<Mail size={18} className="text-cyan-500" />}
                label="Email professionnel"
                value={user.email}
              />
              <InfoItem
                icon={<Phone size={18} className="text-cyan-500" />}
                label="Téléphone"
                value={user.telephone || "Non renseigné"}
              />
              <InfoItem
                icon={<MapPin size={18} className="text-cyan-500" />}
                label="Adresse"
                value={user.adresse || "Non renseignée"}
              />
            </div>

            {/* Localisation & Entreprise */}
            <div className="space-y-4">
              <SectionTitle title="Localisation & Structure" color="pink" />
              <InfoItem
                icon={<Building size={18} className="text-pink-500" />}
                label="Entreprise / Établissement"
                value={user.entreprise}
              />
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
            </div>
          </div>

          {/* Historique */}
          {(user.createdAt || user.updatedAt) && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                Historique du compte
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.createdAt && (
                  <InfoItem
                    icon={<Calendar size={16} className="text-gray-400" />}
                    label="Membre depuis le"
                    value={formatDate(user.createdAt)}
                  />
                )}
                {user.updatedAt && (
                  <InfoItem
                    icon={<Calendar size={16} className="text-gray-400" />}
                    label="Dernière mise à jour"
                    value={formatDate(user.updatedAt)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---------- Footer ---------- */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all duration-200 font-bold shadow-sm"
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
// Sous-composants
// ==========================
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="mt-1">{icon}</div>
    <div className="min-w-0 flex-1">
      <div className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
        {label}
      </div>
      <div className="text-gray-800 text-sm font-medium break-words">
        {value}
      </div>
    </div>
  </div>
);

interface SectionTitleProps {
  title: string;
  color: "cyan" | "pink";
}
const SectionTitle: React.FC<SectionTitleProps> = ({ title, color }) => {
  const colorClass =
    color === "cyan"
      ? "text-cyan-600 border-cyan-100"
      : "text-pink-600 border-pink-100";
  return (
    <h4
      className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${colorClass}`}
    >
      {title}
    </h4>
  );
};

export default UserDetail;
