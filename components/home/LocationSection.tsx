'use client';

import { useState, useEffect } from 'react';

export default function LocationSection() {
  const [settings, setSettings] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
        if (Array.isArray(data?.locations)) setLocations(data.locations);
      })
      .catch(() => {});
  }, []);

  const displayLocations =
    locations.length > 0
      ? locations
      : [
          {
            id: 'default-location',
            name: settings?.name
              ? settings.name.startsWith('Showroom')
                ? settings.name
                : `Showroom ${settings.name}`
              : 'Showroom Rizkya Motor',
            address:
              settings?.address ||
              'Desa Jetis, Kec. Pace, Kabupaten Nganjuk, Jawa Timur 64472',
            phone: settings?.phone || '081334785858',
            mapUrl: null,
          },
        ];

  const containerWidthClass =
    displayLocations.length === 1 ? 'max-w-[720px]' : 'max-w-[1080px]';
  const cardHeightClass =
    displayLocations.length === 1 ? 'h-[450px] sm:h-[500px]' : 'h-[380px] sm:h-[430px]';

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`${containerWidthClass} mx-auto space-y-5`}>
        {/* Header Title */}
        <div>
          <h2 className="text-2xl sm:text-[24px] font-extrabold text-slate-900 tracking-tight">
            Peta Lokasi Showroom
          </h2>
        </div>

        {/* Location Cards Grid (Centered if 1 location) */}
        <div
          className={`grid gap-6 ${
            displayLocations.length === 1
              ? 'grid-cols-1 w-full'
              : displayLocations.length === 2
              ? 'grid-cols-1 md:grid-cols-2 w-full'
              : 'grid-cols-1 md:grid-cols-3 w-full'
          }`}
        >
          {displayLocations.map((loc, idx) => {
            const mapSrc =
              loc.mapUrl ||
              `https://maps.google.com/maps?q=${encodeURIComponent(
                loc.address || settings?.address || 'Nganjuk'
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

            return (
              <div
                key={loc.id || idx}
                className={`relative w-full ${cardHeightClass} rounded-md overflow-hidden text-left transition-all duration-300 group border-0 shadow-xl hover:shadow-2xl flex flex-col justify-end`}
              >
                {/* Google Maps Iframe */}
                <iframe
                  title={`Peta ${loc.name}`}
                  src={mapSrc}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
