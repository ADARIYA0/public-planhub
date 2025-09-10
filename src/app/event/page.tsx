'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { SearchFilters } from '@/components/SearchFilters';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';
import { mockEvents } from '@/data/mockEvents';
import { Event, User, Filters } from '@/types';

export default function EventPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: 'Semua Kategori',
    location: 'Semua Lokasi',
    priceRange: 'Semua Harga',
    dateRange: 'Semua Waktu'
  });

  // Filter events based on search query and filters
  const filteredEvents = useMemo(() => {
    let filtered = mockEvents;

    // Search by query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category && filters.category !== 'Semua Kategori') {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // Filter by location
    if (filters.location && filters.location !== 'Semua Lokasi') {
      if (filters.location === 'Online') {
        filtered = filtered.filter(event => 
          event.location.toLowerCase().includes('online') || 
          event.location.toLowerCase().includes('virtual')
        );
      } else {
        filtered = filtered.filter(event => 
          event.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
    }

    // Filter by price range
    if (filters.priceRange && filters.priceRange !== 'Semua Harga') {
      switch (filters.priceRange) {
        case 'Gratis':
          filtered = filtered.filter(event => event.price === 0);
          break;
        case 'Rp 0 - Rp 100.000':
          filtered = filtered.filter(event => event.price >= 0 && event.price <= 100000);
          break;
        case 'Rp 100.000 - Rp 500.000':
          filtered = filtered.filter(event => event.price > 100000 && event.price <= 500000);
          break;
        case 'Rp 500.000 - Rp 1.000.000':
          filtered = filtered.filter(event => event.price > 500000 && event.price <= 1000000);
          break;
        case 'Rp 1.000.000+':
          filtered = filtered.filter(event => event.price > 1000000);
          break;
      }
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange !== 'Semua Waktu') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'Hari Ini':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === today.toDateString();
          });
          break;
        case 'Minggu Ini':
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
          });
          break;
        case 'Bulan Ini':
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextMonth;
          });
          break;
        case 'Bulan Depan':
          const monthAfterNext = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
          const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= nextMonthStart && eventDate <= monthAfterNext;
          });
          break;
      }
    }

    // Sort by date (nearest first)
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters({
      category: 'Semua Kategori',
      location: 'Semua Lokasi',
      priceRange: 'Semua Harga',
      dateRange: 'Semua Waktu'
    });
    setSearchQuery('');
  };

  const handleViewEvent = (eventId: string) => {
    console.log('View event:', eventId);
  };

  const handleRegisterEvent = (eventId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    console.log('Register for event:', eventId);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentView="search"
        isLoggedIn={!!user}
        userName={user?.name}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Cari Event Favoritmu</h1>
          <p className="text-gray-600 mb-5">
            Temukan event yang sesuai dengan minat dan kebutuhanmu
          </p>
          
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {filteredEvents.length} Event Ditemukan
            </h2>
            <div className="text-sm text-gray-500">
              Diurutkan berdasarkan waktu terdekat
            </div>
          </div>
          <Separator className="mt-3 bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={handleViewEvent}
              onRegister={handleRegisterEvent}
              isLoggedIn={!!user}
              fromPage="event"
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-10">
            <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-600 mb-2">
              Tidak ada event yang ditemukan
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Coba ubah filter atau kata kunci pencarian
            </p>
            <Button 
              onClick={handleClearFilters} 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
