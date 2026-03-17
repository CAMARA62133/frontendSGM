// -------------------------
export interface PollOption {
  id: number;
  pollId: number;
  text: string;
  votes: number;
}

export interface PollVote {
  id: number;
  pollId: number;
  optionId: number;
  userId: number;
}

export interface UserSummary {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
}

export interface Poll {
  id: number;
  question: string;
  createdBy: number;
  groupId: number;
  expiresAt: string;
  isActive: boolean;
  options?: PollOption[];
  votesList?: {
    id: number;
    pollId: number;
    optionId: number;
    user: UserSummary;
  }[];
}
