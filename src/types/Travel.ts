export interface Travel {
  id: string;
  title: string;
  destination: string;
  duration: string;
  dates: string;
  description: string;
  image: string;
  status: 'planning' | 'confirmed' | 'completed';
  memberCount: number;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface TravelFormData {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}