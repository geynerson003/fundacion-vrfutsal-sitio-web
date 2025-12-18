import { useEffect, useState } from "react";
import { FaHandshake, FaExternalLinkAlt } from "react-icons/fa";
import BallModel from "../components/BallModel";
// Imagen de fondo desde Supabase Storage
const pageBg = 'https://lwpcpowhyfexadeukygy.supabase.co/storage/v1/object/public/gallery/page_bg_aliados.jpeg';
import { sponsors } from "../lib/supabase";

const AliadosPatrocinadores = () => {
  const [sponsorList, setSponsorList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      const data = await sponsors.getAll();
      setSponsorList(data || []);
    } catch (e) {
      console.error("Error loading sponsors from Supabase", e);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar por tipo
  const patrocinadores = sponsorList.filter(s => s.sponsor_type === 'patrocinador');
  const aliados = sponsorList.filter(s => s.sponsor_type === 'aliado');
  const colaboradores = sponsorList.filter(s => s.sponsor_type === 'colaborador');

  const SponsorCard = ({ sponsor }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="w-20 h-20 mb-3 flex items-center justify-center">
        {sponsor.logo_url ? (
          <img 
            src={sponsor.logo_url} 
            alt={sponsor.name} 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <FaHandshake className="text-3xl text-gray-400" />
          </div>
        )}
      </div>
      <h4 className="font-bold text-gray-800 text-sm">{sponsor.name}</h4>
      {sponsor.website_url && (
        <a 
          href={sponsor.website_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
        >
          Visitar <FaExternalLinkAlt className="text-[10px]" />
        </a>
      )}
    </div>
  );

  const SponsorSection = ({ title, list, color }) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-10">
        <h3 className="text-xl font-bold text-center mb-6" style={{ color }}>
          {title} ({list.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {list.map(s => <SponsorCard key={s.id} sponsor={s} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="page-bg page-bg--opt2 min-h-screen flex flex-col" style={{ ['--bg-img']: `url(${pageBg})` }}>

      <header className="relative h-64 md:h-80 flex items-center justify-center text-center z-20">
        <div className="max-w-5xl px-6 fade-in">
          <h1
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
            style={{
              fontFamily: "Poppins",
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)"
            }}
          >
            Aliados y Patrocinadores
          </h1>
          <p
            className="mt-4 text-lg md:text-2xl font-medium text-gray-100"
            style={{
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5)"
            }}
          >
            Confianza, compromiso y colaboración con marcas que nos respaldan.
          </p>
        </div>
      </header>

      <main className="flex-grow bg-transparent py-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-16 relative z-50">
            {loading ? (
              <div className="text-center text-white py-8">Cargando...</div>
            ) : sponsorList.length === 0 ? (
              /* Si NO hay sponsors, mostrar solo el balón 3D girando */
              <div className="text-center">
                <BallModel sponsors={[]} />
              </div>
            ) : (
              /* Si HAY sponsors, mostrar título y tarjetas */
              <>
                <h2
                  className="text-3xl md:text-4xl font-bold mb-10 text-center"
                  style={{
                    color: "#00ff7f",
                    textShadow: "0 3px 10px rgba(0, 255, 127, 0.4), 0 2px 4px rgba(0, 0, 0, 0.6)"
                  }}
                >
                  Nuestros Aliados y Patrocinadores
                </h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
                  <SponsorSection title="🏆 Patrocinadores" list={patrocinadores} color="#FFD700" />
                  <SponsorSection title="🤝 Aliados" list={aliados} color="#00ff7f" />
                  <SponsorSection title="⭐ Colaboradores" list={colaboradores} color="#87CEEB" />
                </div>
              </>
            )}
          </section>

          {/* Sección Motivacional */}
          <section
            className="mb-16 relative z-50 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0, 132, 61, 0.75) 0%, rgba(0, 100, 50, 0.75) 100%)",
              boxShadow: "0 10px 40px rgba(0, 132, 61, 0.3)"
            }}
          >
            <div className="px-6 py-10 md:px-12 md:py-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2
                  className="text-2xl md:text-4xl font-extrabold text-white mb-5 leading-tight"
                  style={{
                    textShadow: "0 3px 10px rgba(0, 0, 0, 0.4)"
                  }}
                >
                  🌟 Sé Parte del Cambio
                </h2>
                <div
                  className="text-base md:text-lg text-white/95 leading-relaxed space-y-3 mb-6"
                  style={{
                    textShadow: "0 2px 6px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <p className="font-semibold text-lg md:text-xl text-green-100">
                    Al convertirte en aliado o patrocinador de Fundación Deportiva Club V.R, no solo apoyas un equipo...
                  </p>
                  <p className="font-medium">
                    <strong className="text-green-200">✓ Transformas vidas:</strong> Brindas oportunidades a jóvenes talentos para desarrollar sus habilidades deportivas y valores.
                  </p>
                  <p className="font-medium">
                    <strong className="text-green-200">✓ Construyes comunidad:</strong> Fortaleces el tejido social y fomentas el deporte como herramienta de integración.
                  </p>
                  <p className="font-medium">
                    <strong className="text-green-200">✓ Potencias tu marca:</strong> Ganas visibilidad ante una comunidad apasionada y comprometida.
                  </p>
                  <p className="font-bold text-lg md:text-xl mt-4 text-yellow-300">
                    💚 Juntos formamos campeones dentro y fuera de la cancha.
                  </p>
                </div>
                <div
                  className="inline-block bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-xl border-2 border-white/30"
                  style={{
                    boxShadow: "0 4px 15px rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <p className="text-white font-bold text-base md:text-lg">
                    "El éxito se construye en equipo. ¡Únete a nosotros!"
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="rounded-2xl p-10 md:p-12 text-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.97) 100%)",
              border: "2px solid rgba(0, 132, 61, 0.2)"
            }}
          >
            <h3
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                color: "#1a1a1a",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
              }}
            >
              ¿Quieres ser patrocinador?
            </h3>
            <p
              className="text-gray-700 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
              style={{
                fontWeight: "500"
              }}
            >
              Contáctanos para conocer los niveles de patrocinio y beneficios
              exclusivos para tu marca.
            </p>
            <a
              href="/contacto"
              className="inline-block px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #00843D 0%, #00a84d 100%)",
                color: "#ffffff",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                transform: "translateY(0)",
                boxShadow: "0 4px 15px rgba(0, 132, 61, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 132, 61, 0.5)";
                e.currentTarget.style.background = "linear-gradient(135deg, #00a84d 0%, #00c95d 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 132, 61, 0.4)";
                e.currentTarget.style.background = "linear-gradient(135deg, #00843D 0%, #00a84d 100%)";
              }}
            >
              Contactar
            </a>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AliadosPatrocinadores;
