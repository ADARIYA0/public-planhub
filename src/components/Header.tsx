"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Calendar, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  userName?: string;
  transparent?: boolean;
}

export function Header({ 
  currentView = 'home', 
  onViewChange = () => {}, 
  transparent = false 
}: Omit<HeaderProps, 'isLoggedIn' | 'onLogout' | 'userName'>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, isLoggedIn, logout, loading } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { label: 'Beranda', value: 'home', icon: Calendar, route: '/' },
    { label: 'Cari Event', value: 'search', icon: Search, route: '/event' },
  ];

  const userMenuItems = isLoggedIn ? [
    { label: 'Dashboard', value: 'dashboard', icon: User },
    { label: 'Riwayat Event', value: 'history', icon: Calendar },
    { label: 'Sertifikat', value: 'certificates', icon: Calendar },
  ] : [
    { label: 'Masuk', value: 'login', icon: User, route: '/login' },
    { label: 'Daftar', value: 'register', icon: User },
  ];

  const handleMenuClick = (value: string, route?: string) => {
    if (value === 'logout') {
      logout();
    } else if (route) {
      router.push(route);
    } else {
      onViewChange(value);
    }
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 w-full py-2">
      <div className="max-w-4xl mx-auto px-4">
        <header className="bg-slate-800 rounded-2xl shadow-lg">
          <div className="px-6 py-4">
            <div className="flex h-10 items-center justify-between">
              {/* Logo */}
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => router.push('/')}
              >
                <div className="w-8 h-8 bg-coral rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">
                  PlanHub
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {menuItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleMenuClick(item.value, item.route)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                      currentView === item.value
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Profile dropdown when logged in, Masuk button when not */}
                {!loading && isLoggedIn ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center ${
                        isDropdownOpen
                          ? 'bg-primary text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </button>
                    
                    {/* Dropdown Menu with Animation */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out opacity-100 scale-100 animate-slideDown">
                        <button
                          onClick={() => {
                            onViewChange('dashboard');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </button>
                        <button
                          onClick={async () => {
                            const result = await logout();
                            if (result.success) {
                              setIsDropdownOpen(false);
                            } else {
                              // Show error message to user
                              alert(result.message);
                            }
                          }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : !loading ? (
                  <button
                    onClick={handleLoginClick}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                      currentView === 'login'
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    Masuk
                  </button>
                ) : (
                  <div className="px-4 py-2">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </nav>


              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-slate-700">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {!loading && isLoggedIn && (
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-gray-600">Halo,</p>
                        <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
                      </div>
                    )}
                    
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleMenuClick(item.value, item.route)}
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-teal-50 text-left transition-colors"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-900">{item.label}</span>
                        </button>
                      );
                    })}
                    
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleMenuClick(item.value, (item as any).route)}
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-teal-50 text-left transition-colors"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-900">{item.label}</span>
                        </button>
                      );
                    })}
                    
                    {!loading && isLoggedIn && (
                      <button
                        onClick={async () => {
                          const result = await logout();
                          if (result.success) {
                            setIsOpen(false);
                          } else {
                            alert(result.message);
                          }
                        }}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 text-red-600 text-left transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-semibold">Keluar</span>
                      </button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
