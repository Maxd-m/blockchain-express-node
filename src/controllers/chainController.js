const supabase = require("../config/supabase");

const listarBloques = async (req, res) => {
  const { data, error } = await supabase.from("grados").select("*");
  if (error) return res.status(500).json({ mensaje: error.message });
  res.json(data);
};

// ************ pendiente *****************
const addBloque = async (req, res) => {
  // Solo pedimos nombre y numero_control, la BD maneja el ID y la fecha
  const { nombre, numero_control } = req.body;

  //verificar hash

  //add bloque
  const { data, error } = await supabase
    .from("grado")
    .insert([{ nombre, numero_control }])
    .select(); // Nota: Agregué .select() para que Supabase te devuelva el registro creado

  if (error) return res.status(500).json({ mensaje: error.message });
  res.status(201).json(data);
};

module.exports = {
  listarBloques,
};
