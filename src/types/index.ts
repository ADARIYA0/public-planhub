export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price: number;
  maxParticipants: number;
  registeredParticipants: number;
  isRegistrationOpen: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface Filters {
  category: string;
  location: string;
  priceRange: string;
  dateRange: string;
}
