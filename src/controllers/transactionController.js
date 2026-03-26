const supabase = require("../config/supabase");

// POST - Crear una nueva práctica
const crearTransaccion = async (req, res) => {
  const {
    persona_id,
    institucion_id,
    programa_id,
    fecha_inicio,
    fecha_fin,
    titulo_obtenido,
    numero_cedula,
    titulo_tesis,
    menciones,
  } = req.body;

  const { data, error } = await supabase
    .from("mempool")
    .insert([
      {
        persona_id,
        institucion_id,
        programa_id,
        fecha_inicio,
        fecha_fin,
        titulo_obtenido,
        numero_cedula,
        titulo_tesis,
        menciones,
      },
    ])
    .select(); // Nota: Agregué .select() para que Supabase te devuelva el registro creado

  if (error) return res.status(500).json({ mensaje: error.message });
  res.status(201).json(data);
};

module.exports = {
  crearTransaccion,
};
