const express = require('express');
//const cors = require('cors');
const db = require("./models");
const app = express();
const dotenv = require("dotenv");


const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

db.mongoose
  .connect(db.url)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Cannot connect to the database!", err);
    process.exit(1);
  });
