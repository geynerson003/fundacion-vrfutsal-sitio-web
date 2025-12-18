import { useEffect, useState } from 'react';

// Imagen de fondo desde Supabase Storage
const heroBgDefault = 'https://lwpcpowhyfexadeukygy.supabase.co/storage/v1/object/public/gallery/hero-bg.jpg';

const fallbackMatches = [
  
];

const Results = () => {
  const [storedMatches, setStoredMatches] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todas');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('results') || '[]';
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setStoredMatches(null);
        return;
      }
      setStoredMatches(parsed);
    } catch {
      setStoredMatches(null);
    }
  }, []);

  const base = Array.isArray(storedMatches) ? storedMatches : fallbackMatches;
  const matches = base
    .map((m) => ({
      ...m,
      status: m.status || 'Activo',
    }))
    .filter((m) => (m.status || 'Activo') === 'Activo')
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const categories = ['Todas', ...Array.from(new Set(matches.map((m) => m.category).filter(Boolean)))];

  const filteredMatches =
    activeCategory === 'Todas' ? matches : matches.filter((m) => m.category === activeCategory);

  return (
    <div
      className="page-bg page-bg--opt2 min-h-screen pt-20 flex flex-col"
      style={{ ['--bg-img']: `url(${heroBgDefault})` }}
    >
      <header className="relative py-16 md:py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Resultados Deportivos
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-100 max-w-3xl mx-auto">
            Marcadores recientes por categoría de Fundación Deportiva Club V.R.
          </p>
        </div>
      </header>

      <main className="flex-grow pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => {
              const isActive = c === activeCategory;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCategory(c)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    isActive
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {filteredMatches.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm shadow-2xl p-10 text-center">
              <p className="text-lg text-gray-200">
                {activeCategory === 'Todas'
                  ? 'Aún no hay resultados publicados.'
                  : 'No hay resultados para esta categoría.'}
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Cuando estén listos, aparecerán aquí en formato de tarjetas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((m) => (
                <article
                  key={m.id || `${m.date}-${m.category}-${m.rival}`}
                  className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm shadow-2xl overflow-hidden card-hover"
                  aria-label={`Resultado ${m.category} vs ${m.rival} (${m.score})`}
                >
                  <header className="bg-primary/90 text-white px-6 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold tracking-wide uppercase">{m.category}</p>
                      <p className="text-2xl font-extrabold text-green-200">{m.score}</p>
                    </div>
                    <h2 className="mt-2 text-xl md:text-2xl font-extrabold leading-tight">
                      vs {m.rival}
                    </h2>
                  </header>

                  <div className="px-6 py-5 space-y-3 text-gray-100">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-gray-200">Fecha</p>
                      <p className="text-sm font-semibold">{m.date}</p>
                    </div>
                    {m.city ? (
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-200">Lugar</p>
                        <p className="text-sm font-semibold">{m.city}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;


