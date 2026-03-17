import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import {
  LogOut,
  User,
  MessageCircle,
  Mail,
  Zap,
  Shield,
  Sparkles,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  autoRefresh,
  nombreMessagesNonLus,
} from "../../services/messageService";
import { communicationService } from "../chat/services/communicationService";

const Vitrine: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Logique pour le menu mobile
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCountMessages, setUnreadCountMessages] = useState(0);
  const [unreadCountCommunication, setUnreadCountCommunication] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await nombreMessagesNonLus();
      setUnreadCountMessages(response.count ?? 0);
    } catch {
      setUnreadCountMessages(0);
    }
  }, []);
  const fetchUnreadCountCommunication = useCallback(async () => {
    try {
      const response = await communicationService.getUnreadCount();
      setUnreadCountCommunication(response.count ?? 0);
    } catch {
      setUnreadCountCommunication(0);
    }
  }, []);

  const fetchAllCounts = useCallback(async () => {
    await fetchUnreadCount();
    await fetchUnreadCountCommunication();
  }, [fetchUnreadCount, fetchUnreadCountCommunication]);

  useEffect(() => {
    const stop = autoRefresh(fetchAllCounts, 5000);
    return () => stop();
  }, [fetchAllCounts]);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2 shadow-sm"
            : "bg-white py-3"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <img
                src="/assets/img/edulinkerpro.svg"
                alt="Logo"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full"
              />
              <span className="text-lg md:text-xl font-bold text-gray-900">
                EduLinkerPro
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a
                href="#hero"
                className="text-gray-600 hover:text-cyan-500 transition-colors font-medium text-sm"
              >
                Accueil
              </a>
              <a
                href="#advantages"
                className="text-gray-600 hover:text-pink-600 transition-colors font-medium text-sm"
              >
                Avantages
              </a>
              {user?.type === "admin" && (
                <button
                  onClick={() => navigate("/admin/users")}
                  className="w-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
                >
                  Admin dashboard
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center gap-2 
             rounded-full bg-pink-600 hover:bg-pink-700 
             transition-colors duration-300"
                >
                  {user?.photo ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${user.photo}`}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {(user?.prenom?.[0] || "").toUpperCase()}
                      {(user?.nom?.[0] || "").toUpperCase()}
                    </span>
                  )}

                  {/* Pastille "En ligne" */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md border border-gray-200 py-1 z-50 shadow-lg">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile menu button toggle */}
            <button
              className="lg:hidden text-gray-600 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 py-6 px-6 shadow-2xl flex flex-col space-y-6 animate-in slide-in-from-top duration-300">
              {/* Liens de navigation */}
              <nav className="flex flex-col space-y-4">
                <a
                  href="#hero"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 font-semibold text-lg py-2 flex items-center justify-between border-b border-gray-50 hover:text-pink-600 transition-colors"
                >
                  Accueil
                </a>
                <a
                  href="#advantages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 font-semibold text-lg py-2 flex items-center justify-between border-b border-gray-50 hover:text-pink-600 transition-colors"
                >
                  Avantages
                </a>
                {user?.type === "admin" && (
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="w-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
                  >
                    Admin dashboard
                  </button>
                )}
              </nav>

              {/* Section Utilisateur (Plus élégante) */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  {/* Avatar avec position relative pour la pastille */}
                  <div className="relative w-14 h-14">
                    <div className="w-full h-full rounded-full bg-pink-600 flex items-center justify-center overflow-hidden shadow-md">
                      {user?.photo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${user.photo}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {user?.prenom?.[0].toUpperCase()}
                          {user?.nom?.[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Pastille En Ligne - Correction du positionnement */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>

                  {/* Infos Utilisateur */}
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg leading-none">
                      {user?.prenom} {user?.nom}
                    </span>
                    <span className="text-sm text-gray-500 mt-1 italic">
                      {user?.type}
                    </span>
                  </div>
                </div>

                {/* Bouton Déconnexion - Style bouton large */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section Responsive */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-24 pb-12"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-200 shadow-sm mb-6 lg:mb-8">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm font-medium text-cyan-700">
                  Plateforme de communication nouvelle génération
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-slate-900">Communication</span>
                <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">
                  Réinventée
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Découvrez une plateforme unifiée qui fusionne messagerie
                professionnelle et communication instantanée pour une
                collaboration sans limites.
              </p>

              {/* Conteneur forcé en ligne (flex-row) même sur mobile */}
              <div className="flex flex-row gap-2 sm:gap-4 justify-center lg:justify-start mt-4">
                <a
                  href="/messaging/"
                  className="relative group bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 sm:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-md flex items-center gap-2 sm:gap-3 justify-center flex-1 sm:flex-none whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-base">Messagerie</span>
                  {unreadCountMessages > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 min-w-[18px] h-[18px] sm:min-w-[22px] sm:h-[22px] flex items-center justify-center bg-pink-500 text-white text-[9px] sm:text-[10px] font-black px-1 rounded-full border-2 border-white animate-bounce">
                      {unreadCountMessages > 99 ? "99+" : unreadCountMessages}
                    </span>
                  )}
                </a>

                <a
                  href="/canal"
                  className="relative group bg-gradient-to-r from-pink-600 to-pink-700 text-white px-4 sm:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-md flex items-center gap-2 sm:gap-3 justify-center flex-1 sm:flex-none whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-base">Canal Chat</span>
                  {unreadCountCommunication > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 min-w-[18px] h-[18px] sm:min-w-[22px] sm:h-[22px] flex items-center justify-center bg-cyan-500 text-white text-[9px] sm:text-[10px] font-black px-1 rounded-full border-2 border-white animate-bounce">
                      {unreadCountCommunication > 99
                        ? "99+"
                        : unreadCountCommunication}
                    </span>
                  )}
                </a>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg lg:max-w-none">
                <img
                  src="/assets/img/communication.png"
                  alt="Interface"
                  className="w-full h-auto  lg:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Grid Responsive */}
      <section id="advantages" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Pourquoi <span className="text-cyan-500">EduLinkerPro</span> ?
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto text-sm">
              Une plateforme conçue pour optimiser votre communication d'Ecole
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Rapidité",
                description:
                  "Interface optimisée pour des temps de réponse instantanés",
                color: "cyan",
              },
              {
                icon: Shield,
                title: "Sécurité",
                description:
                  "Protection avancée pour toutes vos communications",
                color: "pink",
              },
              {
                icon: Sparkles,
                title: "Simplicité",
                description: "Interface intuitive, prise en main immédiate",
                color: "cyan",
              },
              {
                icon: Heart,
                title: "UX Fluide",
                description: "Navigation naturelle et agréable",
                color: "pink",
              },
              {
                icon: MessageCircle,
                title: "Support",
                description: "Équipe d'assistance réactive et compétente",
                color: "cyan",
              },
              {
                icon: User,
                title: "Confidentialité",
                description: "Respect strict de la vie privée",
                color: "pink",
              },
            ].map((advantage, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-cyan-200 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-${advantage.color}-50 flex items-center justify-center mb-4`}
                >
                  <advantage.icon
                    className={`w-5 h-5 text-${advantage.color}-500`}
                  />
                </div>
                <h3 className="font-bold mb-2 text-gray-800">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Responsive */}
      {/* CTA Section Responsive - Boutons toujours alignés */}
      <section className="py-16 bg-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Prêt à transformer votre communication ?
          </h2>
          <p className="text-cyan-100 mb-8 max-w-lg mx-auto text-sm md:text-base">
            Rejoignez des milliers d'Ecoles qui utilisent EduLinkerPro
          </p>

          {/* Suppression de flex-col pour forcer l'alignement horizontal */}
          <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center">
            <a
              href="/messaging/"
              className="bg-white text-cyan-600 px-3 sm:px-8 py-3 rounded-xl font-bold shadow-lg text-[10px] xs:text-xs sm:text-sm transition-transform hover:scale-105 whitespace-nowrap"
            >
              Démarrer la Messagerie
            </a>
            <a
              href="/canal"
              className="bg-cyan-600 border border-white text-white px-3 sm:px-8 py-3 rounded-xl font-bold text-[10px] xs:text-xs sm:text-sm transition-all hover:bg-white hover:text-cyan-600 whitespace-nowrap"
            >
              Essayer le Canal Chat
            </a>
          </div>
        </div>
      </section>

      {/* Footer Responsive */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          {/* La grille reste intacte pour tablette et desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Bloc Logo : prend toute la largeur sur mobile */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/assets/img/edulinkerpro.svg"
                  alt="Logo"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-xl font-bold">EduLinkerPro</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                La solution de communication moderne et sécurisée pour les
                établissements scolaires d'aujourd'hui.
              </p>
            </div>

            {/* --- BLOC SERVICES + SUPPORT : CÔTE À CÔTE SUR MOBILE --- */}
            <div className="flex flex-row justify-between sm:contents">
              {/* Services */}
              <div className="flex-1 sm:flex-none">
                <h4 className="font-semibold mb-4 text-gray-200">Services</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <a
                      href="/messaging/"
                      className="hover:text-cyan-400 transition-colors whitespace-nowrap"
                    >
                      Messagerie Pro
                    </a>
                  </li>
                  <li>
                    <a
                      href="/canal"
                      className="hover:text-pink-400 transition-colors whitespace-nowrap"
                    >
                      Canal Chat
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="flex-1 sm:flex-none">
                <h4 className="font-semibold mb-4 text-gray-200">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-cyan-400 whitespace-nowrap"
                    >
                      Centre d'aide
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-pink-400 whitespace-nowrap"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            {/* ------------------------------------------------------- */}
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-xs">
            &copy; 2025 EduLinkerPro. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Vitrine;
