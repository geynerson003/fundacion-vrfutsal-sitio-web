import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaSignOutAlt, FaCheck, FaTimes, FaClock, FaHandshake, FaChartBar, FaUser } from 'react-icons/fa';
import AdminSponsors from '../components/AdminSponsors';
import AdminSchedules from '../components/AdminSchedules';
import AdminGallery from '../components/AdminGallery';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('gallery');

  useEffect(() => {
    // Verificar autenticación con Supabase
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-primary text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { id: 'gallery', name: 'Galería', icon: FaImage },
    { id: 'schedules', name: 'Horarios', icon: FaClock },
    { id: 'sponsors', name: 'Aliados/Patrocinadores', icon: FaHandshake },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-green-100 flex items-center mt-1">
                <FaUser className="mr-2" />
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaSignOutAlt />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar / Menu */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h3 className="font-bold text-lg mb-3 text-gray-700">Secciones</h3>
              <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center text-left w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      activeSection === item.id ? 'bg-primary text-white hover:bg-green-700' : ''
                    }`}
                  >
                    <item.icon className="mr-3" />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="md:col-span-3 space-y-6">
            {/* Messages */}
            {message.text && (
              <div className={`p-4 rounded-lg border-l-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <div className="flex items-center">
                  {message.type === 'success' ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Section Title */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                {menuItems.find(m => m.id === activeSection)?.icon && (
                  <span className="mr-3 text-primary">
                    {(() => {
                      const Icon = menuItems.find(m => m.id === activeSection)?.icon;
                      return Icon ? <Icon /> : null;
                    })()}
                  </span>
                )}
                Gestionar {menuItems.find(m => m.id === activeSection)?.name}
              </h2>
              <p className="text-gray-600 mt-2">
                {activeSection === 'gallery' && 'Añade, edita o elimina imágenes de la galería del club.'}
                {activeSection === 'schedules' && 'Administra los horarios y categorías de entrenamiento.'}
                {activeSection === 'sponsors' && 'Gestiona los aliados y patrocinadores del club.'}
              </p>
            </div>

            {/* Content Sections */}
            {activeSection === 'gallery' && <AdminGallery setMessage={setMessage} />}
            {activeSection === 'schedules' && <AdminSchedules setMessage={setMessage} />}
            {activeSection === 'sponsors' && <AdminSponsors setMessage={setMessage} />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
