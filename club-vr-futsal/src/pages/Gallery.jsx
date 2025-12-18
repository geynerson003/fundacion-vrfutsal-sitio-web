import { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaPlay, FaSearchPlus } from 'react-icons/fa';
import { gallery } from '../lib/supabase';

// Componente de imagen con carga visible
const GalleryImage = ({ image, onClick }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className="relative overflow-hidden rounded-lg shadow-lg bg-gray-200 h-64 flex flex-col items-center justify-center cursor-pointer"
        onClick={onClick}
      >
        <FaImage className="text-4xl text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">Error al cargar</span>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer group"
      onClick={onClick}
    >
      <img 
        src={image.image_url} 
        alt={image.title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setError(true)}
        loading="lazy"
      />
      {/* Overlay con icono de zoom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-4">
        <div className="text-white">
          <h3 className="font-bold text-lg drop-shadow">{image.title}</h3>
          {image.description && (
            <p className="text-sm text-gray-200">{image.description}</p>
          )}
        </div>
        <FaSearchPlus className="text-white text-2xl drop-shadow" />
      </div>
    </div>
  );
};

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Videos estáticos de YouTube
  const videos = [
    {
      id: 'video1',
      embedUrl: 'https://www.youtube.com/embed/kZMQRStt6eI',
      title: 'Fundación Deportiva Club V.R',
      description: 'Actividades y momentos especiales'
    },
    {
      id: 'video2',
      embedUrl: 'https://www.youtube.com/embed/_AsqrP7EjvY',
      title: 'Fundación Deportiva Club V.R',
      description: 'Entrenamientos y competencias'
    }
  ];

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await gallery.getAll();
      setImages(data || []);
    } catch (error) {
      console.error('Error cargando galería:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6 fade-in">Galería</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Momentos especiales y recuerdos de nuestra familia Fundación Deportiva Club V.R
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-500">Cargando galería...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <FaImage className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No hay imágenes disponibles por el momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <GalleryImage 
                  key={image.id} 
                  image={image} 
                  onClick={() => openModal(image)} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección de Videos */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center">
            <FaPlay className="mr-3 text-primary" />
            Videos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="w-full" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={video.embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{video.title}</h3>
                  <p className="text-gray-600 text-sm">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes />
          </button>
          
          <div 
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-white text-center mt-4">
              <h3 className="text-xl font-bold">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-gray-300 mt-2">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
