// app.js

// Referencias a elementos HTML
const formTransaction = document.getElementById("form-transaction-form");
const formNode = document.getElementById("form-node-form");
const btnGetChain = document.getElementById("btn-get-chain");
const btnDocs = document.getElementById("btn-docs");
const btnMine = document.getElementById("btn-mine");
const btnResolveConflicts = document.getElementById("btn-resolve-conflicts");
const resultsDisplay = document.getElementById("results-display");
const tabButtons = document.querySelectorAll(".tab-btn");
const formSections = document.querySelectorAll(".form-section");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    // Activar botón
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Mostrar formulario correspondiente
    formSections.forEach((section) => {
      if (section.id === target) {
        section.classList.remove("hidden");
        section.classList.add("active");
      } else {
        section.classList.add("hidden");
        section.classList.remove("active");
      }
    });
  });
});

// Función auxiliar para realizar peticiones fetch usando rutas relativas
async function makeRequest(url, method = "GET", body = null) {
  try {
    resultsDisplay.textContent = "Cargando..."; // Estado de carga
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);

    // Al usar solo 'url', el navegador automáticamente asume que es en el mismo dominio
    // Ejemplo: Si estás en localhost:8001, fetch('/chain') buscará en localhost:8001/chain
    const response = await fetch(url, options);
    const data = await response.json();

    // Mostrar el resultado formateado
    resultsDisplay.textContent = JSON.stringify(data, null, 2);

    // Limpiar formularios si la petición fue exitosa (solo para POST)
    if (response.ok && method === "POST") {
      if (url === "/transactions") formTransaction.reset();
      if (url === "/nodes/register") formNode.reset();
    }
  } catch (error) {
    resultsDisplay.textContent = `Error: ${error.message}`;
    resultsDisplay.classList.add("error"); // Estilo opcional de error
  }
}

function getValue(id) {
  const value = document.getElementById(id).value;
  return value === "" ? null : value;
}

// --- Event Listeners ---

// 1. GET /chain: "Ver cadena"
btnGetChain.addEventListener("click", () => {
  makeRequest("/chain");
});

// 2. POST /mine: "Minar ultima transaccion"
btnMine.addEventListener("click", () => {
  makeRequest("/mine", "POST");
});

// 3. GET /nodes/resolve: "Resolver conflictos"
btnResolveConflicts.addEventListener("click", () => {
  makeRequest("/nodes/resolve");
});

// 4. POST /transactions: Formulario "Transaccion" -> botón "Crear"
formTransaction.addEventListener("submit", (e) => {
  e.preventDefault(); // Evitar recarga de página

  // Construir payload
  const payload = {
    persona_id: getValue("trans_persona"),
    institucion_id: getValue("trans_institucion"),
    programa_id: getValue("trans_programa"),
    fecha_inicio: getValue("trans_fecha_inicio"),
    fecha_fin: getValue("trans_fecha_fin"),
    titulo_obtenido: getValue("trans_titulo"),
    numero_cedula: getValue("trans_cedula"),
    titulo_tesis: getValue("trans_tesis"),
    menciones: getValue("trans_menciones"),
  };

  makeRequest("/transactions", "POST", payload);
});

// 5. POST /nodes/register: Formulario "Nuevo nodo" -> botón "Crear"
formNode.addEventListener("submit", (e) => {
  e.preventDefault(); // Evitar recarga de página

  // Construir payload, manejando el booleano
  const payload = {
    url: document.getElementById("node_url").value,
    nombre: document.getElementById("node_name").value,
    activo:
      document.getElementById("node_active").value.toLowerCase() === "true", // Convierte texto a booleano
  };

  makeRequest("/nodes/register", "POST", payload);
});

// 6. Botón para abrir la documentación en una nueva pestaña
btnDocs.addEventListener("click", () => {
  window.open("/docs", "_blank");
});
