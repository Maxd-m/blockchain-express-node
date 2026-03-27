# Blockchain en Node.js (Proyecto académico)

Este proyecto implementa una cadena de bloques (blockchain) básica usando Express.js y conceptos clave como bloques, transacciones, minería, nodos y consenso.

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

2. Iniciar servidor:

```bash
npm start
```

3. Abrir en el navegador:

- `http://localhost:3000` (UI web)

---

## 🧩 Endpoints principales

### 1) Cadena de bloques

- `GET /chain`
  - Obtiene la cadena de bloques completa.
  - Respuesta: lista de bloques.

- `POST /chain`
  - Agrega un bloque nuevo como dato. (Puede usarse para pruebas o extensión de la cadena).
  - Cuerpo (JSON): datos del bloque, por ejemplo:
    ```json
    {
      "index": 1,
      "timestamp": "2026-03-26T...",
      "transactions": [],
      "proof": 12345,
      "previous_hash": "abc123"
    }
    ```

### 2) Minar

- `POST /mine`
  - Minar un nuevo bloque.
  - Genera prueba de trabajo, agrega transacciones pendientes y retorna bloque minado.
  - No requiere body (u opcional según implementación).

### 3) Transacciones

- `POST /transactions`
  - Crea una nueva transacción y la añade a la lista de transacciones pendientes.
  - Cuerpo (JSON requerido):
    ```json
    {
      "sender": "direccion_origen",
      "recipient": "direccion_destino",
      "amount": 5
    }
    ```

### 4) Nodos y consenso

- `POST /nodes/register`
  - Registrar nuevos nodos de la red.
  - Cuerpo (JSON):
    ```json
    {
      "nodes": ["http://localhost:3001", "http://localhost:3002"]
    }
    ```

- `GET /nodes/resolve`
  - Ejecuta el algoritmo de consenso para resolver conflictos entre nodos y reemplaza la cadena por la más larga válida.

---

## 🛠️ Funcionalidades implementadas

- Estructura básica blockchain con bloque (`index`, `timestamp`, `transactions`, `proof`, `previous_hash`).
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

- Crear transacción:

```bash
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d '{"sender":"a","recipient":"b","amount":1}'
```

- Minar bloque:

```bash
curl -X POST http://localhost:3000/mine
```

- Registrar nodo:

```bash
curl -X POST http://localhost:3000/nodes/register -H "Content-Type: application/json" -d '{"nodes":["http://localhost:3001"]}'
```

- Resolver conflictos:

```bash
curl http://localhost:3000/nodes/resolve
```
