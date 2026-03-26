const supabase = require("../config/supabase");
const { verificarHash } = require("../utils/miner"); // <-- Importamos tu utilidad

/**
 * Método auxiliar para validar toda una cadena recibida de otro nodo.
 * Ahora incluye la validación criptográfica bloque por bloque.
 */
const cadenaEsValida = (cadena) => {
  // Si la cadena está vacía, no es válida
  if (!cadena || cadena.length === 0) return false;

  for (let i = 0; i < cadena.length; i++) {
    const bloqueActual = cadena[i];

    // 1. Verificamos el Proof of Work y la integridad de los datos de ESTE bloque
    if (!verificarHash(bloqueActual)) {
      console.log(
        `[Consenso] Bloque inválido detectado (Hash/PoW incorrecto). ID: ${bloqueActual.id}`,
      );
      return false;
    }

    // 2. Verificamos el enlace temporal (cadena) con el bloque anterior
    // Omitimos el bloque 0 porque es el Génesis y no tiene bloque anterior
    if (i > 0) {
      const bloqueAnterior = cadena[i - 1];
      if (bloqueActual.hash_anterior !== bloqueAnterior.hash_actual) {
        console.log(
          `[Consenso] Enlace roto en la cadena. El hash_anterior no coincide en el índice ${i}`,
        );
        return false;
      }
    }
  }

  return true; // Si sobrevive al ciclo, la cadena es criptográficamente perfecta
};

// GET /nodes/resolve
const resolverConflictos = async (req, res) => {
  try {
    // 1. Obtener mi propia cadena para saber mi longitud actual
    const { data: miCadena, error: errorMiCadena } = await supabase
      .from("grados")
      .select("*")
      .order("creado_en", { ascending: true });

    if (errorMiCadena) throw errorMiCadena;

    // 2. Obtener los demás nodos registrados
    const { data: nodos, error: errorNodos } = await supabase
      .from("nodos_conocidos") // Asegúrate de usar el nombre correcto de tu tabla de nodos
      .select("url");

    if (errorNodos) throw errorNodos;

    let maximaLongitud = miCadena ? miCadena.length : 0;
    let cadenaMasLarga = null;

    // 3. Consultar la cadena (GET /chain) de cada vecino en la red
    if (nodos && nodos.length > 0) {
      for (const nodo of nodos) {
        try {
          const response = await fetch(`${nodo.url}/chain`);

          if (response.ok) {
            const cadenaVecino = await response.json();

            // 4. Comparamos longitud y validamos matemáticamente usando nuestro método auxiliar
            if (
              cadenaVecino.length > maximaLongitud &&
              cadenaEsValida(cadenaVecino)
            ) {
              maximaLongitud = cadenaVecino.length;
              cadenaMasLarga = cadenaVecino;
            }
          }
        } catch (err) {
          console.log(`[Consenso] Nodo inaccesible: ${nodo.url}`);
        }
      }
    }

    // 5. Si encontramos una cadena válida más larga, sobreescribimos la nuestra
    if (cadenaMasLarga) {
      // a) Vaciamos nuestra tabla local de grados
      const { error: errorBorrado } = await supabase
        .from("grados")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Hack de Supabase para borrar todos los registros (usar un ID que no exista o .not("id", "is", null))

      if (errorBorrado) throw errorBorrado;

      // b) Insertamos la nueva cadena ganadora
      const { error: errorInsercion } = await supabase
        .from("grados")
        .insert(cadenaMasLarga);

      if (errorInsercion) throw errorInsercion;

      return res.status(200).json({
        mensaje:
          "Conflicto resuelto: Nuestra cadena fue reemplazada por la red",
        nueva_longitud: maximaLongitud,
      });
    }

    // 6. Si nadie tiene una cadena válida más larga, conservamos la nuestra
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
    .from("nodos_conocidos")
    .insert([{ url, nombre, activo }])
    .select();
  if (error) return res.status(500).json({ mensaje: error.message });
  res.status(201).json(data);
};

module.exports = {
  crearNodo,
  resolverConflictos,
};
