const supabase = require("../config/supabase");
// Suponiendo que tienes tu función de minería en otro archivo
const { calcularProofOfWork } = require("../utils/miner");

const minar = async (req, res) => {
  try {
    // 1. Obtener info de mempool
    const { data: transaccion, error: errorMempool } = await supabase
      .from("mempool") // O "transacciones_pendientes"
      .select("*")
      .order("creado_en", { ascending: true })
      .limit(1)
      .single();

    if (errorMempool || !transaccion) {
      return res
        .status(404)
        .json({ mensaje: "Transacción no encontrada en mempool" });
    }

    // 2. Consultar tabla grados para el hash_anterior
    const { data: ultimoBloque } = await supabase
      .from("grados")
      .select("hash_actual")
      .order("creado_en", { ascending: false })
      .limit(1)
      .single();

    // Si no hay último bloque, es el Bloque Génesis (nulo o vacío)
    const hashAnterior = ultimoBloque ? ultimoBloque.hash_actual : "";

    // 3. Calcular hash (llamar a método externo para el Proof of Work)
    // Este método debe retornar el hash que cumpla la regla (ej. iniciar con "000") y el nonce que se usó
    const { hash, nonce } = calcularProofOfWork(transaccion, hashAnterior);

    // 4. Guardar en tabla grados (oficializar el bloque)
    const nuevoBloque = {
      persona_id: transaccion.persona_id,
      institucion_id: transaccion.institucion_id,
      programa_id: transaccion.programa_id,
      fecha_inicio: transaccion.fecha_inicio,
      fecha_fin: transaccion.fecha_fin,
      titulo_obtenido: transaccion.titulo_obtenido,
      numero_cedula: transaccion.numero_cedula,
      titulo_tesis: transaccion.titulo_tesis,
      menciones: transaccion.menciones,
      hash_actual: hash, // Campo tipo blockchain [cite: 86]
      hash_anterior: hashAnterior, // Campo tipo blockchain [cite: 86]
      nonce: nonce, // Campo tipo blockchain [cite: 87]
      firmado_por: "Nodo-express", // Identificador de tu nodo [cite: 88]
    };

    const { data: bloqueInsertado, error: errorGrados } = await supabase
      .from("grados")
      .insert([nuevoBloque])
      .select()
      .single();

    if (errorGrados) throw errorGrados;

    // 5. Limpiar mempool
    await supabase.from("mempool").delete().eq("id", transaccion.id);

    // 6. Propagar bloque a nodos registrados
    // Obtenemos los nodos de nuestra tabla (excluyendo el nuestro si lo tuviéramos ahí)
    const { data: nodos } = await supabase.from("nodos").select("url");

    if (nodos && nodos.length > 0) {
      // Disparamos las peticiones de forma asíncrona sin bloquear la respuesta
      nodos.forEach((nodo) => {
        fetch(`${nodo.url}/chain`, {
          // Asumiendo que el endpoint de recepción sea POST /blocks
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bloqueInsertado),
        }).catch((err) =>
          console.log(`Error propagando a ${nodo.url}:`, err.message),
        );
      });
    }

    // Retornamos éxito
    res.status(201).json({
      mensaje: "Bloque minado y propagado con éxito",
      bloque: bloqueInsertado,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

module.exports = {
  minar, // Actualizado el nombre exportado para coincidir con la función
};
