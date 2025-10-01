import axios from 'axios';
import { AddSiteRequest, AddMangaRequest, MangaWithDetails, SiteWithLastSeen } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mangaApi = {
  // Get all mangas with details
  getAllMangas: async (): Promise<MangaWithDetails[]> => {
    const response = await api.get('/all-mangas');
    return response.data.mangas;
  },

  // Get manga list (only tracked ones)
  getMangaList: async (): Promise<MangaWithDetails[]> => {
    const response = await api.get('/manga-list');
    return response.data.mangas;
  },

  // Add new manga
  addManga: async (manga: AddMangaRequest): Promise<void> => {
    await api.post('/add-manga', manga);
  },

  // Delete manga
  deleteManga: async (mangaId: number): Promise<void> => {
    await api.delete(`/delete-manga/${mangaId}`);
  },
};

export const siteApi = {
  // Get sites with last seen info
  getSitesWithLastSeen: async (): Promise<SiteWithLastSeen[]> => {
    const response = await api.get('/sites-with-last-seen');
    return response.data.sites;
  },

  // Add new site
  addSite: async (site: AddSiteRequest): Promise<void> => {
    await api.post('/add-site', site);
  },

  // Delete site
  deleteSite: async (siteId: number): Promise<void> => {
    await api.delete(`/remove-site/${siteId}`);
  },
};

export const trackingApi = {
  // Trigger manual tracking
  trackUpdates: async (): Promise<void> => {
    await api.get('/track-updates');
  },
};

export default api;
