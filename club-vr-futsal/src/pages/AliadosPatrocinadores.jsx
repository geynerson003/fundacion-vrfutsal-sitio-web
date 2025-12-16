import { useEffect, useState } from "react";
import BallModel from "../components/BallModel";
import pageBg from "../assets/gallery/page_bg_aliados.jpeg";

const AliadosPatrocinadores = () => {
  const [sponsors3D, setSponsors3D] = useState([]);

  useEffect(() => {
    // Mantener hook si en el futuro se desea cargar un fondo desde localStorage.
    try {
      const raw = localStorage.getItem('sponsors') || '[]';
      const parsed = JSON.parse(raw);
      // Filtrar solo activos y combinar patrocinadores y aliados
      const active = parsed.filter(s => s.status === 'Activo');
      setSponsors3D(active);
    } catch (e) {
      console.error("Error loading sponsors for 3D model", e);
    }
  }, []);

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
          <section className="mb-16 relative z-50 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-10"
              style={{
                color: "#00ff7f",
                textShadow: "0 3px 10px rgba(0, 255, 127, 0.4), 0 2px 4px rgba(0, 0, 0, 0.6)"
              }}
            >
              Nuestros Aliados y Patrocinadores
            </h2>
            <BallModel sponsors={sponsors3D} />
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
