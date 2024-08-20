
export function initializeMap() {

    var map = L.map('map');
    map.setView([51.505, -0.09], 5);   //lat, long

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  console.log(map);
    return map;
}


export function showCoordinates(map, lat, lon, address) {
    if (!map) {
        console.error('Map is not initialized');
        return;
    }

    if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates:', lat, lon);
        return;
    }

    // Add a marker and set the map view
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${address}</b>`)
        .openPopup();

    map.setView([lat, lon], 5);
}

// Function to get coordinates from an address and display on the map
export async function getCoordinatesAndDisplay(address, map) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            console.log(`Fetched Coordinates: Latitude: ${lat}, Longitude: ${lon}`);

            // Clear previous marker if any
            if (window.marker) {
                window.marker.remove();
            }

            // Add new marker
            window.marker = L.marker([lat, lon]).addTo(map);
            map.setView([lat, lon], 5); // Adjust zoom level

            // Optionally, you can add a popup to the marker
            window.marker.bindPopup(`<b>${address}</b>`).openPopup();
        } else {
            alert('Address not found');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
    }
}