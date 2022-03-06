const Usuarios = require('../models/usuarios.model');
const Productos = require('../models/productos.model');
const Categorias = require('../models/categorias.model');
const Facturas = require('../models/facturas.model');

const nitRandom = require('string-random');



////////////////////////////////////////////////////////////////
// CLIENTE - CARRITO/FACTURA
////////////////////////////////////////////////////////////////

function agregarProductoCarrito(req, res) { // IDEAR UNA FORMA DE AUMENTAR LA CANTIDADCOMPRADA SI EL PRODUCTO A AÑADIR ES REPETIDO
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

    Productos.findOne({ nombreProducto: { $regex: parametros.nombreProducto, $options: 'i' } }, (error, productoEncontrada) => {
        if (error) return res.status(500).send({ mensaje: "Error1 en la petición" });
        if (!productoEncontrada) return res.status(500).send({ mensaje: "Error, no existe este producto" });


        if (0 >= parametros.cantidad) {
            return res.status(500).send({ error: "Cantidad invalida" });

        } else if (productoEncontrada.cantidad == 0) {
            return res.status(500).send({ error: "Producto agotado" });

        } else if (parametros.cantidad > productoEncontrada.cantidad) {
            return res.status(500).send({ error: "La cantidad a comprar es superior a las existencias actuales" });

        } else {

            Usuarios.findById(usuarioLogeado, (error, usuarioFase1) => {

                let productoCoincidencia;
                let idCarrito;
                let cantidadActual;

                for (let b = 0; b < usuarioFase1.carrito.length; b++) {
                    if (usuarioFase1.carrito[b].nombreProducto == productoEncontrada.nombreProducto) {
                        productoCoincidencia = usuarioFase1.carrito[b].nombreProducto

                        idCarrito = usuarioFase1.carrito[b]._id

                        cantidadActual = usuarioFase1.carrito[b].cantidadComprada;
                    }
                }

                if (productoCoincidencia == productoEncontrada.nombreProducto) {
                    let cantidadN = 0;
                    let cantidadA = 0;

                    cantidadN = parametros.cantidad;
                    cantidadA = cantidadActual;

                    if (productoEncontrada.cantidad < (Number(cantidadN) + Number(cantidadA))) {
                        return res.status(500).send({ error: "La cantidad2 a comprar es superior a las existencias actuales" });

                    } else {

                        Usuarios.findOneAndUpdate({ carrito: { $elemMatch: { _id: idCarrito, nombreProducto: productoCoincidencia } } },
                            { $inc: { "carrito.$.cantidadComprada": parametros.cantidad } }, { new: true }, (error, modificarCantidadUsuario) => {


                                Usuarios.findOne({ carrito: { $elemMatch: { _id: idCarrito, nombreProducto: productoCoincidencia } } },
                                    { "carrito.$": 1 }, (error, cantidadNuevaEncontrada) => {

                                        let laCantidad = 0;

                                        for (let c = 0; c < cantidadNuevaEncontrada.carrito.length; c++) {
                                            laCantidad = cantidadNuevaEncontrada.carrito[c].cantidadComprada
                                        }

                                        let subTotalNuevo = productoEncontrada.precio * laCantidad;

                                        Usuarios.findOneAndUpdate({ carrito: { $elemMatch: { _id: idCarrito, nombreProducto: productoCoincidencia } } },
                                            { "carrito.$.subTotal": subTotalNuevo }, { new: true }, (error, modificarSubTotalUsuario) => {

                                                let totalCarritoFor = 0;
                                                let subTotal0 = 0;

                                                for (let p = 0; p < modificarCantidadUsuario.carrito.length; p++) {
                                                    subTotal0 = modificarCantidadUsuario.carrito[p].cantidadComprada * modificarCantidadUsuario.carrito[p].precioUnitario;

                                                    totalCarritoFor += subTotal0;
                                                }

                                                Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoFor }, { new: true }, (error, totalActualizado) => {
                                                    if (error) return res.status(500).send({ mensaje: "Error en la petición 3.0" });
                                                    if (!totalActualizado) return res.status(500).send({ mensaje: "Error al actualizar el total de carrito" });

                                                    return res.status(200).send({ total: totalActualizado });
                                                })
                                            })
                                    })
                            })
                    }

                } else {

                    Usuarios.findByIdAndUpdate(usuarioLogeado, {
                        $push:
                        {
                            carrito: {
                                nombreProducto: productoEncontrada.nombreProducto, cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrada.precio,
                                subTotal: parametros.cantidad * productoEncontrada.precio
                            }
                        }
                    }, { new: true }, (error, usuarioActualizado) => {
                        if (error) return res.status(500).send({ mensaje: "Error en la petición2" });
                        if (!usuarioActualizado) return res.status(500).send({ mensaje: "Error al modificar este usuario" });

                        let totalCarritoFor = 0;
                        let subTotal0 = new Array();

                        for (let p = 0; p < usuarioActualizado.carrito.length; p++) {
                            subTotal0[p] = usuarioActualizado.carrito[p].cantidadComprada * usuarioActualizado.carrito[p].precioUnitario;

                            totalCarritoFor += subTotal0[p];
                        }

                        Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoFor }, { new: true }, (error, totalActualizado) => {
                            if (error) return res.status(500).send({ mensaje: "Error en la petición final" });
                            if (!totalActualizado) return res.status(500).send({ mensaje: "Error al actualizar el total de carrito" });

                            return res.status(200).send({ total: totalActualizado });
                        })
                    });
                }
            })
        }
    })
}

function eliminarProductoCarrito(req, res) {
    const parametros = req.body;

    Productos.findOne({ nombreProducto: { $regex: parametros.nombreProducto, $options: 'i' } }, (error, infoProducto) => {
        if (error) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!infoProducto) return res.status(500).send({ mensaje: "Error al buscar el producto" });

        Usuarios.findOne({ carrito: { $elemMatch: { nombreProducto: infoProducto.nombreProducto } } },
            { "carrito.$": 1 }, (error, infoProductoCarrito) => {
                if (error) return res.status(500).send({ mensaje: "Error en la petición" });
                if (!infoProductoCarrito) return res.status(500).send({ mensaje: "Error al buscar los datos del producto carrito" });

                let pro;
                let id_;
                for (let p = 0; p < infoProductoCarrito.carrito.length; p++) {
                    if (infoProducto.nombreProducto == infoProductoCarrito.carrito[p].nombreProducto) {
                        pro = infoProductoCarrito.carrito[p].nombreProducto
                        id_ = infoProductoCarrito.carrito[p]._id
                    }
                }

                if (infoProducto.nombreProducto == pro) {

                    Usuarios.findOneAndUpdate({ carrito: { $elemMatch: { _id: id_ } } },
                        { $pull: { carrito: { nombreProducto: pro } } }, { new: true },
                        (error, productoCarritoEliminado) => {
                            if (error) return res.status(500).send({ mensaje: "Error en la petición" });
                            if (!productoCarritoEliminado) return res.status(500).send({ mensaje: "Error al eliminar el producto del carrito" });


                            let totalCarritoArray = 0;
                            let subTotal1 = new Array();

                            for (let p = 0; p < productoCarritoEliminado.carrito.length; p++) {
                                subTotal1[p] = productoCarritoEliminado.carrito[p].cantidadComprada * productoCarritoEliminado.carrito[p].precioUnitario;

                                totalCarritoArray += subTotal1[p];
                            }
                            Usuarios.findByIdAndUpdate(req.user.sub, { totalCarrito: totalCarritoArray }, { new: true }, (error, totalActualizado) => {
                                if (error) return res.status(500).send({ mensaje: "Error en la petición final" });
                                if (!totalActualizado) return res.status(500).send({ mensaje: "Error al actualizar el total de carrito" });


                                return res.status(200).send({ "Producto eliminado de su carrito, resultado: ": totalActualizado });
                            })
                        })
                } else {
                    return res.status(500).send({ error: "Producto no encontrado en su carrito" });
                }
            })
    })
}

function generarFactura(req, res) {
    const facturaModel = new Facturas();

    Usuarios.findById(req.user.sub, (error, usuarioEncontrado) => {

        facturaModel.nit = nitRandom(16, { letters: false });
        facturaModel.listaProductos = usuarioEncontrado.carrito;
        facturaModel.idUsuario = req.user.sub;
        facturaModel.totalFactura = usuarioEncontrado.totalCarrito;

        facturaModel.save((error, facturaGuardada) => {
            if (error) return res.status(500).send({ mensaje: "Error de la petición" });
            if (!facturaGuardada) return res.status(500).send({ mensaje: "Error, no se genero ninguna factura" });

            return res.status(200).send({ Factura: facturaGuardada });
        });

        for (let f = 0; f < usuarioEncontrado.carrito.length; f++) {
            Productos.findOneAndUpdate({ nombreProducto: usuarioEncontrado.carrito[f].nombreProducto },
                { $inc: { cantidad: usuarioEncontrado.carrito[f].cantidadComprada * -1, vendidos: usuarioEncontrado.carrito[f].cantidadComprada } }, { new: true }, (error, modificarCantidad) => {

                })
        }
    })

    Usuarios.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, (error) => {
        if (error) return res.status(500).send({ mensaje: "Error de la petición de vaciado" });
    })

}

////////////////////////////////////////////////////////////////
// CLIENTE - PRODUCTO/CATALOGO
////////////////////////////////////////////////////////////////

function buscarProductoNombre(req, res) {
    parametros = req.body;

    if (parametros.nombreProducto) {

        Productos.findOne({ nombreProducto: { $regex: parametros.nombreProducto, $options: 'i' } }, (error, productoEncontrado) => {
            if (error) return res.status(500).send({ error: "error en la petición" })
            if (!productoEncontrado) return res.status(500).send({ error: "error en la busqueda de este producto" })

            return res.status(200).send({ "Producto encontrado": productoEncontrado })
        })
    } else {
        return res.status(500).send({ error: "ingrese el nombre del producto que quiere buscar" });
    }
}

function categorias(req, res) {
    Categorias.find((error, categoriasObtenidas) => {
        if (error) return res.send({ error: "error en la petición" })

        return res.send({ "Categorias:": categoriasObtenidas })
    })
}

function buscarProductosCategoria(req, res){
    parametros = req.body;

    if (parametros.nombreCategoria) {
        Productos.find({ categoria: { $regex: parametros.nombreCategoria, $options: 'i' } }, (error, productosEncontrados) => {
            if (error) return res.status(500).send({ error: "error en la petición" })
            if (!productosEncontrados) return res.status(500).send({ error: "error en la busqueda de los productos" })

            return res.status(200).send({ "Productos encontrados": productosEncontrados })
        })
    } else {
        return res.status(500).send({ error: "ingrese el nombre de la categoria para buscar" });
    }
}

module.exports = {
    agregarProductoCarrito,
    generarFactura,
    eliminarProductoCarrito,

    buscarProductoNombre,
    categorias,
    buscarProductosCategoria
}
