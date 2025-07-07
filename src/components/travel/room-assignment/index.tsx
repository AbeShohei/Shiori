import React, { useState, useEffect } from 'react';
import { Users, Bed, Plus, Shuffle, Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import MemberCard from './MemberCard';
import RoomCard from './RoomCard';
import MemberForm from './MemberForm';
import RoomForm from './RoomForm';
import ResetConfirmModal from './ResetConfirmModal';
import DeleteRoomModal from './DeleteRoomModal';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Input from '../../common/Input';

/**
 * メンバーの型定義
 */
interface Member {
  id: string;
  name: string;
  gender: 'male' | 'female';
  preferences: string[];
}

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
 * 日別割り当ての型定義
 */
interface DayAssignment {
  date: string;
  day: string;
  roomAssignments: { [roomId: string]: string[] }; // roomId -> memberIds
}

interface TravelInfo {
  startDate: string;
  endDate: string;
  destination: string;
}

interface RoomAssignmentTabProps {
  travelInfo?: TravelInfo;
}

/**
 * 部屋割り当てタブコンポーネント
 * 部屋割り当ての管理、メンバーの追加、自動割り当て機能を提供
 */
const RoomAssignmentTab: React.FC<RoomAssignmentTabProps> = ({ travelInfo }) => {
  // メンバーデータの状態
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: '田中太郎',
      gender: 'male',
      preferences: ['静か', '禁煙']
    },
    {
      id: '2',
      name: '佐藤花子',
      gender: 'female',
      preferences: ['景色重視', '禁煙']
    },
    {
      id: '3',
      name: '山田次郎',
      gender: 'male',
      preferences: ['コスト重視']
    },
    {
      id: '4',
      name: '鈴木美咲',
      gender: 'female',
      preferences: ['景色重視', '静か']
    },
    {
      id: '5',
      name: '高橋健太',
      gender: 'male',
      preferences: ['アクセス重視']
    }
  ]);

  // 部屋データの状態
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '101',
      name: 'オーシャンビュー ツイン',
      type: 'ツインルーム',
      capacity: 2,
      pricePerNight: 12000,
      amenities: ['オーシャンビュー', 'バルコニー', '禁煙', 'Wi-Fi'],
      isAvailable: true
    },
    {
      id: '102',
      name: 'シティビュー ツイン',
      type: 'ツインルーム',
      capacity: 2,
      pricePerNight: 8000,
      amenities: ['シティビュー', '禁煙', 'Wi-Fi'],
      isAvailable: true
    },
    {
      id: '201',
      name: 'デラックス トリプル',
      type: 'トリプルルーム',
      capacity: 3,
      pricePerNight: 15000,
      amenities: ['オーシャンビュー', 'バルコニー', '禁煙', 'Wi-Fi', 'ミニバー'],
      isAvailable: true
    }
  ]);

  // 日別割り当ての状態
  const [dayAssignments, setDayAssignments] = useState<DayAssignment[]>([
    {
      date: '2024/3/15',
      day: '1日目',
      roomAssignments: {
        '101': ['1', '3'],
        '102': ['2', '4']
      }
    },
    {
      date: '2024/3/16',
      day: '2日目',
      roomAssignments: {
        '101': ['1', '3'],
        '102': ['2', '4']
      }
    },
    {
      date: '2024/3/17',
      day: '3日目',
      roomAssignments: {
        '201': ['1', '2', '5'],
        '102': ['3', '4']
      }
    }
  ]);

  // UI状態
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showBulkAddRoom, setShowBulkAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkEditMembers, setBulkEditMembers] = useState<Member[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    '静か', '景色重視', 'コスト重視', 'アクセス重視', '禁煙', 'Wi-Fi重視'
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // 日付範囲から日数分のDayAssignmentを自動生成
  useEffect(() => {
    if (travelInfo && travelInfo.startDate && travelInfo.endDate) {
      const start = new Date(travelInfo.startDate);
      const end = new Date(travelInfo.endDate);
      
      // 宿泊日数を計算（終了日は含まない）
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // 日数が0以下の場合は処理しない
      if (nights <= 0) {
        setDayAssignments([]);
        setCurrentDayIndex(0);
        return;
      }
      
      const days: DayAssignment[] = [];
      let current = new Date(start);
      
      for (let dayCount = 1; dayCount <= nights; dayCount++) {
        // 日付の詳細情報を取得
        const dateStr = current.toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
        
        const dayOfWeek = current.toLocaleDateString('ja-JP', { weekday: 'short' });
        const fullDateStr = `${dateStr} (${dayOfWeek})`;
        
        // 連泊の場合は前日の割り当てをコピー
        let roomAssignments = {};
        if (dayCount > 1 && days.length > 0) {
          roomAssignments = { ...days[days.length - 1].roomAssignments };
        }
        
        days.push({
          date: fullDateStr,
          day: `${dayCount}日目`,
          roomAssignments
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      setDayAssignments(days);
      setCurrentDayIndex(0);
    }
  }, [travelInfo]);

  // 宿泊日数を取得
  const getStayNights = () => {
    if (!travelInfo?.startDate || !travelInfo?.endDate) return 0;
    const start = new Date(travelInfo.startDate);
    const end = new Date(travelInfo.endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, nights); // 負の値は0に
  };

  // 旅程の総日数を取得
  const getTotalDays = () => {
    const nights = getStayNights();
    return nights + 1; // 宿泊日数 + 1 = 旅程日数
  };

  // 連泊情報を取得
  const getConsecutiveStayInfo = () => {
    const nights = getStayNights();
    if (nights <= 1) return null;
    
    return {
      nights,
      totalDays: nights + 1,
      isConsecutive: nights > 1,
      message: `${nights}泊${nights + 1}日の旅程`,
      startDate: travelInfo?.startDate,
      endDate: travelInfo?.endDate
    };
  };

  // 現在の日付情報を取得
  const getCurrentDateInfo = () => {
    if (!currentDay) return null;
    
    const nights = getStayNights();
    const currentDayNumber = currentDayIndex + 1;
    
    return {
      currentDay: currentDayNumber,
      totalDays: nights,
      isLastDay: currentDayNumber === nights,
      isFirstDay: currentDayNumber === 1,
      date: currentDay.date,
      dayLabel: currentDay.day
    };
  };

  // 現在の日と割り当てを取得
  const currentDay = dayAssignments[currentDayIndex];
  const currentAssignments = currentDay?.roomAssignments || {};

  /**
   * 未割り当てメンバーを取得
   */
  const getUnassignedMembers = () => {
    const assignedMemberIds = Object.values(currentAssignments).flat();
    return members.filter(member => !assignedMemberIds.includes(member.id));
  };

  /**
   * 1日の総コストを計算
   */
  const getTotalCostForDay = () => {
    return Object.keys(currentAssignments).reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room?.pricePerNight || 0);
    }, 0);
  };

  /**
   * 1人あたりのコストを計算
   */
  const getCostPerPerson = () => {
    const totalCost = getTotalCostForDay();
    return totalCost / members.length;
  };

  /**
   * メンバーを部屋に割り当て
   */
  const assignMemberToRoom = (memberId: string, roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const currentRoomMembers = currentAssignments[roomId] || [];
    
    if (room && currentRoomMembers.length < room.capacity) {
      // 他の部屋からメンバーを削除
      const newAssignments = { ...currentAssignments };
      Object.keys(newAssignments).forEach(rId => {
        newAssignments[rId] = newAssignments[rId].filter(id => id !== memberId);
      });
      
      // 新しい部屋に追加
      newAssignments[roomId] = [...(newAssignments[roomId] || []), memberId];
      
      // 日別割り当てを更新
      const updatedDayAssignments = dayAssignments.map((day, index) => 
        index === currentDayIndex 
          ? { ...day, roomAssignments: newAssignments }
          : day
      );
      setDayAssignments(updatedDayAssignments);
    }
  };

  /**
   * 部屋からメンバーを削除
   */
  const removeMemberFromRoom = (memberId: string, roomId: string) => {
    const newAssignments = { ...currentAssignments };
    newAssignments[roomId] = newAssignments[roomId].filter(id => id !== memberId);
    
    const updatedDayAssignments = dayAssignments.map((day, index) => 
      index === currentDayIndex 
        ? { ...day, roomAssignments: newAssignments }
        : day
    );
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * 前日の割り当てをコピー
   */
  const copyFromPreviousDay = () => {
    if (currentDayIndex > 0) {
      const previousAssignments = dayAssignments[currentDayIndex - 1].roomAssignments;
      const updatedDayAssignments = dayAssignments.map((day, index) => 
        index === currentDayIndex 
          ? { ...day, roomAssignments: { ...previousAssignments } }
          : day
      );
      setDayAssignments(updatedDayAssignments);
    }
  };

  /**
   * 連泊時の自動コピー
   */
  const autoCopyForConsecutiveStay = () => {
    if (getConsecutiveStayInfo()?.isConsecutive && currentDayIndex > 0) {
      copyFromPreviousDay();
    }
  };

  /**
   * 全期間の自動割り当て（連泊対応）
   */
  const autoAssignAllDays = () => {
    const unassignedMembers = getUnassignedMembers();
    const availableRooms = rooms.filter(room => room.isAvailable);
    
    if (unassignedMembers.length === 0 || availableRooms.length === 0) return;
    
    // 1日目の自動割り当て
    autoAssignRooms();
    
    // 連泊の場合は2日目以降も同じ割り当てをコピー
    if (getConsecutiveStayInfo()?.isConsecutive && dayAssignments.length > 1) {
      // 少し遅延を入れて1日目の割り当てが完了してからコピー
      setTimeout(() => {
        const firstDayAssignments = dayAssignments[0].roomAssignments;
        
        const updatedDayAssignments = dayAssignments.map((day, index) => 
          index === 0 
            ? day // 1日目はそのまま
            : { ...day, roomAssignments: { ...firstDayAssignments } }
        );
        
        setDayAssignments(updatedDayAssignments);
      }, 200);
    }
  };

  /**
   * 自動割り当て
   */
  const autoAssignRooms = () => {
    const unassignedMembers = getUnassignedMembers();
    const availableRooms = rooms.filter(room => room.isAvailable);
    
    let newAssignments = { ...currentAssignments };
    let memberIndex = 0;
    
    // 各部屋に順番に割り当て
    for (const room of availableRooms) {
      const currentRoomMembers = newAssignments[room.id] || [];
      const remainingCapacity = room.capacity - currentRoomMembers.length;
      
      for (let i = 0; i < remainingCapacity && memberIndex < unassignedMembers.length; i++) {
        newAssignments[room.id] = [...(newAssignments[room.id] || []), unassignedMembers[memberIndex].id];
        memberIndex++;
      }
    }
    
    // 日別割り当てを更新
    const updatedDayAssignments = dayAssignments.map((day, index) => 
      index === currentDayIndex 
        ? { ...day, roomAssignments: newAssignments }
        : day
    );
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * メンバーをIDで取得
   */
  const getMemberById = (id: string) => members.find(m => m.id === id);

  /**
   * 新しいメンバーを追加
   */
  const addMember = (member: Member | Member[]) => {
    if (Array.isArray(member)) {
      setMembers(prev => [...prev, ...member]);
    } else {
      setMembers(prev => [...prev, member]);
    }
    setShowAddMember(false);
  };

  /**
   * 新しい部屋を追加
   */
  const addRoom = (room: Room) => {
    setRooms([...rooms, room]);
    setShowAddRoom(false);
  };

  /**
   * 複数の部屋を一括追加
   */
  const addBulkRooms = (newRooms: Room[]) => {
    setRooms([...rooms, ...newRooms]);
    setShowBulkAddRoom(false);
  };

  /**
   * 部屋を編集
   */
  const editRoom = (room: Room) => {
    setRooms(rooms.map(r => r.id === room.id ? room : r));
    setEditingRoom(null);
  };

  /**
   * 部屋を削除
   */
  const deleteRoom = (roomId: string) => {
    // 部屋を削除
    setRooms(rooms.filter(r => r.id !== roomId));
    
    // 全ての日別割り当てから該当部屋を削除し、割り当てられたメンバーを未割り当てにする
    const updatedDayAssignments = dayAssignments.map(day => {
      const newRoomAssignments = { ...day.roomAssignments };
      delete newRoomAssignments[roomId];
      return {
        ...day,
        roomAssignments: newRoomAssignments
      };
    });
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * 割り当てを全解除
   */
  const resetAllAssignments = () => {
    // 現在の日の割り当てを全てクリア
    const updatedDayAssignments = dayAssignments.map((day, index) => 
      index === currentDayIndex 
        ? { ...day, roomAssignments: {} }
        : day
    );
    setDayAssignments(updatedDayAssignments);
  };

  /**
   * 現在割り当てられているメンバー数を取得
   */
  const getAssignedMemberCount = () => {
    return Object.values(currentAssignments).flat().length;
  };

  // 編集モード開始
  const startEditMode = () => {
    setEditMode(true);
    setBulkEditMembers([...members]);
    setSelectedMemberIds([]);
  };

  // 編集モード終了
  const cancelEditMode = () => {
    setEditMode(false);
    setBulkEditMembers([]);
    setSelectedMemberIds([]);
  };

  // 編集内容保存
  const saveBulkEdit = () => {
    setMembers([...bulkEditMembers]);
    setEditMode(false);
    setSelectedMemberIds([]);
  };

  // メンバー選択切り替え
  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };

  // 一括削除
  const deleteSelectedMembers = () => {
    setBulkEditMembers(prev => prev.filter(m => !selectedMemberIds.includes(m.id)));
    setSelectedMemberIds([]);
  };

  // メンバー編集（インライン）
  const updateBulkEditMember = (id: string, updates: Partial<Member>) => {
    setBulkEditMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // タグ追加
  const addTag = () => {
    if (newTagInput.trim() && !availableTags.includes(newTagInput.trim())) {
      setAvailableTags(prev => [...prev, newTagInput.trim()]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  // タグ削除
  const removeTag = (tagToRemove: string) => {
    // 使用中のタグは削除できない
    const isTagInUse = members.some(member => member.preferences.includes(tagToRemove));
    if (isTagInUse) {
      alert(`${tagToRemove}は使用中のため削除できません`);
      return;
    }
    
    setAvailableTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // タグ入力のキーハンドリング
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 日付ナビゲーション */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
              disabled={currentDayIndex === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="前の日付に移動"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentDay?.day}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{currentDay?.date}</p>
              {/* 宿泊日数と連泊情報 */}
              {travelInfo && (
                <div className="mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getStayNights()}泊 / {dayAssignments.length}日目
                  </p>
                  {getConsecutiveStayInfo() && (
                    <div className="text-xs">
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {getConsecutiveStayInfo()?.message}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {travelInfo.startDate} 〜 {travelInfo.endDate}
                      </p>
                    </div>
                  )}
                  {getCurrentDateInfo() && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {getCurrentDateInfo()?.isFirstDay && '初日'}
                      {getCurrentDateInfo()?.isLastDay && '最終日'}
                      {!getCurrentDateInfo()?.isFirstDay && !getCurrentDateInfo()?.isLastDay && '連泊中'}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setCurrentDayIndex(Math.min(dayAssignments.length - 1, currentDayIndex + 1))}
              disabled={currentDayIndex === dayAssignments.length - 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="次の日付に移動"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
            <Button
              variant="secondary"
              onClick={copyFromPreviousDay}
              disabled={currentDayIndex === 0}
              size="sm"
            >
              前日をコピー
            </Button>
            <Button
              variant="secondary"
              onClick={autoAssignAllDays}
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              全期間自動割り当て
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
              disabled={getAssignedMemberCount() === 0}
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              全リセット
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddMember(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              メンバー追加
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAddRoom(true)}
              size="sm"
            >
              <Bed className="h-4 w-4 mr-2" />
              部屋追加
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowBulkAddRoom(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              一括追加
            </Button>
          </div>
        </div>
      </div>

      {/* コスト概要 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">1日あたり</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">¥{getTotalCostForDay().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">1人あたり</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">¥{getCostPerPerson().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">使用部屋数</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{Object.keys(currentAssignments).length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
              <Bed className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">宿泊日数</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getStayNights()}泊</p>
              {getConsecutiveStayInfo() && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  連泊
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                旅程: {getTotalDays()}日
              </p>
              {currentDay && (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  現在: {currentDay.date}
                </p>
              )}
            </div>
            <div className="p-2 bg-orange-100 rounded-full dark:bg-orange-900">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 全体進捗状況 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">全体割り当て進捗</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">割り当て済み</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">未割り当て</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 全体進捗バー */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>全体進捗</span>
              <span className="font-semibold">
                {Math.round((members.length - getUnassignedMembers().length) / members.length * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div 
                className={`h-4 rounded-full transition-all duration-700 ease-out ${
                  (members.length - getUnassignedMembers().length) / members.length >= 1 ? 'bg-green-500' : 
                  (members.length - getUnassignedMembers().length) / members.length >= 0.8 ? 'bg-blue-500' : 
                  (members.length - getUnassignedMembers().length) / members.length >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${Math.min((members.length - getUnassignedMembers().length) / members.length * 100, 100)}%` 
                }}
              />
              {/* 進捗アニメーション効果 */}
              {(members.length - getUnassignedMembers().length) / members.length > 0 && 
               (members.length - getUnassignedMembers().length) / members.length < 1 && (
                <div 
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                  style={{ 
                    width: `${Math.min((members.length - getUnassignedMembers().length) / members.length * 100, 100)}%` 
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{members.length - getUnassignedMembers().length}人割り当て済み</span>
              <span>{getUnassignedMembers().length}人未割り当て</span>
            </div>
          </div>

          {/* 部屋別進捗 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const assignedMembers = (currentAssignments[room.id] || [])
                .map(id => getMemberById(id))
                .filter(Boolean) as Member[];
              const occupancyRate = (assignedMembers.length / room.capacity) * 100;
              
                             return (
                 <div key={room.id} className="bg-gray-50 p-3 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center gap-2">
                       <div className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                         {room.id}
                       </div>
                       <span className="text-sm font-medium text-gray-900 truncate">{room.name}</span>
                     </div>
                     <span className="text-xs text-gray-500">{Math.round(occupancyRate)}%</span>
                   </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        occupancyRate >= 100 ? 'bg-red-500' : 
                        occupancyRate >= 80 ? 'bg-yellow-500' : 
                        occupancyRate >= 50 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{assignedMembers.length}/{room.capacity}人</span>
                    <span>{room.capacity - assignedMembers.length}人空き</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 未割り当てメンバー */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">未割り当てメンバー</h3>
            <div className="text-sm text-gray-600">
              全{members.length}人中 {getUnassignedMembers().length}人未割り当て
            </div>
          </div>
          
          {/* 編集モード切替ボタン */}
          <div className="flex justify-end mb-2">
            {!editMode ? (
              <Button variant="secondary" onClick={startEditMode} size="sm">編集モード</Button>
            ) : (
              <>
                <Button variant="primary" onClick={saveBulkEdit} size="sm" className="mr-2">保存</Button>
                <Button variant="secondary" onClick={cancelEditMode} size="sm">キャンセル</Button>
              </>
            )}
          </div>

          {/* タグ管理（編集モード時のみ表示） */}
          {editMode && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 dark:bg-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">タグ管理</h4>
                {!showTagInput && (
                  <Button variant="secondary" onClick={() => setShowTagInput(true)} size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    タグ追加
                  </Button>
                )}
              </div>
              
              {/* タグ追加入力 */}
              {showTagInput && (
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTagInput}
                    onChange={setNewTagInput}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="新しいタグ名"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={addTag} size="sm">追加</Button>
                  <Button variant="secondary" onClick={() => {
                    setNewTagInput('');
                    setShowTagInput(false);
                  }} size="sm">キャンセル</Button>
                </div>
              )}
              
              {/* タグ一覧 */}
              <div className="flex flex-wrap gap-1">
                {availableTags.map(tag => {
                  const isTagInUse = members.some(member => member.preferences.includes(tag));
                  return (
                    <div key={tag} className="flex items-center gap-1 bg-white px-2 py-1 rounded border text-xs dark:bg-gray-600 dark:border-gray-500">
                      <span className={isTagInUse ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                        {tag}
                      </span>
                      {!isTagInUse && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`${tag}を削除`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* メンバーリスト */}
          {editMode ? (
            <div className="space-y-2">
              {bulkEditMembers.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2 rounded border dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <input type="checkbox" checked={selectedMemberIds.includes(member.id)} onChange={() => toggleSelectMember(member.id)} aria-label="メンバー選択" />
                    <label className="sr-only" htmlFor={`name-input-${member.id}`}>名前</label>
                    <Input id={`name-input-${member.id}`} value={member.name} onChange={v => updateBulkEditMember(member.id, { name: v })} className="w-full sm:w-32" title="名前" placeholder="名前" />
                  </div>
                  <label className="sr-only" htmlFor={`gender-select-${member.id}`}>性別</label>
                  <select id={`gender-select-${member.id}`} value={member.gender} onChange={e => updateBulkEditMember(member.id, { gender: e.target.value as 'male' | 'female' })} className="border rounded px-2 py-1 w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" title="性別">
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                  </select>
                  {/* タグ編集（希望条件） */}
                  <div className="flex flex-wrap gap-1 w-full">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={member.preferences.includes(tag)} onChange={() => {
                          const prefs = member.preferences.includes(tag)
                            ? member.preferences.filter(p => p !== tag)
                            : [...member.preferences, tag];
                          updateBulkEditMember(member.id, { preferences: prefs });
                        }} aria-label={tag} />
                        <span className="dark:text-gray-300">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="danger" onClick={deleteSelectedMembers} disabled={selectedMemberIds.length === 0} className="mt-2 w-full sm:w-auto">選択したメンバーを削除</Button>
            </div>
          ) : (
            // 従来のメンバーカード表示
            <div className="space-y-3">
              {getUnassignedMembers().map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isAssigned={false}
                  rooms={rooms}
                  currentAssignments={currentAssignments}
                  onAssign={assignMemberToRoom}
                />
              ))}
              {getUnassignedMembers().length === 0 && (
                <p className="text-center text-gray-500 py-8">全メンバーが割り当てられています</p>
              )}
            </div>
          )}
        </div>

        {/* 部屋一覧 */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">部屋一覧</h3>
            <div className="text-sm text-gray-600">
              全{rooms.length}部屋
            </div>
          </div>
          <div className="space-y-4">
            {rooms.map((room) => {
              const assignedMembers = (currentAssignments[room.id] || [])
                .map(id => getMemberById(id))
                .filter(Boolean) as Member[];
              
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  assignedMembers={assignedMembers}
                  allMembers={members}
                  onRemoveMember={removeMemberFromRoom}
                  onEditRoom={setEditingRoom}
                  onAssignMember={assignMemberToRoom}
                  onDeleteRoom={(roomId) => {
                    const roomToDelete = rooms.find(r => r.id === roomId);
                    if (roomToDelete) {
                      setDeletingRoom(roomToDelete);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* メンバー追加モーダル */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="新しいメンバーを追加"
        size="md"
      >
        <MemberForm
          onSave={addMember}
          onCancel={() => setShowAddMember(false)}
        />
      </Modal>

      {/* 部屋追加モーダル */}
      <Modal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        title="新しい部屋を追加"
        size="lg"
      >
        <RoomForm
          onSave={addRoom}
          onCancel={() => setShowAddRoom(false)}
        />
      </Modal>

      {/* 部屋編集モーダル */}
      <Modal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title="部屋を編集"
        size="lg"
      >
        <RoomForm
          room={editingRoom || undefined}
          onSave={editRoom}
          onCancel={() => setEditingRoom(null)}
        />
      </Modal>

      {/* リセット確認モーダル */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetAllAssignments}
        memberCount={getAssignedMemberCount()}
      />

      {/* 部屋削除確認モーダル */}
      <DeleteRoomModal
        isOpen={!!deletingRoom}
        onClose={() => setDeletingRoom(null)}
        onConfirm={() => {
          if (deletingRoom) {
            deleteRoom(deletingRoom.id);
            setDeletingRoom(null);
          }
        }}
        room={deletingRoom}
        assignedMemberCount={deletingRoom ? (currentAssignments[deletingRoom.id] || []).length : 0}
      />

      {/* 部屋一括追加モーダル */}
      <Modal
        isOpen={showBulkAddRoom}
        onClose={() => setShowBulkAddRoom(false)}
        title="部屋を一括追加"
        size="lg"
      >
        <RoomForm
          existingRooms={rooms}
          isBulkAdd={true}
          onBulkSave={addBulkRooms}
          onCancel={() => setShowBulkAddRoom(false)}
        />
      </Modal>
    </div>
  );
};

export default RoomAssignmentTab; 