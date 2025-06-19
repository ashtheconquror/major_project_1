const axios = require("axios");

const getCoordinatesFromMapTiler = async (locationQuery) => {
  const apiKey = process.env.MAP_API_KEY;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
    locationQuery
  )}.json?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const coordinates = response.data.features[0].geometry.coordinates;
    return {
      type: "Point",
      coordinates: coordinates, // [lng, lat]
    };
  } catch (err) {
    console.error("MapTiler geocoding error:", err.message);
    return null;
  }
};

module.exports = getCoordinatesFromMapTiler;
