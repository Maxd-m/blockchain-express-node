const supabase = require("../config/supabase");

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
    .select();

  if (error) return res.status(500).json({ mensaje: error.message });
  res.status(201).json(data);
};

module.exports = {
  crearNodo,
};
