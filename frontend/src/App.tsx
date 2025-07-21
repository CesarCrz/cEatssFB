import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Importamos Navigate
import './App.css'; // Mantener estilos si existen o ajustar según necesites

// Importa los componentes de tus páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Crea componentes placeholder para las páginas que aún no hemos desarrollado
// Eliminamos HomePage ya que la raíz redirigirá a login
const RestaurantMenuPage = () => <div>Página del Menú del Restaurante</div>; // Este ya no sería necesario si solo hay paneles
const RestaurantDashboard = () => <div>Panel del Restaurante</div>;
const AdminDashboard = () => <div>Panel de Administración</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Aquí podrías añadir una barra de navegación global si la necesitas */}
        <Routes>
          {/* Redirigir la ruta raíz a /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Mantener estas rutas por ahora, aunque RestaurantMenuPage podría eliminarse */}
          <Route path="/restaurant/:restaurantId" element={<RestaurantMenuPage />} />
          <Route path="/dashboard/restaurant/:restaurantId" element={<RestaurantDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          {/* Puedes añadir una ruta 404 aquí si lo deseas */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;