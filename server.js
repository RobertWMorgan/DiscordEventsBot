const express = require('express');
const app = express();

// Route for Uptime Robot to ping
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(3000, () => {
  console.log('Express server is running on port 3000');
});