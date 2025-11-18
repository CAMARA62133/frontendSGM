"use client";

import { useState } from "react";
import {
  Bell,
  User,
  LogOut,
  Home,
  Calendar,
  Clock,
  Award,
  Menu,
  X,
  FileTextIcon,
  AlertTriangleIcon,
  XIcon,
  BarChart3,
  Users,
  MapPin,
} from "lucide-react";

// --- Types et Interfaces existants ---

export type NotificationType = "Nouvelle Évaluation" | "Incident" | "Absence";

export interface Notification {
  type: NotificationType;
  icon: string;
  matière: string;
  date: string;
  détail: string;
  remarque_date?: string;
}

interface Course {
  time: string;
  subject: string;
  room: string;
  teacher: string;
  color: string;
  gridRow: string;
}

interface ScheduleData {
  [key: string]: Course[];
}

// --- Fonctions utilitaires existantes ---

// Fonction pour obtenir l'icône correspondante
const getNotificationIcon = (iconName: string) => {
  switch (iconName) {
    case "FileText":
      return FileTextIcon;
    case "AlertTriangle":
      return AlertTriangleIcon;
    case "X":
      return XIcon;
    default:
      return FileTextIcon;
  }
};

// Fonction pour obtenir les couleurs selon le type de notification
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "Nouvelle Évaluation":
      return {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      };
    case "Incident":
      return {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
      };
    case "Absence":
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      };
  }
};

// --- NOUVELLE Fonction utilitaire pour les couleurs des cours (basée sur l'image) ---
const getClassColor = (subject: string) => {
  switch (subject.toUpperCase()) {
    case "PHYSIQUE-CHIMIE":
    case "SCIENCES VIE & TERRE":
    case "TECHNOLOGIE":
    case "SVT":
    case "TECHNO":
      return "border border-teal-400 hover:border-teal-500 bg-white text-teal-700 hover:shadow-md transition-all duration-200";
    case "FRANCAIS":
    case "ARTS PLASTIQUES":
      return "border border-rose-400 hover:border-rose-500 bg-white text-rose-700 hover:shadow-md transition-all duration-200";
    case "MUSIQUE":
    case "ÉDUCATION MUSICALE":
      return "border border-purple-400 hover:border-purple-500 bg-white text-purple-700 hover:shadow-md transition-all duration-200";
    case "MATHÉMATIQUES":
      return "border border-indigo-400 hover:border-indigo-500 bg-white text-indigo-700 hover:shadow-md transition-all duration-200";
    case "HISTOIRE-GÉOGRAPHIE":
      return "border border-amber-500 hover:border-amber-600 bg-white text-amber-800 hover:shadow-md transition-all duration-200";
    case "ANGLAIS":
    case "ESPAGNOL":
      return "border border-emerald-400 hover:border-emerald-500 bg-white text-emerald-700 hover:shadow-md transition-all duration-200";
    case "ÉDUCATION PHYSIQUE & SPORT":
      return "border border-orange-400 hover:border-orange-500 bg-white text-orange-700 hover:shadow-md transition-all duration-200";
    case "AVIS":
    case "ANTI PRATIQUES":
      return "border border-yellow-400 hover:border-yellow-500 bg-white text-yellow-700 hover:shadow-md transition-all duration-200";
    case "CULT REL":
    case "SOCIOLOGIE":
    case "VIE SCOLAIRE":
      return "border border-lime-500 hover:border-lime-600 bg-white text-lime-700 hover:shadow-md transition-all duration-200";
    case "PERMANENCE":
      return "border border-slate-300 hover:border-slate-400 bg-white text-slate-600 hover:shadow-md transition-all duration-200";
    default:
      return "border border-blue-400 hover:border-blue-500 bg-white text-blue-700 hover:shadow-md transition-all duration-200";
  }
};

// --- Données existantes ---

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
];

// Données des élèves
const students = [
  {
    id: 1,
    name: "Cellou Koyla",
    grade: "6EME3",
    avatar: "👦",
    attendance: "95%",
    average: "14.2/20",
    behavior: "Excellent",
    lastUpdate: "Aujourd'hui",
  },
];

// Navigation items
const navigationItems = [
  { id: "overview", icon: Home, label: "Tableau de bord", color: "cyan" },
  { id: "schedule", icon: Calendar, label: "Emploi du temps", color: "cyan" },
];

// --- NOUVELLES Données de l'emploi du temps (basées sur l'image pour la semaine 42) ---
const scheduleData: ScheduleData = {
  // Lundi 13 Oct
  Lun: [
    {
      time: "08:00-09:00",
      subject: "PHYSIQUE-CHIMIE",
      room: "LABO S. R. VIVET E. M.",
      teacher: "PHILIPPE N.",
      color: "teal",
      gridRow: "1 / 5",
    },
    {
      time: "09:00-10:00",
      subject: "FRANCAIS",
      room: "C",
      teacher: "FRANCAD C.",
      color: "rose",
      gridRow: "5 / 9",
    },
    {
      time: "10:15-11:15",
      subject: "MATHÉMATIQUES",
      room: "A302",
      teacher: "DERIET G.",
      color: "indigo",
      gridRow: "10 / 14",
    },
    {
      time: "11:15-12:15",
      subject: "ANGLAIS",
      room: "A302",
      teacher: "DEMON B.",
      color: "emerald",
      gridRow: "14 / 18",
    },
    {
      time: "13:30-14:25",
      subject: "MATHÉMATIQUES",
      room: "C",
      teacher: "DERIET C.",
      color: "indigo",
      gridRow: "23 / 27",
    },
    {
      time: "14:25-15:20",
      subject: "FRANCAIS",
      room: "C",
      teacher: "FRANCAD C.",
      color: "rose",
      gridRow: "27 / 31",
    },
  ],
  // Mardi 14 Oct
  Mar: [
    {
      time: "08:00-09:00",
      subject: "PHYSIQUE-CHIMIE",
      room: "En gymnase",
      teacher: "LEROY E.",
      color: "teal",
      gridRow: "1 / 5",
    },
    {
      time: "09:00-10:00",
      subject: "HISTOIRE-GÉOGRAPHIE",
      room: "C",
      teacher: "DEFAIT C.",
      color: "amber",
      gridRow: "5 / 9",
    },
    {
      time: "10:00-11:00",
      subject: "ARTS PLASTIQUES",
      room: "A40",
      teacher: "SOUVERAIN J.",
      color: "rose",
      gridRow: "9 / 13",
    },
    {
      time: "11:00-12:00",
      subject: "AVIS",
      room: "RED",
      teacher: "PORCHER E.",
      color: "yellow",
      gridRow: "13 / 17",
    },
    {
      time: "13:30-14:25",
      subject: "HISTOIRE-GÉOGRAPHIE",
      room: "C",
      teacher: "DEFAIT C.",
      color: "amber",
      gridRow: "23 / 27",
    },
    {
      time: "14:25-15:20",
      subject: "TECHNO",
      room: "T",
      teacher: "SIMON V.",
      color: "teal",
      gridRow: "27 / 31",
    },
    {
      time: "15:20-16:15",
      subject: "SOCIOLOGIE",
      room: "C",
      teacher: "DALLONGEVILLE E.",
      color: "lime",
      gridRow: "31 / 35",
    },
  ],
  // Mercredi 15 Oct
  Mer: [
    {
      time: "08:00-08:55",
      subject: "ÉDUCATION PHYSIQUE & SPORT",
      room: "En gymnase",
      teacher: "LEROY E.",
      color: "orange",
      gridRow: "1 / 5",
    },
    {
      time: "09:00-09:55",
      subject: "MATHÉMATIQUES",
      room: "A302",
      teacher: "DERIET G.",
      color: "indigo",
      gridRow: "5 / 9",
    },
    {
      time: "10:15-11:15",
      subject: "ARTS PLASTIQUES",
      room: "A302",
      teacher: "COUTRANT A.",
      color: "rose",
      gridRow: "10 / 14",
    },
    {
      time: "11:15-12:15",
      subject: "SVT",
      room: "LABO",
      teacher: "GUÉRIN G.",
      color: "teal",
      gridRow: "14 / 18",
    },
    {
      time: "13:30-14:25",
      subject: "HISTOIRE-GÉOGRAPHIE",
      room: "A302",
      teacher: "DEFAIT C.",
      color: "amber",
      gridRow: "23 / 27",
    },
    {
      time: "14:25-15:20",
      subject: "ANTI PRATIQUES",
      room: "A302",
      teacher: "MISTER D.",
      color: "yellow",
      gridRow: "27 / 31",
    },
  ],
  // Jeudi 16 Oct (Jour sélectionné dans l'image originale)
  Jeu: [
    {
      time: "08:00-08:55",
      subject: "MATHÉMATIQUES",
      room: "A302",
      teacher: "DERIET G.",
      color: "indigo",
      gridRow: "1 / 5",
    },
    {
      time: "09:00-09:55",
      subject: "HISTOIRE-GÉOGRAPHIE",
      room: "A302",
      teacher: "DEFAIT C.",
      color: "amber",
      gridRow: "5 / 9",
    },
    {
      time: "10:15-11:15",
      subject: "SCIENCES VIE & TERRE",
      room: "A302",
      teacher: "LEPINE P.",
      color: "teal",
      gridRow: "10 / 14",
    },
    {
      time: "11:15-12:15",
      subject: "ÉDUCATION PHYSIQUE & SPORT",
      room: "En gymnase",
      teacher: "LEROY E.",
      color: "orange",
      gridRow: "14 / 18",
    },
    {
      time: "13:30-14:25",
      subject: "HISTOIRE-GÉOGRAPHIE",
      room: "A302",
      teacher: "DEFAIT C.",
      color: "amber",
      gridRow: "23 / 27",
    },
    {
      time: "14:25-15:20",
      subject: "PERMANENCE",
      room: "A302",
      teacher: "DUBIN R.",
      color: "slate",
      gridRow: "27 / 31",
    },
    {
      time: "15:20-16:15",
      subject: "MATHÉMATIQUES",
      room: "A302",
      teacher: "DERIET G.",
      color: "indigo",
      gridRow: "31 / 35",
    },
  ],
  // Vendredi 17 Oct
  Ven: [
    {
      time: "08:00-09:00",
      subject: "ÉDUCATION MUSICALE",
      room: "F40",
      teacher: "GEORGE F.",
      color: "purple",
      gridRow: "1 / 5",
    },
    {
      time: "09:00-10:00",
      subject: "HISTOIRE-GÉOGRAPHIE",
      room: "A302",
      teacher: "DEFAIT C.",
      color: "amber",
      gridRow: "5 / 9",
    },
    {
      time: "10:15-11:15",
      subject: "ANGLAIS",
      room: "A302",
      teacher: "DEMON B.",
      color: "emerald",
      gridRow: "10 / 14",
    },
    {
      time: "11:15-12:15",
      subject: "CULT REL",
      room: "A302",
      teacher: "SPIESSER A.",
      color: "lime",
      gridRow: "14 / 18",
    },
    {
      time: "14:25-15:20",
      subject: "MATHÉMATIQUES",
      room: "A302",
      teacher: "DALLONGEVILLE E.",
      color: "indigo",
      gridRow: "27 / 31",
    },
    {
      time: "15:35-16:30",
      subject: "FRANCAIS",
      room: "C",
      teacher: "FRANCAD C.",
      color: "rose",
      gridRow: "32 / 36",
    },
  ],
};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const DAY_LABELS = {
  Lun: "Lundi 13 Oct",
  Mar: "Mardi 14 Oct",
  Mer: "Mercredi 15 Oct",
  Jeu: "Jeudi 16 Oct",
  Ven: "Vendredi 17 Oct",
};
const TIME_SLOTS = Array.from({ length: 4 * 10 }, (_, i) => {
  const hour = 8 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

// --- Composants de section existants ---

const OverviewSection = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-cyan-600 mb-4">Vue d'ensemble</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-cyan-700">Performance</h3>
          </div>
          <p className="text-cyan-600 text-sm">
            Votre enfant maintient une excellente performance globale avec une
            moyenne de 14.2/20.
          </p>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-cyan-700">Présence</h3>
          </div>
          <p className="text-cyan-600 text-sm">
            Taux de présence de 95% ce mois-ci. 1 retard justifié enregistré.
          </p>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-cyan-700">Comportement</h3>
          </div>
          <p className="text-cyan-600 text-sm">
            Comportement évalué comme "Excellent" par l'équipe pédagogique.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Composant ScheduleSection MIS À JOUR pour afficher la grille ---

const ScheduleSection = () => {
  const [selectedDay, setSelectedDay] = useState("Jeu");
  const [isWeekView, setIsWeekView] = useState(true);

  const renderDayScheduleList = (day: string) => {
    const courses = scheduleData[day] || [];
    if (courses.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          Aucun cours prévu.
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {courses.map((cours, index) => {
          const colorClass = getClassColor(cours.subject);
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl shadow-sm group ${colorClass}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-md">
                    {cours.subject}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-500" />
                      {cours.room}
                    </span>
                    <span className="text-xs text-gray-500">
                      {cours.teacher}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-md text-teal-500">
                  {cours.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

const renderWeekScheduleGrid = () => {
  const headerClasses =
    "p-3 text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-200 sticky top-0 z-20 bg-gray-50";

  return (
    <div className="overflow-x-auto min-h-[600px] border border-gray-200 rounded-2xl relative shadow-sm bg-white">
      <div
        className="grid gap-0 relative min-w-max" // Ajout de min-w-max
        style={{
          gridTemplateColumns: "70px repeat(5, minmax(160px, 1fr))",
          gridTemplateRows: `repeat(41, minmax(32px, auto))`,
        }}
      >
        {/* EN-TÊTE DE LA GRILLE (Jours) */}
        <div
          className={`${headerClasses} sticky left-0 z-30 bg-white border-r-2`} // z-30 augmenté
        >
          Heure
        </div>
        {DAYS.map((day) => (
          <div
            key={day}
            className={`${headerClasses} text-center sticky top-0 z-30`} // Ajout de sticky top-0 et z-30
            style={{ gridColumn: DAYS.indexOf(day) + 2 }}
          >
            <div className="font-bold text-sm">
              {DAY_LABELS[day as keyof typeof DAY_LABELS].split(" ")[0]}
            </div>
            <div className="text-xs font-normal text-gray-500 mt-0.5">
              {DAY_LABELS[day as keyof typeof DAY_LABELS]
                .split(" ")
                .slice(1)
                .join(" ")}
            </div>
          </div>
        ))}

        {/* GRILLE HORAIRE ET COURS */}
        {Array.from({ length: 40 }).map((_, i) => {
          const isHourMark = i % 4 === 0;
          const time = TIME_SLOTS[i];
          const timeDisplay = isHourMark ? time.substring(0, 5) : null;
          const row = i + 2;

          return (
            <div key={`row-${i}`} style={{ gridRow: row }} className="contents">
              <div
                className={`text-xs text-gray-600 p-2 text-right sticky left-0 border-r-2 border-gray-200 bg-white ${
                  isHourMark ? "font-semibold pt-3" : ""
                }`}
                style={{ gridColumn: 1 }}
              >
                {timeDisplay}
              </div>

              {DAYS.map((day, dayIndex) => (
                <div
                  key={`${day}-${i}`}
                  style={{ gridColumn: dayIndex + 2 }}
                  className={`border-b ${
                    isHourMark
                      ? "border-t border-gray-200"
                      : "border-t border-gray-100"
                  } border-r border-gray-100`}
                >
                  {/* Espace pour le cours */}
                </div>
              ))}
            </div>
          );
        })}

        {/* PLACEMENT DES COURS */}
        {DAYS.flatMap((day, dayIndex) =>
          scheduleData[day].map((cours, index) => {
            const colorClass = getClassColor(cours.subject);
            return (
              <div
                key={`${day}-${index}`}
                className={`absolute shadow-sm rounded-xl p-3 text-sm z-10 overflow-hidden cursor-pointer ${colorClass}`}
                style={{
                  gridColumn: dayIndex + 2,
                  gridRow: cours.gridRow,
                  marginLeft: "3px",
                  marginRight: "3px",
                  marginTop: "80px",
                  marginBottom: "2px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "auto",
                }}
              >
                <div className="font-bold text-sm leading-tight mb-1">
                  {cours.subject}
                </div>
                <div className="text-xs font-medium opacity-80 leading-snug mb-1">
                  {cours.time}
                </div>
                <div className="text-xs opacity-70 leading-snug">
                  <div>{cours.room}</div>
                  <div className="mt-0.5">{cours.teacher}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-cyan-500">Emploi du temps</h2>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setIsWeekView(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !isWeekView
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-cyan-50"
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setIsWeekView(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isWeekView
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-cyan-50"
              }`}
            >
              Semaine
            </button>
          </div>
        </div>

        {isWeekView ? (
          renderWeekScheduleGrid()
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {DAYS.map((jour) => (
                <button
                  key={jour}
                  onClick={() => setSelectedDay(jour)}
                  className={`p-3 rounded-xl border font-medium transition-all duration-200 ${
                    selectedDay === jour
                      ? "border-cyan-500 bg-cyan-500 text-white shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:bg-cyan-50"
                  }`}
                >
                  <div className="text-sm font-semibold">{jour}</div>
                  <div className="text-xs opacity-80">
                    {DAY_LABELS[jour as keyof typeof DAY_LABELS].split(" ")[1]}
                  </div>
                </button>
              ))}
            </div>
            {renderDayScheduleList(selectedDay)}
          </>
        )}
      </div>
    </div>
  );
};

// --- Composants de section existants ---

const ActiveSection = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "overview":
      return <OverviewSection />;
    case "schedule":
      return <ScheduleSection />;
    default:
      return <OverviewSection />;
  }
};

export default function ParentStudentDashboard() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadCount = 3;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-cyan-600">Espace famille</h2>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              const colorClass = item.color === "pink" ? "pink" : "cyan";

              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? colorClass === "pink"
                          ? "bg-pink-50 text-pink-600 shadow-sm border border-pink-200"
                          : "bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? colorClass === "pink"
                            ? "text-pink-600"
                            : "text-cyan-600"
                          : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        isActive
                          ? colorClass === "pink"
                            ? "text-pink-600"
                            : "text-cyan-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          onClick={() => setSidebarOpen(false)}
        />

        <aside className="relative w-72 bg-white h-full border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-cyan-600">EduConnect</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200">
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(Number(e.target.value))}
            >
              {students.map((student, index) => (
                <option key={student.id} value={index}>
                  {student.name} - {student.grade}
                </option>
              ))}
            </select>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                const colorClass = item.color === "pink" ? "pink" : "cyan";

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? colorClass === "pink"
                            ? "bg-pink-50 text-pink-600 shadow-sm border border-pink-200"
                            : "bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? colorClass === "pink"
                              ? "text-pink-600"
                              : "text-cyan-600"
                            : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isActive
                            ? colorClass === "pink"
                              ? "text-pink-600"
                              : "text-cyan-600"
                            : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-cyan-100 transition-colors duration-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-cyan-500" />
            </button>

            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-800">
                {students[selectedStudent].name}
              </h1>
              <p className="text-sm text-gray-500">
                {students[selectedStudent].grade} • Dernière mise à jour:{" "}
                {students[selectedStudent].lastUpdate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-cyan-100 transition-colors relative"
              >
                <Bell className="w-6 h-6 text-cyan-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-pink-600 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount} non lues
                      </span>
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
                            className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              index < unreadCount
                                ? colors.bg + " bg-opacity-10"
                                : ""
                            }`}
                          >
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
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button className="w-full text-center text-cyan-500 font-medium text-sm py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-500" />
                </div>
                <span className="text-sm font-medium text-gray-800 hidden md:inline">
                  M. Habib 50W
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          M. Habib 50W
                        </p>
                        <p className="text-sm text-gray-500">Parent</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Mon profil</span>
                      </button>
                      <button className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {navigationItems.find((item) => item.id === activeTab)?.label}
            </h2>
          </div>

          <ActiveSection activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
}
