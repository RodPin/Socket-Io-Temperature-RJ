const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const port = process.env.PORT || 4001;
const index = require('./routes');
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
// const getApiAndEmit = 'TODO';

let interval;

function fToC(fahrenheit) {
  var fTemp = fahrenheit;
  var fToCel = ((fTemp - 32) * 5) / 9;
  return fToCel.toFixed(2);
}
const getApiAndEmit = async socket => {
  try {
    const res = await axios.get(
      'https://api.darksky.net/forecast/43860b88d5e983b1798459559093af32/-22.8534362,-43.2432727'
    ); // Getting the data from DarkSky
    const temperatureC = fToC(res.data.currently.temperature);
    console.log('sending: ' + temperatureC + ' °C');
    socket.emit('FromAPI', temperatureC); // Emitting a new message. It will be consumed by the client
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

io.on('connection', socket => {
  console.log('New client connected');
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 10000);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
