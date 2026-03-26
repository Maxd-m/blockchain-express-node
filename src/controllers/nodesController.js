const supabase = require("../config/supabase");

// POST - Crear una nueva práctica
const crearNodo = async (req, res) => {
  const { url, nombre, activo } = req.body;

  const { data, error } = await supabase
    .from("nodos")
    .insert([
      {
        url,
        nombre,
        activo,
      },
    ])
    .select(); // Nota: Agregué .select() para que Supabase te devuelva el registro creado

  if (error) return res.status(500).json({ mensaje: error.message });
  res.status(201).json(data);
};

module.exports = {
  crearNodo,
};
