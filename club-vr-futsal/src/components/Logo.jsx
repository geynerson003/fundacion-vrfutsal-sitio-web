import React, { useState } from "react";

const InlineLogoSvg = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 200 260" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Tu SVG actual (puedes dejarlo tal cual) */}
    <path
      d="M 100 15 L 170 25 L 175 60 Q 175 100, 170 130 Q 165 155, 155 175 Q 145 190, 130 205 L 100 230 L 70 205 Q 55 190, 45 175 Q 35 155, 30 130 Q 25 100, 25 60 L 30 25 Z"
      fill="#00843D"
      stroke="#000000"
      strokeWidth="5"
      strokeLinejoin="round"
    />
    {/* ...resto de tu SVG (pelota, texto, etc.) */}
  </svg>
);

const Logo = ({ className = "w-16 h-16", src, alt = "Logo Club V.R" }) => {
  const [imgError, setImgError] = useState(false);

  // Si hay src y no falló, renderiza la imagen
  if (src && !imgError) {
    return (
      <span
        className="
          inline-flex items-center justify-center
          rounded-2xl p-1
          bg-gradient-to-br from-emerald-50 via-white to-emerald-100
          shadow-md ring-1 ring-emerald-200/70
        "
        aria-label={alt}
      >
        <img
          src={src}
          alt={alt}
          className={`${className} object-contain rounded-xl`}
          onError={() => setImgError(true)}
          decoding="async"
        />
      </span>
    );
  }

  // Fallback: tu SVG inline
  return (
    <span className="inline-flex items-center justify-center rounded-2xl p-1 shadow-md">
      <InlineLogoSvg className={className} />
    </span>
  );
};

export default Logo;
