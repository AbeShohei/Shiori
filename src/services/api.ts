import axios from 'axios';
import { Travel, TravelFormData } from '../types/Travel';

// Supabase Edge FunctionsのベースURL
// 本番環境では実際のSupabaseプロジェクトURLに変更してください
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-project-ref.supabase.co/functions/v1/travel-api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateTravelRequest {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
  schedule?: any[];
  places?: any[];
  budgetBreakdown?: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
  };
}

export interface GeneratePlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}

export interface GeneratedPlan {
  schedule: Array<{
    date: string;
    day: string;
    items: Array<{
      time: string;
      title: string;
      location: string;
      description: string;
      category: string;
    }>;
  }>;
  places: Array<{
    name: string;
    category: string;
    rating: number;
    description: string;
  }>;
  budget: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
  };
  recommendations: {
    mustVisit: string[];
    localFood: string[];
    tips: string[];
  };
}

export interface GeneratePlanResponse {
  success: boolean;
  plan: GeneratedPlan;
  message?: string;
  error?: string;
}

export interface AIRecommendation {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  aiReason: string;
  matchScore: number;
  estimatedTime: string;
  priceRange: string;
  tags: string[];
  isBookmarked: boolean;
}

export interface GenerateRecommendationsRequest {
  destination: string;
  region?: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
  customNote?: string;
}

export interface GenerateRecommendationsResponse {
  success: boolean;
  recommendations: AIRecommendation[];
  message?: string;
  error?: string;
}

export const travelApi = {
  // 全ての旅行を取得
  getAll: async (): Promise<Travel[]> => {
    const response = await api.get('/travels');
    return response.data;
  },

  // 特定の旅行を取得
  getById: async (id: string): Promise<Travel> => {
    const response = await api.get(`/travels/${id}`);
    return response.data;
  },

  // AIプランを生成
  generatePlan: async (planData: GeneratePlanRequest): Promise<GeneratePlanResponse> => {
    const response = await api.post('/travels/generate-plan', planData);
    return response.data;
  },

  // 新しい旅行を作成
  create: async (travelData: CreateTravelRequest): Promise<Travel> => {
    const response = await api.post('/travels', travelData);
    return response.data;
  },

  // 旅行を更新
  update: async (id: string, travelData: Partial<Travel>): Promise<Travel> => {
    const response = await api.put(`/travels/${id}`, travelData);
    return response.data;
  },

  // 旅行を削除
  delete: async (id: string): Promise<void> => {
    await api.delete(`/travels/${id}`);
  },

  // 画像OCR＋人名抽出
  extractNamesFromImage: async (imageBase64: string): Promise<string[]> => {
    const response = await api.post('/travels/extract-names-from-image', { imageBase64 });
    return response.data.names;
  },
};

export const aiApi = {
  generateRecommendations: async (prefs: GenerateRecommendationsRequest): Promise<GenerateRecommendationsResponse> => {
    const response = await api.post('/travels/ai/recommend', prefs);
    return response.data;
  }
};

export default api; 