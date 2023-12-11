require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const sendEmail = require('./mail');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const messageGen = require('./messageGenerate')
const fetchLocationName = require('./getLocation');

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
    const {longitude, latitude } = req.body;

    console.log('Received request body:', req.body);
    const name = await fetchLocationName(latitude, longitude);

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

app.post('/send/mail', async (req, res) => {
  try {
    const { email, name, message } = req.body;

    console.log(email, name, message);

    if (!email || !name || !message) {
      throw res.status(400).send('all files are required ');
    }
    const cmess = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Send Email From HiteshFolio</title>
      <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f0f0;
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .notification-container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
        }

        h1 {
            color: #4285f4;
        }

        .location-info {
            margin-top: 20px;
        }

        p {
            margin: 8px 0;
        }
    </style>
  </head>
  <body>
    
  <div class="notification-container">
  <h1>${name} is mail for you</h1>
  <div class="location-info">
      <p>message: <span>${message}</span></p>
      <p>Name: <span >${name}</span></p>
      <p>Email: <span >${email}</span></p>
  </div>
</div>

  
  </body>
  </html>
  `

    const subject = "A Profile viewer Send mail";
    await sendEmail(email, subject, cmess);
    console.log('mail send successfully');

    res.status(200).send('mail send successfully');
  } catch (error) {
    console.error('Error sending mail:', error);
    res.status(500).send('Internal Server Error');
  }
})



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

