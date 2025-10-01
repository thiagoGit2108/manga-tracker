import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Plus, Settings, Home, List } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Manga List', href: '/manga', icon: List },
    { name: 'Add Manga', href: '/add-manga', icon: Plus },
    { name: 'Sites', href: '/sites', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-azalea-50 via-white to-polo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-azalea-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-bittersweet-500 to-scampi-500 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-scampi-600 to-bittersweet-600 bg-clip-text text-transparent">Manga Tracker</h1>
            </div>
            <div className="hidden md:block">
              <nav className="flex space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        'inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                        isActive
                          ? 'text-bittersweet-600 bg-azalea-100 border-b-2 border-bittersweet-600'
                          : 'text-scampi-600 hover:text-bittersweet-600 hover:bg-azalea-50'
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-azalea-200">
        <nav className="flex space-x-2 px-4 py-2 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-bittersweet-500 to-bittersweet-600 text-white shadow-lg'
                    : 'text-scampi-600 hover:text-bittersweet-600 hover:bg-azalea-100'
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
