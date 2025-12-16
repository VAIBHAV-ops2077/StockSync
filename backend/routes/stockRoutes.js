const express = require("express");
const router = express.Router();
const { createMovement } = require("../controllers/stockController");

router.post("/", createMovement);

module.exports = router;
