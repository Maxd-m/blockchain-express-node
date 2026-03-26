const supabase = require("../config/supabase");

// POST - Crear una nueva transaccion
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
    propagado, // <-- 1. Agregamos este flag para evitar bucles infinitos
  } = req.body;

  // 2. Insertamos en la mempool
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
    .select();

  if (error) return res.status(500).json({ mensaje: error.message });

  // 3. PROPAGACIÓN A OTROS NODOS
  // Solo propagamos si esta transacción viene directamente de un cliente (ej. Postman)
  // y NO si nos la envió otro nodo de la red.
  if (!propagado) {
    const { data: nodos } = await supabase.from("nodos").select("url");

    if (nodos && nodos.length > 0) {
      // Preparamos el cuerpo de la petición indicando que ya fue propagada
      const payloadPropagacion = {
        ...req.body,
        propagado: true, // El nodo que lo reciba verá esto y no lo re-propagará
      };

      // Disparamos las peticiones a todos los nodos conocidos de forma asíncrona
      nodos.forEach((nodo) => {
        fetch(`${nodo.url}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadPropagacion),
        }).catch((err) =>
          console.log(
            `[Transacción] Error propagando a ${nodo.url}:`,
            err.message,
          ),
        );
      });
    }
  }

  // 4. Respondemos éxito al cliente/nodo original
  res.status(201).json({
    mensaje: "Transacción recibida y registrada",
    transaccion: data[0],
  });
};

module.exports = {
  crearTransaccion,
};
