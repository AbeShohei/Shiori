import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TravelForm from './TravelForm';
import AIGenerationStep from './AIGenerationStep';
import PlanReviewStep from './PlanReviewStep';
import Button from '../../common/Button';
import { TravelFormData, Travel } from '../../../types/Travel';
import { travelApi, CreateTravelRequest, GeneratedPlan } from '../../../services/api';

/**
 * 旅行作成のステップ
 */
type CreatorStep = 'form' | 'ai-generation' | 'review';

/**
 * 旅行作成コンポーネントのプロパティ
 * 
 * @param onBack - 戻るボタンクリック時のコールバック
 * @param onComplete - 旅行作成完了時のコールバック
 */
interface TravelCreatorProps {
  onBack: () => void;
  onComplete: (travel: Travel) => void;
}

/**
 * 旅行作成コンポーネント
 * 旅行の基本情報入力からAIプラン生成、確認までの一連の流れを管理
 */
const TravelCreator: React.FC<TravelCreatorProps> = ({ onBack, onComplete }) => {
  // 現在のステップ
  const [step, setStep] = useState<CreatorStep>('form');
  
  // エラー状態
  const [error, setError] = useState<string | null>(null);
  
  // フォームデータ
  const [formData, setFormData] = useState<TravelFormData>({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    memberCount: 2,
    budget: 50000,
    interests: [],
    travelStyle: 'balanced',
    description: ''
  });

  // 生成されたプラン
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  /**
   * AIによるプラン生成を開始
   */
  const generateWithAI = async () => {
    setError(null);
    setStep('ai-generation');
  };

  /**
   * AIプラン生成完了時の処理
   */
  const handlePlanGenerated = (plan: GeneratedPlan) => {
    setGeneratedPlan(plan);
    setStep('review');
  };

  /**
   * AIプラン生成エラー時の処理
   */
  const handlePlanError = (errorMessage: string) => {
    setError(errorMessage);
    setStep('form');
  };

  /**
   * 旅行を作成
   */
  const createTravel = async () => {
    try {
      setError(null);
      
      const travelData: CreateTravelRequest = {
        title: formData.title,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        memberCount: formData.memberCount,
        budget: formData.budget,
        interests: formData.interests,
        travelStyle: formData.travelStyle,
        description: formData.description,
        schedule: generatedPlan?.schedule || [],
        places: generatedPlan?.places || [],
        budgetBreakdown: generatedPlan?.budget || {
          transportation: Math.round(formData.budget * 0.3),
          accommodation: Math.round(formData.budget * 0.4),
          food: Math.round(formData.budget * 0.2),
          activities: Math.round(formData.budget * 0.1)
        }
      };

      const createdTravel = await travelApi.create(travelData);
      onComplete(createdTravel);
    } catch (err) {
      console.error('旅行作成エラー:', err);
      setError('旅行の作成に失敗しました。もう一度お試しください。');
    }
  };

  /**
   * 旅行期間を計算
   */
  const calculateDuration = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;
    return `${nights}泊${days}日`;
  };

  /**
   * 目的地に応じた画像を取得
   */
  const getDestinationImage = (destination: string) => {
    const images = {
      '沖縄': 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600',
      '京都': 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=600',
      '北海道': 'https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=600',
      '東京': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600'
    };
    return images[destination] || 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  // AI生成ステップの表示
  if (step === 'ai-generation') {
    return (
      <AIGenerationStep
        travelData={{
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          memberCount: formData.memberCount,
          budget: formData.budget,
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          description: formData.description
        }}
        onPlanGenerated={handlePlanGenerated}
        onError={handlePlanError}
      />
    );
  }

  // プラン確認ステップの表示
  if (step === 'review') {
    return (
      <PlanReviewStep
        formData={formData}
        generatedPlan={generatedPlan}
        onCreateTravel={createTravel}
        error={error}
      />
    );
  }

  // フォームステップの表示
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">新しい旅行を作成</h1>
          </div>
        </div>
      </header>

      {/* フォーム */}
      <TravelForm
        formData={formData}
        onFormDataChange={setFormData}
        onNext={generateWithAI}
      />
    </div>
  );
};

export default TravelCreator; 