// src/routes/usuarios.js
const express = require("express");
const router = express.Router();
// const validarUsuario = require("../middlewares/validarUsuario");

const ctrl = require("../controllers/transactionController");

// router.get("/", ctrl.listarPracticas);
// router.get("/:id", ctrl.obtenerUsuario);
router.post("/", ctrl.crearTransaccion);
// router.put("/:id", validarUsuario, ctrl.actualizarUsuario);
// router.delete("/:id", ctrl.eliminarUsuario);
module.exports = router;
