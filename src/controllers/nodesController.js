const supabase = require("../config/supabase");
const { verificarHash, verificarHashSinDificultad } = require("../utils/miner"); // <-- Importamos tu utilidad

/**
 * Método auxiliar para validar toda una cadena recibida de otro nodo.
 * Incluye validación estructural, Proof of Work y enlaces criptográficos.
 */
const cadenaEsValida = (cadena) => {
  if (!cadena || !Array.isArray(cadena) || cadena.length === 0) return false;

  const camposRequeridos = [
    "persona_id",
    "institucion_id",
    "titulo_obtenido",
    "fecha_fin",
    "hash_anterior",
    "nonce",
    "hash_actual",
  ];

  for (let i = 0; i < cadena.length; i++) {
    const bloqueActual = cadena[i];

    // 1. Validar que la estructura sea correcta y no tenga nulos
    const camposFaltantes = camposRequeridos.filter(
      (campo) =>
        bloqueActual[campo] === undefined || bloqueActual[campo] === null,
    );

    if (camposFaltantes.length > 0) {
      console.log(
        `[Consenso] Cadena inválida: El bloque en el índice ${i} tiene campos faltantes o nulos (${camposFaltantes.join(", ")}).`,
      );
      return false;
    }

    // 2. Verificamos el Proof of Work y la integridad de los datos
    if (!verificarHashSinDificultad(bloqueActual)) {
      console.log(
        `[Consenso] Cadena inválida: Bloque con Hash/PoW incorrecto. Índice: ${i}, ID: ${bloqueActual.id}`,
      );
      return false;
    }

    // 3. Verificamos el enlace temporal con el bloque anterior
    if (i > 0) {
      const bloqueAnterior = cadena[i - 1];
      if (bloqueActual.hash_anterior !== bloqueAnterior.hash_actual) {
        console.log(
          `[Consenso] Cadena inválida: Enlace roto. El hash_anterior del índice ${i} no coincide con el hash_actual del índice ${i - 1}.`,
        );
        return false;
      }
    }
  }

  return true; // La cadena pasó todas las auditorías
};

// GET /nodes/resolve
const resolverConflictos = async (req, res) => {
  try {
    // 1. Obtener mi propia cadena
    const { data: miCadena, error: errorMiCadena } = await supabase
      .from("grados")
      .select("*")
      .order("creado_en", { ascending: true });

    if (errorMiCadena) throw errorMiCadena;

    // 2. Obtener los demás nodos
    const { data: nodos, error: errorNodos } = await supabase
      .from("nodos")
      .select("url");

    if (errorNodos) throw errorNodos;

    let maximaLongitud = miCadena ? miCadena.length : 0;
    let cadenaMasLarga = null;

    // 3. Consultar la cadena de cada vecino
    if (nodos && nodos.length > 0) {
      for (const nodo of nodos) {
        try {
          const response = await fetch(`${nodo.url}/chain`);

          // Solo procedemos si el HTTP Status es 200 OK
          if (response.ok) {
            const cadenaVecino = await response.json();
            cadenaVecino.sort(
              (a, b) => new Date(a.creado_en) - new Date(b.creado_en),
            );

            // A) Validación: Asegurarnos de que nos devolvieron un Array
            if (!Array.isArray(cadenaVecino)) {
              console.log(
                `[Consenso] Ignorando nodo ${nodo.url}: La respuesta no es un arreglo JSON válido.`,
              );
              continue; // Brincamos al siguiente nodo
            }

            // B) Validación: Revisar si compartimos el mismo Bloque Génesis (Bloque 0)
            // Si ambas cadenas tienen bloques, sus hashes iniciales deben ser idénticos
            if (miCadena.length > 0 && cadenaVecino.length > 0) {
              if (miCadena[0].hash_actual !== cadenaVecino[0].hash_actual) {
                console.log(
                  `[Consenso] Ignorando nodo ${nodo.url}: Su bloque Génesis es diferente al nuestro (Pertenecen a otra red).`,
                );
                // console.log(miCadena[0]);
                // console.log(cadenaVecino[0]);
                continue;
              }
            }

            // 4. Comparamos longitud y validamos matemáticamente y estructuralmente
            if (
              cadenaVecino.length > maximaLongitud &&
              cadenaEsValida(cadenaVecino)
            ) {
              maximaLongitud = cadenaVecino.length;
              cadenaMasLarga = cadenaVecino;
            }
          }
        } catch (err) {
          console.log(
            `[Consenso] Nodo inaccesible o error de red: ${nodo.url}`,
          );
        }
      }
    }

    // 5. Si encontramos una cadena válida más larga, sobreescribimos
    if (cadenaMasLarga) {
      const { error: errorBorrado } = await supabase
        .from("grados")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (errorBorrado) throw errorBorrado;

      // c) Limpiamos los datos antes de insertar (Opcional pero recomendado)
      // Extraemos solo las columnas que nuestra BD acepta, ignorando basura extra
      const datosLimpios = cadenaMasLarga.map((b) => ({
        id: b.id,
        persona_id: b.persona_id,
        institucion_id: b.institucion_id,
        programa_id: b.programa_id, // Asegúrate de tener este o quitarlo si no lo usas
        fecha_inicio: b.fecha_inicio,
        fecha_fin: b.fecha_fin,
        titulo_obtenido: b.titulo_obtenido,
        numero_cedula: b.numero_cedula,
        titulo_tesis: b.titulo_tesis,
        menciones: b.menciones,
        hash_actual: b.hash_actual,
        hash_anterior: b.hash_anterior,
        nonce: b.nonce,
        firmado_por: b.firmado_por,
      }));

      const { error: errorInsercion } = await supabase
        .from("grados")
        .insert(datosLimpios);

      if (errorInsercion) throw errorInsercion;

      return res.status(200).json({
        mensaje:
          "Conflicto resuelto: Nuestra cadena fue reemplazada por la red",
        nueva_longitud: maximaLongitud,
      });
    }

    // 6. Si nadie tiene una cadena válida más larga
    res.status(200).json({
      mensaje: "Conflicto resuelto: Nuestra cadena ya es la más larga y válida",
      longitud: maximaLongitud,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al resolver conflictos",
      detalle: error.message,
    });
  }
};

const crearNodo = async (req, res) => {
  const { url, nombre, activo } = req.body;
  const { data, error } = await supabase
    .from("nodos")
    .insert([{ url, nombre, activo }])
    .select();
  if (error) return res.status(500).json({ mensaje: error.message });
  res.status(201).json(data);
};

module.exports = {
  crearNodo,
  resolverConflictos,
};
