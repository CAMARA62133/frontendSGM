export interface MessageByDay {
  date: string; // format YYYY-MM-DD
  count: number;
}

export interface TopInterlocutor {
  interlocutorId: number;
  name: string;
  count: number;
}

export interface PeakHour {
  hour: number; // 0-23
  count: number;
}

export interface UserStatsResponse {
  messagesByDay: MessageByDay[];
  topInterlocutors: TopInterlocutor[];
  peakHours: PeakHour[];
  totalMessages: number;
}
