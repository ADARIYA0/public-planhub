'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, MapPin, DollarSign, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Filters } from '@/types';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters
}: SearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    'Semua Kategori',
    'Konferensi',
    'Workshop',
    'Seminar',
    'Meetup',
    'Festival',
    'Concert'
  ];

  const locations = [
    'Semua Lokasi',
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Yogyakarta',
    'Medan',
    'Bali',
    'Online'
  ];

  const priceRanges = [
    'Semua Harga',
    'Gratis',
    'Rp 0 - Rp 100.000',
    'Rp 100.000 - Rp 500.000',
    'Rp 500.000 - Rp 1.000.000',
    'Rp 1.000.000+'
  ];

  const dateRanges = [
    'Semua Waktu',
    'Hari Ini',
    'Minggu Ini',
    'Bulan Ini',
    'Bulan Depan'
  ];

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== 'Semua Kategori' && value !== 'Semua Lokasi' && 
      value !== 'Semua Harga' && value !== 'Semua Waktu'
    ).length;
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.category && filters.category !== 'Semua Kategori') {
      active.push({ key: 'category', label: filters.category });
    }
    if (filters.location && filters.location !== 'Semua Lokasi') {
      active.push({ key: 'location', label: filters.location });
    }
    if (filters.priceRange && filters.priceRange !== 'Semua Harga') {
      active.push({ key: 'priceRange', label: filters.priceRange });
    }
    if (filters.dateRange && filters.dateRange !== 'Semua Waktu') {
      active.push({ key: 'dateRange', label: filters.dateRange });
    }
    return active;
  };

  const removeFilter = (key: string) => {
    const defaultValues = {
      category: 'Semua Kategori',
      location: 'Semua Lokasi',
      priceRange: 'Semua Harga',
      dateRange: 'Semua Waktu'
    };
    handleFilterChange(key as keyof Filters, defaultValues[key as keyof typeof defaultValues]);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Cari event berdasarkan nama, deskripsi, atau kategori..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary transition-colors bg-white"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative border-gray-200 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-2 bg-primary text-white text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Filter Event</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-primary hover:text-teal-700"
                >
                  Reset
                </Button>
              </div>
              
              <Separator className="bg-gray-200" />

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Kategori
                  </label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Lokasi
                  </label>
                  <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center text-gray-700">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    Harga
                  </label>
                  <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Waktu
                  </label>
                  <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Filters */}
        <div className="hidden md:flex items-center gap-3">
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="w-44 h-10 border-gray-200 text-sm">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
            <SelectTrigger className="w-36 h-10 border-gray-200 text-sm">
              <SelectValue placeholder="Semua Waktu" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-primary hover:text-teal-700"
          >
            Hapus Filter
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFilters().length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filter aktif:</span>
          {getActiveFilters().map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 bg-teal-50 text-teal-700 border-teal-200 text-xs"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:bg-teal-100 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
