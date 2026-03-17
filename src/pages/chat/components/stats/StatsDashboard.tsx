import React, { useState, useEffect, useCallback } from "react";
import { Users, MessageCircle, Clock, X, TrendingUp } from "lucide-react";
import { statsService } from "../../services/statsService";
import type {
  MessageByDay,
  PeakHour,
  TopInterlocutor,
  UserStatsResponse,
} from "../../types/stats.type";

interface StatsDashboardProps {
  onClose: () => void;
}

type PeriodType = "week" | "month" | "year";

const StatsDashboard: React.FC<StatsDashboardProps> = ({ onClose }) => {
  const [period, setPeriod] = useState<PeriodType>("week");
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data: UserStatsResponse = await statsService.getUserStats(period);
      setStats(data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3 border border-zinc-200">
          <div className="h-5 w-5 rounded-full border-2 border-zinc-200 border-t-cyan-500 animate-spin"></div>
          <p className="text-zinc-600 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const peakHour: PeakHour | undefined = stats?.peakHours?.reduce(
    (max, current) => (current.count > max.count ? current : max),
    { hour: 0, count: 0 },
  );

  const messagesByDay = stats?.messagesByDay ?? [];
  const maxDayCount = messagesByDay.length
    ? Math.max(...messagesByDay.map((d) => d.count))
    : 1;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-50 rounded-xl w-[800px] max-w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header Compact */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-4 flex justify-between items-center border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-cyan-500 rounded-full"></div>
            Statistiques
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-pink-500 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Sélecteur de période miniature */}
          <div className="flex gap-1.5 mb-5">
            {(["week", "month", "year"] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  period === p
                    ? "bg-zinc-800 text-white shadow-md"
                    : "bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200"
                }`}
              >
                {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
              </button>
            ))}
          </div>

          {/* Grille de KPIs compacte */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Messages",
                val: stats?.totalMessages,
                icon: MessageCircle,
                color: "text-cyan-600",
                bg: "bg-cyan-50",
              },
              {
                label: "Contacts",
                val: stats?.topInterlocutors?.length,
                icon: Users,
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                label: "Pic",
                val: `${peakHour?.hour || 0}h`,
                icon: Clock,
                color: "text-zinc-600",
                bg: "bg-zinc-100",
              },
              {
                label: "Moyenne/j",
                val: Math.round(
                  (stats?.totalMessages || 0) /
                    (stats?.messagesByDay?.length || 1),
                ),
                icon: TrendingUp,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`${item.bg} ${item.color} p-1.5 rounded-lg`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-lg font-black text-zinc-800 leading-tight">
                      {item.val || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Volume d'échanges */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Volume d'échanges
              </h3>
              <div className="space-y-3">
                {stats?.messagesByDay?.map((day: MessageByDay) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-zinc-500 w-12 shrink-0">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${(day.count / maxDayCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-700 w-6 text-right">
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Interlocuteurs */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Interactions
              </h3>
              <div className="space-y-1.5">
                {stats?.topInterlocutors?.map(
                  (inter: TopInterlocutor, index) => (
                    <div
                      key={inter.interlocutorId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all"
                    >
                      <span
                        className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded ${
                          index === 0
                            ? "bg-pink-100 text-pink-600"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-700 flex-1 truncate">
                        {inter.name || `User ${inter.interlocutorId}`}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {inter.count}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
