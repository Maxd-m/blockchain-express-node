const btnGetChain = document.getElementById("btn-get-chain");
const btnMine = document.getElementById("btn-mine");
const divResultado = document.getElementById("resultado");

// Función para listar bloques (GET /chain)
btnGetChain.addEventListener("click", async () => {
  try {
    divResultado.textContent = "Cargando...";
    const response = await fetch("/chain");
    const data = await response.json();
    // Mostramos el JSON formateado en pantalla
    divResultado.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    divResultado.textContent = "Error al obtener la cadena: " + error.message;
  }
});

// Función para minar (POST /mine)
btnMine.addEventListener("click", async () => {
  try {
    divResultado.textContent = "Minando...";
    const response = await fetch("/mine", { method: "POST" });
    const data = await response.json();
    divResultado.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    divResultado.textContent = "Error al minar: " + error.message;
  }
});
