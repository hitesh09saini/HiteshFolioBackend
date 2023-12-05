const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;
const MdURI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose.connect(MdURI)
  .then(() => {
    console.log('MongoDB Connected!');
  })
  .catch((err) => {
    console.error('MDB Connection Error:', err);
  });

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  longitude: {
    type: Number,
    // required: true,
  },
  latitude: {
    type: Number,
    // required: true,
  },

});


const getGeolocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve location name');
    }

    const data = await response.json();
    const locationName = data.results[0].formatted_address;

    return locationName;
  } catch (error) {
    throw new Error(`Error getting location name: ${error.message}`);
  }
};

const Location = mongoose.model('Location', locationSchema);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server Connected!');
});

app.post('/api/loc', async (req, res) => {
  try {
    const { name, longitude, latitude } = req.body;



    console.log('Received request body:', req.body, name);

    // const nam = getGeolocationName(longitude, latitude);
    const newLocation = new Location({
      name,
      longitude,
      latitude
    });
    

    await newLocation.save();

    res.status(201).json({ message: 'Location added successfully' });
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});





