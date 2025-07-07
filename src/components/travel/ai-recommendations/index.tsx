import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AIPreferences from './AIPreferences';
import RecommendationCard from './RecommendationCard';
import Button from '../../common/Button';
import { aiApi, GenerateRecommendationsRequest, AIRecommendation } from '../../../services/api';

/**
 * AI推薦の型定義
 */
interface AIRecommendation {
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
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
}

/**
 * 旅行設定の型定義
 */
interface TravelPreferences {
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
}

/**
 * AI推薦タブコンポーネントのプロパティ
 * 
 * @param onAddToPlaces - 場所に追加時のコールバック
 */
interface AIRecommendationsTabProps {
  onAddToPlaces?: (place: any) => void;
}

/**
 * AI推薦タブコンポーネント
 * AIによる旅行推薦の管理、設定変更、フィードバック機能を提供
 */
const AIRecommendationsTab: React.FC<AIRecommendationsTabProps> = ({ onAddToPlaces }) => {
  // 旅行設定の状態
  const [preferences, setPreferences] = useState<GenerateRecommendationsRequest>({
    destination: '',
    region: '',
    interests: ['歴史・文化', '自然・景色', 'グルメ'],
    budget: 'medium',
    travelStyle: 'balanced',
    groupSize: 4,
    duration: 4,
    customNote: ''
  });

  // AI推薦の状態
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * AI推薦を生成
   */
  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      console.log('AI推薦リクエスト送信前 destination:', preferences.destination);
      const res = await aiApi.generateRecommendations(preferences);
      if (res.success) {
        setRecommendations(res.recommendations.map((rec, idx) => ({ ...rec, id: rec.id || String(idx + 1) })));
      } else {
        setRecommendations([]);
        alert(res.message || res.error || 'AI推薦の生成に失敗しました');
      }
    } catch (e) {
      setRecommendations([]);
      alert('AI推薦の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * ブックマークの切り替え
   */
  const toggleBookmark = (id: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, isBookmarked: !rec.isBookmarked } : rec
    ));
  };

  /**
   * 場所に追加
   */
  const addToPlaces = (recommendation: AIRecommendation) => {
    const place = {
      id: Date.now().toString(),
      name: recommendation.name,
      category: recommendation.category,
      rating: recommendation.rating,
      image: recommendation.image,
      description: recommendation.description,
      address: recommendation.address || '',
      phone: recommendation.phone,
      website: recommendation.website,
      openingHours: recommendation.openingHours || '',
      priceRange: recommendation.priceRange,
      isFavorite: false
    };

    if (onAddToPlaces) {
      onAddToPlaces(place);
    }
    
    // ブックマークに追加
    toggleBookmark(recommendation.id);
  };

  /**
   * フィードバック処理
   */
  const handleFeedback = (id: string, isPositive: boolean) => {
    // フィードバックをAIに送信する処理
    console.log(`Feedback for ${id}: ${isPositive ? 'positive' : 'negative'}`);
  };

  return (
    <div className="space-y-6">
      {/* AI設定 */}
      <AIPreferences
        preferences={preferences}
        onPreferencesChange={setPreferences}
      />

      {/* 推薦生成ボタン */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="px-8 py-3"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '推薦を生成中...' : '新しい推薦を生成'}
        </Button>
      </div>

      {/* 推薦一覧 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          AI推薦 ({recommendations.length}件)
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onToggleBookmark={toggleBookmark}
                onAddToPlaces={addToPlaces}
                onFeedback={handleFeedback}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">AI推薦がありません</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              設定を調整して「新しい推薦を生成」ボタンを押してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsTab; 