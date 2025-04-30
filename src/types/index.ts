// Type definitions for the ChoreChamp application

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isParent: boolean;
  stripeCustomerId?: string;
  isPremium?: boolean;
  walletBalance?: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarURL: string;
  avatar?: string; // Emoji avatar
  parentId: string;
  points: number;
  streakCount: number;
  createdAt: number;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  dueDate: number; // timestamp
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  assignedTo: string; // childId
  completedAt?: number; // timestamp
  status: 'pending' | 'completed' | 'overdue' | 'skipped';
  createdBy: string; // parentId
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  reminders: Reminder[];
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: number; // timestamp
}

export interface Reminder {
  id: string;
  time: number; // timestamp
  sent: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  image?: string;
  isCashReward: boolean;
  cashValue?: number; // in cents
  isAvailable: boolean;
  createdBy: string; // parentId
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  childId: string;
  pointsSpent: number;
  cashValue?: number; // in cents
  status: 'pending' | 'approved' | 'denied';
  redeemedAt: number; // timestamp
  processedAt?: number; // timestamp
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward';
  amount: number; // in cents
  description: string;
  childId?: string;
  parentId: string;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface SharedList {
  id: string;
  title: string;
  type: 'shopping' | 'project' | 'notes';
  items: SharedListItem[];
  createdBy: string; // parentId
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface SharedListItem {
  id: string;
  text: string;
  completed: boolean;
  createdBy: string; // userId
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface ChildAnalytics {
  childId: string;
  completedChores: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
  averageTimeToComplete: number; // in hours
  lastUpdated: number; // timestamp
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'chore' | 'reward' | 'streak' | 'wallet' | 'system';
  data?: any;
  read: boolean;
  userId: string;
  createdAt: number; // timestamp
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
  allDay: boolean;
  location?: string;
  choreId?: string;
  calendarId?: string; // external calendar ID
  externalId?: string; // ID in external calendar
  recurringEventId?: string;
  color?: string;
}

// Redux State Interfaces
export interface AppState {
  auth: AuthState;
  chores: ChoresState;
  children: ChildrenState;
  rewards: RewardsState;
  wallet: WalletState;
  lists: ListsState;
  analytics: AnalyticsState;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ChoresState {
  chores: Record<string, Chore>;
  loading: boolean;
  error: string | null;
}

export interface ChildrenState {
  children: Record<string, ChildProfile>;
  selectedChildId: string | null;
  loading: boolean;
  error: string | null;
}

export interface RewardsState {
  rewards: Record<string, Reward>;
  redemptions: Record<string, RewardRedemption>;
  loading: boolean;
  error: string | null;
}

export interface WalletState {
  balance: number;
  transactions: Record<string, Transaction>;
  pointToMoneyRatio: number; // cents per point
  loading: boolean;
  error: string | null;
}

export interface ListsState {
  lists: Record<string, SharedList>;
  loading: boolean;
  error: string | null;
}

export interface AnalyticsState {
  childAnalytics: Record<string, ChildAnalytics>;
  loading: boolean;
  error: string | null;
}