const mongoose = require('mongoose');
const app = require('./app');
const adminController = require('./src/controller/ventas_admin.controller');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/IN6BM2', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Se encuentra conectado a la base de datos");

    app.listen(5000, function () {

        adminController.crearAdmin("", "");
        console.log("ADMIN: Nom:God  Usu:ADMIN  Rol:Admin  Pass:******");
        console.log("Bienvenidos, corriendo en el puerto 5000");
        console.log("---------------------------------------------------")

    })

}).catch(error => console.log(error));