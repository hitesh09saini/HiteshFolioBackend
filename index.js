require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const sendEmail = require('./mail');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const messageGen = require('./messageGenerate')

app.use(cors());
app.use(express.json());

let MDconn = false;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    MDconn = true;
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
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
});

const Location = mongoose.model('Location', locationSchema);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.json({
    "Server": "Server is Running ",
    "Database": `${MDconn ? "MongoDB is Connected" : "...."}`
  });
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


    const email = process.env.SMTP_FROM_EMAIL;
    const subject = 'a person view your portfolio !';
    const message = await messageGen(longitude, latitude);

    await sendEmail(email, subject, message);

    res.status(201).json({ message: 'Location added successfully and send mail' });
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



// likes

const LikeSchema = new mongoose.Schema({
  like: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Like = mongoose.model('Likes', LikeSchema); // Create the Like model

app.post('/api/likes', async (req, res) => {
  try {
    await Like.findOneAndUpdate({}, { $inc: { like: 1 } });
    console.log('like added');
    res.status(202).json({ message: 'Like added successfully' });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.get('/api/likes', async (req, res) => {
  try {
    const likesData = await Like.findOne();
    if (likesData) {
      return res.json(likesData);
    }
    res.status(404).json({ message: 'Likes not found' });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

