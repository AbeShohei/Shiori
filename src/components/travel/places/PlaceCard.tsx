import React from 'react';
import { MapPin, Star, Clock, Phone, Globe, Heart, Edit3, Trash2 } from 'lucide-react';

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
 * 観光スポットカードコンポーネントのプロパティ
 * 
 * @param place - 観光スポットデータ
 * @param onToggleFavorite - お気に入り切り替え時のコールバック
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 */
interface PlaceCardProps {
  place: Place;
  onToggleFavorite: (id: string) => void;
  onEdit: (place: Place) => void;
  onDelete: (placeId: string) => void;
}

/**
 * 観光スポットカードコンポーネント
 * 観光スポットの詳細情報を表示し、お気に入り・編集・削除機能を提供
 */
const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* 画像エリア */}
      <div className="relative">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-full h-48 object-cover"
        />
        
        {/* お気に入りボタン */}
        <button
          onClick={() => onToggleFavorite(place.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            place.isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
          aria-label={place.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          <Heart className={`h-4 w-4 ${place.isFavorite ? 'fill-current' : ''}`} />
        </button>
        
        {/* カテゴリバッジ */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
            {place.category}
          </span>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-4 flex flex-col h-full">
        {/* タイトルと評価 */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{place.rating}</span>
          </div>
        </div>
        
        {/* 説明 */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
        
        {/* 基本情報 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{place.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{place.openingHours}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{place.priceRange}</span>
          </div>
        </div>
        
        {/* 連絡先情報 */}
        {(place.phone || place.website) && (
          <div className="space-y-1 mb-4">
            {place.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{place.phone}</span>
              </div>
            )}
            {place.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-3 w-3" />
                <a 
                  href={place.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {place.website}
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* 操作ボタン */}
        <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
          <button
            onClick={() => onEdit(place)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            編集
          </button>
          <button
            onClick={() => onDelete(place.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard; 