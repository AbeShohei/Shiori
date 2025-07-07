import React from 'react';
import { ArrowLeft, Edit, MapPin, Calendar, Users, Moon } from 'lucide-react';
import Button from './common/Button';

/**
 * ヘッダーコンポーネントのプロパティ
 * 
 * @param title - 旅行タイトル
 * @param destination - 目的地
 * @param duration - 旅行期間
 * @param dates - 旅行日付
 * @param memberCount - 参加人数
 * @param onBack - 戻るボタンクリック時のコールバック
 * @param onEdit - 編集ボタンクリック時のコールバック
 */
interface HeaderProps {
  title: string;
  destination: string;
  duration: string;
  dates: string;
  memberCount: number;
  onBack: () => void;
  onEdit: () => void;
}

/**
 * ヘッダーコンポーネント
 * 旅行の基本情報を表示し、ナビゲーション機能を提供
 */
const Header: React.FC<HeaderProps> = ({
  title,
  destination,
  duration,
  dates,
  memberCount,
  onBack,
  onEdit
}) => {
  /**
   * 宿泊日数を計算
   */
  const getNightsCount = () => {
    if (duration) {
      // "3泊4日" のような形式から宿泊日数を抽出
      const match = duration.match(/(\d+)泊/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  };

  const nightsCount = getNightsCount();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* 編集ボタン（右上固定） */}
          <div className="absolute top-0 right-0 sm:static sm:order-2 z-10">
            <Button
              variant="ghost"
              onClick={onEdit}
              className="p-2 flex-shrink-0"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>

          {/* 左側：戻るボタンとタイトル */}
          <div className="flex flex-row items-start gap-4 w-full min-w-0 sm:order-1">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate max-w-full">{title}</h1>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400 w-full">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{destination}</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{dates}</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{memberCount}名</span>
                </div>
                {nightsCount > 0 && (
                  <div className="flex items-center gap-1 min-w-0">
                    <Moon className="h-4 w-4 flex-shrink-0" />
                    <span>{nightsCount}泊</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;