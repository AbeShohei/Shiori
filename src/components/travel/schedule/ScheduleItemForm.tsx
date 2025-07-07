import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';

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
 * スケジュールアイテムフォームコンポーネントのプロパティ
 * 
 * @param item - 編集対象のアイテム（新規作成時はnull）
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 */
interface ScheduleItemFormProps {
  item: ScheduleItem | null;
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
}

/**
 * スケジュールアイテムフォームコンポーネント
 * スケジュールアイテムの追加・編集フォームを提供
 */
const ScheduleItemForm: React.FC<ScheduleItemFormProps> = ({ 
  item, 
  onSave, 
  onCancel 
}) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    time: '',
    title: '',
    location: '',
    description: '',
    category: 'sightseeing'
  });

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    if (item) {
      setFormData({
        time: item.time,
        title: item.title,
        location: item.location,
        description: item.description,
        category: item.category
      });
    }
  }, [item]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof ScheduleItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * フォームのバリデーション
   */
  const isFormValid = () => {
    return (
      formData.title?.trim() !== ''
    );
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (isFormValid()) {
      const newItem: ScheduleItem = {
        id: item?.id || Date.now().toString(),
        time: formData.time || '',
        title: formData.title!,
        location: formData.location || '',
        description: formData.description || '',
        category: formData.category as ScheduleItem['category']
      };
      onSave(newItem);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {item ? '予定を編集' : '新しい予定を追加'}
      </h3>
      
      <div className="space-y-4">
        {/* 時間 */}
        <div className="space-y-1">
          <label htmlFor="time-input" className="block text-sm font-medium text-gray-700">
            時間（任意）
          </label>
          <input 
            id="time-input"
            type="time"
            value={formData.time || ''}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* タイトル */}
        <Input
          label="タイトル"
          value={formData.title || ''}
          onChange={(value) => handleInputChange('title', value)}
          placeholder="予定のタイトル"
          required
        />
        
        {/* 場所 */}
        <Input
          label="場所"
          value={formData.location || ''}
          onChange={(value) => handleInputChange('location', value)}
          placeholder="場所"
        />
        
        {/* カテゴリー */}
        <div className="space-y-1">
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
            カテゴリー
          </label>
          <select
            id="category-select"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="sightseeing">観光</option>
            <option value="food">食事</option>
            <option value="transport">移動</option>
            <option value="accommodation">宿泊</option>
          </select>
        </div>
        
        {/* 説明 */}
        <div className="space-y-1">
          <label htmlFor="description-textarea" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea 
            id="description-textarea"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="詳細説明"
          />
        </div>
      </div>
      
      {/* ボタン群 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isFormValid()}
        >
          {item ? '保存' : '追加'}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleItemForm; 