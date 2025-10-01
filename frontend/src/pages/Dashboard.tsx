import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Globe, TrendingUp, AlertCircle } from 'lucide-react';
import { mangaApi, siteApi, trackingApi } from '../api/client';
import { MangaWithDetails, SiteWithLastSeen } from '../types';

const Dashboard: React.FC = () => {
  const [mangas, setMangas] = useState<MangaWithDetails[]>([]);
  const [sites, setSites] = useState<SiteWithLastSeen[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [mangasData, sitesData] = await Promise.all([
        mangaApi.getMangaList(),
        siteApi.getSitesWithLastSeen()
      ]);
      setMangas(mangasData);
      setSites(sitesData);
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackUpdates = async () => {
    try {
      setIsTracking(true);
      setError(null);
      await trackingApi.trackUpdates();
      // Reload data after tracking
      await loadData();
    } catch (err) {
      setError('Failed to track updates. Please try again.');
      console.error('Error tracking updates:', err);
    } finally {
      setIsTracking(false);
    }
  };

  const activeMangas = mangas.filter(manga => manga.status === 'active');
  const pendingMangas = mangas.filter(manga => manga.status === 'pending');
  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.last_seen_manga).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Track and manage your manga collection</p>
        </div>
        <button
          onClick={handleTrackUpdates}
          disabled={isTracking}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTracking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Tracking...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Track Updates</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-bittersweet-500 to-bittersweet-600 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-scampi-600">Total Manga</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-bittersweet-600 to-scampi-600 bg-clip-text text-transparent">{mangas.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-cucumber-500 to-cucumber-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-scampi-600">Active Manga</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-cucumber-600 to-cucumber-700 bg-clip-text text-transparent">{activeMangas.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-polo-500 to-polo-600 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-scampi-600">Total Sites</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-polo-600 to-polo-700 bg-clip-text text-transparent">{totalSites}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-scampi-500 to-scampi-600 rounded-xl">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-scampi-600">Pending</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-scampi-600 to-scampi-700 bg-clip-text text-transparent">{pendingMangas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Manga Updates */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
          {activeMangas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No manga updates yet. Add some manga and run tracking!</p>
          ) : (
            <div className="space-y-3">
              {activeMangas.slice(0, 5).map((manga) => (
                <div key={`${manga.manga_id}-${manga.site_name}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-azalea-50 to-polo-50 rounded-xl border border-azalea-200 hover:shadow-md transition-all duration-200">
                  <div>
                    <p className="font-semibold text-scampi-800">{manga.manga_name}</p>
                    <p className="text-sm text-scampi-600">{manga.site_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold bg-gradient-to-r from-bittersweet-600 to-scampi-600 bg-clip-text text-transparent">Ch. {manga.last_chapter_scraped}</p>
                    {manga.newly_found_chapters && manga.newly_found_chapters !== '[]' && (
                      <p className="text-xs font-semibold text-cucumber-600 bg-cucumber-100 px-2 py-1 rounded-full">New chapters!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Site Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Status</h3>
          {sites.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sites configured yet. Add some sites to start tracking!</p>
          ) : (
            <div className="space-y-3">
              {sites.map((site) => (
                <div key={site.site_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-polo-50 to-azalea-50 rounded-xl border border-polo-200 hover:shadow-md transition-all duration-200">
                  <div>
                    <p className="font-semibold text-scampi-800">{site.site_name}</p>
                    <p className="text-sm text-scampi-600 truncate max-w-xs">{site.base_url}</p>
                  </div>
                  <div className="text-right">
                    <div className={`w-4 h-4 rounded-full ${site.last_seen_manga ? 'bg-gradient-to-r from-cucumber-500 to-cucumber-600' : 'bg-gradient-to-r from-scampi-300 to-scampi-400'} shadow-sm`}></div>
                    {site.last_seen_manga && (
                      <p className="text-xs text-scampi-600 mt-1 font-medium">
                        Last: {site.last_seen_manga} Ch.{site.last_seen_chapter}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
