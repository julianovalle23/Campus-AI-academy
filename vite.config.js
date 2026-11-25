import { defineConfig } from 'vite';

/**
 * Renderiza las secciones a HTML estático en dev y en build.
 * index.html tiene marcadores <!--@section:nombre--> que se reemplazan con
 * las plantillas de src/templates/sections.js (que leen src/data).
 * Así el contenido vive separado de la lógica y la página no depende de JS
 * para mostrarse (mejor LCP y accesibilidad).
 */
function staticSections() {
  return {
    name: 'static-sections',
    async transformIndexHtml(html, ctx) {
      // En dev, recarga las plantillas en cada petición para ver cambios.
      const url = new URL('./src/templates/sections.js', import.meta.url).href;
      const { sections } = ctx.server
        ? await ctx.server.ssrLoadModule('/src/templates/sections.js')
        : await import(url);
      return html.replace(/<!--@section:(\w+)-->/g, (_, name) => {
        if (!sections[name]) throw new Error(`Sección desconocida: ${name}`);
        return sections[name]();
      });
    },
  };
}

export default defineConfig({
  // Rutas relativas: dist/ se puede abrir con Live Server o desde cualquier subcarpeta.
  base: './',
  plugins: [staticSections()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      input: { main: 'index.html', admin: 'admin.html' },
    },
  },
});
