const crypto = require("crypto");

/**
 * Calcula el Proof of Work generando hashes hasta encontrar uno válido.
 * * @param {Object} transaccion - Los datos de la transacción desde la mempool
 * @param {String} hashAnterior - El hash del último bloque en la tabla 'grados' (o "" si es el génesis)
 * @returns {Object} Un objeto conteniendo el hash válido y el nonce utilizado
 */
const calcularProofOfWork = (transaccion, hashAnterior) => {
  let nonce = 0;
  let hash = "";

  // La dificultad determina cuántos ceros debe tener el hash al inicio.
  // "000" es un buen balance para pruebas (es rápido pero demuestra el concepto).
  // Si tu profesor te pide más dificultad, solo agrega más ceros (ej. "0000").
  const dificultad = "00";

  // Extraemos estrictamente los campos que pide el documento para el hash
  const { persona_id, institucion_id, titulo_obtenido, fecha_fin } =
    transaccion;

  console.log("Iniciando minería (Proof of Work)...");

  // Bucle infinito que solo se detiene cuando encontramos el hash correcto
  while (true) {
    // 1. Concatenar los datos exactamente como indica el PDF
    const dataAHashear = `${persona_id}${institucion_id}${titulo_obtenido}${fecha_fin}${hashAnterior}${nonce}`;

    // 2. Aplicar el algoritmo SHA256
    hash = crypto.createHash("sha256").update(dataAHashear).digest("hex");

    // 3. Validar si el hash cumple con la regla de dificultad
    if (hash.startsWith(dificultad)) {
      console.log(`¡Bloque minado exitosamente! Nonce: ${nonce}`);
      console.log(`Hash generado: ${hash}`);
      break; // Rompemos el bucle porque ya ganamos
    }

    // 4. Si no cumple, incrementamos el nonce y volvemos a intentar
    nonce++;
  }

  // Retornamos los valores que necesita el controlador para guardar en la BD
  return { hash, nonce };
};

module.exports = {
  calcularProofOfWork,
};
