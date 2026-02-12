import { useState, useEffect } from "react";
import {
  Bell,
  User,
  BookOpen,
  MapPin,
  FileText,
  AlertTriangle,
  X,
  Menu,
  ArrowRight,
  ChevronRight,
  LogOut,
  Home,
  Info,
  Calendar,
  UserX,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

// --- Types TypeScript ---
export interface InfoEvent {
  id: number;
  type: "Annonce" | "Événement" | "Rappel";
  titre: string;
  description: string;
  date: string;
  image?: string;
  urgent?: boolean;
}

export interface Seance {
  heure: string;
  matiere: string;
  enseignant: string;
  salle: string;
  couleur?: string;
}

export interface EmploiDuTemps {
  aujourdHui: Seance[];
  demain: Seance[];
}

export type NotificationType = "Nouvelle Évaluation" | "Incident" | "Absence";
export interface Notification {
  type: NotificationType;
  icon: string;
  matière: string;
  date: string;
  détail: string;
  remarque_date?: string;
}
// --- Types TypeScript pour la Vie Scolaire ---
interface Statistique {
  id: string;
  label: string;
  valeur: number;
  icon: React.ElementType;
  couleur: "cyan" | "pink";
  description: string;
}

interface AbsenceRetard {
  id: string;
  type: "absence" | "retard";
  date: string;
  heure: string;
  duree: string;
  justifie: boolean;
  motif: string;
  commentaire: string;
  cours: string;
}

interface SanctionIncident {
  id: string;
  type: "sanction" | "incident" | "retenue";
  date: string;
  motif: string;
  auteur: string;
  commentaire: string;
  dateDeroulement?: string;
  statut: "en_cours" | "termine" | "a_venir";
}

// --- Données statiques ---
const infosEvents: InfoEvent[] = [
  {
    id: 1,
    type: "Événement",
    titre: "Forum des métiers",
    description:
      "Rencontre avec des professionnels de différents secteurs pour votre orientation future. Inscription obligatoire.",
    date: "25 Oct 2025",
    image: "/images/forum.jpg",
  },
  {
    id: 2,
    type: "Annonce",
    titre: "Session examens trimestriels",
    description:
      "Les examens du premier trimestre débutent le 15 novembre. Consultez votre planning de révision.",
    date: "15 Nov 2025",
    image: "/images/exam.jpg",
    urgent: true,
  },
  {
    id: 3,
    type: "Rappel",
    titre: "Retour des livres empruntés",
    description:
      "Pensez à rapporter vos livres empruntés à la bibliothèque avant le 25 octobre.",
    date: "25 Oct 2025",
    image: "/images/library.jpg",
  },
  {
    id: 4,
    type: "Événement",
    titre: "Semaine culturelle",
    description:
      "Participez à des ateliers artistiques, expositions et représentations théâtrales.",
    date: "20-25 Oct 2025",
    image: "/images/culture.jpg",
  },
  {
    id: 5,
    type: "Annonce",
    titre: "Réunion parents-professeurs",
    description:
      "Bilan du premier trimestre le 28 octobre à 17h30 en salle polyvalente.",
    date: "28 Oct 2025",
    image: "/images/meeting.jpg",
  },
  {
    id: 6,
    type: "Rappel",
    titre: "Inscriptions club rugby",
    description:
      "Dernier délai pour s'inscrire au club rugby. Entraînements les mercredis.",
    date: "22 Oct 2025",
    image: "/images/sport.jpg",
    urgent: true,
  },
];

const notifications: Notification[] = [
  {
    type: "Nouvelle Évaluation",
    icon: "FileText",
    matière: "FRANCAIS",
    date: "mardi 14 octobre",
    détail: "Étude de texte : Les fables",
    remarque_date: "du 08/10/2025",
  },
  {
    type: "Nouvelle Évaluation",
    icon: "FileText",
    matière: "HISTOIRE-GÉOGRAPHIE",
    date: "samedi 11 octobre",
    détail: "Le paléolithique",
    remarque_date: "du 11/10/2025",
  },
  {
    type: "Incident",
    icon: "AlertTriangle",
    matière: "INCIDENT",
    date: "vendredi 10 octobre",
    détail: "Tenue vestimentaire non conforme",
  },
  {
    type: "Incident",
    icon: "AlertTriangle",
    matière: "INCIDENT",
    date: "jeudi 9 octobre",
    détail: "Travail non fait",
  },
  {
    type: "Incident",
    icon: "AlertTriangle",
    matière: "INCIDENT",
    date: "mercredi 8 octobre",
    détail: "Oubli de matériel",
  },
  {
    type: "Nouvelle Évaluation",
    icon: "FileText",
    matière: "ANGLAIS LV1",
    date: "mercredi 8 octobre",
    détail: "Pr sujets/adj poss/be",
    remarque_date: "du 02/10/2025",
  },
  {
    type: "Absence",
    icon: "X",
    matière: "ABSENCE 1 COURS",
    date: "mardi 7 octobre",
    détail: "Justifiée",
  },
  {
    type: "Nouvelle Évaluation",
    icon: "FileText",
    matière: "FRANCAIS",
    date: "mardi 7 octobre",
    détail: "Le verbe",
    remarque_date: "du 02/10/2025",
  },
  {
    type: "Nouvelle Évaluation",
    icon: "FileText",
    matière: "MATHÉMATIQUES",
    date: "lundi 6 octobre",
    détail: "les décimaux",
    remarque_date: "du 29/09/2025",
  },
];

const emploiDuTemps: EmploiDuTemps = {
  aujourdHui: [
    {
      heure: "08:00 - 08:55",
      matiere: "FRANÇAIS",
      enseignant: "COULY C.",
      salle: "A3M2",
      couleur: "bg-cyan-500",
    },
    {
      heure: "09:00 - 09:55",
      matiere: "MATHÉMATIQUES",
      enseignant: "DERIAT C.",
      salle: "A2M2",
      couleur: "bg-pink-600",
    },
    {
      heure: "10:25 - 12:05",
      matiere: "ED.PHYSIQUE & SPORT",
      enseignant: "LEROY E.",
      salle: "Gymnase 2",
      couleur: "bg-cyan-500",
    },
    {
      heure: "13:00 - 13:55",
      matiere: "ARTS PLASTIQUES",
      enseignant: "PELTIER C.",
      salle: "A-A-M3",
      couleur: "bg-pink-600",
    },
  ],
  demain: [
    {
      heure: "08:00 - 08:55",
      matiere: "PHYSIQUE",
      enseignant: "CAMARA M.",
      salle: "B1M1",
      couleur: "bg-cyan-500",
    },
    {
      heure: "09:00 - 09:55",
      matiere: "HISTOIRE-GÉOGRAPHIE",
      enseignant: "MARTIN L.",
      salle: "B1M4",
      couleur: "bg-pink-600",
    },
    {
      heure: "10:25 - 12:05",
      matiere: "ANGLAIS",
      enseignant: "BARRY A.",
      salle: "A2M1",
      couleur: "bg-cyan-500",
    },
    {
      heure: "13:00 - 13:55",
      matiere: "INFORMATIQUE",
      enseignant: "SOUMAH K.",
      salle: "Salle Info B2",
      couleur: "bg-pink-600",
    },
  ],
};
// --- Données statiques pour la Vie Scolaire ---
const statistiques: Statistique[] = [
  {
    id: "absences",
    label: "Absences",
    valeur: 2,
    icon: UserX,
    couleur: "cyan",
    description: "Absences ce trimestre",
  },
  {
    id: "retards",
    label: "Retards",
    valeur: 1,
    icon: Clock,
    couleur: "pink",
    description: "Retards enregistrés",
  },
  {
    id: "sanctions",
    label: "Sanctions",
    valeur: 1,
    icon: Shield,
    couleur: "cyan",
    description: "Sanctions ce mois",
  },
  {
    id: "incidents",
    label: "Incidents",
    valeur: 8,
    icon: AlertTriangle,
    couleur: "pink",
    description: "Incidents signalés",
  },
];

const absencesRetards: AbsenceRetard[] = [
  {
    id: "1",
    type: "absence",
    date: "07/10/2025",
    heure: "15:40 - 16:35",
    duree: "1 cours",
    justifie: true,
    motif: "Erreur emploi/organisation",
    commentaire: "",
    cours: "FRANÇAIS",
  },
  {
    id: "2",
    type: "retard",
    date: "02/10/2025",
    heure: "08:00 - 08:13",
    duree: "00:13",
    justifie: false,
    motif: "Problème de transport",
    commentaire: "",
    cours: "MATHÉMATIQUES",
  },
  {
    id: "3",
    type: "absence",
    date: "16/09/2025",
    heure: "15:40 - 16:35",
    duree: "1 cours",
    justifie: false,
    motif: "",
    commentaire: "",
    cours: "HISTOIRE-GÉOGRAPHIE",
  },
];

const sanctionsIncidents: SanctionIncident[] = [
  {
    id: "1",
    type: "incident",
    date: "10/10/2025",
    motif: "Tenue vestimentaire non conforme",
    auteur: "Mme LERIN C.",
    commentaire:
      "Cellou est en polo en classe mais ce n'est pas le polo de l'uniforme, je lui demande donc d'enfiler son pull.",
    statut: "termine",
  },
  {
    id: "2",
    type: "incident",
    date: "09/10/2025",
    motif: "Travail non fait",
    auteur: "M. COULY C.",
    commentaire:
      "Le travail de préparation à l'écriture d'une fable n'a pas été fait.",
    statut: "termine",
  },
  {
    id: "3",
    type: "incident",
    date: "08/10/2025",
    motif: "Oubli de matériel",
    auteur: "Mme LERIN C.",
    commentaire: "N'a pas de livre pour le 1/4 heure lecture.",
    statut: "termine",
  },
  {
    id: "4",
    type: "retenue",
    date: "02/10/2025",
    motif: "Incidents à répétition",
    auteur: "Mme PORCHER Elena",
    commentaire:
      "Cellous a cumulé 5 incidents qui entrainent 1h de retenue. Travail à faire : Donné sur place",
    dateDeroulement: "17/10/2025 de 16:35 à 17:30",
    statut: "a_venir",
  },
];

// --- Composants ---

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      const sections = ["home", "infos-events", "schedule", "vie-scolaire"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const getNotificationIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText":
        return FileText;
      case "AlertTriangle":
        return AlertTriangle;
      case "X":
        return X;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "Nouvelle Évaluation":
        return {
          bg: "bg-cyan-50",
          text: "text-cyan-500",
          border: "border-cyan-200",
        };
      case "Incident":
        return {
          bg: "bg-pink-50",
          text: "text-pink-600",
          border: "border-pink-200",
        };
      case "Absence":
        return {
          bg: "bg-orange-50",
          text: "text-orange-500",
          border: "border-orange-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-500",
          border: "border-gray-200",
        };
    }
  };

  const unreadCount = Math.min(3, notifications.length);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-cyan-500 shadow-lg" : "bg-cyan-500"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-500" />
            </div>
            <span className="font-bold text-lg text-white">Espace Élèves</span>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              icon={Home}
              label="Accueil"
              sectionId="home"
              active={activeSection === "home"}
              onClick={handleNavClick}
            />
            <NavLink
              icon={Info}
              label="Infos & Événements"
              sectionId="infos-events"
              active={activeSection === "infos-events"}
              onClick={handleNavClick}
            />
            <NavLink
              icon={Calendar}
              label="Emploi du temps"
              sectionId="schedule"
              active={activeSection === "schedule"}
              onClick={handleNavClick}
            />
            <NavLink
              icon={FileText}
              label="Vie scolaire"
              sectionId="vie-scolaire"
              active={activeSection === "vie-scolaire"}
              onClick={handleNavClick}
            />
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-cyan-600 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-600 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount} non lues
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification, index) => {
                      const IconComponent = getNotificationIcon(
                        notification.icon
                      );
                      const colors = getNotificationColor(notification.type);
                      return (
                        <div
                          key={index}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                            index < unreadCount ? colors.bg : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${colors.text}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-sm font-medium ${colors.text}`}
                                >
                                  {notification.type}
                                </span>
                                {index < unreadCount && (
                                  <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
                                )}
                              </div>

                              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                {notification.matière}
                              </h4>

                              <p className="text-sm text-gray-600 mb-2">
                                {notification.détail}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-cyan-500 font-medium">
                                  {notification.date}
                                </span>
                                {notification.remarque_date && (
                                  <span className="text-xs text-gray-500">
                                    {notification.remarque_date}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-center text-cyan-500 font-medium text-sm py-2 hover:bg-gray-50 rounded-lg">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-500" />
                </div>
                <span className="text-sm font-medium text-white">
                  Lucas Martin
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Lucas Martin
                        </p>
                        <p className="text-sm text-gray-500">Seconde 3</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="flex items-center space-x-3 w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Mon profil</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cyan-600 border-t border-cyan-400">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink
              icon={Home}
              label="Accueil"
              sectionId="home"
              active={activeSection === "home"}
              onClick={handleNavClick}
            />
            <MobileNavLink
              icon={Info}
              label="Infos & Événements"
              sectionId="infos-events"
              active={activeSection === "infos-events"}
              onClick={handleNavClick}
            />
            <MobileNavLink
              icon={Calendar}
              label="Emploi du temps"
              sectionId="schedule"
              active={activeSection === "schedule"}
              onClick={handleNavClick}
            />
            <MobileNavLink
              icon={FileText}
              label="Vie scolaire"
              sectionId="vie-scolaire"
              active={activeSection === "vie-scolaire"}
              onClick={handleNavClick}
            />
          </div>
        </div>
      )}
    </nav>
  );
};
interface LinkProps {
  icon: React.ElementType;
  label: string;
  sectionId: string;
  active: boolean;
  onClick: (sectionId:string) => void;
}
const NavLink: React.FC<LinkProps> = ({
  icon: Icon,
  label,
  sectionId,
  active,
  onClick,
}) => (
  <button
    onClick={() => onClick(sectionId)}
    className={`relative px-3 py-2 text-sm font-medium transition-colors hover:bg-cyan-600 rounded-lg flex items-center space-x-2 ${
      active ? "text-white" : "text-white text-opacity-90"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full"></div>
    )}
  </button>
);



const MobileNavLink: React.FC<LinkProps> = ({
  icon: Icon,
  label,
  sectionId,
  active,
  onClick,
}) => (
  <button
    onClick={() => onClick(sectionId)}
    className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center space-x-3 ${
      active
        ? "bg-cyan-700 text-white"
        : "text-white text-opacity-90 hover:bg-cyan-600"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const HomeSection = () => (
  <section
    id="home"
    className="min-h-screen pt-16 bg-gradient-to-br from-cyan-50 to-white"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texte principal */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Bienvenue dans votre
              <span className="text-cyan-500 block">Espace Élèves</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Accédez facilement à toutes vos informations scolaires : emploi du
              temps, événements, actualités et notifications, pour rester
              connecté et organisé.
            </p>
          </div>

          {/* Boutons CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() =>
                document
                  .getElementById("infos-events")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Découvrir les événements</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("schedule")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border border-cyan-500 text-cyan-500 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-50 transition-colors shadow-sm hover:shadow-md"
            >
              Voir mon emploi du temps
            </button>
          </div>
        </div>

        {/* Illustration */}
        <div className="hidden lg:flex justify-center">
          <div className="w-full max-w-md h-80   flex items-center justify-center overflow-hidden">
            <img
              src="/assets/img/student.png" 
              alt="Élève"
              className="w-full h-full object-contain" 
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const InfosEventsSection = () => (
  <section id="infos-events" className="min-h-screen py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Informations & Événements
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Toutes les actualités et événements de votre établissement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {infosEvents.map((item) => (
          <InfoEventCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  </section>
);

const InfoEventCard = ({ item }: { item: InfoEvent }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Annonce":
        return "bg-cyan-500";
      case "Événement":
        return "bg-pink-600";
      case "Rappel":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Annonce":
        return Info;
      case "Événement":
        return Calendar;
      case "Rappel":
        return Bell;
      default:
        return Info;
    }
  };

  const IconComponent = getTypeIcon(item.type);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-cyan-500 transition-all duration-300 hover:shadow-md group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`}
          ></div>
          <span className="text-sm font-medium text-gray-500">{item.type}</span>
        </div>
        <div className="text-sm text-cyan-500 font-medium bg-cyan-50 px-3 py-1 rounded-full">
          {item.date}
        </div>
      </div>

      <div className="w-full h-40 bg-gradient-to-br from-cyan-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center">
        <IconComponent className="w-12 h-12 text-cyan-500 opacity-50" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-cyan-500 transition-colors">
            {item.titre}
          </h3>
          {item.urgent && (
            <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
              URGENT
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {item.description}
        </p>
        <button className="flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors text-sm">
          En savoir plus
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

const ScheduleCard = ({ seance }: { seance: Seance }) => {
  return (
    <div
      className={`relative p-4 rounded-lg shadow-md ${seance.couleur} text-white`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-bold uppercase">{seance.matiere}</span>
          <span className="text-sm">{seance.enseignant}</span>
        </div>
        <div className="flex flex-col items-end text-sm">
          <span>{seance.heure}</span>
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {seance.salle}
          </span>
        </div>
      </div>
    </div>
  );
};

const ScheduleSection = () => {
  const [activeTab, setActiveTab] = useState<"aujourdHui" | "demain">(
    "aujourdHui"
  );
  const dateAujourdhui = "16 Oct 2025";
  const dateDemain = "17 Oct 2025";

  return (
    <section id="schedule" className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Emploi du temps
          </h2>
          <p className="text-xl text-gray-600">
            Votre planning des cours et activités
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-cyan-500">
              Emploi du temps
            </h3>
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1 mt-3 sm:mt-0">
              <button
                onClick={() => setActiveTab("aujourdHui")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === "aujourdHui"
                    ? "bg-white text-cyan-500 shadow-sm ring-1 ring-cyan-500"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>Aujourd'hui</span>
              </button>
              <button
                onClick={() => setActiveTab("demain")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === "demain"
                    ? "bg-white text-cyan-500 shadow-sm ring-1 ring-cyan-500"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>Demain</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center py-3 text-sm font-medium text-gray-700 border-b border-gray-100">
            {activeTab === "aujourdHui" ? dateAujourdhui : dateDemain}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {emploiDuTemps[activeTab].map((seance, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex flex-col items-center justify-start text-xs text-gray-500 mr-4 mt-2">
                    <span className="font-semibold">
                      {seance.heure.split(" - ")[0].split(":")[0]}:00
                    </span>
                    <div className="w-px h-16 bg-gray-300"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <ScheduleCard seance={seance} />
                  </div>
                </div>
              ))}
              <div className="flex items-start">
                <div className="flex flex-col items-center justify-start text-xs text-gray-500 mr-4 mt-2">
                  <span className="font-semibold">
                    {
                      emploiDuTemps[activeTab][
                        emploiDuTemps[activeTab].length - 1
                      ].heure
                        .split(" - ")[1]
                        .split(":")[0]
                    }
                    :00
                  </span>
                  <div className="w-px h-4 bg-gray-300"></div>
                </div>
                <div className="flex-1 min-w-0 h-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- NOUVELLE SECTION VIE SCOLAIRE ---
// --- Composant VieScolaire ---
const VieScolaireSection = () => {
  const [activeTab, setActiveTab] = useState<"absences" | "sanctions">(
    "absences"
  );

  // Fonction pour obtenir la couleur et l'icône selon le type
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "absence":
        return {
          couleur: "text-cyan-500",
          bgCouleur: "bg-cyan-50",
          borderCouleur: "border-cyan-200",
          icon: UserX,
        };
      case "retard":
        return {
          couleur: "text-pink-500",
          bgCouleur: "bg-pink-50",
          borderCouleur: "border-pink-200",
          icon: Clock,
        };
      case "incident":
        return {
          couleur: "text-pink-500",
          bgCouleur: "bg-pink-50",
          borderCouleur: "border-pink-200",
          icon: AlertTriangle,
        };
      case "retenue":
        return {
          couleur: "text-cyan-500",
          bgCouleur: "bg-cyan-50",
          borderCouleur: "border-cyan-200",
          icon: Shield,
        };
      case "sanction":
        return {
          couleur: "text-cyan-500",
          bgCouleur: "bg-cyan-50",
          borderCouleur: "border-cyan-200",
          icon: FileText,
        };
      default:
        return {
          couleur: "text-gray-500",
          bgCouleur: "bg-gray-50",
          borderCouleur: "border-gray-200",
          icon: Info,
        };
    }
  };

  return (
    <section id="vie-scolaire" className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Vie Scolaire
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Suivi complet de votre parcours scolaire
          </p>

        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statistiques.map((stat) => {
            const IconComponent = stat.icon;
            const textColor =
              stat.couleur === "cyan" ? "text-cyan-500" : "text-pink-500";

            return (
              <div
                key={stat.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${
                      stat.couleur === "cyan" ? "bg-cyan-50" : "bg-pink-50"
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 ${textColor}`} />
                  </div>
                  <span className={`text-2xl font-bold ${textColor}`}>
                    {stat.valeur}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-1">
                  {stat.label}
                </h3>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("absences")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "absences"
                  ? "text-cyan-500 border-b-2 border-cyan-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Absences & Retards
            </button>
            <button
              onClick={() => setActiveTab("sanctions")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "sanctions"
                  ? "text-cyan-500 border-b-2 border-cyan-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sanctions & Incidents
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === "absences" && (
              <div className="overflow-hidden">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Historique des absences et retards
                </h3>

                {/* Version Desktop */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Type
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Date & Heure
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Cours
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Durée
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Justifié
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Motif
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {absencesRetards.map((item) => {
                        const config = getTypeConfig(item.type);
                        const IconComponent = config.icon;

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="p-4">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgCouleur} ${config.borderCouleur} border`}
                              >
                                <IconComponent
                                  className={`w-4 h-4 mr-2 ${config.couleur}`}
                                />
                                <span
                                  className={`text-sm font-medium ${config.couleur}`}
                                >
                                  {item.type === "absence"
                                    ? "Absence"
                                    : "Retard"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-800 font-medium">
                                {item.date}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.heure}
                              </div>
                            </td>
                            <td className="p-4 text-gray-700">{item.cours}</td>
                            <td className="p-4 text-gray-700">{item.duree}</td>
                            <td className="p-4">
                              {item.justifie ? (
                                <div className="inline-flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  <span className="text-sm">Oui</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center text-red-600">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  <span className="text-sm">Non</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-gray-700">
                              {item.motif || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Version Mobile */}
                <div className="lg:hidden space-y-4">
                  {absencesRetards.map((item) => {
                    const config = getTypeConfig(item.type);
                    const IconComponent = config.icon;

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgCouleur} ${config.borderCouleur} border`}
                          >
                            <IconComponent
                              className={`w-4 h-4 mr-2 ${config.couleur}`}
                            />
                            <span
                              className={`text-sm font-medium ${config.couleur}`}
                            >
                              {item.type === "absence" ? "Absence" : "Retard"}
                            </span>
                          </div>
                          {item.justifie ? (
                            <div className="inline-flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Justifié</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center text-red-600">
                              <XCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Non justifié</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">
                              {item.date} {item.heure}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cours:</span>
                            <span className="font-medium">{item.cours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Durée:</span>
                            <span className="font-medium">{item.duree}</span>
                          </div>
                          {item.motif && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Motif:</span>
                              <span className="font-medium text-right">
                                {item.motif}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "sanctions" && (
              <div className="overflow-hidden">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Sanctions et incidents
                </h3>

                {/* Version Desktop */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Type
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Motif
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Par
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Commentaire
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sanctionsIncidents.map((item) => {
                        const config = getTypeConfig(item.type);
                        const IconComponent = config.icon;

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="p-4">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgCouleur} ${config.borderCouleur} border`}
                              >
                                <IconComponent
                                  className={`w-4 h-4 mr-2 ${config.couleur}`}
                                />
                                <span
                                  className={`text-sm font-medium ${config.couleur}`}
                                >
                                  {item.type === "incident"
                                    ? "Incident"
                                    : item.type === "retenue"
                                    ? "Retenue"
                                    : "Sanction"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-700">{item.date}</td>
                            <td className="p-4 text-gray-700">{item.motif}</td>
                            <td className="p-4 text-gray-700">{item.auteur}</td>
                            <td className="p-4 text-gray-700 max-w-xs">
                              <div className="line-clamp-2">
                                {item.commentaire}
                              </div>
                            </td>
                            <td className="p-4">
                              {item.dateDeroulement && (
                                <div className="text-sm text-cyan-600">
                                  {item.dateDeroulement}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Version Mobile */}
                <div className="lg:hidden space-y-4">
                  {sanctionsIncidents.map((item) => {
                    const config = getTypeConfig(item.type);
                    const IconComponent = config.icon;

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgCouleur} ${config.borderCouleur} border`}
                          >
                            <IconComponent
                              className={`w-4 h-4 mr-2 ${config.couleur}`}
                            />
                            <span
                              className={`text-sm font-medium ${config.couleur}`}
                            >
                              {item.type === "incident"
                                ? "Incident"
                                : item.type === "retenue"
                                ? "Retenue"
                                : "Sanction"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{item.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Par:</span>
                            <span className="font-medium">{item.auteur}</span>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Motif:</div>
                            <div className="font-medium">{item.motif}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">
                              Commentaire:
                            </div>
                            <div className="font-medium text-sm">
                              {item.commentaire}
                            </div>
                          </div>
                          {item.dateDeroulement && (
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                              <div className="text-cyan-700 text-sm font-medium">
                                ⏰ {item.dateDeroulement}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Composant Principal ---
const EspaceEleveOnePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HomeSection />
        <InfosEventsSection />
        <ScheduleSection />
        <VieScolaireSection />
      </main>
    </div>
  );
};

export default EspaceEleveOnePage;
