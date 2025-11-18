import React, { useState, useEffect } from "react";
import { Edit3, Eye, Power, Search, Download, Plus, Users } from "lucide-react";
import { getAllUsers, toggleUser } from "../../services/userService";
import type { User, Type } from "../../models/User";
import UserDetail from "./UserDetail";
import Toast from "../../components/ui/Toast";
import AddOrEditUser from "./AddUser";

// Types pour les filtres
type StatusFilter = "all" | "active" | "inactive";
type TypeFilter = Type | "all";

const UserList: React.FC = () => {
  // États pour la gestion des données utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // États pour la gestion des modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | undefined>();

  // État pour les notifications Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fonction pour récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.users || []);
    } catch {
      setToast({
        message: "Erreur lors du chargement des utilisateurs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers();
  }, []);

  // Effet pour filtrer les utilisateurs selon les critères
  useEffect(() => {
    let result = users;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.nom.toLowerCase().includes(term) ||
          user.prenom.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.telephone?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut (actif/inactif)
    if (statusFilter !== "all") {
      result = result.filter((user) =>
        statusFilter === "active" ? user.isActif : !user.isActif
      );
    }

    // Filtre par type d'utilisateur
    if (typeFilter !== "all") {
      result = result.filter((user) => user.type === typeFilter);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, statusFilter, typeFilter]);

  // Fonction pour activer/désactiver un utilisateur
  const handleToggleUser = async (userId: string) => {
    try {
      await toggleUser(userId);
      setToast({
        message: "Statut utilisateur mis à jour avec succès",
        type: "success",
      });
      fetchUsers(); // Recharger la liste
    } catch {
      setToast({
        message: "Erreur lors de la modification du statut",
        type: "error",
      });
    }
  };

  // Fonction pour ouvrir le modal d'édition
  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  // Fonction pour ouvrir le modal de détail
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // Fonction pour fermer tous les modals et rafraîchir les données
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setUserToEdit(undefined);
    fetchUsers(); // Rafraîchir la liste après modification
  };

  // Gestionnaires de changement pour les filtres
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as TypeFilter);
  };

  // Fonctions pour les classes CSS conditionnelles
  const getStatusClass = (isActif: boolean | undefined) => {
    return isActif
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-red-100 text-red-800 border border-red-200";
  };

  const getTypeClass = (type: Type) => {
    switch (type) {
      case "admin":
        return "bg-pink-100 text-pink-800 border border-pink-200";
      case "directeur":
        return "bg-cyan-100 text-cyan-800 border border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Fonction pour traduire les types d'utilisateurs
  const translateType = (type: Type) => {
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

  // Fonction pour réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte : Total utilisateurs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Users className="text-cyan-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Total utilisateurs
              </p>
              <p className="text-3xl font-bold text-cyan-600">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Carte : Utilisateurs actifs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Power className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Utilisateurs actifs
              </p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter((u) => u.isActif).length}
              </p>
            </div>
          </div>
        </div>

        {/* Carte : Administrateurs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="text-pink-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Administrateurs
              </p>
              <p className="text-3xl font-bold text-pink-600">
                {users.filter((u) => u.type === "admin").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête avec titre et bouton d'ajout */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500 rounded-xl text-white">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredUsers.length} utilisateur
                {filteredUsers.length > 1 ? "s" : ""} trouvé
                {filteredUsers.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {/* Bouton pour ajouter un nouvel utilisateur */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={20} />
            Ajouter Utilisateur
          </button>
        </div>

        {/* Section des filtres et recherche */}
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Champ de recherche */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white transition-colors duration-200"
              />
            </div>

            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white transition-colors duration-200"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            {/* Filtre par type */}
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white transition-colors duration-200"
            >
              <option value="all">Tous les types</option>
              <option value="admin">Administrateur</option>
              <option value="directeur">Directeur</option>
              <option value="user">Utilisateur</option>
            </select>

            {/* Bouton d'export */}
            <button className="px-4 py-3 border border-cyan-500 text-cyan-600 rounded-lg hover:bg-cyan-500 hover:text-white flex items-center justify-center gap-2 transition-colors duration-200 font-semibold">
              <Download size={18} />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          // Affichage quand aucun utilisateur n'est trouvé
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier utilisateur"}
            </p>
            {/* Bouton selon le contexte (réinitialiser ou ajouter) */}
            {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? (
              <button
                onClick={handleResetFilters}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Ajouter le premier utilisateur
              </button>
            )}
          </div>
        ) : (
          // Tableau avec la liste des utilisateurs
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyan-500">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Établissement
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Colonne informations utilisateur */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {user.prenom[0]}
                          {user.nom[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Colonne contact */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.telephone || "Non renseigné"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.region}, {user.pays}
                      </div>
                    </td>

                    {/* Colonne type d'utilisateur */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getTypeClass(
                          user.type
                        )}`}
                      >
                        {translateType(user.type)}
                      </span>
                    </td>

                    {/* Colonne statut */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusClass(
                          user.isActif
                        )}`}
                      >
                        {user.isActif ? "Actif" : "Inactif"}
                      </span>
                    </td>

                    {/* Colonne établissement */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.etablissement}
                      </div>
                    </td>

                    {/* Colonne actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* Bouton voir détails */}
                        <button
                          onClick={() => handleViewDetail(user)}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors duration-200"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Bouton modifier */}
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
                          title="Modifier"
                        >
                          <Edit3 size={18} />
                        </button>

                        {/* Bouton activer/désactiver */}
                        <button
                          onClick={() => user.id && handleToggleUser(user.id)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            user.isActif
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={user.isActif ? "Désactiver" : "Activer"}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals pour l'ajout, l'édition et la visualisation */}
      <AddOrEditUser isOpen={isAddModalOpen} onClose={handleCloseModal} />
      <AddOrEditUser
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        userToEdit={userToEdit}
      />
      <UserDetail
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
      />

      {/* Notification Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default UserList;
