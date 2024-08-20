import { initializeMap, getCoordinatesAndDisplay, showCoordinates } from '/js/geoUtils.js';

export function setupMap(listing) {
    const map = initializeMap();

    if (listing && listing.geometry && listing.geometry.coordinates) {
        const lat = listing.geometry.coordinates[1];
        const lon = listing.geometry.coordinates[0];
        const address = `${listing.location}, ${listing.country}`;

        showCoordinates(map, lat, lon, address);
    } else {
        const address = `${listing.location}, ${listing.country}`;
        
        getCoordinatesAndDisplay(address, map);
    }
}