require("dotenv").config();

const transacRoutes = require("./routes/transactionRoutes");
const nodeRoutes = require("./routes/nodeRoutes");
const mineRoutes = require("./routes/mineRoutes");
const chainRoutes = require("./routes/chainRoutes");

const express = require("express");
const path = require("path");
const cors = require("cors");

// 1. Importamos las librerías para la documentación
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

app.use(cors());
app.use(express.json()); // Para poder recibir transacciones JSON en POST requests

const PORT = process.env.PORT || 8001; // Puerto 8001 para el Nodo 1

// 2. Cargamos el archivo OpenAPI (asegúrate de que esté en la misma carpeta que index.js)
const swaggerDocument = YAML.load(path.join(__dirname, "../openapi.yaml"));

// 3. Reemplazamos el app.get("/docs") manual por la interfaz de Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Sirve la interfaz gráfica en HTML
app.use(express.static(path.join(__dirname, "public")));

app.use("/transactions", transacRoutes);
app.use("/nodes", nodeRoutes);
app.use("/mine", mineRoutes);
app.use("/chain", chainRoutes);

app.listen(PORT, () => {
  console.log(`Nodo Express corriendo en http://localhost:${PORT}`);
  console.log(
    `Documentación de la API disponible en http://localhost:${PORT}/docs`,
  );
});
