'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { SearchFilters } from '@/components/SearchFilters';
import { Footer } from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Filters, EventCategory } from '@/types';

export default function EventPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    dateRange: 'all'
  });

  const { events, loading, error, refetch } = useEvents({ 
    limit: 20, 
    search: searchQuery || undefined,
    category: filters.category !== 'all' ? filters.category : undefined,
    time_range: filters.dateRange !== 'all' ? filters.dateRange : undefined
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    refetch({ 
      search: query || undefined, 
      category: filters.category !== 'all' ? filters.category : undefined,
      time_range: filters.dateRange !== 'all' ? filters.dateRange : undefined
    });
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    refetch({ 
      search: searchQuery || undefined, 
      category: newFilters.category !== 'all' ? newFilters.category : undefined,
      time_range: newFilters.dateRange !== 'all' ? newFilters.dateRange : undefined
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = { category: 'all', dateRange: 'all' };
    setFilters(clearedFilters);
    refetch({ 
      search: searchQuery || undefined, 
      category: undefined,
      time_range: undefined
    });
  };

  const handleViewEvent = (eventSlug: string) => {
    router.push(`/event/${eventSlug}`);
  };

  const handleRegisterEvent = (eventId: number) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    console.log('Register for event:', eventId);
  };

  // Extract unique categories from events
  const availableCategories: EventCategory[] = events
    .map(event => event.kategori)
    .filter((kategori, index, self) => 
      kategori && self.findIndex(k => k?.slug === kategori.slug) === index
    ) as EventCategory[];

  return (
    <div className="min-h-screen bg-white">
      <Header currentView="search" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Cari Event Favoritmu</h1>
          <p className="text-gray-600 mb-5">
            Temukan event yang sesuai dengan minat dan kebutuhanmu
          </p>
          
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            availableCategories={availableCategories}
          />
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {loading ? 'Memuat...' : `${events.length} Event Ditemukan`}
            </h2>
            <div className="text-sm text-gray-500">
              Diurutkan berdasarkan waktu terdekat
            </div>
          </div>
          <Separator className="mt-3 bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-red-300" />
              <p className="text-lg font-semibold text-red-600">Gagal memuat event</p>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-600">Tidak ada event ditemukan</p>
              <p className="text-sm text-gray-500 mt-2">Coba ubah kata kunci pencarian</p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewEvent}
                onRegister={handleRegisterEvent}
                isLoggedIn={isLoggedIn}
                fromPage="event"
              />
            ))
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
