# Blockchain en express (Proyecto académico)

Este proyecto implementa una cadena de bloques (blockchain) para llevar el registro de obtención de grados académicos usando Express.js y conceptos clave como bloques, transacciones, minería, nodos y consenso.

## 📁 Estructura del proyecto

- `src/index.js`: punto de entrada del servidor Express.
- `src/routes/*`: rutas de la API.
- `src/controllers/*`: lógica de negocio para cada ruta.
- `src/utils/miner.js`: lógica de minería y validación de hash.
- `src/config/supabase.js`: configuración de Supabase.
- `src/public`: cliente web simple (`index.html`, `app.js`, estilos CSS).

---

## 🚀 Instalación y ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Variables de Entorno
   Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example`.

3. Base de datos
   Este proyecto requiere una base de datos PostgreSQL alojada en Supabase.
   Para inicializar las tablas necesarias (`grados`, `mempool`, `nodos_conocidos`, etc.), por favor ejecuta el script SQL que se encuentra en `schema.sql`

4. Iniciar servidor:

```bash
npm start
```

4. Abrir en el navegador:

- `http://localhost:3000` (UI web)

---

## 🧩 Endpoints principales

**Para mas informacion revisar el archivo openapi.yaml**

### 1) Cadena de bloques

- `GET /chain`
  - Obtiene la cadena de bloques completa.
  - Respuesta: lista de bloques.

- `POST /chain`
  - Agrega un bloque nuevo como dato. (Puede usarse para pruebas o extensión de la cadena).

### 2) Minar

- `POST /mine`
  - Minar un nuevo bloque.
  - Genera prueba de trabajo, agrega transacciones pendientes y retorna bloque minado.
  - No requiere body (u opcional según implementación).

### 3) Transacciones

- `POST /transactions`
  - Crea una nueva transacción y la añade a la lista de transacciones pendientes.

### 4) Nodos y consenso

- `POST /nodes/register`
  - Registrar nuevos nodos de la red.

- `GET /nodes/resolve`
  - Ejecuta el algoritmo de consenso para resolver conflictos entre nodos y reemplaza la cadena por la más larga válida.

---

## 🛠️ Funcionalidades implementadas

- Estructura de bloque adaptada a registros académicos (`persona_id`, `institucion_id`, `titulo_obtenido`, `hash_actual`, `hash_anterior`, `nonce`).
- Gestión de transacciones pendientes.
- Minería con prueba de trabajo (PoW).
- Validación del hash y de la cadena.
- Registro de nodos y consenso de red.
- Interfaz de cliente simple en `src/public`.

---

## 🧪 Pruebas rápidas mediante `curl`

- Ver cadena:

```bash
curl http://localhost:3000/chain
```

- Crear transacción (registro académico):

```bash
curl -X POST http://localhost:3000/transactions \
-H "Content-Type: application/json" \
-d '{
  "persona_id": "11111111-1111-1111-1111-111111111111",
  "institucion_id": "22222222-2222-2222-2222-222222222222",
  "programa_id": "33333333-3333-3333-3333-333333333333",
  "fecha_inicio": "2018-08-15",
  "fecha_fin": "2022-06-01",
  "titulo_obtenido": "Ingeniero en Sistemas Computacionales",
  "numero_cedula": "CED-12345678",
  "titulo_tesis": "Implementación de Redes Blockchain",
  "menciones": "Mención Honorífica"
}'
```

- Minar bloque:

```bash
curl -X POST http://localhost:3000/mine
```

- Registrar nodo:

```bash
curl -X POST http://localhost:3000/nodes/register \
-H "Content-Type: application/json" \
-d '{
  "url": "http://localhost:3001",
  "nombre": "Nodo de mi compañero",
  "activo": true
}'
```

- Resolver conflictos:

```bash
curl http://localhost:3000/nodes/resolve
```
