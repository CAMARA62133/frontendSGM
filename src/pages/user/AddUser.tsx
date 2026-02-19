"use client";

import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, X } from "lucide-react";
import Toast from "../../components/ui/Toast";
import { register, importUsers, updateUser } from "../../services/userService";
import type { AxiosError } from "axios";
import type { User } from "../../models/User";

// ======================================
// Props du composant
// ======================================
interface Props {
  isOpen: boolean; // Indique si le modal est ouvert
  onClose: () => void; // Fonction pour fermer le modal
  userToEdit?: User; // Utilisateur à modifier (optionnel)
}

// ======================================
// Composant principal
// ======================================
const AddOrEditUser: React.FC<Props> = ({ isOpen, onClose, userToEdit }) => {
  // ----------------------------------
  // États du formulaire
  // ----------------------------------
  const [mode, setMode] = useState<"manual" | "import">("manual"); // Mode manuel ou import
  const [utilisateur, setUtilisateur] = useState<Partial<User>>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    pays: "",
    region: "",
    etablissement: "",
    type: "user",
  });
  const [file, setFile] = useState<File | null>(null); // Pour l'importation (CSV/Excel)
  const [photo, setPhoto] = useState<File | null>(null); // Pour la photo de profil

  // ----------------------------------
  // États d'interface
  // ----------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false); 

  // ----------------------------------
  // Effet : pré-remplir le formulaire si édition
  // ----------------------------------
  useEffect(() => {
    if (userToEdit) {
      setUtilisateur({
        nom: userToEdit.nom,
        prenom: userToEdit.prenom,
        email: userToEdit.email,
        telephone: userToEdit.telephone,
        adresse: userToEdit.adresse,
        pays: userToEdit.pays,
        region: userToEdit.region,
        etablissement: userToEdit.etablissement,
        type: userToEdit.type,
      });
      setMode("manual");
    }
  }, [userToEdit]);

  // ----------------------------------
  // Handler : mise à jour des champs du formulaire
  // ----------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUtilisateur((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------------------------
  // Handler : sélection d'un fichier pour import
  // ----------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // ----------------------------------
  // Handler : soumission du formulaire
  // ----------------------------------
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setToast(null);
  setLoading(true);

  try {
    if (mode === "manual") {
      const formData = new FormData();

      // On ajoute les données texte
      Object.entries(utilisateur).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // ICI : On utilise l'état "photo" pour l'image
      if (photo) {
        formData.append("photo", photo);
      }

      if (userToEdit) {
        await updateUser(userToEdit.id!, formData);
        setToast({ message: "Mis à jour avec succès !", type: "success" });
      } else {
        await register(formData);
        setToast({ message: "Ajouté avec succès !", type: "success" });
        setPhoto(null); // On vide la photo après succès
      }
    } else if (mode === "import") {
      if (!file) {
        setToast({
          message: "Sélectionnez un fichier Excel/CSV",
          type: "error",
        });
        setLoading(false);
        return;
      }
      // ICI : On utilise "file" pour l'importation
      const res = await importUsers(file);
      setToast({
        message: res.data.message || "Import réussi",
        type: "success",
      });
      setFile(null);
    }

    setTimeout(() => onClose(), 1000);
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    setToast({
      message: error.response?.data?.message || "Erreur",
      type: "error",
    });
  } finally {
    setLoading(false);
  }
};

  // ----------------------------------
  // Si le modal est fermé, ne rien afficher
  // ----------------------------------
  if (!isOpen) return null;

  // ======================================
  // Rendu du modal
  // ======================================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header du modal */}
        <div className="bg-cyan-500 rounded-t-2xl px-6 py-5 text-white relative flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {userToEdit ? "Modifier utilisateur" : "Ajouter un utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Sélecteur de mode */}
        <div className="flex justify-center gap-4 p-4 border-b border-gray-200">
          <button
            onClick={() => setMode("manual")}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              mode === "manual"
                ? "bg-cyan-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Ajouter/Modifier manuellement
          </button>
          {!userToEdit && (
            <button
              onClick={() => setMode("import")}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                mode === "import"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Importer fichier
            </button>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {mode === "manual" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Champs du formulaire manuel */}
              <input
                name="nom"
                value={utilisateur.nom || ""}
                onChange={handleChange}
                placeholder="Nom"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                required
              />
              <input
                name="prenom"
                value={utilisateur.prenom || ""}
                onChange={handleChange}
                placeholder="Prénom"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                required
              />
              <input
                name="email"
                value={utilisateur.email || ""}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
              />
              <input
                name="telephone"
                value={utilisateur.telephone || ""}
                onChange={handleChange}
                placeholder="Téléphone"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
              />
              <input
                name="adresse"
                value={utilisateur.adresse || ""}
                onChange={handleChange}
                placeholder="Adresse"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
              />
              <input
                name="pays"
                value={utilisateur.pays || ""}
                onChange={handleChange}
                placeholder="Pays"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                required
              />
              <input
                name="region"
                value={utilisateur.region || ""}
                onChange={handleChange}
                placeholder="Région"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                required
              />
              <input
                name="etablissement"
                value={utilisateur.etablissement || ""}
                onChange={handleChange}
                placeholder="Établissement"
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                required
              />
              <select
                name="type"
                value={utilisateur.type || "user"}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
              >
                <option value="admin">Administrateur</option>
                <option value="directeur">Directeur</option>
                <option value="user">Utilisateur</option>
              </select>

              {/* ------------------ */}
              {/* Champ Photo de profil */}
              {/* ------------------ */}
  
              <label className="w-full col-span-2">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-cyan-500 cursor-pointer">
                  {photo ? (
                    <span className="text-cyan-700 font-medium">
                      {photo.name}
                    </span>
                  ) : (
                    "Cliquez pour sélectionner une photo de profil"
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setPhoto(e.target.files[0]); // <--- On utilise setPhoto ici
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-4">
              {/* Import fichier */}
              <label className="w-full max-w-md">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-600 transition-colors cursor-pointer">
                  <div className="text-gray-600 mb-2">
                    Cliquez pour sélectionner un fichier
                  </div>
                  <div className="text-sm text-gray-500">
                    Formats supportés: .csv, .xlsx, .xls
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2">
                  <span className="text-cyan-700 font-medium">{file.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer avec boutons Annuler et Enregistrer/Importer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} /> Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 border rounded-xl text-white flex items-center gap-2 transition-colors ${
                mode === "import"
                  ? "bg-pink-600 border-pink-600 hover:bg-pink-700 hover:border-pink-700"
                  : "bg-cyan-500 border-cyan-500 hover:bg-cyan-600 hover:border-cyan-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Save size={18} />{" "}
              {loading
                ? "Chargement..."
                : userToEdit
                  ? "Modifier"
                  : mode === "manual"
                    ? "Enregistrer"
                    : "Importer"}
            </button>
          </div>
        </form>

        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AddOrEditUser;
