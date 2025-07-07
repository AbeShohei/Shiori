import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Tag } from 'lucide-react';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import ScheduleItemForm from './ScheduleItemForm';
import DayEditForm from './DayEditForm';
import { Travel } from '../../../types/Travel';
import DayScheduleComponent from './DaySchedule';
import DeleteConfirmModal from '../TravelCatalog/DeleteConfirmModal';

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
 * 旅行の基本情報
 */
interface TravelInfo {
  startDate: string;
  endDate: string;
  destination: string;
}

/**
 * スケジュールタブコンポーネントのプロパティ
 */
interface ScheduleTabProps {
  travelInfo?: Travel;
}

/**
 * 日付からDayスケジュールを生成する関数
 */
const generateDaySchedules = (startDate: string, endDate: string, destination: string): DaySchedule[] => {
  const schedules: DaySchedule[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let currentDate = new Date(start);
  let dayNumber = 1;
  
  while (currentDate <= end) {
    const dateStr = currentDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
    
    let dayTitle = '';
    let daySubtitle = '';
    
    // 日数に応じてデフォルトのタイトルを設定
    if (dayNumber === 1) {
      dayTitle = `${destination}到着`;
      daySubtitle = '旅行の始まり';
    } else if (dayNumber === 2) {
      dayTitle = `${destination}観光`;
      daySubtitle = 'メインの観光日';
    } else if (dayNumber === 3) {
      dayTitle = `${destination}体験`;
      daySubtitle = 'アクティビティ';
    } else if (dayNumber === 4) {
      dayTitle = `${destination}巡り`;
      daySubtitle = 'お気に入りスポット';
    } else {
      dayTitle = `${destination}最終日`;
      daySubtitle = 'お土産・お買い物';
    }
    
    schedules.push({
      date: dateStr,
      day: `Day ${dayNumber}`,
      dayTitle: dayTitle,
      daySubtitle: daySubtitle,
      items: []
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber++;
  }
  
  return schedules;
};

/**
 * スケジュールタブコンポーネント
 * スケジュールの管理、アイテムの追加・編集・削除機能を提供
 */
const ScheduleTab: React.FC<ScheduleTabProps> = ({ travelInfo }) => {
  // スケジュールデータの状態
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  // 旅行情報からスケジュールを初期化
  useEffect(() => {
    if (travelInfo) {
      // AI生成のスケジュールがある場合はそれを使用
      if (travelInfo.schedule && travelInfo.schedule.length > 0) {
        // AI生成データをDaySchedule形式に変換
        const aiSchedules: DaySchedule[] = travelInfo.schedule.map((day, index) => ({
          date: day.date || `Day ${index + 1}`,
          day: day.day || `Day ${index + 1}`,
          dayTitle: day.dayTitle,
          daySubtitle: day.daySubtitle,
          items: day.items.map((item, itemIndex) => ({
            id: item.id || `${index}-${itemIndex}`,
            time: item.time,
            title: item.title,
            location: item.location,
            description: item.description,
            category: item.category as 'sightseeing' | 'food' | 'transport' | 'accommodation'
          }))
        }));
        setSchedule(aiSchedules);
      } else {
        // AI生成データがない場合は基本情報から生成
        const generatedSchedules = generateDaySchedules(
          travelInfo.startDate,
          travelInfo.endDate,
          travelInfo.destination
        );
        setSchedule(generatedSchedules);
      }
    } else {
      // 旅行情報がない場合は空のスケジュール
      setSchedule([]);
    }
  }, [travelInfo]);

  // モーダルの状態
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDayEditModal, setShowDayEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<DaySchedule | null>(null);

  /**
   * アイテム追加
   */
  const handleAddItem = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowAddModal(true);
  };

  /**
   * アイテム編集
   */
  const handleEditItem = (item: ScheduleItem, dayIndex: number) => {
    setEditingItem(item);
    setSelectedDayIndex(dayIndex);
    setShowEditModal(true);
  };

  /**
   * 日付編集
   */
  const handleEditDay = (day: DaySchedule, dayIndex: number) => {
    setEditingDay(day);
    setSelectedDayIndex(dayIndex);
    setShowDayEditModal(true);
  };

  /**
   * アイテム削除
   */
  const handleDeleteClick = (itemId: string, dayIndex: number) => {
    setDeletingItemId(itemId);
    setSelectedDayIndex(dayIndex);
    setShowDeleteConfirm(true);
  };

  /**
   * 削除確認
   */
  const confirmDelete = () => {
    if (selectedDayIndex !== null && deletingItemId) {
      setSchedule(prev => prev.map((day, index) => 
        index === selectedDayIndex 
          ? { ...day, items: day.items.filter(item => item.id !== deletingItemId) }
          : day
      ));
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
    }
  };

  /**
   * 新しいアイテムを保存
   */
  const saveNewItem = (item: ScheduleItem) => {
    if (selectedDayIndex !== null) {
      setSchedule(prev => prev.map((day, index) => 
        index === selectedDayIndex 
          ? { ...day, items: [...day.items, item].sort((a, b) => {
              // 時間が空の場合は最後に表示
              if (!a.time && !b.time) return 0;
              if (!a.time) return 1;
              if (!b.time) return -1;
              return a.time.localeCompare(b.time);
            }) }
          : day
      ));
      setShowAddModal(false);
    }
  };

  /**
   * 編集したアイテムを保存
   */
  const saveEditedItem = (item: ScheduleItem) => {
    if (selectedDayIndex !== null) {
      setSchedule(prev => prev.map((day, index) => 
        index === selectedDayIndex 
          ? { 
              ...day, 
              items: day.items.map(i => 
                i.id === item.id ? item : i
              ).sort((a, b) => {
                // 時間が空の場合は最後に表示
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
              })
            }
          : day
      ));
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  /**
   * 日付編集を保存
   */
  const saveDayEdit = (dayData: Partial<DaySchedule>) => {
    if (selectedDayIndex !== null) {
      setSchedule(prev => prev.map((day, index) => 
        index === selectedDayIndex 
          ? { 
              ...day, 
              dayTitle: dayData.dayTitle,
              daySubtitle: dayData.daySubtitle
            }
          : day
      ));
      setShowDayEditModal(false);
      setEditingDay(null);
    }
  };

  /**
   * 削除対象のアイテム名を取得
   */
  const getDeletingItemName = () => {
    if (selectedDayIndex !== null && deletingItemId) {
      const day = schedule[selectedDayIndex];
      const item = day?.items.find(i => i.id === deletingItemId);
      return item?.title || '';
    }
    return '';
  };

  /**
   * 予定の並び替え
   */
  const handleReorderItems = (newItems: ScheduleItem[], dayIndex: number) => {
    setSchedule(prev => prev.map((day, idx) =>
      idx === dayIndex ? { ...day, items: newItems } : day
    ));
  };

  return (
    <div className="space-y-8">
      {/* 日別スケジュール一覧 */}
      {schedule.map((day, idx) => (
        <DayScheduleComponent
          key={day.date}
          day={day}
          dayIndex={idx}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteClick}
          onEditDay={handleEditDay}
          onReorderItems={handleReorderItems}
        />
      ))}

      {/* アイテム追加モーダル */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新しい予定を追加"
        size="md"
      >
        <ScheduleItemForm
          item={null}
          onSave={saveNewItem}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* アイテム編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        title="予定を編集"
        size="md"
      >
        <ScheduleItemForm
          item={editingItem}
          onSave={saveEditedItem}
          onCancel={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* 日付編集モーダル */}
      <Modal
        isOpen={showDayEditModal}
        onClose={() => {
          setShowDayEditModal(false);
          setEditingDay(null);
        }}
        title="日程タイトルを編集"
        size="md"
      >
        <DayEditForm
          day={editingDay!}
          onSave={saveDayEdit}
          onCancel={() => {
            setShowDayEditModal(false);
            setEditingDay(null);
          }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title={getDeletingItemName()}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingItemId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ScheduleTab; 