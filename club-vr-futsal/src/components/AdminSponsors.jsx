import { useEffect, useState, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaLink, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const emptyForm = { name: '', logo: '', website: '', type: 'Patrocinador', status: 'Activo', level: '' };

const AdminSponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    try {
      const raw = localStorage.getItem('sponsors') || '[]';
      const parsed = JSON.parse(raw);
      parsed.sort((a,b) => (a.order || 0) - (b.order || 0));
      setSponsors(parsed);
    } catch (e) {
      setSponsors([]);
    }
  };

  const saveAll = (arr) => {
    localStorage.setItem('sponsors', JSON.stringify(arr));
    setSponsors(arr);
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const handleEdit = (s) => {
    setForm({ ...s });
    setEditingId(s.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar patrocinador? Esta acción no se puede deshacer.')) return;
    const next = sponsors.filter(s => s.id !== id);
    saveAll(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Agregar nombre');
      return;
    }

    let next = [...sponsors];
    if (editingId) {
      next = next.map(s => s.id === editingId ? { ...s, ...form } : s);
    } else {
      const id = Date.now().toString();
      next.push({ id, ...form, createdAt: new Date().toISOString(), order: (next.length + 1) });
    }

    // Ensure order is consistent
    next = next.map((s, i) => ({ ...s, order: s.order || i + 1 }));

    saveAll(next);
    setEditingId(null);
    setOpen(false);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { alert('Solo imágenes'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, logo: reader.result }));
    reader.readAsDataURL(f);
  };

  // Mover arriba/abajo
  const moveUp = (id) => {
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx <= 0) return;
    const next = [...sponsors];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    // reasignar orden
    const withOrder = next.map((s, i) => ({ ...s, order: i + 1 }));
    saveAll(withOrder);
  };

  const moveDown = (id) => {
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx === -1 || idx === sponsors.length - 1) return;
    const next = [...sponsors];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    const withOrder = next.map((s, i) => ({ ...s, order: i + 1 }));
    saveAll(withOrder);
  };

  // Normalizar sitio web al perder foco
  const normalizeWebsite = () => {
    if (!form.website) return;
    const v = form.website.trim();
    if (!/^https?:\/\//i.test(v)) {
      setForm(prev => ({ ...prev, website: 'https://' + v }));
    }
  };

  // focus y escape para cerrar modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Gestión de Patrocinadores</h3>
        <div className="flex items-center space-x-2">
          <button onClick={handleAdd} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg">
            <FaPlus />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Tabla para pantallas md+ */}
        <table className="w-full text-sm table-auto hidden md:table">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Logo</th>
              <th className="py-2">Nombre</th>
              <th className="py-2">Tipo / Nivel</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Creado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map(s => (
              <tr key={s.id} className="border-t">
                <td className="py-3">
                  {s.logo ? <img src={s.logo} alt={s.name} className="h-10 object-contain" /> : <div className="text-gray-400">Sin logo</div>}
                </td>
                <td className="py-3">{s.name}</td>
                <td className="py-3">{s.type} {s.level ? `· ${s.level}` : ''}</td>
                <td className="py-3">{s.status}</td>
                <td className="py-3">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {s.website && (
                      <a href={s.website} target="_blank" rel="noreferrer" className="text-blue-600" title="Abrir sitio">
                        <FaLink />
                      </a>
                    )}
                    <button onClick={() => handleEdit(s)} className="text-yellow-600" title="Editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600" title="Eliminar">
                      <FaTrash />
                    </button>
                    <button onClick={() => moveUp(s.id)} className="text-gray-600" title="Subir">
                      <FaArrowUp />
                    </button>
                    <button onClick={() => moveDown(s.id)} className="text-gray-600" title="Bajar">
                      <FaArrowDown />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tarjetas para móvil */}
        <div className="md:hidden space-y-3">
          {sponsors.length === 0 && (
            <div className="p-4 bg-gray-50 text-gray-600 rounded">No hay patrocinadores. Añade uno.</div>
          )}
          {sponsors.map(s => (
            <div key={s.id} className="border rounded p-3 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded">
                  {s.logo ? <img src={s.logo} alt={s.name} className="max-h-12 object-contain" /> : <div className="text-gray-400">Sin logo</div>}
                </div>
                <div>
                  <div className="font-bold">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.type}{s.level ? ` · ${s.level}` : ''}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.website && (
                  <a href={s.website} target="_blank" rel="noreferrer" className="text-blue-600" title="Abrir sitio"><FaLink /></a>
                )}
                <button onClick={() => handleEdit(s)} className="text-yellow-600" title="Editar"><FaEdit /></button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600" title="Eliminar"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal simple */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar' : 'Nuevo'} Patrocinador</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input ref={nameRef} value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium">Logo (URL o subir)</label>
                <input value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} placeholder="https://..." className="mt-1 w-full border rounded px-3 py-2" />
                <div className="mt-2">
                  <input type="file" accept="image/*" onChange={handleFile} />
                </div>
                {form.logo && (
                  <div className="mt-2">
                    <img src={form.logo} alt="Preview logo" className="h-20 object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Sitio web</label>
                  <input value={form.website} onBlur={normalizeWebsite} onChange={e => setForm({...form, website: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tipo</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="mt-1 w-full border rounded px-3 py-2">
                    <option>Patrocinador</option>
                    <option>Aliado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="mt-1 w-full border rounded px-3 py-2">
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>



              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => {
                  const dirty = JSON.stringify(form) !== JSON.stringify(emptyForm) && !editingId;
                  if (dirty && !confirm('Cancelar y perder cambios?')) return;
                  setOpen(false);
                }} className="px-4 py-2 rounded border">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSponsors;
