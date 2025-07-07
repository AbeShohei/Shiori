import React from 'react';
import { MapPin, Edit3, Trash2, Utensils, Bus, Bed } from 'lucide-react';

/**
 * スケジュールアイテムの型定義
 */
interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation';
}

/**
 * スケジュールアイテムコンポーネントのプロパティ
 * 
 * @param item - スケジュールアイテムデータ
 * @param isFirst - 最初のアイテムかどうか
 * @param isLast - 最後のアイテムかどうか
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 */
interface ScheduleItemProps {
  item: ScheduleItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (itemId: string) => void;
}

/**
 * スケジュールアイテムコンポーネント
 * 個別のスケジュールアイテムを表示し、編集・削除機能を提供
 */
const ScheduleItemComponent: React.FC<ScheduleItemProps> = ({
  item,
  isFirst,
  isLast,
  onEdit,
  onDelete
}) => {
  /**
   * カテゴリに応じた色を取得
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sightseeing': return 'bg-blue-100 text-blue-800';
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'transport': return 'bg-green-100 text-green-800';
      case 'accommodation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * カテゴリに応じたラベルを取得
   */
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sightseeing': return '観光';
      case 'food': return '食事';
      case 'transport': return '移動';
      case 'accommodation': return '宿泊';
      default: return '';
    }
  };

  /**
   * カテゴリに応じたアイコンを返す
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sightseeing': return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'food': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'transport': return <Bus className="w-5 h-5 text-green-500" />;
      case 'accommodation': return <Bed className="w-5 h-5 text-purple-500" />;
      default: return null;
    }
  };

  // カテゴリごとの丸の色
  const getCircleColor = (category: string) => {
    switch (category) {
      case 'sightseeing': return 'bg-blue-500';
      case 'food': return 'bg-orange-500';
      case 'transport': return 'bg-green-500';
      case 'accommodation': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  // アイコンの色（白抜き）
  const getIconColor = () => 'text-white';

  return (
    <div className="flex relative bg-transparent m-0 p-0">
      {/* タイムライン（丸＋上下線） */}
      <div className="relative w-12 min-w-[48px] max-w-[48px] flex flex-col items-center m-0 p-0">
        {/* タイムラインの直線 */}
        <div className={`absolute left-1/2 ${isFirst ? 'top-[20px]' : 'top-0'} ${isLast ? 'bottom-[20px]' : 'bottom-0'} w-px bg-gray-200 -translate-x-1/2 z-0`} />
        {/* 丸いアイコン */}
        <div className={`relative z-10 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow ring-2 ring-gray-200 ${getCircleColor(item.category)} m-0 p-0`}>
          {item.category === 'sightseeing' && <MapPin className={`w-5 h-5 ${getIconColor()}`} />}
          {item.category === 'food' && <Utensils className={`w-5 h-5 ${getIconColor()}`} />}
          {item.category === 'transport' && <Bus className={`w-5 h-5 ${getIconColor()}`} />}
          {item.category === 'accommodation' && <Bed className={`w-5 h-5 ${getIconColor()}`} />}
        </div>
      </div>
      {/* 内容 */}
      <div className="flex-1 py-2 pl-2">
        <div className="flex items-center mb-1">
          <span className="text-sm font-medium text-gray-600 mr-2">
            {item.time ? item.time : '時間未定'}
          </span>
          <h4 className="font-medium text-gray-900">{item.title}</h4>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 場所 */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin className="h-3 w-3" />
              {item.location}
            </div>
            {/* 説明 */}
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
          {/* 操作ボタン */}
          <div className="flex gap-2 ml-4">
            <button 
              onClick={() => onEdit(item)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="予定を編集"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              aria-label="予定を削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleItemComponent; 