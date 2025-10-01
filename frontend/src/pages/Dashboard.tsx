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
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Manga</p>
              <p className="text-2xl font-bold text-gray-900">{mangas.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Manga</p>
              <p className="text-2xl font-bold text-gray-900">{activeMangas.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sites</p>
              <p className="text-2xl font-bold text-gray-900">{totalSites}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingMangas.length}</p>
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
                <div key={`${manga.manga_id}-${manga.site_name}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{manga.manga_name}</p>
                    <p className="text-sm text-gray-500">{manga.site_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600">Ch. {manga.last_chapter_scraped}</p>
                    {manga.newly_found_chapters && manga.newly_found_chapters !== '[]' && (
                      <p className="text-xs text-green-600">New chapters!</p>
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
                <div key={site.site_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{site.site_name}</p>
                    <p className="text-sm text-gray-500">{site.base_url}</p>
                  </div>
                  <div className="text-right">
                    <div className={`w-3 h-3 rounded-full ${site.last_seen_manga ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    {site.last_seen_manga && (
                      <p className="text-xs text-gray-500 mt-1">
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
