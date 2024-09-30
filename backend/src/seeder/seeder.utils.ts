export const generateUserCoordinates = (count = 100) => {
    const vienna = { lat: 48.210033, long: 16.363449 };
    const innsbruck = { lat: 47.2675, long: 11.391 };
    const coordinates = [];

    // Generate coordinates for Vienna (60% of users)
    for (let i = 0; i < count * 0.6; i++) {
        if (i < count * 0.4) {
            // 40% close to Vienna
            coordinates.push(getRandomLatLong(vienna.lat, vienna.long, 10, 1));
        } else {
            // 20% further from Vienna
            coordinates.push(getRandomLatLong(vienna.lat, vienna.long, 30, 2));
        }
    }
    // Generate coordinates for Innsbruck (40% of users)
    for (let i = 0; i < count * 0.4; i++) {
        if (i < count * 0.25) {
            // 25% close to Innsbruck
            coordinates.push(
                getRandomLatLong(innsbruck.lat, innsbruck.long, 8, 1),
            );
        } else {
            // 15% further from Innsbruck
            coordinates.push(
                getRandomLatLong(innsbruck.lat, innsbruck.long, 25, 2),
            );
        }
    }

    return coordinates;
};

export const getRandomLatLong = (centerLat, centerLong, radius, spread) => {
    const radiusDegrees = radius / 111;
    const angle = Math.random() * 2 * Math.PI;
    const offsetLat = Math.random() * radiusDegrees * spread * Math.sin(angle);
    const offsetLong = Math.random() * radiusDegrees * spread * Math.cos(angle);
    const lat = centerLat + offsetLat;
    const long = centerLong + offsetLong;
    return {
        latitude: Number(lat.toFixed(6)),
        longitude: Number(long.toFixed(6)),
    };
};
