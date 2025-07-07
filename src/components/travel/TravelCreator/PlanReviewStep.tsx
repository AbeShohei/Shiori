import React from 'react';
import { Check, MapPin, Calendar, Users, DollarSign, AlertCircle } from 'lucide-react';
import Button from '../../common/Button';
import { TravelFormData } from '../../../types/Travel';
import { GeneratedPlan } from '../../../services/api';

/**
 * プラン確認ステップコンポーネントのプロパティ
 * 
 * @param formData - フォームデータ
 * @param generatedPlan - 生成されたプラン
 * @param onCreateTravel - 旅行作成時のコールバック
 * @param error - エラーメッセージ
 */
interface PlanReviewStepProps {
  formData: TravelFormData;
  generatedPlan: GeneratedPlan | null;
  onCreateTravel: () => void;
  error?: string | null;
}

/**
 * プラン確認ステップコンポーネント
 * AIが生成した旅行プランを確認し、旅行を作成する
 */
const PlanReviewStep: React.FC<PlanReviewStepProps> = ({
  formData,
  generatedPlan,
  onCreateTravel,
  error
}) => {
  if (!generatedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            プランが見つかりません
          </h2>
          <p className="text-gray-600">
            プランの生成に失敗しました。もう一度お試しください。
          </p>
        </div>
      </div>
    );
  }

  /**
   * 予算の合計を計算
   */
  const totalBudget = Object.values(generatedPlan.budget).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">AIプラン生成完了！</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 旅行概要 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">旅行概要</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">基本情報</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{formData.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formData.startDate} - {formData.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{formData.memberCount}名</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  <span>¥{formData.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">予算配分</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>交通費</span>
                  <span>¥{generatedPlan.budget.transportation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>宿泊費</span>
                  <span>¥{generatedPlan.budget.accommodation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>食事費</span>
                  <span>¥{generatedPlan.budget.food.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>アクティビティ</span>
                  <span>¥{generatedPlan.budget.activities.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 font-medium">
                  <div className="flex justify-between">
                    <span>合計</span>
                    <span>¥{totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* スケジュール */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">スケジュール</h2>
          
          <div className="space-y-4">
            {generatedPlan.schedule.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{day.day}</h3>
                <div className="space-y-2">
                  {day.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-3 text-sm">
                      <span className="text-gray-500 min-w-[60px]">{item.time}</span>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-gray-600">{item.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* おすすめスポット */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">おすすめスポット</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedPlan.places.map((place, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{place.name}</h3>
                  <span className="text-sm text-gray-500">★ {place.rating}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">{place.category}</div>
                <p className="text-sm text-gray-600">{place.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onCreateTravel}
          >
            このプランで旅行を作成
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PlanReviewStep; 