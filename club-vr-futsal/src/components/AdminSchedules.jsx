import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaClock } from 'react-icons/fa';
import { schedules } from '../lib/supabase';

const AdminSchedules = ({ setMessage }) => {
  const [scheduleList, setScheduleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_name: '',
    age_range: '',
    days: '',
    start_time: '16:00',
    end_time: '17:30',
    description: '',
    max_players: 20,
    location: 'Cancha principal',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await schedules.getAllAdmin();
      setScheduleList(data || []);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setMessage({ type: 'error', text: 'Error al cargar los horarios' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await schedules.update(editingId, formData);
        setMessage({ type: 'success', text: 'Horario actualizado correctamente' });
      } else {
        await schedules.create(formData);
        setMessage({ type: 'success', text: 'Horario añadido correctamente' });
      }
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error('Error guardando horario:', error);
      setMessage({ type: 'error', text: 'Error al guardar el horario' });
    }
  };

  const handleEdit = (schedule) => {
    setFormData({
      category_name: schedule.category_name,
      age_range: schedule.age_range,
      days: schedule.days,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      description: schedule.description || '',
      max_players: schedule.max_players,
      location: schedule.location || 'Cancha principal',
      display_order: schedule.display_order,
      is_active: schedule.is_active,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;
    try {
      await schedules.delete(id);
      setMessage({ type: 'success', text: 'Horario eliminado correctamente' });
      loadSchedules();
    } catch (error) {
      console.error('Error eliminando horario:', error);
      setMessage({ type: 'error', text: 'Error al eliminar el horario' });
    }
  };

  const resetForm = () => {
    setFormData({
      category_name: '',
      age_range: '',
      days: '',
      start_time: '16:00',
      end_time: '17:30',
      description: '',
      max_players: 20,
      location: 'Cancha principal',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
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

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botón añadir */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Añadir Categoría/Horario
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Editar Horario' : 'Nuevo Horario'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Sub-11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de edad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.age_range}
                  onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: 9-10 años"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días *
                </label>
                <input
                  type="text"
                  required
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Martes y Jueves"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora inicio *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora fin *
                </label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de jugadores
                </label>
                <input
                  type="number"
                  value={formData.max_players}
                  onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || 20 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Cancha principal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
                placeholder="Descripción del entrenamiento"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Activo (visible en la página de horarios)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave className="mr-2" />
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de horarios */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-bold">Categorías y Horarios ({scheduleList.length})</h3>
        </div>
        {scheduleList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaClock className="mx-auto text-4xl mb-2" />
            <p>No hay horarios configurados</p>
          </div>
        ) : (
          <div className="divide-y">
            {scheduleList.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 hover:bg-gray-50 ${!schedule.is_active ? 'opacity-50 bg-gray-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-bold text-lg text-primary">{schedule.category_name}</h4>
                      <span className="text-sm text-gray-500">({schedule.age_range})</span>
                      <span className={`text-xs px-2 py-1 rounded ${schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {schedule.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>📅 {schedule.days}</div>
                      <div>⏰ {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</div>
                      <div>👥 Máx: {schedule.max_players} jugadores</div>
                    </div>
                    {schedule.description && (
                      <p className="mt-1 text-sm text-gray-500">{schedule.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedules;
