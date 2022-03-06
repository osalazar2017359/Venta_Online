
exports.Admi = function (req, res, next) {
    if (req.user.rol !== "Admin") {
        return res.status(500).send({ message: "Solo para usuarios rol: Admin"})
    }
    next()
}

exports.Clie = function (req, res, next) {
    if (req.user.rol !== "Cliente") {
        return res.status(500).send({ message: "Solo para usuarios rol: Cliente"})
    }
    next()
}
