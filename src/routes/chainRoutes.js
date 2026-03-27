// routes/chainRoutes.js

const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/chainController");

router.get("/", ctrl.listarBloques);
router.post("/", ctrl.addBloque);
module.exports = router;
