import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MangaList from './pages/MangaList';
import AddManga from './pages/AddManga';
import SiteManagement from './pages/SiteManagement';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/manga" element={<MangaList />} />
          <Route path="/add-manga" element={<AddManga />} />
          <Route path="/sites" element={<SiteManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
