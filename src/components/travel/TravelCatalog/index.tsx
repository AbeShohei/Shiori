import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import TravelCard from './TravelCard';
import TravelFilters from './TravelFilters';
import TravelCatalogHeader from './TravelCatalogHeader';
import { Travel } from '../../../types/Travel';
import { travelApi } from '../../../services/api';

/**
 * 旅行カタログコンポーネントのプロパティ
 * 
 * @param onSelectTravel - 旅行選択時のコールバック
 * @param onCreateNew - 新しい旅行作成時のコールバック
 */
interface TravelCatalogProps {
  onSelectTravel: (travel: Travel) => void;
  onCreateNew: () => void;
}

/**
 * 旅行カタログコンポーネント
 * 旅行一覧を表示し、検索・フィルタリング機能を提供
 */
const TravelCatalog: React.FC<TravelCatalogProps> = ({ 
  onSelectTravel, 
  onCreateNew 
}) => {
  // 旅行データ
  const [travels, setTravels] = useState<Travel[]>([]);
  
  // ローディング状態
  const [loading, setLoading] = useState(true);
  
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    destination: 'all'
  });

  // フィルター表示状態
  const [showFilters, setShowFilters] = useState(false);

  /**
   * 旅行データを取得
   */
  const fetchTravels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await travelApi.getAll();
      setTravels(data);
    } catch (err) {
      console.error('旅行データ取得エラー:', err);
      setError('旅行データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 旅行を削除
   */
  const handleDeleteTravel = async (id: string) => {
    try {
      await travelApi.delete(id);
      setTravels(prev => prev.filter(travel => travel.id !== id));
    } catch (err) {
      console.error('旅行削除エラー:', err);
      setError('旅行の削除に失敗しました');
    }
  };

  /**
   * 旅行を更新
   */
  const handleUpdateTravel = async (updatedTravel: Travel) => {
    try {
      const updated = await travelApi.update(updatedTravel.id, updatedTravel);
      setTravels(prev => prev.map(travel => 
        travel.id === updated.id ? updated : travel
    ));
    } catch (err) {
      console.error('旅行更新エラー:', err);
      setError('旅行の更新に失敗しました');
    }
  };

  // 初回読み込み時にデータを取得
  useEffect(() => {
    fetchTravels();
  }, []);

  /**
   * フィルタリングされた旅行を取得
   */
  const filteredTravels = travels.filter(travel => {
    const matchesSearch = travel.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         travel.destination.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || travel.status === filters.status;
    const matchesDestination = filters.destination === 'all' || travel.destination === filters.destination;
    
    return matchesSearch && matchesStatus && matchesDestination;
  });

  /**
   * 検索クエリを更新
   */
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  /**
   * フィルターを更新
   */
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <TravelCatalogHeader onCreateNew={onCreateNew} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索とフィルター */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="旅行を検索..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>
            
            {/* フィルターボタン */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4 dark:text-gray-300" />
              <span>フィルター</span>
            </button>
          </div>
          
          {/* フィルターパネル */}
          {showFilters && (
            <div className="mt-4">
              <TravelFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchTravels}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              再試行
            </button>
          </div>
        )}

        {/* ローディング状態 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* 旅行一覧 */}
        {!loading && !error && (
          <>
            {filteredTravels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {filters.search || filters.status !== 'all' || filters.destination !== 'all'
                    ? '条件に一致する旅行が見つかりません'
                    : 'まだ旅行がありません'
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filters.search || filters.status !== 'all' || filters.destination !== 'all'
                    ? '検索条件を変更するか、新しい旅行を作成してください'
                    : '最初の旅行を作成して、素晴らしい旅の計画を始めましょう'
                  }
                </p>
                {!filters.search && filters.status === 'all' && filters.destination === 'all' && (
                  <button
                    onClick={onCreateNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    新しい旅行を作成
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTravels.map(travel => (
                  <TravelCard
                    key={travel.id || travel._id}
                    travel={{ ...travel, id: travel.id || travel._id }}
                    onSelect={onSelectTravel}
                    onDelete={handleDeleteTravel}
                    onUpdate={handleUpdateTravel}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TravelCatalog; 