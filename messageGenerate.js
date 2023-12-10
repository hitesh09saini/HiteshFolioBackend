const fetchLocationName = require('./getLocation');

const messageGen = async (longitude, latitude,) => {
    const locationName = await fetchLocationName(latitude, longitude);

    const mess =
        `<!DOCTYPE html>
     <html lang="en">
     
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Portfolio Viewer Notification</title>
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
             <h1>Someone viewed your portfolio!</h1>
             <div class="location-info">
                 <p>Longitude: <span id="longitude">${longitude}</span></p>
                 <p>Latitude: <span id="latitude">${latitude}</span></p>
                 <p>Location: <span id="location">${locationName}</span></p>
             </div>
         </div>
     </body>
     
     </html>`

    return mess;
}

module.exports = messageGen;