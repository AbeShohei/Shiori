import React from 'react';
import { Plus, Moon, Sun } from 'lucide-react';
import Button from '../../common/Button';

/**
 * 旅行カタログヘッダーコンポーネントのプロパティ
 * 
 * @param onCreateNew - 新しい旅行作成ボタンクリック時のコールバック
 */
interface TravelCatalogHeaderProps {
  onCreateNew: () => void;
}

/**
 * 旅行カタログヘッダーコンポーネント
 * アプリのタイトルと新しい旅行作成ボタンを表示
 */
const TravelCatalogHeader: React.FC<TravelCatalogHeaderProps> = ({ onCreateNew }) => {
  const [isDark, setIsDark] = React.useState(
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const body = document.body;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      body.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      body.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-row items-center justify-between gap-4 min-h-[72px]">
          {/* タイトルエリア */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 truncate">旅のしおり</h1>
            <p className="text-blue-100 text-base md:text-lg">あなたの旅行プランを管理しましょう</p>
          </div>
          {/* 右側ボタンエリア */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {/* 新規作成ボタン */}
            <Button
              variant="secondary"
              size="md"
              onClick={onCreateNew}
              className="flex items-center justify-center bg-white text-blue-600 rounded-full !rounded-full w-14 h-14 shadow-md hover:bg-blue-50 transition-colors md:hidden"
              aria-label="新しい旅行を作成"
            >
              <Plus className="h-7 w-7" />
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onCreateNew}
              className="bg-white text-blue-600 hover:bg-blue-50 flex items-center hidden md:flex md:py-3 md:px-6 h-14"
            >
              <Plus className="h-6 w-6 md:mr-2" />
              <span className="hidden md:inline text-lg">新しい旅行を作成</span>
            </Button>
            {/* ダークモード切り替えボタン（いちばん右） */}
            <button
              onClick={toggleDarkMode}
              className="ml-2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-200 transition-colors shadow-md text-blue-600 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700"
              aria-label="ダークモード切り替え"
            >
              {isDark ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TravelCatalogHeader; 