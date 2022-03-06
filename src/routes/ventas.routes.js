const express = require('express');
const adminController = require('../controller/ventas_admin.controller');
const clienteController = require('../controller/ventas_cliente.controller')

const md_autentificacion = require('../middlewares/autentificacion');
const md_autentificacion_rol = require('../middlewares/autentificacion_rol_usuario');


var api = express.Router();

api.post('/login', adminController.Login);

api.get('/verCategorias', adminController.verCategorias);
api.post('/registrarCategoria', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.registrarCategoria);
api.put('/editarCategoria/:idCategoria', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.editarCategoria);
api.delete('/eliminarCategoria/:idCategoria', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.eliminarCategoria);

api.get('/productos', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.verProductos);
api.put('/stockProducto/:idProducto', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.stockProducto);
api.post('/agregarProducto', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.agregarProductos);
api.put('/editarProducto/:idCategoria', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.EditarProductos);
api.delete('/eliminarProducto/:idCategoria', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.EliminarProductos);

api.get('/usuarios', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.verUsuarios);
api.post('/registrar', adminController.Registrar);
api.put('/modificarUsuario/:idUsuario', md_autentificacion.Auth, adminController.modificarUsuarios);
api.delete('/eliminarUsuario/:idUsuario', md_autentificacion.Auth, adminController.eliminarUsuarios);

api.get('/productosMasVendidos', md_autentificacion.Auth, adminController.productosMasVendidos);
api.get('/productosAgotados', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.productosAgotados);
api.get('/productosFactura/:idFactura', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.productosFactura);
api.get('/facturasUsuario/:idUsuario', [md_autentificacion.Auth, md_autentificacion_rol.Admi], adminController.facturasUsuario);

//CARRITOS - FACTURAS
api.put('/agregarProductoCarrito', [md_autentificacion.Auth, md_autentificacion_rol.Clie], clienteController.agregarProductoCarrito);
api.put('/generarFactura', [md_autentificacion.Auth, md_autentificacion_rol.Clie], clienteController.generarFactura);
api.delete('/eliminarProductoCarrito', [md_autentificacion.Auth, md_autentificacion_rol.Clie], clienteController.eliminarProductoCarrito)
api.get('/ProductosCategoria', [md_autentificacion.Auth, md_autentificacion_rol.Clie], clienteController.buscarProductosCategoria);
api.get('/buscarProducto', [md_autentificacion.Auth, md_autentificacion_rol.Clie], clienteController.buscarProductoNombre);


module.exports = api;
