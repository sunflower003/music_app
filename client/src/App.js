import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import MainLayout from "./layout/MainLayout.js";
import ArtistDetail from './pages/ArtistDetail';
import PlaylistDetail from "./pages/PlaylistDetail.js";
import AdminAlbumsPage from './pages/admin/AdminAlbumsPage';
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminArtistsPage from './pages/admin/AdminArtistsPage';
import AdminSongsPage from './pages/admin/AdminSongsPage';
import AdminPlaylistsPage from './pages/admin/AdminPlaylistsPage';
import AdminProtectedRoute from "./components/AdminProtectedRoute.js";
import SettingsPage from './pages/SettingsPage';
import AllAlbumsPage from './pages/AllAlbumsPage';
import AllPlaylistsPage from './pages/AllPlaylistsPage'
import FavoritesPage from './pages/FavoritesPage';
import AlbumDetail from './pages/AlbumDetail';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles.css";

function App() {
  return (
    <BrowserRouter>
    <ToastContainer position="top-right" autoClose={1500} />
      <Routes>
        {/* Route cho user */}
        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/home" />
              : <AuthForm />
          }
        />

        
        <Route element={<MainLayout />}>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/artist/:id"
            element={
              <ProtectedRoute>
                <ArtistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlist/:id"
            element={
              <ProtectedRoute>
                <PlaylistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <AllPlaylistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/album/:id"
            element={
              <ProtectedRoute>
                <AlbumDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/albums"
            element={
              <ProtectedRoute>
                <AllAlbumsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>


        {/* Route cho admin */}
        <Route
          path="/admin/artists"
          element={
            <AdminProtectedRoute>
              <AdminArtistsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/songs"
          element={
            <AdminProtectedRoute>
              <AdminSongsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/playlists"
          element={
            <AdminProtectedRoute>
              <AdminPlaylistsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/albums"
          element={
            <AdminProtectedRoute>
              <AdminAlbumsPage />
            </AdminProtectedRoute>
          }  
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsersPage />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}






export default App;
