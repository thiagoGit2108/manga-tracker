import React, { useState, useEffect } from 'react';
import { Trash2, ExternalLink, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { mangaApi } from '../api/client';
import { MangaWithDetails } from '../types';

const MangaList: React.FC = () => {
  const [mangas, setMangas] = useState<MangaWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadMangas();
  }, []);

  const loadMangas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mangaApi.getAllMangas();
      setMangas(data);
    } catch (err) {
      setError('Failed to load manga list. Please check if the backend is running.');
      console.error('Error loading mangas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManga = async (mangaId: number) => {
    if (!window.confirm('Are you sure you want to delete this manga? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(mangaId);
      setError(null);
      await mangaApi.deleteManga(mangaId);
      await loadMangas(); // Reload the list
    } catch (err) {
      setError('Failed to delete manga. Please try again.');
      console.error('Error deleting manga:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group mangas by manga_id
  const groupedMangas = mangas.reduce((acc, manga) => {
    const key = manga.manga_id;
    if (!acc[key]) {
      acc[key] = {
        manga_id: manga.manga_id,
        manga_name: manga.manga_name,
        sources: []
      };
    }
    if (manga.site_name) {
      acc[key].sources.push({
        site_name: manga.site_name,
        url_on_site: manga.url_on_site,
        last_chapter_scraped: manga.last_chapter_scraped,
        newly_found_chapters: manga.newly_found_chapters,
        status: manga.status
      });
    }
    return acc;
  }, {} as Record<number, { manga_id: number; manga_name: string; sources: any[] }>);

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
          <h1 className="text-3xl font-bold text-gray-900">Manga List</h1>
          <p className="mt-2 text-gray-600">Manage your manga collection and track updates</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Total: {Object.keys(groupedMangas).length} manga
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Manga List */}
      {Object.keys(groupedMangas).length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No manga found</h3>
          <p className="text-gray-500 mb-4">Get started by adding some manga to track.</p>
          <a href="/add-manga" className="btn-primary">
            Add Your First Manga
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedMangas).map((manga) => (
            <div key={manga.manga_id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{manga.manga_name}</h3>
                    {manga.sources.length > 0 && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(manga.sources[0].status)}`}>
                        {manga.sources[0].status || 'Not tracked'}
                      </span>
                    )}
                  </div>

                  {manga.sources.length === 0 ? (
                    <p className="text-gray-500 italic">Not tracked on any sites yet</p>
                  ) : (
                    <div className="space-y-2">
                      {manga.sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(source.status)}
                            <div>
                              <p className="font-medium text-gray-900">{source.site_name}</p>
                              {source.last_chapter_scraped && (
                                <p className="text-sm text-gray-500">
                                  Latest: Chapter {source.last_chapter_scraped}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {source.newly_found_chapters && source.newly_found_chapters !== '[]' && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                New chapters!
                              </span>
                            )}
                            {source.url_on_site && (
                              <a
                                href={source.url_on_site}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                title="Open on site"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteManga(manga.manga_id)}
                  disabled={deleting === manga.manga_id}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete manga"
                >
                  {deleting === manga.manga_id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaList;
