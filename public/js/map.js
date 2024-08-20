 
async function getCoordinates(address) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            console.log(`Address: ${address}, Latitude: ${lat}, Longitude: ${lon}`);

            return {
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            };
        } else {
            alert('Address not found');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
    }
}

module.exports =  { getCoordinates };

