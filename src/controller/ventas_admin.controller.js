const Usuarios = require('../models/usuarios.model');
const Productos = require('../models/productos.model');
const Categorias = require('../models/categorias.model');
const Facturas = require('../models/facturas.model');

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');


////////////////////////////////////////////////////////////////
// UNIVERSAL
////////////////////////////////////////////////////////////////

function Login(req, res) {
    var parametros = req.body;

    Usuarios.findOne({ usuario: parametros.usuario }, (error, usuarioEncontrado) => {
        if (error) return res.status(500).send({ mensaje: "Error en la petición" });
        if (usuarioEncontrado) {

            bcrypt.compare(parametros.password, usuarioEncontrado.password, (error, verificacionPassword) => {
                if (verificacionPassword) {

                    if (parametros.obtenerToken === "true") {
                        return res.status(200).send({ token: jwt.crearToken(usuarioEncontrado) })
                    }
                } else {
                    usuarioEncontrado.password = undefined;
                    return res.status(200).send({ usuario: usuarioEncontrado })
                }
            })
        } else {
            return res.status(500).send({ mensaje: "Error, el Usuario no se encuentra registrado" })
        }
    })
}

function verCategorias(req, res) {
    Categorias.find((error, categoriasObtenidas) => {

        if (error) return res.send({ mensaje: "error:" + error })

        for (let i = 0; i < categoriasObtenidas.length; i++) {
        }

        return res.send({ "Lista de categorias registradas:": categoriasObtenidas })
    })
}

function Registrar(req, res) {
    var parametros = req.body;
    var usuarioModelo = new Usuarios();

    if (parametros.nombre && parametros.apellido && parametros.usuario && parametros.password) {

        usuarioModelo.nombre = parametros.nombre;
        usuarioModelo.apellido = parametros.apellido;
        usuarioModelo.usuario = parametros.usuario;
        usuarioModelo.rol = "Cliente";
        usuarioModelo.totalCarrito = 0;

        Usuarios.find({ usuario: parametros.usuario }, (error, usuarioEncontrado) => {
            if (usuarioEncontrado.length == 0) {

                bcrypt.hash(parametros.password, null, null, (error, passwordEncriptada) => {
                    usuarioModelo.password = passwordEncriptada;

                    usuarioModelo.save((error, usuarioGuardado) => {
                        if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                        if (!usuarioGuardado) return res.status(500).send({ mensaje: "Error, no se agrego ningun Usuario" });

                        return res.status(200).send({ usuario: usuarioGuardado, nota: "Usuario agregado exitosamente" });
                    });
                });

            } else {
                return res.status(500).send({ mensaje: "Este Usuario ya se encuentra utilizado" });
            }
        });
    }
}

////////////////////////////////////////////////////////////////
// ADMIN - PRODUCTOS
////////////////////////////////////////////////////////////////

function stockProducto(req, res) {
    const idProdu = req.params.idProducto;
    const parametros = req.body;

    Productos.findByIdAndUpdate(idProdu, { $inc: { cantidad: parametros.cantidad } }, { new: true }, (error, stockProduActualizado) => {
        if (error) return res.status(500).send({ mensaje: "Error1 en la petición" });
        if (!stockProduActualizado) return res.status(500).send({ mensaje: "Error1, no se edito la cantidad" });

        return res.status(200).send({ producto: stockProduActualizado });
    });

}

function verProductos(req, res) {
    Productos.find((error, productosObtenidos) => {

        if (error) return res.send({ mensaje: "error:" + error })

        for (let i = 0; i < productosObtenidos.length; i++) {
        }

        return res.send({ "Lista de productos encontrados:": productosObtenidos })
    })
}

function agregarProductos(req, res) {
    var parametros = req.body;
    var productoModelo = new Productos();

    if (parametros.nombre && parametros.precio && parametros.categoria && parametros.cantidad) {

        Categorias.findOne({ nombreCategoria: { $regex: parametros.categoria, $options: 'i' } }, (error, categoriaEncontrada) => {
            if (error) return res.status(500).send({ mensaje: "Error en la petición" });
            if (!categoriaEncontrada) return res.status(500).send({ mensaje: "Error, no existe una categoria similar" });

            productoModelo.nombreProducto = parametros.nombre;
            productoModelo.precio = parametros.precio;
            productoModelo.cantidad = parametros.cantidad;
            productoModelo.categoria = categoriaEncontrada.nombreCategoria;
            productoModelo.vendidos = 0;

            Productos.find({ nombreProducto: parametros.nombre }, (error, productoEncontrado) => {
                if (productoEncontrado.length == 0) {

                    productoModelo.save((error, productoGuardado) => {
                        if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                        if (!productoGuardado) return res.status(500).send({ mensaje: "Error, no se agrego ningun producto" });

                        return res.status(200).send({ "Producto agregado exitosamente": productoGuardado });
                    });

                } else {
                    return res.status(500).send({ mensaje: "Este producto ya se encuentra registrado" });
                }

            });
        })
    }
}

function EditarProductos(req, res) {
    var idProdu = req.params.idCategoria;
    var parametros = req.body;

    Productos.findByIdAndUpdate(idProdu, parametros, { new: true }, (error, productoActualizado) => {
        if (error) return res.status(500).send({ mesaje: "Error de la petición" });
        if (!productoActualizado) return res.status(500).send({ mensaje: "Error al editar el producto " });

        return res.status(200).send({ "Producto editado exitosamente": productoActualizado });
    });
}

function EliminarProductos(req, res) {
    var idProdu = req.params.idCategoria;

    Productos.findByIdAndDelete(idProdu, (error, productoEliminado) => {
        if (error) return res.status(500).send({ mensaje: "Error de la petición" });
        if (!productoEliminado) return res.status(404).send({ mensaje: "Error al eliminar el producto" });

        return res.status(200).send({ "Producto eliminado con exito": productoEliminado });
    })

}


////////////////////////////////////////////////////////////////
// ADMIN - CATEGORIAS
////////////////////////////////////////////////////////////////

function registrarCategoria(req, res) {
    var parametros = req.body;
    var categoriasModelo = new Categorias();

    if (parametros.nombre) {

        categoriasModelo.nombreCategoria = parametros.nombre;

        Categorias.find({ nombreCategoria: parametros.nombre }, (error, categoriaEncontrada) => {
            if (categoriaEncontrada.length == 0) {

                categoriasModelo.save((error, categoriaGuardada) => {
                    if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                    if (!categoriaGuardada) return res.status(500).send({ mensaje: "Error, no se agrego ninguna categoria nueva" });

                    return res.status(200).send({ "Categoria añadira exitosamente": categoriaGuardada });
                });

            } else {
                return res.status(500).send({ mensaje: "Esta categoria ya existe" });
            }
        });
    }
}

function editarCategoria(req, res) {
    var idCate = req.params.idCategoria;
    var parametros = req.body;

    Categorias.findOne({ _id: idCate }, (error, nombreCategoriaId) => {
        if (error) return res.status(500).send({ mesaje: "Error de la petición" });

        Productos.updateMany({ categoria: nombreCategoriaId.nombreCategoria }, { categoria: parametros.nombreCategoria }, (error) => {
            if (error) return res.status(500).send({ mensaje: "Error de la petición" });

            Categorias.findByIdAndUpdate(idCate, parametros, { new: true }, (error, categoriaActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!categoriaActualizada) return res.status(500).send({ mensaje: "Error al editar la categoria" });

                return res.status(200).send({
                    Categoria: categoriaActualizada, nota: "Categoria editada exitosamente"
                });
            });
        })
    })
}

function eliminarCategoria(req, res) { //UPDATEMANY PARA CUANDO ELIMINE LA CATEGORIA, CAMBIE A LA CATEGORIA POR DEFECTO A TODOS LOS PRODUCTOS DE LA CATEGORIA BORRARA
    var idCate = req.params.idCategoria;

    Categorias.findOne({ _id: idCate }, (error, nombreCategoriaId) => {
        if (error) return res.status(500).send({ mesaje: "Error de la petición" });

        Categorias.findOne({ nombreCategoria: "Por Defecto" }, (error, PorDefectoEncontrado) => {
            if (error) return res.status(500).send({ mesaje: "Error de la petición" });

            if (!PorDefectoEncontrado) {
                const modeloCategoria = new Categorias();
                modeloCategoria.nombreCategoria = "Por Defecto";

                modeloCategoria.save((error, categoriaDefectoGuardada) => {
                    if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                    if (!categoriaDefectoGuardada) return res.status(500).send({ mensaje: "Error, no se agrego la categoria Por Defecto" });


                    Productos.updateMany({ categoria: nombreCategoriaId.nombreCategoria },
                        { categoria: categoriaDefectoGuardada.nombreCategoria }, (error, categoriaProductosActualizada) => {
                            if (error) return res.status(500).send({ mensaje: "Error de la petición" });

                            Categorias.findByIdAndDelete(idCate, (error, categoriaEliminada) => {
                                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                                if (!categoriaEliminada) return res.status(404).send({ mensaje: "Error al eliminar el Usuario" });

                                return res.status(200).send({
                                    "Categoria eliminada con exito": categoriaEliminada,
                                    "Productos Actualizados": categoriaProductosActualizada
                                })
                            })

                        })
                })
            } else {
                Productos.updateMany({ categoria: nombreCategoriaId.nombreCategoria },
                    { categoria: PorDefectoEncontrado.nombreCategoria }, (error, categoriaProductosActualizada) => {
                        if (error) return res.status(500).send({ mensaje: "Error de la petición" });

                        Categorias.findByIdAndDelete(idCate, (error, categoriaEliminada) => {
                            if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                            if (!categoriaEliminada) return res.status(404).send({ mensaje: "Error al eliminar el Usuario" });

                            return res.status(200).send({
                                "Categoria eliminada con exito": categoriaEliminada,
                                "Productos Actualizados": categoriaProductosActualizada
                            })
                        })

                    })
            }
        })
    });

}


////////////////////////////////////////////////////////////////
// ADMIN - USUARIOS
////////////////////////////////////////////////////////////////

function crearAdmin(req, res) {
    var usuarioModelo = new Usuarios();

    usuarioModelo.nombre = "God";
    usuarioModelo.apellido = "of War";
    usuarioModelo.usuario = "ADMIN";
    usuarioModelo.rol = 'Admin';

    Usuarios.find({ rol: "Admin" }, (error, usuarioEncontrado) => {
        if (usuarioEncontrado.length == 0)

            bcrypt.hash("123456", null, null, (error, passwordEncriptada) => {
                usuarioModelo.password = passwordEncriptada;

                usuarioModelo.save((error, usuarioGuardado) => {
                    if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                    if (!usuarioGuardado) return res.status(500).send({ mensaje: "Error, no se agrego ningun usuario" });

                });
            });
    });
}

function verUsuarios(req, res) {
    Usuarios.find((error, usuariosObtenidas) => {

        if (error) return res.send({ mensaje: "error:" + error })

        for (let i = 0; i < usuariosObtenidas.length; i++) {
        }

        return res.send({ "Lista de usuarios registrados:": usuariosObtenidas })
    })
}

function modificarUsuarios(req, res) {
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    Usuarios.findOne({ _id: idUsu }, (error, usuarioEncontrado) => {
        if (error) return res.status(500).send({ mesaje: "Usuario no encontrado" });

        if (req.user.rol == "Admin" && usuarioEncontrado.rol == "Cliente") {

            Usuarios.findByIdAndUpdate(idUsu, parametros, { new: true }, (error, usuarioActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!usuarioActualizada) return res.status(500).send({ mensaje: "Error al editar el Usuario" });

                usuarioActualizada.password = undefined;
                return res.status(200).send({
                    Usuario: usuarioActualizada, nota: "Usuario cliente editado exitosamente"
                });
            });

        } else if (req.user.rol == "Cliente" && req.user.sub == idUsu) {

            parametros.rol = "Cliente"

            Usuarios.findByIdAndUpdate(idUsu, parametros, { new: true }, (error, usuarioActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!usuarioActualizada) return res.status(500).send({ mensaje: "Error al editar el Usuario" });

                usuarioActualizada.password = undefined;
                return res.status(200).send({
                    Usuario: usuarioActualizada, nota: "Perfil editado exitosamente"
                });
            });

        } else if (req.user.rol == "Admin" && req.user.sub == idUsu) {

            Usuarios.findByIdAndUpdate(idUsu, parametros, { new: true }, (error, usuarioActualizada) => {
                if (error) return res.status(500).send({ mesaje: "Error de la petición" });
                if (!usuarioActualizada) return res.status(500).send({ mensaje: "Error al editar el Usuario" });

                usuarioActualizada.password = undefined;
                return res.status(200).send({
                    Usuario: usuarioActualizada, nota: "Perfil admin editada exitosamente"
                });
            });

        } else {
            return res.status(500).send({ error2: "No puede editar a este usuario" });
        }
    })
}

function eliminarUsuarios(req, res) {
    var idUsu = req.params.idUsuario;

    Usuarios.findOne({ _id: idUsu }, (error, usuarioEncontrado) => {
        if (error) return res.status(500).send({ mesaje: "Usuario no encontrado" });

        if (req.user.sub == idUsu) {

            Usuarios.findByIdAndDelete(idUsu, (error, usuarioEliminado) => {
                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                if (!usuarioEliminado) return res.status(404).send({ mensaje: "Error al eliminar el usuario1" });

                return res.status(200).send({ "Perfil eliminado con exito1": usuarioEliminado });
            })

        } else if (req.user.rol == "Admin" && usuarioEncontrado.rol == "Cliente") {

            Usuarios.findByIdAndDelete(idUsu, (error, usuarioEliminado) => {
                if (error) return res.status(500).send({ mensaje: "Error de la petición" });
                if (!usuarioEliminado) return res.status(404).send({ mensaje: "Error al eliminar el usuario2" });

                return res.status(200).send({ "Usuario eliminado con exito2": usuarioEliminado });
            })

        } else {
            return res.status(500).send({ error: "No puede eliminar a este usuario" });
        }
    });
}

////////////////////////////////////////////////////////////////
// ADMIN - VER FACTURAS
////////////////////////////////////////////////////////////////

function facturasUsuario(req, res) {
    idUsuario = req.params.idUsuario;

    Facturas.find({ idUsuario: idUsuario, }, (error, facturasEncontradas) => {
        if (error) return res.status(500).send({ error: "error en la petición" });
        if (!facturasEncontradas) return res.status(500).send({ error: "error al buscar las facturas" });

        facturasEncontradas.listaProductos = undefined;
        return res.status(200).send({ "Facturas del Usuario encontradas:": facturasEncontradas })
    })
}

function productosFactura(req, res) {
    idFactura = req.params.idFactura;

    Facturas.findById(idFactura, (error, facturaEncontrada) => {
        if (error) return res.status(500).send({ error: "error en la petición" });
        if (!facturaEncontrada) return res.status(500).send({ error: "error al buscar la factura" });

        facturaEncontrada.idUsuario = undefined
        return res.status(200).send({ "Factura encontrada:": facturaEncontrada })
    })
}

function productosAgotados(req, res) {
    Productos.find({ cantidad: 0 }, (error, productosAgotados) => {
        if (error) return res.status(500).send({ error: "error en la petición" })

        return res.status(200).send({ "Lista de productos agotados:": productosAgotados })
    })
}

function productosMasVendidos(req, res) {
    Productos.find({ vendidos: { $gt: 0 } }, (error, productosObtenidos) => {
        if (error) return res.status(500).send({ error: "error en la petición" })

        productosObtenidos.categoria = undefined;
        return res.status(200).send({ "Lista de los productos más vendidos:": productosObtenidos })
    }).sort({ vendidos: -1 })

}



module.exports = {
    Login,

    stockProducto,
    verProductos,
    agregarProductos,
    EditarProductos,
    EliminarProductos,

    verCategorias,
    registrarCategoria,
    editarCategoria,
    eliminarCategoria,

    crearAdmin,
    verUsuarios,
    Registrar,
    modificarUsuarios,
    eliminarUsuarios,

    productosAgotados,
    productosFactura,
    facturasUsuario,
    productosMasVendidos
}
