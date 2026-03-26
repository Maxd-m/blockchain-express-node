// routes/nodeRoutes.js

const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/nodesController");

router.post("/register", ctrl.crearNodo);
module.exports = router;
