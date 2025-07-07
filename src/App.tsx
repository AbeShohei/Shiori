import React, { useState } from 'react';
import TravelCatalog from './components/travel/TravelCatalog';
import TravelCreator from './components/travel/TravelCreator';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ScheduleTab from './components/travel/schedule';
import PlacesTab from './components/travel/places';
import AIRecommendationsTab from './components/travel/ai-recommendations';
import BudgetTab from './components/travel/budget';
import RoomAssignmentTab from './components/travel/room-assignment';
import PackingTab from './components/travel/packing';
import NotesTab from './components/travel/notes';
import EditTravelModal from './components/travel/TravelCatalog/EditTravelModal';
import { Travel } from './types/Travel';

type AppView = 'catalog' | 'creator' | 'travel';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('catalog');
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [places, setPlaces] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleSelectTravel = (travel: Travel) => {
    setSelectedTravel(travel);
    setCurrentView('travel');
  };

  const handleCreateNew = () => {
    setCurrentView('creator');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedTravel(null);
  };

  const handleTravelCreated = (travel: Travel) => {
    setSelectedTravel(travel);
    setCurrentView('travel');
  };

  const handleAddToPlaces = (place: any) => {
    setPlaces(prev => [...prev, place]);
  };

  const renderActiveTab = () => {
    // 旅行タイプを判定（簡易版：目的地に基づいて判定）
    const getTravelType = () => {
      if (!selectedTravel?.destination) return 'domestic';
      // 海外の主要都市名で判定（簡易版）
      const internationalDestinations = [
        'パリ', 'ロンドン', 'ニューヨーク', 'ロサンゼルス', 'シンガポール', 'バンコク', 
        'ソウル', '台北', '香港', '上海', '北京', 'シドニー', 'メルボルン', 'バンクーバー',
        'トロント', 'バンクーバー', 'パリ', 'ローマ', 'ミラノ', 'バルセロナ', 'マドリード',
        'ベルリン', 'ミュンヘン', 'アムステルダム', 'ブリュッセル', 'ウィーン', 'プラハ',
        'ブダペスト', 'ワルシャワ', 'ストックホルム', 'コペンハーゲン', 'オスロ', 'ヘルシンキ'
      ];
      return internationalDestinations.some(dest => 
        selectedTravel.destination.includes(dest)
      ) ? 'international' : 'domestic';
    };

    switch (activeTab) {
      case 'schedule':
        return <ScheduleTab travelInfo={selectedTravel} />;
      case 'places':
        return <PlacesTab initialPlaces={selectedTravel?.places || []} />;
      case 'ai-recommendations':
        return <AIRecommendationsTab onAddToPlaces={handleAddToPlaces} />;
      case 'budget':
        return <BudgetTab budgetData={selectedTravel?.budgetBreakdown} />;
      case 'room-assignment':
        return <RoomAssignmentTab />;
      case 'packing':
        return <PackingTab packingData={selectedTravel?.packingList} travelType={getTravelType()} />;
      case 'notes':
        return <NotesTab notesData={selectedTravel?.notes} />;
      default:
        return <ScheduleTab travelInfo={selectedTravel} />;
    }
  };

  if (currentView === 'catalog') {
    return (
      <TravelCatalog 
        onSelectTravel={handleSelectTravel}
        onCreateNew={handleCreateNew}
      />
    );
  }

  if (currentView === 'creator') {
    return (
      <TravelCreator 
        onBack={handleBackToCatalog}
        onComplete={handleTravelCreated}
      />
    );
  }

  if (currentView === 'travel' && selectedTravel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          title={selectedTravel.title}
          destination={selectedTravel.destination}
          duration={selectedTravel.duration}
          dates={selectedTravel.dates}
          memberCount={selectedTravel.memberCount}
          onBack={handleBackToCatalog}
          onEdit={() => setEditModalOpen(true)}
        />
        <EditTravelModal
          isOpen={editModalOpen}
          travel={selectedTravel}
          onClose={() => setEditModalOpen(false)}
          onSave={(updated) => setSelectedTravel(updated)}
        />
        
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveTab()}
        </main>
      </div>
    );
  }

  return null;
}

export default App;