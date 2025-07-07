import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PlaceCard from './PlaceCard';
import PlaceForm from './PlaceForm';
import Modal from '../../common/Modal';
import DeleteConfirmModal from '../TravelCatalog/DeleteConfirmModal';
import Button from '../../common/Button';

/**
 * 観光スポットの型定義
 */
interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  openingHours: string;
  priceRange: string;
  isFavorite: boolean;
}

/**
 * 観光スポットタブコンポーネントのプロパティ
 * 
 * @param initialPlaces - 初期の観光スポットリスト
 */
interface PlacesTabProps {
  initialPlaces?: any[];
}

/**
 * 観光スポットタブコンポーネント
 * 観光スポットの一覧表示、追加、編集、削除機能を提供
 */
const PlacesTab: React.FC<PlacesTabProps> = ({ initialPlaces = [] }) => {
  // 観光スポットデータの状態
  const [places, setPlaces] = useState<Place[]>([]);

  // フィルターとモーダルの状態
  const [selectedCategory, setSelectedCategory] = useState('全てのカテゴリー');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  // カテゴリオプション
  const categories = [
    '全てのカテゴリー', '史跡・遺跡', 'テーマパーク', '自然・景勝地', 'グルメ', 
    'ショッピング', '温泉・スパ', 'アクティビティ', 'その他'
  ];

  /**
   * AI推奨スポットを設定
   */
  useEffect(() => {
    if (initialPlaces.length > 0) {
      // AI生成データをPlace形式に変換
      const aiPlaces: Place[] = initialPlaces.map((place, index) => ({
        id: place.id || `ai-${index}`,
        name: place.name,
        category: place.category,
        rating: place.rating || 4.0,
        image: place.image || 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: place.description,
        address: place.address || '',
        phone: place.phone,
        website: place.website,
        openingHours: place.openingHours || '営業時間未定',
        priceRange: place.priceRange || '価格未定',
        isFavorite: false
      }));
      setPlaces(aiPlaces);
    } else {
      // AI生成データがない場合は空のリスト
      setPlaces([]);
    }
  }, [initialPlaces]);

  /**
   * お気に入り切り替え
   */
  const toggleFavorite = (id: string) => {
    setPlaces(places.map(place => 
      place.id === id ? { ...place, isFavorite: !place.isFavorite } : place
    ));
  };

  /**
   * 観光スポット追加
   */
  const handleAddPlace = () => {
    setShowAddModal(true);
  };

  /**
   * 観光スポット編集
   */
  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setShowEditModal(true);
  };

  /**
   * 観光スポット削除
   */
  const handleDeleteClick = (placeId: string) => {
    setDeletingPlaceId(placeId);
    setShowDeleteConfirm(true);
  };

  /**
   * 削除確認
   */
  const confirmDelete = () => {
    if (deletingPlaceId) {
      setPlaces(places.filter(place => place.id !== deletingPlaceId));
      setShowDeleteConfirm(false);
      setDeletingPlaceId(null);
    }
  };

  /**
   * 新しい観光スポットを保存
   */
  const saveNewPlace = (place: Place) => {
    setPlaces([...places, place]);
    setShowAddModal(false);
  };

  /**
   * 編集した観光スポットを保存
   */
  const saveEditedPlace = (place: Place) => {
    setPlaces(places.map(p => p.id === place.id ? place : p));
    setShowEditModal(false);
    setEditingPlace(null);
  };

  /**
   * フィルタリングされた観光スポットを取得
   */
  const filteredPlaces = selectedCategory === '全てのカテゴリー'
    ? places
    : places.filter(place => place.category === selectedCategory);

  /**
   * 削除対象の観光スポット名を取得
   */
  const getDeletingPlaceName = () => {
    const place = places.find(p => p.id === deletingPlaceId);
    return place?.name || '';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">観光スポット</h2>
        <div className="flex gap-2">
          <label htmlFor="category-filter" className="sr-only">カテゴリでフィルター</label>
          <select 
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button
            variant="primary"
            onClick={handleAddPlace}
          >
            <Plus className="h-4 w-4 mr-2" />
            新しい場所を追加
          </Button>
        </div>
      </div>

      {/* 観光スポットグリッド */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onToggleFavorite={toggleFavorite}
            onEdit={handleEditPlace}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* 観光スポットが見つからない場合のメッセージ */}
      {filteredPlaces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedCategory === '全てのカテゴリー'
              ? '観光スポットがありません。新しいスポットを追加してみましょう！'
              : 'このカテゴリーに一致する観光スポットがありません。'
            }
          </p>
        </div>
      )}

      {/* 追加モーダル */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新しい観光スポットを追加"
        size="lg"
      >
        <PlaceForm
          place={null}
          onSave={saveNewPlace}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPlace(null);
        }}
        title="観光スポットを編集"
        size="lg"
      >
        <PlaceForm
          place={editingPlace}
          onSave={saveEditedPlace}
          onCancel={() => {
            setShowEditModal(false);
            setEditingPlace(null);
          }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title={getDeletingPlaceName()}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingPlaceId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PlacesTab; 