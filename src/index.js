require("dotenv").config();

const transacRoutes = require("./routes/transactionRoutes");
const nodeRoutes = require("./routes/nodeRoutes");
const mineRoutes = require("./routes/mineRoutes");
const chainRoutes = require("./routes/chainRoutes");

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); // Para poder recibir transacciones JSON en POST requests [cite: 20]

const PORT = process.env.PORT || 8001; // Puerto 8001 para el Nodo 1

// Endpoint para compartir la cadena
app.get("/", (req, res) => {
  res.json({
    mensaje: "Blockchain local del Nodo Express",
    longitud: 0,
    cadena: [],
  });
});

app.use("/transactions", transacRoutes);
app.use("/nodes", nodeRoutes);
app.use("/mine", mineRoutes);
app.use("/chain", chainRoutes);

app.listen(PORT, () => {
  console.log(`Nodo Express corriendo en http://localhost:${PORT}`);
});
