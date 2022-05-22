const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// middletier
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Tool baba on Fire')
})

app.listen(port, () => {
    console.log(`Tool baba's marks:`, port)
})