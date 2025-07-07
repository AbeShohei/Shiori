import React from 'react';
import { Plus, Edit3, ChevronUp, ChevronDown } from 'lucide-react';
import ScheduleItemComponent from './ScheduleItem';

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
 * 日別スケジュールの型定義
 */
interface DaySchedule {
  date: string;
  day: string;
  dayTitle?: string;
  daySubtitle?: string;
  items: ScheduleItem[];
}

/**
 * 日別スケジュールコンポーネントのプロパティ
 * 
 * @param day - 日別スケジュールデータ
 * @param dayIndex - 日付のインデックス
 * @param onAddItem - アイテム追加時のコールバック
 * @param onEditItem - アイテム編集時のコールバック
 * @param onDeleteItem - アイテム削除時のコールバック
 * @param onEditDay - 日付編集時のコールバック
 * @param onReorderItems - アイテム並び替え時のコールバック
 */
interface DayScheduleProps {
  day: DaySchedule;
  dayIndex: number;
  onAddItem: (dayIndex: number) => void;
  onEditItem: (item: ScheduleItem, dayIndex: number) => void;
  onDeleteItem: (itemId: string, dayIndex: number) => void;
  onEditDay: (day: DaySchedule, dayIndex: number) => void;
  onReorderItems?: (newItems: ScheduleItem[], dayIndex: number) => void;
}

/**
 * 移動可能なスケジュールアイテムコンポーネント
 */
const MovableScheduleItem: React.FC<{
  item: ScheduleItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (itemId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = ({ item, isFirst, isLast, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ScheduleItemComponent
        item={item}
        isFirst={isFirst}
        isLast={isLast}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      
      {/* 移動ボタン */}
      {isHovered && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
          {!isFirst && (
            <button
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
              aria-label="上に移動"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
              aria-label="下に移動"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 日別スケジュールコンポーネント
 * 1日分のスケジュールを表示し、アイテムの管理機能を提供
 */
const DayScheduleComponent: React.FC<DayScheduleProps> = ({
  day,
  dayIndex,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onEditDay,
  onReorderItems
}) => {
  // アイテムを上に移動
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...day.items];
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      if (onReorderItems) {
        onReorderItems(newItems, dayIndex);
      }
    }
  };

  // アイテムを下に移動
  const handleMoveDown = (index: number) => {
    if (index < day.items.length - 1) {
      const newItems = [...day.items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      if (onReorderItems) {
        onReorderItems(newItems, dayIndex);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-row items-center gap-2 md:gap-6">
              <div className="flex flex-col gap-1 min-w-fit">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{day.day}</h3>
                  <button 
                    onClick={() => onEditDay(day, dayIndex)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label="日程タイトルを編集"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">{day.date}</p>
              </div>
              {day.dayTitle && (
                <div className="flex flex-col">
                  <h4 className="text-md font-medium text-gray-800">{day.dayTitle}</h4>
                  {day.daySubtitle && (
                    <span className="text-sm text-gray-600">{day.daySubtitle}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-auto flex justify-end">
            {/* スマホ：丸アイコンボタン */}
            <button
              onClick={() => onAddItem(dayIndex)}
              className="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 shadow-md hover:bg-blue-700 transition-colors md:hidden"
              aria-label="予定を追加"
            >
              <Plus className="h-5 w-5" />
            </button>
            {/* PC：従来のボタン */}
            <button 
              onClick={() => onAddItem(dayIndex)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>予定を追加</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* スケジュールアイテム一覧 */}
      <div className="p-6">
        <div className="space-y-0">
          {day.items.length > 0 ? (
            day.items.map((item, idx) => (
              <MovableScheduleItem
                key={item.id}
                item={item}
                isFirst={idx === 0}
                isLast={idx === day.items.length - 1}
                onEdit={(item) => onEditItem(item, dayIndex)}
                onDelete={(itemId) => onDeleteItem(itemId, dayIndex)}
                onMoveUp={() => handleMoveUp(idx)}
                onMoveDown={() => handleMoveDown(idx)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>予定がありません</p>
              <p className="text-sm mt-1">「予定を追加」ボタンから予定を追加してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayScheduleComponent; 