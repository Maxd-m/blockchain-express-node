const supabase = require("../config/supabase");
const { verificarHash } = require("../utils/miner");

const listarBloques = async (req, res) => {
  const { data, error } = await supabase.from("grados").select("*");
  if (error) return res.status(500).json({ mensaje: error.message });
  res.json(data);
};

// Endpoint que recibe un bloque minado por otro nodo (ej. POST /blocks)
const addBloque = async (req, res) => {
  const bloqueEntrante = req.body;
  console.log(
    "JSON recibido del otro nodo:",
    JSON.stringify(bloqueEntrante, null, 2),
  );
  // 1. Validar que vengan todos los campos requeridos
  const camposRequeridos = [
    "persona_id",
    "institucion_id",
    "titulo_obtenido",
    "fecha_fin",
    "hash_anterior",
    "nonce",
    "hash_actual",
  ];

  // const camposFaltantes = camposRequeridos.filter((campo) => !bloque[campo]);
  // CORRECCIÓN: Usamos bloqueEntrante y validamos estrictamente nulos o indefinidos
  const camposFaltantes = camposRequeridos.filter(
    (campo) =>
      bloqueEntrante[campo] === undefined || bloqueEntrante[campo] === null,
  );

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      mensaje: "Bloque rechazado: Formato JSON incorrecto. Faltan datos.",
      campos_faltantes: camposFaltantes,
      tip: "Asegúrate de enviar las llaves exactamente con estos nombres en snake_case.",
    });
  }

  // 1. Verificar la integridad criptográfica del hash
  if (!verificarHash(bloqueEntrante)) {
    return res.status(400).json({
      mensaje: "Bloque rechazado: Hash inválido o no cumple el Proof of Work",
    });
  }

  // 2. Verificar que el bloque encaje en nuestra cadena local
  // Obtenemos nuestro último bloque
  const { data: ultimoBloque } = await supabase
    .from("grados")
    .select("hash_actual")
    .order("creado_en", { ascending: false })
    .limit(1)
    .single();

  const miHashAnterior = ultimoBloque ? ultimoBloque.hash_actual : "";

  // Si el hash anterior del bloque entrante no coincide con nuestra punta de la cadena
  if (bloqueEntrante.hash_anterior !== miHashAnterior) {
    return res.status(409).json({
      mensaje:
        "Bloque rechazado: Desincronización de cadena. El hash_anterior no coincide con nuestro último bloque.",
      tip: "Deberías ejecutar GET /nodes/resolve para sincronizarte.",
    });
  }

  // 3. Si todo es válido, añadimos el bloque a nuestra base de datos
  const { data, error } = await supabase
    .from("grados")
    .insert([bloqueEntrante])
    .select();

  if (error) return res.status(500).json({ mensaje: error.message });

  // (Opcional) Si este bloque tenía una transacción equivalente en nuestra mempool, debemos borrarla
  // await supabase.from("mempool").delete().eq("persona_id", bloqueEntrante.persona_id); // Ejemplo de limpieza

  res.status(201).json({
    mensaje: "Bloque validado y añadido a la cadena local exitosamente",
    bloque: data[0],
  });
};

module.exports = {
  listarBloques,
  addBloque,
};
