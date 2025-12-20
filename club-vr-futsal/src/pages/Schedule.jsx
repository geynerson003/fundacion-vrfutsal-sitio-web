import { useState, useEffect } from 'react';
import { FaClock, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { schedules } from '../lib/supabase';

const Schedule = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await schedules.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error cargando horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear hora para mostrar (de 16:00:00 a 4:00 PM)
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 text-white">
        {/* Fondo degradado horizontal */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-700 to-emerald-950" />
        {/* Overlay suave para contraste */}
        <div className="absolute inset-0 bg-black/15" />

        {/* Luces suaves decorativas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-28 h-96 w-96 rounded-full bg-emerald-300/10 blur-2xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6 fade-in drop-shadow-sm">
            Horarios y Categorías
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90">
            Encuentra la categoría perfecta para tu edad y revisa nuestros horarios de entrenamiento
          </p>
        </div>
      </section>

      {/* Categorías y horarios */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-500">Cargando horarios...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FaClock className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No hay horarios disponibles por el momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden card-hover"
                >
                  {/* Header de la card */}
                  <div className="bg-primary text-white p-6 text-center">
                    <h3 className="text-3xl font-bold mb-2">{category.category_name}</h3>
                    <p className="text-lg">{category.age_range}</p>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start">
                      <FaCalendarAlt className="text-primary text-xl mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Días</p>
                        <p className="text-gray-600">{category.days}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaClock className="text-primary text-xl mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Horario</p>
                        <p className="text-gray-600">
                          {formatTime(category.start_time)} - {formatTime(category.end_time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaUsers className="text-primary text-xl mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-700">Cupos</p>
                        <p className="text-gray-600">{category.max_players} jugadores</p>
                      </div>
                    </div>

                    {category.location && (
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-primary text-xl mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-700">Ubicación</p>
                          <p className="text-gray-600">{category.location}</p>
                        </div>
                      </div>
                    )}

                    {category.description && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Información adicional */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-6">¿Quieres unirte a nosotros?</h2>
          <p className="text-gray-600 mb-6">
            Contáctanos para más información sobre inscripciones, horarios disponibles y pruebas de selección.
          </p>
          <a
            href="/contacto"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Contáctanos
          </a>
        </div>
      </section>
    </div>
  );
};

export default Schedule;
