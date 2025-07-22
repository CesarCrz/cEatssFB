import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Importa los componentes de tus páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard'; // Importamos AdminDashboard
import PendingOrdersPage from './pages/PendingOrdersPage'; // Importamos PendingOrdersPage (como panel de restaurante inicial)

// Eliminamos placeholders para las páginas que ya creamos o no usaremos
// const HomePage = () => <div>Página de Inicio (Selección de Restaurante)</div>; // Eliminado
// const RestaurantMenuPage = () => <div>Página del Menú del Restaurante</div>; // Este podría eliminarse o moverse si el enfoque es solo paneles
// const RestaurantDashboard = () => <div>Panel del Restaurante</div>; // Reemplazado por PendingOrdersPage por ahora

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

          {/* Rutas de los Paneles de Administración y Restaurante */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} /> {/* Ruta para el Panel de Administración */}
          {/* Usamos PendingOrdersPage como el componente para el panel de restaurante por ahora */}
          <Route path="/dashboard/restaurant/:restaurantId" element={<PendingOrdersPage />} /> {/* Ruta para el Panel de Restaurante (pedidos pendientes) */}

          {/* Mantener o eliminar rutas no usadas según el enfoque final */}
          {/* <Route path="/restaurant/:restaurantId" element={<RestaurantMenuPage />} /> */}

          {/* Puedes añadir una ruta 404 aquí si lo deseas */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
