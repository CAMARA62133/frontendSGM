"use client";

import React, { useState, useEffect } from "react";
import {
  Edit3,
  Search,
  Download,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllUsers, toggleUser } from "../../services/userService";
import type { User, UserRole } from "../../models/User"; // Utilisation de UserRole mis à jour

import Toast from "../../components/ui/Toast";
import AddOrEditUser from "./AddUser";

type StatusFilter = "all" | "active" | "inactive";
type TypeFilter = UserRole | "all" | "directeur"; // On garde directeur si présent dans ton interface

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | undefined>();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // On s'assure de récupérer les données selon la structure de ton API
      const fetchedUsers = response.data?.users || response.data || [];
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
    } catch {
      setToast({
        message: "Erreur lors du chargement des utilisateurs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.nom.toLowerCase().includes(term) ||
          user.prenom.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((user) =>
        statusFilter === "active" ? user.isActif : !user.isActif,
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((user) => user.type === typeFilter);
    }
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, statusFilter, typeFilter]);

  // --- CALCULS DE PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleToggleUser = async (userId: string | number) => {
    try {
      // Conversion en string pour le service si nécessaire
      await toggleUser(String(userId));
      setToast({ message: "Statut mis à jour", type: "success" });
      fetchUsers();
    } catch {
      setToast({ message: "Erreur de mise à jour", type: "error" });
    }
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setUserToEdit(undefined);
    fetchUsers();
  };

  const getStatusClass = (isActif: boolean | undefined) =>
    isActif
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";

  const getTypeClass = (type: string) => {
    if (type === "admin") return "bg-pink-100 text-pink-800 border-pink-200";
    if (type === "directeur")
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-cyan-50 rounded-lg">
            <Users className="text-cyan-600" size={22} />
          </div>
          <div>
            <p className="text-[13px] text-gray-500 font-medium">
              Total Utilisateurs
            </p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] text-gray-500 font-medium">
              Comptes Actifs
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.isActif).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-pink-50 rounded-lg">
            <Users className="text-pink-600" size={22} />
          </div>
          <div>
            <p className="text-[13px] text-gray-500 font-medium">
              Administrateurs
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.type === "admin").length}
            </p>
          </div>
        </div>
      </div>

      {/* Header & Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 mt-6">
        <div className="p-6 border-b border-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-pink-500">
                Liste des Utilisateurs
              </h1>
              <p className="text-sm text-cyan-500">
                {filteredUsers.length} résultat(s) trouvé(s)
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} /> Nouveau compte
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none transition-all cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none transition-all cursor-pointer"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="user">Utilisateur</option>
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
              <Download size={16} /> Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {user.prenom[0]}
                        {user.nom[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.telephone || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeClass(user.type)}`}
                    >
                      {user.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusClass(user.isActif)}`}
                    >
                      {user.isActif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.entreprise}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => user.id && handleToggleUser(user.id)}
                        className={`p-2 rounded-lg transition-all ${user.isActif ? "text-emerald-600 hover:bg-emerald-50" : "text-red-500 hover:bg-red-50"}`}
                        title={user.isActif ? "Désactiver" : "Activer"}
                      >
                        {user.isActif ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              width="18"
                              height="11"
                              x="3"
                              y="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              width="18"
                              height="11"
                              x="3"
                              y="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Affichage de{" "}
              <span className="font-semibold">{indexOfFirstItem + 1}</span> à{" "}
              <span className="font-semibold">
                {Math.min(indexOfLastItem, filteredUsers.length)}
              </span>{" "}
              sur <span className="font-semibold">{filteredUsers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-lg border font-semibold ${currentPage === index + 1 ? "bg-cyan-500 border-cyan-500 text-white" : "bg-white border-gray-300 text-gray-600"}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddOrEditUser isOpen={isAddModalOpen} onClose={handleCloseModal} />
      <AddOrEditUser
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        userToEdit={userToEdit}
      />

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
