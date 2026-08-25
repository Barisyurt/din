// Kaaba (Mekke / Kabe) Coordinates
export const KAABA_COORDS = {
  lat: 21.422487,
  lng: 39.826206,
};

// Turkish Cities Default Coordinates Database for instant fallback
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  İstanbul: { lat: 41.0082, lng: 28.9784 },
  Ankara: { lat: 39.9334, lng: 32.8597 },
  İzmir: { lat: 38.4237, lng: 27.1428 },
  Bursa: { lat: 40.1885, lng: 29.061 },
  Konya: { lat: 37.8746, lng: 32.4932 },
  Antalya: { lat: 36.8969, lng: 30.7133 },
  Adana: { lat: 37.0, lng: 35.3213 },
  Gaziantep: { lat: 37.0662, lng: 37.3833 },
  Diyarbakır: { lat: 37.9144, lng: 40.2306 },
  Eskişehir: { lat: 39.7767, lng: 30.5206 },
  Kayseri: { lat: 38.7205, lng: 35.4826 },
  Trabzon: { lat: 41.0027, lng: 39.7168 },
  Samsun: { lat: 41.2867, lng: 36.33 },
  Mersin: { lat: 36.8121, lng: 34.6415 },
  Denizli: { lat: 37.7765, lng: 29.0864 },
  Şanlıurfa: { lat: 37.1674, lng: 38.7954 },
  Malatya: { lat: 38.3552, lng: 38.3095 },
  Erzurum: { lat: 39.9043, lng: 41.2679 },
  Van: { lat: 38.4891, lng: 43.4089 },
};

/**
 * Calculates the Qibla Bearing angle (in degrees 0-360) from North
 * using the Great-Circle / Forward Azimuth Formula.
 */
export function calculateQiblaBearing(userLat: number, userLng: number): number {
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (KAABA_COORDS.lat * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDS.lng - userLng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let theta = Math.atan2(y, x);
  let bearing = (theta * 180) / Math.PI;

  return (bearing + 360) % 360;
}

/**
 * Calculates the direct distance to Kaaba in Kilometers using Haversine formula.
 */
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((KAABA_COORDS.lat - userLat) * Math.PI) / 180;
  const dLng = ((KAABA_COORDS.lng - userLng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((KAABA_COORDS.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns human readable cardinal direction (e.g. "Güneydoğu (SE)")
 */
export function getCardinalDirection(bearing: number): string {
  const normalized = (bearing + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return "Kuzey (N)";
  if (normalized >= 22.5 && normalized < 67.5) return "Kuzeydoğu (NE)";
  if (normalized >= 67.5 && normalized < 112.5) return "Doğu (E)";
  if (normalized >= 112.5 && normalized < 157.5) return "Güneydoğu (SE)";
  if (normalized >= 157.5 && normalized < 202.5) return "Güney (S)";
  if (normalized >= 202.5 && normalized < 247.5) return "Güneybatı (SW)";
  if (normalized >= 247.5 && normalized < 292.5) return "Batı (W)";
  if (normalized >= 292.5 && normalized < 337.5) return "Kuzeybatı (NW)";
  return "Kuzey (N)";
}
