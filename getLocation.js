
const  fetchLocationName= async function (lat, lon) {
    const apiKey = process.env.API_KEY;
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${lat}+${lon}&pretty=1`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const locationName = data.results[0].formatted;
        
        return locationName;

    } catch (error) {
        console.error('Error fetching location:', error);
    }
}

module.exports = fetchLocationName;