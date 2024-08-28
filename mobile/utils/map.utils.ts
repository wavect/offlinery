export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const getRegionForCoordinates = (
  points: Array<{ latitude: number; longitude: number }>,
) => {
  let minX: number, maxX: number, minY: number, maxY: number;

  // Init first point
  ((point) => {
    minX = point.longitude;
    maxX = point.longitude;
    minY = point.latitude;
    maxY = point.latitude;
  })(points[0]);

  // Calculate rect
  points.map((point) => {
    minX = Math.min(minX, point.longitude);
    maxX = Math.max(maxX, point.longitude);
    minY = Math.min(minY, point.latitude);
    maxY = Math.max(maxY, point.latitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX;
  const deltaY = maxY - minY;

  return {
    latitude: midY,
    longitude: midX,
    latitudeDelta: deltaY * 1.2, // Add a little padding
    longitudeDelta: deltaX * 1.2,
  };
};
