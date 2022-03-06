const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacturasSchema = Schema({
    nit: String,
    idUsuario: { type: Schema.Types.ObjectId, ref: "usuarios_venta"},
    listaProductos: [{
        nombreProducto: String,
        cantidadComprada: Number,
        precioUnitario: Number,
        subTotal: Number
    }],
    totalFactura: Number
});

module.exports = mongoose.model('facturas_venta', FacturasSchema);