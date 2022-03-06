const express = require('express');
const cors = require('cors');
var app = express();

const VentasRutas = require('./src/routes/ventas.routes')

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', VentasRutas);


module.exports = app;
