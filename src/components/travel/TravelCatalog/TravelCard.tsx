import React from 'react';
import { Calendar, MapPin, Users, DollarSign, Edit3, Trash2, Eye, Star, Moon, Clock } from 'lucide-react';
import { Travel } from '../../../types/Travel';

/**
 * 旅行カードコンポーネントのプロパティ
 * 
 * @param travel - 表示する旅行データ
 * @param onSelect - 旅行選択時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 * @param onUpdate - 更新時のコールバック
 */
interface TravelCardProps {
  travel: Travel;
  onSelect: (travel: Travel) => void;
  onDelete: (travelId: string) => Promise<void>;
  onUpdate: (updatedTravel: Travel) => Promise<void>;
}

/**
 * 旅行カードコンポーネント
 * 旅行の基本情報を表示し、選択・編集・削除の操作を提供
 */
const TravelCard: React.FC<TravelCardProps> = ({ 
  travel, 
  onSelect, 
  onDelete,
  onUpdate
}) => {
  /**
   * 旅行のステータスに応じた色とラベルを取得
   */
  const getStatusInfo = (status: Travel['status']) => {
    switch (status) {
      case 'planning':
        return { color: 'bg-yellow-100 text-yellow-800', label: '計画中' };
      case 'confirmed':
        return { color: 'bg-green-100 text-green-800', label: '確定済み' };
      case 'completed':
        return { color: 'bg-gray-100 text-gray-800', label: '完了' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: '' };
    }
  };

  /**
   * 宿泊日数を計算
   */
  const getNightsCount = () => {
    if (travel.duration) {
      // "3泊4日" のような形式から宿泊日数を抽出
      const match = travel.duration.match(/(\d+)泊/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  };

  // 日付だけを抽出する関数
  const getDateOnly = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const statusInfo = getStatusInfo(travel.status);
  const nightsCount = getNightsCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full">
      {/* 画像エリア */}
      <div className="relative">
        <img 
          src={travel.image} 
          alt={travel.title}
          className="w-full h-48 object-cover"
        />
        
        {/* ステータスバッジ */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* 宿泊日数バッジ */}
        {nightsCount > 0 && (
          <div className="absolute top-3 right-3">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
              <Moon className="h-3 w-3" />
              <span>{nightsCount}泊</span>
            </div>
          </div>
        )}
      </div>

      {/* コンテンツエリア */}
      <div className="p-4 flex flex-col flex-1">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-gray-100">{travel.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{travel.destination}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current dark:text-yellow-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{travel.rating}</span>
          </div>
        </div>
        
        {/* 説明 */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2 dark:text-gray-200">{travel.description}</p>
        
        {/* 基本情報 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{travel.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{travel.dates}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>{travel.memberCount}名</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4" />
            <span>¥{travel.budget.toLocaleString()}</span>
          </div>
          {nightsCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Moon className="h-4 w-4" />
              <span>{nightsCount}泊</span>
            </div>
          )}
        </div>
        
        {/* フッター */}
        <div className="flex flex-col mt-auto">
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>4.8</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 text-right min-w-[90px]">
                更新: {getDateOnly(travel.updatedAt)}
              </span>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onSelect(travel)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 h-10 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:text-gray-100 dark:hover:bg-blue-900"
              >
                <Eye className="h-4 w-4" />
                詳細を見る
              </button>
              <button
                onClick={() => onDelete(travel.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 h-10 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4" />
                削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelCard; 