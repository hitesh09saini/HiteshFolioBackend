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

    console.log('Received request body:', req.body);

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
