import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaSignOutAlt, FaUpload, FaCheck, FaTimes } from 'react-icons/fa';
import AdminSponsors from '../components/AdminSponsors';

// Importar imágenes por defecto
import heroBgDefault from '../assets/hero-bg.jpg';
import aboutTeamDefault from '../assets/about-team.jpg';
import foto1Default from '../assets/gallery/foto1.jpg';
import foto2Default from '../assets/gallery/foto2.jpg';
import foto3Default from '../assets/gallery/foto3.jpg';
import foto4Default from '../assets/gallery/foto4.jpg';
import foto5Default from '../assets/gallery/foto5.jpg';
import foto6Default from '../assets/gallery/foto6.jpg';
import foto7Default from '../assets/gallery/foto7.jpg';
import foto8Default from '../assets/gallery/foto8.jpg';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentImages, setCurrentImages] = useState({});
  const [activeSection, setActiveSection] = useState('images');
  const mainRef = useRef(null);

  useEffect(() => {
    // Verificar autenticación
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    // Cargar imágenes actuales desde el servidor
    loadCurrentImages();
  }, [navigate]);

  const loadCurrentImages = async () => {
    // Mapeo de imágenes por defecto
    const defaultImages = {
      'hero-bg': heroBgDefault,
      'about-team': aboutTeamDefault,
      'foto1': foto1Default,
      'foto2': foto2Default,
      'foto3': foto3Default,
      'foto4': foto4Default,
      'foto5': foto5Default,
      'foto6': foto6Default,
      'foto7': foto7Default,
      'foto8': foto8Default,
    };

    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      // En desarrollo, usar imágenes por defecto
      setCurrentImages(defaultImages);
      return;
    }

    try {
      // En producción, cargar desde el servidor
      const response = await fetch('/api/upload-image.php');
      const data = await response.json();
      
      if (data.success && data.images) {
        // Combinar imágenes subidas con las por defecto
        const mergedImages = { ...defaultImages };
        Object.keys(data.images).forEach(key => {
          mergedImages[key] = data.images[key];
        });
        setCurrentImages(mergedImages);
      } else {
        setCurrentImages(defaultImages);
      }
    } catch (error) {
      console.error('Error cargando imágenes actuales:', error);
      setCurrentImages(defaultImages);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUser');
    navigate('/');
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido' });
        return;
      }

      if (file.size > 5000000) { // 5MB
        setMessage({ type: 'error', text: 'La imagen no debe superar 5MB' });
        return;
      }

      setSelectedImage(file);
      setUploadType(type);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !uploadType) {
      setMessage({ type: 'error', text: 'Por favor selecciona una imagen primero' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    // Detectar si estamos en desarrollo local
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      // Modo desarrollo: Simular la subida
      setTimeout(() => {
        setMessage({ 
          type: 'success', 
          text: '✅ MODO DESARROLLO: La imagen se subiría correctamente en el servidor real. En desarrollo local, esta es solo una simulación. Sube el proyecto al hosting para que funcione realmente.' 
        });
        setSelectedImage(null);
        setPreview('');
        setUploadType('');
        setUploading(false);
      }, 1000);
      return;
    }

    // Modo producción: Usar el script PHP
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('type', uploadType);

    try {
      const response = await fetch('/api/upload-image.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '¡Imagen actualizada exitosamente! Recarga la página para ver los cambios.' });
        setSelectedImage(null);
        setPreview('');
        setUploadType('');
        // Recargar imágenes actuales
        loadCurrentImages();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al subir la imagen' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión. Asegúrate de que el archivo /api/upload-image.php esté en el servidor y que PHP esté habilitado.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const imageTypes = [
    { id: 'hero-bg', name: 'Imagen de Fondo Principal', description: 'Imagen grande de fondo en la página de inicio' },
    { id: 'about-team', name: 'Foto del Equipo', description: 'Imagen del equipo en la página "Sobre Nosotros"' },
    { id: 'foto1', name: 'Galería - Foto 1', description: 'Primera foto de la galería' },
    { id: 'foto2', name: 'Galería - Foto 2', description: 'Segunda foto de la galería' },
    { id: 'foto3', name: 'Galería - Foto 3', description: 'Tercera foto de la galería' },
    { id: 'foto4', name: 'Galería - Foto 4', description: 'Cuarta foto de la galería' },
    { id: 'foto5', name: 'Galería - Foto 5', description: 'Quinta foto de la galería' },
    { id: 'foto6', name: 'Galería - Foto 6', description: 'Sexta foto de la galería' },
    { id: 'foto7', name: 'Galería - Foto 7', description: 'Séptima foto de la galería' },
    { id: 'foto8', name: 'Galería - Foto 8', description: 'Octava foto de la galería' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
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
        {/* Layout: Sidebar menu + Main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar / Menu */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h3 className="font-bold text-lg mb-3">Secciones</h3>
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setActiveSection('images');
                    setTimeout(() => document.getElementById('images-section')?.scrollIntoView({ behavior: 'smooth' }), 60);
                  }}
                  className={`text-left w-full px-3 py-2 rounded-lg hover:bg-gray-100 ${activeSection === 'images' ? 'bg-gray-100 font-semibold' : ''}`}
                >
                  Gestionar Imágenes
                </button>
                <button
                  onClick={() => {
                    setActiveSection('sponsors');
                    setTimeout(() => document.getElementById('sponsors-section')?.scrollIntoView({ behavior: 'smooth' }), 60);
                  }}
                  className={`text-left w-full px-3 py-2 rounded-lg hover:bg-gray-100 ${activeSection === 'sponsors' ? 'bg-gray-100 font-semibold' : ''}`}
                >
                  Gestionar Patrocinadores
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="md:col-span-3 space-y-6">
        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
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

        {/* Section Info */}
        <div className="mb-6">
          {activeSection === 'images' && (
            <div className="p-4 rounded-lg border-l-4 bg-blue-50 border-green-500 text-green-800">
              <h3 className="font-bold">Gestionar Imágenes</h3>
              <p className="text-sm">Selecciona la imagen que quieras cambiar, revisa la vista previa y sube la nueva imagen. Las imágenes deben ser JPG/PNG y no superar 5MB.</p>
            </div>
          )}
          {activeSection === 'sponsors' && (
            <div className="p-4 rounded-lg border-l-4 bg-green-50 border-green-500 text-green-800">
              <h3 className="font-bold">Gestionar Aliados y Patrocinadores</h3>
              <p className="text-sm">Añade, edita o reordena Aliados y Patrocinadores. El campo "Tipo" define si se mostrará como Aliado o Patrocinador en la web pública.</p>
            </div>
          )}
        </div>

        {/* Instrucciones y Advertencia - mostrar antes de la subida y lista */}
        {activeSection === 'images' && (
          <>
            <div className="mt-0 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Instrucciones — Gestionar Imágenes</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                <li>Selecciona la imagen para la sección correspondiente (p. ej. 'Imagen de Fondo Principal').</li>
                <li>Verás una vista previa antes de subirla; confirma que sea la correcta.</li>
                <li>Haz clic en "Subir Imagen" para enviar al servidor (o simular en modo desarrollo).</li>
                <li>Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB.</li>
                <li>En entorno local la subida es simulada; en producción se guarda en el hosting con PHP.</li>
              </ul>
            </div>

            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ MODO DESARROLLO:</h3>
                <p className="text-yellow-800 text-sm">
                  Estás en desarrollo local. El panel de administración funciona en modo simulación.
                  Para que las imágenes se suban realmente, debes desplegar el proyecto al hosting compartido con PHP.
                </p>
              </div>
            )}
          </>
        )}

        {/* Upload Section */}
        {activeSection === 'images' && preview && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Vista Previa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-2">
                  {imageTypes.find(t => t.id === uploadType)?.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {imageTypes.find(t => t.id === uploadType)?.description}
                </p>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaUpload />
                  <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                </button>
                <button
                  onClick={() => {
                    setPreview('');
                    setSelectedImage(null);
                    setUploadType('');
                  }}
                  className="mt-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image List - sección anclada */}
        {activeSection === 'images' && (
          <div id="images-section" className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center">
            <FaImage className="mr-3 text-primary" />
            Gestionar Imágenes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageTypes.map((type) => (
              <div key={type.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Vista previa de la imagen actual */}
                <div className="w-full h-40 bg-gray-100">
                  {currentImages[type.id] ? (
                    <img 
                      src={currentImages[type.id]} 
                      alt={type.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaImage size={40} />
                    </div>
                  )}
                </div>
                
                {/* Información y botón */}
                <div className="p-4">
                  <h3 className="font-bold text-secondary mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  <label className="cursor-pointer">
                    <div className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center">
                      Cambiar Imagen
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, type.id)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {activeSection === 'sponsors' && (
          <div className="mt-6 bg-green-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Instrucciones — Gestionar Aliados y Patrocinadores</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Usa "Añadir" para crear un nuevo Aliado o Patrocinador.</li>
              <li>El campo <strong>Tipo</strong> determina si será "Aliado" o "Patrocinador" en tu gestor.</li>
              <li>Logo: puedes pegar una URL o subir una imagen (se guarda en <code>localStorage</code> como DataURL en modo local).</li>
              <li><strong>Recomendable: </strong>Pasar tu logo por <strong><a href="https://www.remove.bg/es">Remove.bg</a></strong> para eliminar el fondo del logo</li>
              <li>Estado: marca <em>Activo</em> para que se muestre públicamente; <em>Inactivo</em> lo ocultará.</li>
              <li>Reordena con las flechas para cambiar la prioridad/posición en la lista pública.</li>
              <li>Eliminar pedirá confirmación; los cambios se guardan automáticamente en el panel.</li>
            </ul>
          </div>
        )}

        {/* Sponsors - sección anclada */}
        {activeSection === 'sponsors' && (
          <div id="sponsors-section" className="mt-6">
            <AdminSponsors />
          </div>
        )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

