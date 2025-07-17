const express = require('express');
//const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
