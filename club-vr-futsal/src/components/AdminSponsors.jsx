import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaHandshake } from 'react-icons/fa';
import { sponsors } from '../lib/supabase';

const AdminSponsors = ({ setMessage }) => {
  const [sponsorList, setSponsorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    sponsor_type: 'aliado',
    is_active: true,
  });

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const data = await sponsors.getAllAdmin();
      setSponsorList(data || []);
    } catch (error) {
      console.error('Error cargando patrocinadores:', error);
      setMessage?.({ type: 'error', text: 'Error al cargar los patrocinadores' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await sponsors.update(editingId, formData);
        setMessage?.({ type: 'success', text: 'Patrocinador actualizado' });
      } else {
        await sponsors.create(formData);
        setMessage?.({ type: 'success', text: 'Patrocinador añadido' });
      }
      resetForm();
      loadSponsors();
    } catch (error) {
      console.error('Error guardando:', error);
      setMessage?.({ type: 'error', text: 'Error al guardar' });
    }
  };

  const handleEdit = (sponsor) => {
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || '',
      sponsor_type: sponsor.sponsor_type,
      is_active: sponsor.is_active,
    });
    setEditingId(sponsor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este patrocinador?')) return;
    try {
      await sponsors.delete(id);
      setMessage?.({ type: 'success', text: 'Patrocinador eliminado' });
      loadSponsors();
    } catch (error) {
      setMessage?.({ type: 'error', text: 'Error al eliminar' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', logo_url: '', website_url: '', sponsor_type: 'aliado', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getTypeLabel = (type) => {
    const labels = { patrocinador: 'Patrocinador', aliado: 'Aliado', colaborador: 'Colaborador' };
    return labels[type] || type;
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <FaPlus className="mr-2" /> Añadir
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar' : 'Nuevo'} Patrocinador</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nombre del patrocinador"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL del Logo</label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="https://ejemplo.com/logo.png"
              />
              {formData.logo_url && (
                <img src={formData.logo_url} alt="Preview" className="mt-2 h-16 object-contain" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sitio Web</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={formData.sponsor_type}
                  onChange={(e) => setFormData({ ...formData, sponsor_type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="patrocinador">Patrocinador</option>
                  <option value="aliado">Aliado</option>
                  <option value="colaborador">Colaborador</option>
                </select>
              </div>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Activo</span>
            </label>

            <div className="flex space-x-3">
              <button type="submit" className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <FaSave className="mr-2" /> Guardar
              </button>
              <button type="button" onClick={resetForm} className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg">
                <FaTimes className="mr-2" /> Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-bold">Aliados y Patrocinadores ({sponsorList.length})</h3>
        </div>
        {sponsorList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaHandshake className="mx-auto text-4xl mb-2" />
            <p>No hay patrocinadores</p>
          </div>
        ) : (
          <div className="divide-y">
            {sponsorList.map((s) => (
              <div key={s.id} className={`p-4 flex items-center ${!s.is_active ? 'opacity-50' : ''}`}>
                <div className="w-14 h-14 mr-4 flex-shrink-0">
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain rounded" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                      <FaHandshake className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{s.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{getTypeLabel(s.sponsor_type)}</span>
                    {!s.is_active && <span className="text-xs px-2 py-0.5 rounded bg-gray-100">Inactivo</span>}
                  </div>
                  {s.website_url && <a href={s.website_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">{s.website_url}</a>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 p-2"><FaEdit /></button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 p-2"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSponsors;
