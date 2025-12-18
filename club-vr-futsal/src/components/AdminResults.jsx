import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const emptyForm = {
  category: 'Sub-17',
  rival: '',
  score: '0 - 0',
  date: '',
  city: '',
  status: 'Activo',
};

const normalizeScore = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return '';
  return v.replace(/\s*-\s*/g, ' - ');
};

const safeParseArray = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const rivalRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const parsed = safeParseArray(localStorage.getItem('results') || '[]');
      parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
      setResults(parsed);
    };
    load();
  }, []);

  const saveAll = (arr) => {
    localStorage.setItem('results', JSON.stringify(arr));
    setResults(arr);
  };

  const categories = useMemo(() => {
    const base = ['Sub-7', 'Sub-9', 'Sub-11', 'Sub-13', 'Sub-15', 'Sub-17'];
    const extra = Array.from(new Set(results.map((r) => r.category).filter(Boolean)));
    return Array.from(new Set([...base, ...extra]));
  }, [results]);

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const handleEdit = (r) => {
    setForm({
      category: r.category || emptyForm.category,
      rival: r.rival || '',
      score: r.score || emptyForm.score,
      date: r.date || '',
      city: r.city || '',
      status: r.status || 'Activo',
    });
    setEditingId(r.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar resultado? Esta acción no se puede deshacer.')) return;
    saveAll(results.filter((r) => r.id !== id).map((r, i) => ({ ...r, order: i + 1 })));
  };

  const moveUp = (id) => {
    const idx = results.findIndex((r) => r.id === id);
    if (idx <= 0) return;
    const next = [...results];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    saveAll(next.map((r, i) => ({ ...r, order: i + 1 })));
  };

  const moveDown = (id) => {
    const idx = results.findIndex((r) => r.id === id);
    if (idx === -1 || idx >= results.length - 1) return;
    const next = [...results];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    saveAll(next.map((r, i) => ({ ...r, order: i + 1 })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.rival.trim()) {
      alert('Por favor ingresa el rival.');
      return;
    }
    if (!form.date) {
      alert('Por favor selecciona la fecha.');
      return;
    }

    const payload = {
      category: form.category,
      rival: form.rival.trim(),
      score: normalizeScore(form.score),
      date: form.date,
      city: form.city.trim(),
      status: form.status,
    };

    let next = [...results];
    if (editingId) {
      next = next.map((r) =>
        r.id === editingId ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r
      );
    } else {
      const id = Date.now().toString();
      next.push({
        id,
        ...payload,
        createdAt: new Date().toISOString(),
        order: next.length + 1,
      });
    }

    saveAll(next.map((r, i) => ({ ...r, order: i + 1 })));
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // escape para cerrar modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => rivalRef.current?.focus(), 50);
  }, [open]);

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Gestión de Resultados</h3>
        <button onClick={handleAdd} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg">
          <FaPlus />
          <span>Añadir</span>
        </button>
      </div>

      {results.length === 0 ? (
        <div className="p-4 bg-gray-50 text-gray-700 rounded">
          No hay resultados guardados. Añade el primero para que aparezca en la web pública.
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="border rounded-lg p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {r.category || '-'}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {r.status || 'Activo'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div className="font-extrabold text-secondary truncate">vs {r.rival}</div>
                  <div className="font-extrabold text-primary">{r.score}</div>
                </div>
                <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Fecha:</strong> {r.date || '-'}</span>
                  {r.city ? <span><strong>Lugar:</strong> {r.city}</span> : null}
                </div>
              </div>

              <div className="flex items-center gap-2 md:justify-end">
                <button onClick={() => handleEdit(r)} className="text-yellow-600" title="Editar" aria-label="Editar">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-red-600" title="Eliminar" aria-label="Eliminar">
                  <FaTrash />
                </button>
                <button onClick={() => moveUp(r.id)} className="text-gray-600" title="Subir" aria-label="Subir">
                  <FaArrowUp />
                </button>
                <button onClick={() => moveDown(r.id)} className="text-gray-600" title="Bajar" aria-label="Bajar">
                  <FaArrowDown />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar' : 'Nuevo'} Resultado</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Rival</label>
                  <input
                    ref={rivalRef}
                    value={form.rival}
                    onChange={(e) => setForm((p) => ({ ...p, rival: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Ej: Academia Norte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Marcador</label>
                  <input
                    value={form.score}
                    onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Ej: 2 - 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Lugar (opcional)</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Ej: Bogotá"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const dirty = JSON.stringify(form) !== JSON.stringify(emptyForm) && !editingId;
                    if (dirty && !confirm('Cancelar y perder cambios?')) return;
                    setOpen(false);
                  }}
                  className="px-4 py-2 rounded border"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResults;


