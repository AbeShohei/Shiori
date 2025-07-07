import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { travelApi, GeneratePlanRequest, GeneratedPlan } from '../../../services/api';

interface AIGenerationStepProps {
  travelData: GeneratePlanRequest;
  onPlanGenerated: (plan: GeneratedPlan) => void;
  onError: (error: string) => void;
}

/**
 * AI生成ステップコンポーネント
 * Gemini APIを使用して実際の旅行プランを生成
 */
const AIGenerationStep: React.FC<AIGenerationStepProps> = ({
  travelData,
  onPlanGenerated,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    '目的地の情報を分析中...',
    'おすすめスポットを選定中...',
    'スケジュールを最適化中...',
    '予算配分を計算中...',
    'プランを完成中...'
  ];

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // ステップの進行をシミュレート
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          clearInterval(stepInterval);
          return prev;
        });
      }, 1000);

      // AIプランを生成
      const response = await travelApi.generatePlan(travelData);

      clearInterval(stepInterval);
      setCurrentStep(steps.length - 1);

      if (response.success) {
        // 少し待ってから結果を返す（UXのため）
        setTimeout(() => {
          onPlanGenerated(response.plan);
        }, 500);
      } else {
        setError(response.error || 'AIプラン生成に失敗しました');
        setTimeout(() => {
          onError(response.error || 'AIプラン生成に失敗しました');
        }, 2000);
      }
    } catch (error) {
      console.error('AIプラン生成エラー:', error);
      setError('ネットワークエラーが発生しました');
      setTimeout(() => {
        onError('ネットワークエラーが発生しました');
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setError(null);
    generatePlan();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        {/* アイコンとタイトル */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AIが旅行プランを作成中...
          </h2>
          <p className="text-gray-600">
            あなたの希望に基づいて最適なプランを生成しています
          </p>
        </div>
        
        {/* 進行状況 */}
        <div className="space-y-3 text-left">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              {index < currentStep ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : index === currentStep ? (
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${
                index < currentStep ? 'text-green-600' : 
                index === currentStep ? 'text-blue-600' : 
                'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* ヒント */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Gemini AIがあなたの旅行プランを生成しています。お待ちください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationStep; 