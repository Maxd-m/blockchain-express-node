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
  const dificultad = "0000";

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

/**
 * Verifica que el hash de un bloque entrante sea legítimo y cumpla la dificultad.
 * Incluye depuración detallada para identificar la causa del rechazo.
 * @param {Object} bloque - El bloque completo recibido en el request
 * @returns {Boolean} - true si es válido, false si es inválido
 */
const verificarHash = (bloque) => {
  const dificultad = "000"; // Debe ser la misma que usaste al minar

  // 1. Extraemos los campos (añadí el 'id' para poder identificarlo en la consola)
  const {
    id,
    persona_id,
    institucion_id,
    titulo_obtenido,
    fecha_fin,
    hash_anterior,
    nonce,
    hash_actual,
  } = bloque;

  // 2. Reconstruimos la cadena original
  const dataAHashear = `${persona_id}${institucion_id}${titulo_obtenido}${fecha_fin}${hash_anterior}${nonce}`;

  // 3. Volvemos a calcular el hash por nuestra cuenta
  const hashCalculado = crypto
    .createHash("sha256")
    .update(dataAHashear)
    .digest("hex");

  // 4. Validamos las dos reglas
  const esHashCorrecto = hashCalculado === hash_actual;
  const cumpleDificultad = hashCalculado.startsWith(dificultad);

  // ==========================================
  //         INICIO DE DEPURACIÓN
  // ==========================================
  if (!esHashCorrecto || !cumpleDificultad) {
    console.log(`\n❌ [ERROR DE VALIDACIÓN] Bloque ID: ${id || "Desconocido"}`);

    // Mostramos exactamente qué intentó hashear tu código
    console.log(`Datos concatenados : "${dataAHashear}"`);
    console.log(`Hash esperado (el que calculamos) : ${hashCalculado}`);
    console.log(`Hash recibido (el que mandó el nodo): ${hash_actual}`);

    // Identificamos la causa raíz
    if (!esHashCorrecto) {
      console.log(`Motivo de rechazo: LOS HASHES NO COINCIDEN.`);
      console.log(
        `Tip: Dile al otro nodo que revise el orden en el que concatena sus datos. Un solo espacio extra arruina todo.`,
      );
    } else if (!cumpleDificultad) {
      console.log(
        `Motivo de rechazo: NO CUMPLE EL PROOF OF WORK (DIFICULTAD).`,
      );
      console.log(
        `Tip: El hash es matemáticamente correcto, pero tu nodo exige que empiece con "${dificultad}", y este empieza con "${hashCalculado.substring(0, dificultad.length)}".`,
      );
    }
    console.log(`--------------------------------------------------\n`);
  } else {
    // Opcional: un log pequeñito cuando todo sale bien
    console.log(
      `✅ [BLOQUE VÁLIDO] Bloque ID: ${id || "Desconocido"} pasó las pruebas criptográficas.`,
    );
  }
  // ==========================================

  return esHashCorrecto && cumpleDificultad;
};

/**
 * Verifica únicamente que el hash corresponda a la información del bloque.
 * IGNORA la regla de dificultad (Proof of Work) de los ceros iniciales.
 * @param {Object} bloque - El bloque completo recibido
 * @returns {Boolean} - true si los datos están íntegros, false si fueron alterados
 */
const verificarHashSinDificultad = (bloque) => {
  const {
    id,
    persona_id,
    institucion_id,
    titulo_obtenido,
    fecha_fin,
    hash_anterior,
    nonce,
    hash_actual,
  } = bloque;

  // Reconstruimos la cadena original exactamente igual
  const dataAHashear = `${persona_id}${institucion_id}${titulo_obtenido}${fecha_fin}${hash_anterior}${nonce}`;

  // Calculamos el hash
  const hashCalculado = crypto
    .createHash("sha256")
    .update(dataAHashear)
    .digest("hex");

  // Validamos SOLO la integridad de los datos
  const esHashCorrecto = hashCalculado === hash_actual;

  // ==========================================
  //         DEPURACIÓN DE INTEGRIDAD
  // ==========================================
  if (!esHashCorrecto) {
    console.log(`\n❌ [ERROR DE INTEGRIDAD] Bloque ID: ${id || "Desconocido"}`);
    console.log(`Datos concatenados : "${dataAHashear}"`);
    console.log(`Hash esperado      : ${hashCalculado}`);
    console.log(`Hash recibido      : ${hash_actual}`);
    console.log(
      `Motivo de rechazo  : LOS HASHES NO COINCIDEN. La información fue alterada o mal concatenada.`,
    );
    console.log(`--------------------------------------------------\n`);
  } else {
    console.log(
      `✅ [BLOQUE ÍNTEGRO] Bloque ID: ${id || "Génesis/Desconocido"}`,
    );
  }

  return esHashCorrecto;
};

// NO OLVIDES EXPORTARLA AL FINAL DEL ARCHIVO:
module.exports = {
  calcularProofOfWork,
  verificarHash,
  verificarHashSinDificultad, // <-- Añade esta línea
};

module.exports = {
  calcularProofOfWork,
  verificarHash,
  verificarHashSinDificultad,
};
