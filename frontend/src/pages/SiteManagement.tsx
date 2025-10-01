import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, AlertCircle, CheckCircle, X } from 'lucide-react';
import { siteApi } from '../api/client';
import { SiteWithLastSeen, AddSiteRequest } from '../types';

const SiteManagement: React.FC = () => {
  const [sites, setSites] = useState<SiteWithLastSeen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Add Site Form State
  const [formData, setFormData] = useState<AddSiteRequest>({
    name: '',
    base_url: '',
    latest_updates_url: '',
    manga_card_selector: '',
    title_selector: '',
    chapter_selector: '',
    navigation_mode: 'pagination',
    load_more_button_text: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await siteApi.getSitesWithLastSeen();
      setSites(data);
    } catch (err) {
      setError('Failed to load sites. Please check if the backend is running.');
      console.error('Error loading sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: number) => {
    if (!window.confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(siteId);
      setError(null);
      await siteApi.deleteSite(siteId);
      await loadSites(); // Reload the list
    } catch (err) {
      setError('Failed to delete site. Please try again.');
      console.error('Error deleting site:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.base_url.trim() || 
        !formData.latest_updates_url.trim() || !formData.manga_card_selector.trim() ||
        !formData.title_selector.trim() || !formData.chapter_selector.trim()) {
      setFormError('All required fields must be filled');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      setFormSuccess(false);
      
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        base_url: formData.base_url.trim(),
        latest_updates_url: formData.latest_updates_url.trim(),
        manga_card_selector: formData.manga_card_selector.trim(),
        title_selector: formData.title_selector.trim(),
        chapter_selector: formData.chapter_selector.trim(),
        load_more_button_text: formData.load_more_button_text?.trim() || undefined
      };
      
      await siteApi.addSite(submitData);
      
      setFormSuccess(true);
      setFormData({
        name: '',
        base_url: '',
        latest_updates_url: '',
        manga_card_selector: '',
        title_selector: '',
        chapter_selector: '',
        navigation_mode: 'pagination',
        load_more_button_text: ''
      });
      setShowAddForm(false);
      
      await loadSites(); // Reload the list
      
      // Hide success message after 3 seconds
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to add site. Please try again.');
      console.error('Error adding site:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (field: keyof AddSiteRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Site Management</h1>
          <p className="mt-2 text-gray-600">Configure and manage manga tracking sites</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Site</span>
        </button>
      </div>

      {/* Success Alert */}
      {formSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">Site added successfully!</p>
        </div>
      )}

      {/* Error Alert */}
      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error || formError}</p>
        </div>
      )}

      {/* Add Site Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Site</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddSite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Site Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., MangaPark"
                    className="input-field"
                    required
                    disabled={formLoading}
                  />
                </div>
                
                <div>
                  <label className="label">Base URL *</label>
                  <input
                    type="url"
                    value={formData.base_url}
                    onChange={(e) => handleInputChange('base_url', e.target.value)}
                    placeholder="e.g., https://mangapark.io/"
                    className="input-field"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="label">Latest Updates URL *</label>
                <input
                  type="text"
                  value={formData.latest_updates_url}
                  onChange={(e) => handleInputChange('latest_updates_url', e.target.value)}
                  placeholder="e.g., latest"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Relative path from base URL to the latest updates page
                </p>
              </div>

              <div>
                <label className="label">Manga Card Selector *</label>
                <input
                  type="text"
                  value={formData.manga_card_selector}
                  onChange={(e) => handleInputChange('manga_card_selector', e.target.value)}
                  placeholder="e.g., .manga-card"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  CSS selector for individual manga cards on the updates page
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title Selector *</label>
                  <input
                    type="text"
                    value={formData.title_selector}
                    onChange={(e) => handleInputChange('title_selector', e.target.value)}
                    placeholder="e.g., .title"
                    className="input-field"
                    required
                    disabled={formLoading}
                  />
                </div>
                
                <div>
                  <label className="label">Chapter Selector *</label>
                  <input
                    type="text"
                    value={formData.chapter_selector}
                    onChange={(e) => handleInputChange('chapter_selector', e.target.value)}
                    placeholder="e.g., .chapter"
                    className="input-field"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Navigation Mode</label>
                  <select
                    value={formData.navigation_mode}
                    onChange={(e) => handleInputChange('navigation_mode', e.target.value)}
                    className="input-field"
                    disabled={formLoading}
                  >
                    <option value="pagination">Pagination</option>
                    <option value="load_more">Load More</option>
                  </select>
                </div>
                
                {formData.navigation_mode === 'load_more' && (
                  <div>
                    <label className="label">Load More Button Text</label>
                    <input
                      type="text"
                      value={formData.load_more_button_text || ''}
                      onChange={(e) => handleInputChange('load_more_button_text', e.target.value)}
                      placeholder="e.g., Load more"
                      className="input-field"
                      disabled={formLoading}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={formLoading}
                  className="btn-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add Site</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sites List */}
      {sites.length === 0 ? (
        <div className="card text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites configured</h3>
          <p className="text-gray-500 mb-4">Add your first manga tracking site to get started.</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            Add Your First Site
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sites.map((site) => (
            <div key={site.site_id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{site.site_name}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 break-all">{site.base_url}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${site.last_seen_manga ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className={site.last_seen_manga ? 'text-green-600' : 'text-gray-500'}>
                          {site.last_seen_manga ? 'Active' : 'Not tracked yet'}
                        </span>
                      </div>
                    </div>
                    
                    {site.last_seen_manga && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last seen:</span>
                        <span className="text-gray-900">
                          {site.last_seen_manga} Ch.{site.last_seen_chapter}
                        </span>
                      </div>
                    )}
                    
                    {site.load_more_text && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Load more text:</span>
                        <span className="text-gray-900">{site.load_more_text}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSite(site.site_id)}
                  disabled={deleting === site.site_id}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete site"
                >
                  {deleting === site.site_id ? (
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

export default SiteManagement;
