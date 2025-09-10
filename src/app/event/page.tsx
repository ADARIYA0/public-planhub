import { Header } from '@/components/Header';

export default function EventPage() {
  return (
    <div className="min-h-screen">
      <Header 
        currentView="search"
        isLoggedIn={false}
      />
    </div>
  );
}
