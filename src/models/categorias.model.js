const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriasSchema = Schema({
    nombreCategoria: String
});

module.exports = mongoose.model('categorias_venta', CategoriasSchema);


