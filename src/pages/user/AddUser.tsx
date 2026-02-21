"use client";

import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, X, AlertCircle } from "lucide-react";
import Toast from "../../components/ui/Toast";
import { register, updateUser } from "../../services/userService";
import type { AxiosError } from "axios";
import type { User } from "../../models/User";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const AddOrEditUser: React.FC<Props> = ({ isOpen, onClose, userToEdit }) => {
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

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUtilisateur(userToEdit);
      if (userToEdit.photo) {
        setPreview(`${import.meta.env.VITE_API_URL}${userToEdit.photo}`);
      }
    }
  }, [userToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUtilisateur((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError(null);

    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      setFileError("La photo est trop lourde (max 5 Mo)");
      setToast({
        message: "Le fichier dépasse la limite de 5MB",
        type: "error",
      });
      e.target.value = "";
      setPhoto(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(selected.type)) {
      setFileError("Format non supporté (JPG ou PNG uniquement)");
      return;
    }

    setPhoto(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhoto(null);
    setPreview(null);
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photo && photo.size > MAX_FILE_SIZE) {
      setToast({ message: "L'image est trop volumineuse", type: "error" });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const formData = new FormData();
      Object.entries(utilisateur).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (photo) {
        formData.append("photo", photo);
      }

      if (userToEdit) {
        await updateUser(userToEdit.id!, formData);
        setToast({ message: "Mis à jour avec succès !", type: "success" });
      } else {
        await register(formData);
        setToast({ message: "Ajouté avec succès !", type: "success" });
      }

      setTimeout(() => onClose(), 1000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setToast({
        message:
          error.response?.data?.message || "Erreur lors de l'enregistrement",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      {/* Ajustement de la largeur (w-full) et de la hauteur max pour le scroll mobile */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER - Ajustement du padding et de la taille du texte sur mobile */}
        <div className="bg-cyan-500 px-4 sm:px-6 py-3 sm:py-4 text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold truncate mr-2">
            {userToEdit ? "Modifier utilisateur" : "Ajouter utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-white rounded-full hover:bg-gray-100 transition shrink-0"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* FORM - Ajout d'un overflow-y-auto pour que le contenu défile si l'écran est petit */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:y-6 overflow-y-auto grow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              name="nom"
              value={utilisateur.nom || ""}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
              required
            />
            <input
              name="prenom"
              value={utilisateur.prenom || ""}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
              required
            />
            <input
              name="email"
              type="email"
              value={utilisateur.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
            />
            <input
              name="telephone"
              value={utilisateur.telephone || ""}
              onChange={handleChange}
              placeholder="Téléphone"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
            />
            <input
              name="adresse"
              value={utilisateur.adresse || ""}
              onChange={handleChange}
              placeholder="Adresse"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
            />
            <input
              name="pays"
              value={utilisateur.pays || ""}
              onChange={handleChange}
              placeholder="Pays"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
              required
            />
            <input
              name="region"
              value={utilisateur.region || ""}
              onChange={handleChange}
              placeholder="Région"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
              required
            />
            <input
              name="etablissement"
              value={utilisateur.etablissement || ""}
              onChange={handleChange}
              placeholder="Établissement"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
              required
            />

            <select
              name="type"
              value={utilisateur.type || "user"}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100
             outline-none shadow-sm hover:shadow-md transition
             text-sm sm:text-base"
            >
              <option value="admin">Administrateur</option>
              <option value="directeur">Directeur</option>
              <option value="user">Utilisateur</option>
            </select>

            {/* PHOTO SECTION - sm:col-span-2 pour rester sur 2 colonnes en tablette/PC */}
            <div className="md:col-span-2">
              <label className="block group relative cursor-pointer">
                <div
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 
        ${
          fileError
            ? "border-red-400 bg-red-50"
            : "border-gray-300 hover:border-cyan-500 hover:bg-cyan-50"
        }`}
                >
                  {preview ? (
                    <div className="relative w-28 h-28 mx-auto mt-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-full border-4 border-cyan-500 shadow-md"
                      />
                      {/* Icône de suppression en overlay */}
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-gray-600 font-medium">
                        Cliquez pour sélectionner une photo
                      </p>
                      <p className="text-xs text-gray-400">
                        (JPG/PNG - Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {fileError && (
                <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle size={14} /> {fileError}
                </p>
              )}
            </div>
          </div>

          {/* FOOTER - Utilisation de flex-col sur mobile pour empiler les boutons si nécessaire */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft size={16} /> Annuler
            </button>

            <button
              type="submit"
              disabled={loading || !!fileError}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              <Save size={18} />
              {loading
                ? "Chargement..."
                : userToEdit
                  ? "Modifier"
                  : "Enregistrer"}
            </button>
          </div>
        </form>

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
