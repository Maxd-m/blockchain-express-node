const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/transactionController");

router.post("/", ctrl.crearTransaccion);
module.exports = router;
