import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaUpload, FaCheck, FaDatabase, FaCloud } from 'react-icons/fa';
import { gallery } from '../lib/supabase';

const AdminGallery = ({ setMessage }) => {
  const [images, setImages] = useState([]);
  const [storageFiles, setStorageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [galleryData, storageData] = await Promise.all([
        gallery.getAllAdmin(),
        gallery.listStorageFiles()
      ]);
      setImages(galleryData || []);
      setStorageFiles(storageData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setMessage({ type: 'error', text: 'Error al cargar las imágenes' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await gallery.update(editingId, formData);
        setMessage({ type: 'success', text: 'Imagen actualizada correctamente' });
      } else {
        await gallery.create(formData);
        setMessage({ type: 'success', text: 'Imagen añadida a la galería' });
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando imagen:', error);
      setMessage({ type: 'error', text: 'Error al guardar la imagen' });
    }
  };

  const handleEdit = (image) => {
    setFormData({
      title: image.title,
      description: image.description || '',
      image_url: image.image_url,
      display_order: image.display_order,
      is_active: image.is_active,
    });
    setEditingId(image.id);
    setShowForm(true);
    setActiveTab('gallery');
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen de la galería?')) return;
    try {
      await gallery.delete(id);
      setMessage({ type: 'success', text: 'Imagen eliminada de la galería' });
      loadData();
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      setMessage({ type: 'error', text: 'Error al eliminar la imagen' });
    }
  };

  const handleDeleteStorageFile = async (fileName) => {
    if (!confirm(`¿Eliminar "${fileName}" del almacenamiento? Esta acción es permanente.`)) return;
    try {
      await gallery.deleteStorageFile(fileName);
      setMessage({ type: 'success', text: 'Archivo eliminado del almacenamiento' });
      loadData();
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      setMessage({ type: 'error', text: 'Error al eliminar el archivo' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no debe superar 5MB' });
      return;
    }

    try {
      setUploading(true);
      const url = await gallery.uploadImage(file, file.name.split('.')[0]);
      setMessage({ type: 'success', text: 'Imagen subida correctamente' });
      loadData();
      
      if (showForm) {
        setFormData({ ...formData, image_url: url });
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addToGallery = (file) => {
    setFormData({
      title: file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
      description: '',
      image_url: file.publicUrl,
      display_order: images.length,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(true);
    setActiveTab('gallery');
  };

  const isInGallery = (publicUrl) => {
    return images.some(img => img.image_url === publicUrl);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
            activeTab === 'gallery'
              ? 'bg-white text-primary shadow font-semibold'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FaDatabase className="mr-2" />
          Galería Pública ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
            activeTab === 'storage'
              ? 'bg-white text-primary shadow font-semibold'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FaCloud className="mr-2" />
          Almacenamiento ({storageFiles.length})
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        {activeTab === 'gallery' && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Nueva Imagen
          </button>
        )}
        <label className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <FaUpload className="mr-2" />
          {uploading ? 'Subiendo...' : 'Subir Imagen'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Editar Imagen' : 'Añadir a Galería Pública'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.image_url && (
              <div className="flex justify-center">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-40 object-contain rounded-lg border"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Título de la imagen"
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
                rows="2"
                placeholder="Descripción opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de la Imagen
              </label>
              <input
                type="url"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://..."
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
                Visible en la galería pública
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

      {/* Tab: Galería Pública */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-bold">Imágenes en la Galería Pública</h3>
            <p className="text-sm text-gray-500">Estas imágenes son visibles para todos los visitantes</p>
          </div>
          {images.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaImage className="mx-auto text-4xl mb-2" />
              <p>No hay imágenes en la galería pública</p>
              <p className="text-sm mt-2">Ve a "Almacenamiento" para agregar imágenes</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`border rounded-lg overflow-hidden ${!image.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="h-32 bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h4 className="font-semibold text-sm truncate">{image.title}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {image.is_active ? 'Activo' : 'Oculto'}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(image)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Quitar de galería"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Almacenamiento */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-bold">Todas las Imágenes en Supabase</h3>
            <p className="text-sm text-gray-500">Archivos almacenados en la nube. Haz clic en "Añadir" para mostrarlos en la galería pública.</p>
          </div>
          {storageFiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaCloud className="mx-auto text-4xl mb-2" />
              <p>No hay imágenes en el almacenamiento</p>
              <p className="text-sm mt-2">Usa el botón "Subir Imagen" para agregar</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {storageFiles.map((file) => {
                const inGallery = isInGallery(file.publicUrl);
                return (
                  <div
                    key={file.name}
                    className={`border rounded-lg overflow-hidden relative ${inGallery ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {inGallery && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 z-10">
                        <FaCheck size={10} />
                      </div>
                    )}
                    <div className="h-28 bg-gray-100">
                      <img
                        src={file.publicUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate" title={file.name}>{file.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        {inGallery ? (
                          <span className="text-xs text-green-600 font-medium">En galería</span>
                        ) : (
                          <button
                            onClick={() => addToGallery(file)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            + Añadir
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStorageFile(file.name)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar archivo"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
