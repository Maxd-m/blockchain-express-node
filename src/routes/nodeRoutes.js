// routes/nodeRoutes.js

const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/nodesController");

router.post("/register", ctrl.crearNodo);
router.get("/resolve", ctrl.resolverConflictos);

module.exports = router;
