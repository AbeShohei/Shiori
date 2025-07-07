import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Button from '../../common/Button';

/**
 * 部屋の型定義
 */
interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
}

/**
 * 部屋フォームコンポーネントのプロパティ
 */
interface RoomFormProps {
  room?: Room;
  onSave: (room: Room) => void;
  onCancel: () => void;
  existingRooms?: Room[]; // 既存の部屋リスト（部屋タイプ選択用）
  isBulkAdd?: boolean; // 一括追加モード
  onBulkSave?: (rooms: Room[]) => void; // 一括保存用
}

/**
 * 部屋フォームコンポーネント
 * 部屋の追加・編集を行う
 */
const RoomForm: React.FC<RoomFormProps> = ({ 
  room, 
  onSave, 
  onCancel, 
  existingRooms = [], 
  isBulkAdd = false,
  onBulkSave 
}) => {
  const [formData, setFormData] = useState<Omit<Room, 'id'> & { roomNumber: string }>({
    name: '',
    type: '',
    capacity: 2,
    pricePerNight: 0,
    amenities: [],
    isAvailable: true,
    roomNumber: ''
  });
  const [newAmenity, setNewAmenity] = useState('');
  
  // 一括追加用の状態
  const [bulkData, setBulkData] = useState({
    selectedRoomType: '',
    roomCount: 1,
    startRoomNumber: '',
    baseName: ''
  });

  // 既存の部屋タイプを取得
  const existingRoomTypes = Array.from(new Set(existingRooms.map(r => r.type)));

  // 選択された部屋タイプの情報を取得
  const selectedRoomInfo = existingRooms.find(r => r.type === bulkData.selectedRoomType);

  // 編集時は既存データを設定
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        amenities: [...room.amenities],
        isAvailable: room.isAvailable,
        roomNumber: room.id
      });
    }
  }, [room]);

  /**
   * フォームデータを更新
   */
  const handleInputChange = (field: keyof Omit<Room, 'id'> | 'roomNumber', value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 一括追加データを更新
   */
  const handleBulkInputChange = (field: keyof typeof bulkData, value: any) => {
    setBulkData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 部屋番号の連番を生成
   */
  const generateRoomNumbers = (startNumber: string, count: number): string[] => {
    const start = parseInt(startNumber) || 1;
    return Array.from({ length: count }, (_, i) => (start + i).toString());
  };

  /**
   * 部屋名の連番を生成
   */
  const generateRoomNames = (baseName: string, count: number): string[] => {
    return Array.from({ length: count }, (_, i) => 
      count === 1 ? baseName : `${baseName} ${i + 1}`
    );
  };

  /**
   * 一括追加の実行
   */
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomInfo || !bulkData.startRoomNumber || !bulkData.baseName) return;

    const roomNumbers = generateRoomNumbers(bulkData.startRoomNumber, bulkData.roomCount);
    const roomNames = generateRoomNames(bulkData.baseName, bulkData.roomCount);

    const newRooms: Room[] = roomNumbers.map((roomNumber, index) => ({
      id: roomNumber,
      name: roomNames[index],
      type: selectedRoomInfo.type,
      capacity: selectedRoomInfo.capacity,
      pricePerNight: selectedRoomInfo.pricePerNight,
      amenities: [...selectedRoomInfo.amenities],
      isAvailable: true
    }));

    if (onBulkSave) {
      onBulkSave(newRooms);
    }
  };

  /**
   * アメニティを追加
   */
  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  /**
   * アメニティを削除
   */
  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  /**
   * フォームを送信
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.type.trim() && formData.pricePerNight > 0 && formData.roomNumber.trim()) {
      onSave({
        id: formData.roomNumber.trim(),
        name: formData.name,
        type: formData.type,
        capacity: formData.capacity,
        pricePerNight: formData.pricePerNight,
        amenities: formData.amenities,
        isAvailable: formData.isAvailable
      });
    }
  };

  return (
    <form onSubmit={isBulkAdd ? handleBulkSubmit : handleSubmit} className="space-y-6">
      {isBulkAdd ? (
        // 一括追加モード
        <>
          {/* 部屋タイプ選択 */}
          <div>
            <label htmlFor="roomTypeSelect" className="block text-sm font-medium text-gray-700 mb-2">
              部屋タイプを選択 *
            </label>
            <select
              id="roomTypeSelect"
              value={bulkData.selectedRoomType}
              onChange={(e) => handleBulkInputChange('selectedRoomType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">既存の部屋タイプを選択</option>
              {existingRoomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {selectedRoomInfo && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>選択された部屋タイプ:</strong> {selectedRoomInfo.type}<br/>
                  <strong>定員:</strong> {selectedRoomInfo.capacity}人<br/>
                  <strong>料金:</strong> ¥{selectedRoomInfo.pricePerNight.toLocaleString()}<br/>
                  <strong>アメニティ:</strong> {selectedRoomInfo.amenities.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* 部屋数 */}
          <div>
            <label htmlFor="roomCount" className="block text-sm font-medium text-gray-700 mb-2">
              追加する部屋数 *
            </label>
            <input
              type="number"
              id="roomCount"
              value={bulkData.roomCount}
              onChange={(e) => handleBulkInputChange('roomCount', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="20"
              required
            />
          </div>

          {/* 開始部屋番号 */}
          <div>
            <label htmlFor="startRoomNumber" className="block text-sm font-medium text-gray-700 mb-2">
              開始部屋番号 *
            </label>
            <input
              type="text"
              id="startRoomNumber"
              value={bulkData.startRoomNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleBulkInputChange('startRoomNumber', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 201"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              連番で自動生成されます（例: 201, 202, 203...）
            </p>
          </div>

          {/* 部屋名のベース */}
          <div>
            <label htmlFor="baseName" className="block text-sm font-medium text-gray-700 mb-2">
              部屋名のベース *
            </label>
            <input
              type="text"
              id="baseName"
              value={bulkData.baseName}
              onChange={(e) => handleBulkInputChange('baseName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: オーシャンビュー ツイン"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {bulkData.roomCount > 1 ? `複数部屋の場合: "${bulkData.baseName} 1", "${bulkData.baseName} 2"...` : 'そのまま使用されます'}
            </p>
          </div>

          {/* プレビュー */}
          {bulkData.selectedRoomType && bulkData.startRoomNumber && bulkData.baseName && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">追加される部屋のプレビュー:</h4>
              <div className="space-y-1">
                {generateRoomNumbers(bulkData.startRoomNumber, bulkData.roomCount).map((roomNumber, index) => (
                  <div key={roomNumber} className="text-sm text-blue-700">
                    <strong>部屋{roomNumber}:</strong> {generateRoomNames(bulkData.baseName, bulkData.roomCount)[index]} 
                    ({selectedRoomInfo?.type}, {selectedRoomInfo?.capacity}人, ¥{selectedRoomInfo?.pricePerNight.toLocaleString()})
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // 通常の単一追加・編集モード
        <>
          {/* 部屋番号 */}
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
              部屋番号 *
            </label>
            <input
              type="text"
              id="roomNumber"
              value={formData.roomNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleInputChange('roomNumber', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 101"
              required
            />
            <p className="text-xs text-gray-500 mt-1">数字で入力してください</p>
          </div>

          {/* 部屋名 */}
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              部屋名 *
            </label>
            <input
              type="text"
              id="roomName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: オーシャンビュー ツイン"
              required
            />
          </div>

          {/* 部屋タイプ */}
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
              部屋タイプ *
            </label>
            <select
              id="roomType"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">部屋タイプを選択</option>
              <option value="シングルルーム">シングルルーム</option>
              <option value="ツインルーム">ツインルーム</option>
              <option value="ダブルルーム">ダブルルーム</option>
              <option value="トリプルルーム">トリプルルーム</option>
              <option value="スイートルーム">スイートルーム</option>
              <option value="ファミリールーム">ファミリールーム</option>
            </select>
          </div>

          {/* 定員 */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              定員 *
            </label>
            <select
              id="capacity"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={1}>1人</option>
              <option value={2}>2人</option>
              <option value={3}>3人</option>
              <option value={4}>4人</option>
              <option value={5}>5人</option>
              <option value={6}>6人</option>
            </select>
          </div>

          {/* 1泊あたりの料金 */}
          <div>
            <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
              1泊あたりの料金 (円) *
            </label>
            <input
              type="number"
              id="pricePerNight"
              value={formData.pricePerNight}
              onChange={(e) => handleInputChange('pricePerNight', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 12000"
              min="0"
              required
            />
          </div>

          {/* アメニティ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アメニティ
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: オーシャンビュー"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addAmenity}
                disabled={!newAmenity.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label={`${amenity}を削除`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 利用可能フラグ */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
              利用可能
            </label>
          </div>
        </>
      )}

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {isBulkAdd ? '一括追加' : (room ? '更新' : '追加')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
};

export default RoomForm; 