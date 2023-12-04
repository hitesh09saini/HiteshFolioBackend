const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());
const PORT = 3000;

require('dotenv').config();
const MdURI = process.env.MONGO_URI;

mongoose.connect(MdURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected!');
  })
  .catch((err) => {
    console.log('MDB Connection Error ' + err);
  });

const locationSchema = new mongoose.Schema({
  name: String,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
});

const Location = mongoose.model('Location', locationSchema);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server Connected!');
});

// Add a new route to handle incoming location data
app.post('/api/loc', async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    // Create a new location document
    const newLocation = new Location({
      name,
      coordinates,
    });

    // Save the new location to the database
    await newLocation.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: 'Visit your Portfolio by a new Person',
      text: `A new location (${name}) has been added with coordinates: ${coordinates}`,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Location added successfully' });
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
