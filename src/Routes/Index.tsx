import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";
import { ProtectedRoute } from "../context/ProtectedRoute";

// Pages Authentification
import Login from "../pages/login/Login";
import ChangePassword from "../pages/login/ChangePassword";

// Dashboard Admin
import AdminDashboardLayout from "../pages/user/AdminDashboardLayout";
import UserList from "../pages/user/UserList";
import MessageList from "../pages/user/MessageList";

// Pages Messagerie
import MessagingLayout from "../pages/message/MessagingMenu";
import InboxPage from "../pages/message/inbox/InboxPage";
import SentPage from "../pages/message/sent/SentPage";
import DraftsPage from "../pages/message/drafts/DraftsPage";
import ArchivedPage from "../pages/message/archived/ArchivedPage";
import FavoritesPage from "../pages/message/favorite/FavoritesPage";
import TrashPage from "../pages/message/trash/TrashPage";


// Dashboards élèves / parents
import DashboardEleve from "../pages/user/DashboardEleve";
import ParentStudentDashboard from "../pages/user/ParentStudentDashboard";
import CanalCommunication from "../pages/cannalcommunication/CanalCommunication";
import Vitrine from "../pages/vitrine/Vitrine";
import MessageDetailPage from "../pages/message/MessageDetailPage";

/**
 * Composant principal de gestion des routes de l'application
 */
const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* ------------------ Routes Auth ------------------ */}
        <Route path="/login" element={<Login />} />
        <Route path="/vitrine" element={<Vitrine />} />
        <Route path="canal" element={<CanalCommunication />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/eleve"
          element={
            <ProtectedRoute types={["user"]}>
              <DashboardEleve />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent"
          element={
            <ProtectedRoute types={["user"]}>
              <ParentStudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ------------------ Dashboard Admin ------------------ */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute types={["admin", "directeur"]}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserList />} />
          <Route path="messages" element={<MessageList />} />
        </Route>

        {/* ------------------ Messagerie ------------------ */}
        <Route
          path="/messaging/*"
          element={
            <ProtectedRoute types={["user", "admin", "directeur"]}>
              <MessagingLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="inbox" replace />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="sent" element={<SentPage />} />
          <Route path="drafts" element={<DraftsPage />} />
          <Route path="archived" element={<ArchivedPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="trash" element={<TrashPage />} />

          <Route path="message/:id" element={<MessageDetailPage />} />
        </Route>

        {/* ------------------ Redirection par défaut ------------------ */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ------------------ Page 404 ------------------ */}
        <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRoutes;
