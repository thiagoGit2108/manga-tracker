import React, { useState } from 'react';
import { Plus, X, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { mangaApi } from '../api/client';

const AddManga: React.FC = () => {
  const [mangaName, setMangaName] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAlias = () => {
    if (newAlias.trim() && !aliases.includes(newAlias.trim())) {
      setAliases([...aliases, newAlias.trim()]);
      setNewAlias('');
    }
  };

  const handleRemoveAlias = (index: number) => {
    setAliases(aliases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mangaName.trim()) {
      setError('Manga name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await mangaApi.addManga({
        manga_name: mangaName.trim(),
        aliases: aliases.length > 0 ? aliases : undefined
      });
      
      setSuccess(true);
      setMangaName('');
      setAliases([]);
      setNewAlias('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add manga. Please try again.');
      console.error('Error adding manga:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Manga</h1>
        <p className="mt-2 text-gray-600">Add a manga to start tracking updates across your configured sites</p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">Manga added successfully! It will be tracked when found on any configured sites.</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Manga Name */}
          <div>
            <label htmlFor="mangaName" className="label">
              Manga Name *
            </label>
            <input
              type="text"
              id="mangaName"
              value={mangaName}
              onChange={(e) => setMangaName(e.target.value)}
              placeholder="Enter the primary manga name"
              className="input-field"
              required
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              This is the main name that will be used to identify the manga
            </p>
          </div>

          {/* Aliases */}
          <div>
            <label className="label">Aliases (Optional)</label>
            <p className="mb-3 text-sm text-gray-500">
              Add alternative names or titles that might be used on different sites
            </p>
            
            {/* Alias Input */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                placeholder="Enter an alias name"
                className="input-field flex-1"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAlias();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAlias}
                disabled={loading || !newAlias.trim()}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Alias List */}
            {aliases.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Current aliases:</p>
                <div className="flex flex-wrap gap-2">
                  {aliases.map((alias, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      <span>{alias}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlias(index)}
                        disabled={loading}
                        className="ml-2 text-primary-600 hover:text-primary-800 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setMangaName('');
                setAliases([]);
                setNewAlias('');
                setError(null);
                setSuccess(false);
              }}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !mangaName.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  <span>Add Manga</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">How it works</h3>
            <p className="mt-1 text-sm text-blue-800">
              Once you add a manga, the tracker will automatically monitor your configured sites for updates. 
              When new chapters are found, they'll appear in your manga list and dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddManga;
