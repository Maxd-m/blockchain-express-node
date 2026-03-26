// routes/mineRoutes.js

const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/mineController");

router.post("/", ctrl.minar);
module.exports = router;
