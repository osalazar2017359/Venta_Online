const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombreProducto: String,
    precio: Number,
    categoria: String,
    cantidad: Number,
    vendidos: Number
});

module.exports = mongoose.model('productos_venta', ProductosSchema);


