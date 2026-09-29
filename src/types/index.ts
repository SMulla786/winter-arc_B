import {
  User,
  UserProfile,
  Meal,
  MealItem,
  Activity,
  WorkoutSession,
  Exercise,
  Expense,
  Receipt,
  WaterLog,
  WeightLog,
  FoodAnalysis,
  Plan,
  PlanFeature,
  Role,
  GoalType,
  DietType,
  LifestyleType,
  MealType,
  ActivityType,
  ExpenseCategory,
} from '@prisma/client';

export type {
  User,
  UserProfile,
  Meal,
  MealItem,
  Activity,
  WorkoutSession,
  Exercise,
  Expense,
  Receipt,
  WaterLog,
  WeightLog,
  FoodAnalysis,
  Plan,
  PlanFeature,
  Role,
  GoalType,
  DietType,
  LifestyleType,
  MealType,
  ActivityType,
  ExpenseCategory,
};

export interface UserAuthInfo {
  id: string;
  email: string;
  name: string;
  role: Role;
  profile: UserProfile | null;
  subscription: any | null;
}

export interface AuthSuccessData {
  user: UserAuthInfo;
  accessToken: string;
  refreshToken: string;
}

export interface MealTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface MealWithItems extends Meal {
  items: MealItem[];
}

export interface DailyMealsResponseData {
  meals: MealWithItems[];
  totals: MealTotals;
  targets: MealTargets;
}

export interface FoodScanResponseData {
  analysis: any;
  imageUrl: string | null;
  foodAnalysisId: string;
}

export interface ReceiptScanResponseData {
  receipt: any;
  imageUrl: string | null;
  receiptId: string;
}

export interface ExpensesResponseData {
  expenses: (Expense & { receipt: Receipt | null })[];
  totalSpent: number;
  categoryTotals: Record<string, number>;
}

export interface WaterLogResponseData {
  totalGlasses: number;
  totalMl: number;
}

export interface WeightHistoryResponseData {
  weightLogs: WeightLog[];
}

export interface AdminStatsResponseData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalMeals: number;
    totalAiScans: number;
  };
  plans: (Plan & { features: PlanFeature[] })[];
}
