# Campuslands AI Academy

Landing de una página para presentar la formación en IA aplicada de Campuslands AI Academy. La experiencia usa una narrativa espacial, conserva las cinco misiones y enlaza a los canales actuales de inscripción y contacto.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Vite muestra la dirección local en la terminal.

## Compilar y previsualizar

```bash
npm run build
npm run preview
```

La compilación estática queda en `dist/` y puede publicarse en un servicio compatible con sitios estáticos, como Vercel, Netlify o GitHub Pages.

## Estructura

- `src/data/`: textos, enlaces, planes, herramientas y preguntas frecuentes.
- `src/templates/`: HTML semántico de las secciones.
- `src/modules/`: navegación, animaciones, recomendador y constelación interactiva.
- `src/styles/`: tokens de marca y estilos por sección.
- `src/lib/`: reglas del formulario (`lead.js`) y cliente de los webhooks de n8n (`n8n.js`).
- `src/admin/` y `admin.html`: panel protegido de solicitudes.
- `n8n/`: flujos exportados de n8n, su generador y la guía de configuración.
- `tools/crear-admin.mjs`: genera la fila de una cuenta del panel.
- `public/logo/` y `public/fonts/`: activos locales del logo y Poppins.

## Solicitudes de información y panel

El formulario «Solicitar información» y el panel (`/admin.html`) no tienen backend propio. Funcionan con n8n, que guarda los registros en Google Sheets y avisa a un chat privado de prueba de Telegram. Para que funcionen hay que:

- Configurar las credenciales de Google y Telegram en n8n.
- Publicar los flujos.
- Definir `VITE_N8N_URL` en `.env.local`.

Sin esa configuración, el formulario muestra un error y no simula un envío. La configuración, la demostración paso a paso y los límites de seguridad están en [`n8n/README.md`](n8n/README.md).

## Marca y accesibilidad

La interfaz usa Poppins y la paleta del manual de marca. Las animaciones respetan `prefers-reduced-motion`; la navegación y las interacciones principales tienen soporte de teclado y controles táctiles.

## Enlaces pendientes de confirmar

La landing publicada deja Política de privacidad y Términos apuntando a `#`, sin páginas de destino. La landing conserva sus nombres como texto hasta contar con las URL oficiales. No se crearon destinos legales ficticios.
