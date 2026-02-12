// src/App.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import {
  ChevronDown,
  LogOut,
  User,
  MessageCircle,
  Mail,
  Zap,
  Shield,
  Sparkles,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Vitrine: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      {/* Header compact */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2"
            : "bg-white py-3"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-1">
              <img
                src="/assets/img/edulinkerpro.svg"
                alt=""
                className="w-15 h-15 rounded-full"
              />
              <span className="text-xl font-bold text-gray-900">
                EduLinkerPro
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              <a
                href="#hero"
                className="text-gray-600 hover:text-cyan-500 transition-colors duration-200 font-medium text-sm"
              >
                Accueil
              </a>
              <a
                href="#advantages"
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium text-sm"
              >
                Avantages
              </a>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
                >
                  <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.photo ? (
                      <img
                        src={user.photo}
                        alt={`${user.prenom} ${user.nom}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md border border-gray-200 py-1 z-50 shadow-sm">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button className="lg:hidden text-gray-600 p-1.5 rounded-md hover:bg-gray-100">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section compacte */}
      {/* Hero Section améliorée */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-30"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-200 shadow-sm mb-8">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-cyan-700">
                  Plateforme de communication nouvelle génération
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-slate-900">Communication</span>
                <span className="bg-gradient-to-r from-cyan-500 to-pink-600 bg-clip-text text-transparent">
                  Réinventée
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
                Découvrez une plateforme unifiée qui fusionne messagerie
                professionnelle et communication instantanée pour une
                collaboration sans limites.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ">
                <a
                  href="/messaging/"
                  className="group bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 flex items-center gap-3 justify-center"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Accéder à la Messagerie
                </a>
                <a
                  href="/canal"
                  className="group bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-600/25 flex items-center gap-3 justify-center"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Accéder au Canal Chat
                </a>
              </div>
            </div>

            {/* Visual grande taille */}
            <div className="lg:w-1/2">
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/assets/img/communication.png"
                  alt="Interface de communication EduLinkerPro"
                  className="w-full max-w-2xl rounded-lg border border-gray-200 scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Advantages Section compacte */}
      <section id="advantages" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              Pourquoi <span className="text-cyan-500">EduLinkerPro</span> ?
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto text-sm">
              Une plateforme conçue pour optimiser votre communication d'Ecole
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
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
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-colors duration-200"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-${advantage.color}-50 flex items-center justify-center mb-2`}
                >
                  <advantage.icon
                    className={`w-4 h-4 text-${advantage.color}-500`}
                  />
                </div>

                <h3 className="font-semibold mb-1 text-gray-800 text-sm">
                  {advantage.title}
                </h3>

                <p className="text-gray-600 text-xs">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section compacte */}
      <section className="py-12 bg-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Prêt à transformer votre communication ?
          </h2>

          <p className="text-cyan-100 mb-6 max-w-lg mx-auto text-sm">
            Rejoignez des milliers d'Ecoles qui utilisent EduLinkerPro
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/messaging/"
              className="bg-white text-cyan-600 hover:bg-gray-100 px-5 py-2.5 rounded-md font-semibold transition-colors duration-200 flex items-center gap-2 justify-center text-sm"
            >
              <Mail className="w-4 h-4" />
              Démarrer avec la Messagerie
            </a>
            <a
              href="/canal"
              className="bg-transparent border border-white text-white hover:bg-white hover:text-cyan-600 px-5 py-2.5 rounded-md font-semibold transition-colors duration-200 flex items-center gap-2 justify-center text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Essayer le Canal Chat
            </a>
          </div>
        </div>
      </section>

      {/* Footer compact */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
            {/* Brand */}
            <div className="flex-1 max-w-sm">
              <div className="flex items-center space-x-2 mb-3">
                <img
                  src="/assets/img/edulinkerpro1.jpg"
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-lg font-bold"> EduLinkerPro</span>
              </div>
              <p className="text-gray-400 text-xs">
                Communication moderne unifiée pour les Ecoles.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-gray-200 text-sm">
                  Services
                </h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/messaging/"
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-xs"
                    >
                      Messagerie Professionnelle
                    </a>
                  </li>
                  <li>
                    <a
                      href="/canal"
                      className="text-gray-400 hover:text-pink-400 transition-colors duration-200 text-xs"
                    >
                      Canal Chat Instantané
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-gray-200 text-sm">
                  Support
                </h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-xs"
                    >
                      Centre d'aide
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-pink-400 transition-colors duration-200 text-xs"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 text-center text-gray-400">
            <p className="text-xs">
              &copy; 2025 EduLinkerPro. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Vitrine;
