import { useEffect, useRef, useState } from 'react';
import SponsorCard from './SponsorCard';

const SponsorGrid = ({ variant = 'all' }) => {
  const [sponsors, setSponsors] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sponsors') || '[]';
      const parsed = JSON.parse(raw);
      // Filtrar solo activos
      let active = parsed.filter(s => s.status === 'Activo');

      // Filtrar según variante: 'featured' => Patrocinador, 'allies' => Aliado, 'all' => todos
      if (variant === 'featured') {
        active = active.filter(s => (s.type || '').toLowerCase() === 'patrocinador');
        // Ordenar por nivel si existe (Platinum, Gold, Silver, etc.) y luego por orden
        active.sort((a, b) => {
          const la = (a.level || '').toLowerCase();
          const lb = (b.level || '').toLowerCase();
          if (la === lb) return (a.order || 0) - (b.order || 0);
          // Priorizar niveles: platinum > gold > silver > (others alphabetically)
          const rank = (v) => {
            if (!v) return 0;
            if (v.includes('platinum')) return 4;
            if (v.includes('gold')) return 3;
            if (v.includes('silver')) return 2;
            return 1;
          };
          return rank(lb) - rank(la);
        });
      } else if (variant === 'allies') {
        active = active.filter(s => (s.type || '').toLowerCase() === 'aliado');
        // Mantener el orden guardado
        active.sort((a, b) => (a.order || 0) - (b.order || 0));
      } else {
        // Default: mostrar todos los activos por orden
        active.sort((a, b) => (a.order || 0) - (b.order || 0));
      }

      setSponsors(active);
    } catch (e) {
      setSponsors([]);
    }
  }, [variant]);

  // Reveal on scroll (simple)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.sponsor-item');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(it => io.observe(it));
    return () => io.disconnect();
  }, [sponsors]);

  if (!sponsors.length) {
    return <div className="text-gray-500">No hay patrocinadores disponibles aún.</div>;
  }

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {sponsors.map(s => (
        <div key={s.id} className="sponsor-item">
          <SponsorCard sponsor={s} />
        </div>
      ))}
    </div>
  );
};

export default SponsorGrid;
