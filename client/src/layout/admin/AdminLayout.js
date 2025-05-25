import React from 'react';
import Sidebar from './Sidebar.js';
import Header from './Header.js';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-container" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ padding: '20px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
