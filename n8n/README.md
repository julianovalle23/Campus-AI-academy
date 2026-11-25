# Solicitudes de información: n8n + Google Sheets + Telegram

No hay backend propio. El landing y el panel son páginas estáticas que llaman a dos webhooks de n8n:

| Archivo | Webhook | Qué hace |
| --- | --- | --- |
| `1-recibir-solicitud.json` | `POST /webhook/aia-solicitud` | Valida el formulario y guarda la fila en **Solicitudes** con estado `Nuevo`. También anota la creación en **Historial**, responde al visitante y, **solo después de guardar**, avisa al chat de prueba de Telegram. |
| `2-panel-api.json` | `POST /webhook/aia-panel` | Gestiona el inicio de sesión del panel, la lista y el detalle de solicitudes, el cambio de estado, las notas, el historial y el cierre de sesión. Todo lee y escribe en la misma hoja. |

`build.mjs` genera ambos JSON. Contienen la misma definición que está en la instancia de prueba, con dos cambios:

- El ID de la hoja y el chat de Telegram van como marcadores (`REEMPLAZAR_…`).
- No incluyen credenciales.

`test/n8n-export.test.js` comprueba tres cosas:

- Los JSON no contienen secretos.
- Todas las conexiones apuntan a nodos que existen.
- Las ramas de error están conectadas: si falla el guardado, no se envía aviso; si falla el cambio de estado, no se escribe historial.

```bash
node n8n/build.mjs   # regenera los JSON
npm test
```

## Reglas que aplica n8n (no solo el navegador)

- **Validación.** Nombre (2–100), correo con formato válido, programa (uno de los cinco del landing: Ignition, Booster, Liftoff, Odyssey o Nebula) y teléfono opcional (7–15 dígitos). Son las mismas reglas que `src/lib/lead.js`. Una solicitud inválida recibe `422` y no se guarda ni se avisa. El campo oculto `website` (trampa para bots) también se rechaza.
- **Guardado.** Si falla el guardado en Sheets, el visitante recibe `500` con un mensaje neutro y Telegram no se ejecuta.
- **Aviso.** El aviso incluye el código de la solicitud, el nombre, el correo, el programa y el teléfono solo si se escribió. El resultado queda en la columna `aviso` (`enviado` o `fallido`).
- **Escritura en Sheets.** Todo se escribe en modo `RAW`, así que un texto como `=HYPERLINK(...)` no se ejecuta como fórmula.
- **Panel.** Cada acción salvo `login` exige un token de sesión vigente. Sin token, la respuesta es `401` y no devuelve datos.
- **Cambios.** Cada cambio de estado y cada nota añaden una fila a **Historial** con qué cambió (antes y después), quién lo hizo y cuándo.

## Hoja de Google

Crea (o usa la ya creada) una hoja con estas pestañas. La fila 1 lleva exactamente estos encabezados:

| Pestaña | Columnas |
| --- | --- |
| Solicitudes | `id` `fecha` `nombre` `correo` `programa` `telefono` `estado` `actualizado` `aviso` |
| Historial | `fecha` `solicitud_id` `campo` `antes` `despues` `quien` |
| Administradores | `usuario` `nombre` `salt` `hash` `activo` |
| Sesiones | `token_hash` `usuario` `nombre` `expira` |

La hoja contiene datos personales y los hashes del panel: **no la compartas por enlace público**.

## Configuración (una vez)

1. **Credencial de Google Sheets en n8n.** Ve a *Credentials → New → Google Sheets OAuth2 API* y conecta la cuenta dueña de la hoja.
2. **Importar.** Importa los dos JSON (*Workflows → Import from File*). En la instancia de prueba ya existen como «AI Academy · 1 …» y «AI Academy · 2 …»; en ese caso basta con abrirlos.
3. **Configurar los nodos de Google Sheets.** En cada uno, elige la credencial del paso 1. Si importaste los JSON, cambia también `REEMPLAZAR_CON_ID_DE_LA_HOJA` por el ID de la hoja (la parte de la URL entre `/d/` y `/edit`).
4. **Telegram, solo con un chat privado de prueba.**
   - Crea un bot con @BotFather y guarda su token **solo** como credencial *Telegram API* de n8n.
   - Escribe al bot desde la cuenta de prueba y obtén el chat ID (por ejemplo, con `https://api.telegram.org/bot<TOKEN>/getUpdates` en tu navegador; no lo pegues en ningún archivo).
   - En el nodo «Avisar al chat de prueba», elige la credencial y reemplaza `REEMPLAZAR_CON_CHAT_ID_DE_PRUEBA`.
5. **Orígenes permitidos.** Los dos webhooks aceptan `http://localhost:5173` (dev) y `http://localhost:4173` (preview). Si publicas el sitio, añade su dominio en *Webhook → Options → Allowed Origins (CORS)*.
6. **Publicar.** Activa ambos flujos. Las URL de producción quedan en `…/webhook/aia-solicitud` y `…/webhook/aia-panel`.
7. **Configurar el landing.** Copia `.env.example` a `.env.local` y completa `VITE_N8N_URL=https://<tu-instancia>/webhook`. Reinicia `npm run dev`.
8. **Crear la cuenta de prueba del panel:**

   ```bash
   node tools/crear-admin.mjs --usuario admin.demo --nombre "Admin Demo"
   ```

   El script imprime una fila separada por tabuladores. Pégala en la pestaña **Administradores**. También muestra una contraseña generada, una sola vez: guárdala en tu gestor de contraseñas. Para usar una contraseña propia, defínela antes en la variable `ADMIN_PASSWORD` (12 o más caracteres). La hoja solo guarda `sha256(salt + contraseña)`.

## Demostración de principio a fin (datos ficticios)

Usa `npm run dev` y abre `http://localhost:5173`.

1. **Formulario inválido.** En «Solicitar información», envía el formulario vacío y después con el correo `ana@prueba`.
   - Esperado: aparecen errores junto a cada campo y un resumen arriba.
   - En la pestaña *Network* no hay petición. En la hoja no aparece ninguna fila y en Telegram no llega ningún aviso.
   - Para probar la validación del servidor, envía datos inválidos directamente:

     ```bash
     curl -i -X POST "$VITE_N8N_URL/aia-solicitud" -H "Content-Type: application/json" -d '{"name":"","email":"x","program":"master"}'
     ```

     Esperado: `422`, sin fila nueva y sin aviso.
2. **Solicitud válida.** Envía *Nombre:* `Ana Prueba`, *Correo:* `ana.prueba@ejemplo.test`, *Programa:* `Liftoff` y *Teléfono:* `+57 300 000 0000`.
   - Esperado: se ve «Enviando…» y luego la confirmación. El código `S-AAAAMMDD-XXXXX` no se muestra al visitante: llega en el aviso y aparece en el panel.
3. **Aviso en Telegram.** En el chat de prueba llega el aviso con el código, el nombre, el correo, el programa y el teléfono.
4. **Panel.** Abre `http://localhost:5173/admin.html` e inicia sesión con `admin.demo`.
   - Esperado: la solicitud aparece arriba con el estado `Nuevo` y el aviso `enviado`.
   - Puedes buscarla por su código.
5. **Cambio de estado y nota.** Abre la solicitud, cambia el estado a `Contactado` y escribe la nota «Llamada de prueba: pide el horario de Liftoff». Después pulsa Guardar.
   - Esperado: el historial muestra la creación, el cambio de estado (Nuevo → Contactado) y la nota, cada uno con la fecha y «Admin Demo».
6. **Comprobar que se guardó.** Recarga la página, o cierra sesión y vuelve a entrar, y abre la misma solicitud.
   - Esperado: siguen el estado, la nota y el historial.
   - En la hoja puedes ver las filas correspondientes en **Solicitudes** e **Historial**.
7. **Acceso sin sesión.** Con la sesión cerrada, envía una petición sin token:

   ```bash
   curl -i -X POST "$VITE_N8N_URL/aia-panel" -H "Content-Type: application/json" -d '{"accion":"listar"}'
   ```

   Esperado: `401` y ningún dato.

## Seguridad y límites conocidos

- El frontend no contiene secretos. `VITE_N8N_URL` es la URL pública de los webhooks: el formulario es público por diseño y el panel exige sesión.
- **Sesiones.**
  - El token es aleatorio (256 bits) y caduca a las 8 horas.
  - En **Sesiones** solo se guarda su hash.
  - El navegador lo guarda en `sessionStorage`, así que se pierde al cerrar la pestaña.
  - «Cerrar sesión» lo invalida en la hoja.
- **Ejecuciones.** El flujo del panel no guarda ejecuciones en n8n (`saveDataSuccessExecution: none`), porque su entrada lleva contraseñas y tokens.
- **Límites conocidos** (adecuados para una demo, a reforzar en producción):
  - La contraseña usa SHA-256 con sal, no un hash lento como bcrypt o argon2.
  - No hay límite de intentos de inicio de sesión.
  - No hay roles: cualquier cuenta activa ve todas las solicitudes.
  - Google Sheets no ofrece transacciones. Si el cambio de estado se guarda pero el historial falla, el panel lo avisa explícitamente en vez de darlo por bueno.
- **Desactivar una cuenta.** Pon `no` en la columna `activo` de **Administradores**.
