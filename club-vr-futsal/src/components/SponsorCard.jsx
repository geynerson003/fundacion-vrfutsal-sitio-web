import React from 'react';

const SponsorCard = ({ sponsor }) => {
  const { name, logo, website } = sponsor;

  return (
    <div className="group flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-primary transform transition-transform duration-300 hover:scale-105">
      <a
        href={website || '#'}
        target={website ? '_blank' : '_self'}
        rel="noreferrer"
        className="flex items-center justify-center w-full h-20"
      >
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="max-h-16 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="text-center text-sm text-gray-500">{name}</div>
        )}
      </a>
    </div>
  );
};

export default SponsorCard;
