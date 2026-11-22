// Max, el astronauta de Campuslands AI Academy (manual de marca, cap. 07 · Mascota).
// Fuente: láminas «Poses de uso» (APROBADO) del manual v1.0, recortadas sin
// modificar proporciones, colores, bandera, logo de la mochila ni expresión.
// Archivos en public/max/ (AVIF + WebP en varios anchos).
//
// Reglas del manual que aplicamos:
// - Max acompaña (guía recursos y respuestas a preguntas frecuentes); no reemplaza a personas reales.
// - Siempre sobre fondo negro con halo violeta.
// - Solo poses y expresiones aprobadas; nada de texto en el visor ni poses nuevas.

export const max = {
  presentando: {
    // «Presentando»: para portadas y para invitar a empezar.
    alt: 'Max, el astronauta de Campuslands AI Academy, te presenta el recomendador',
    width: 522,
    height: 762,
    widths: [240, 360, 522],
  },
  aprobando: {
    // «Aprobando»: para respuestas correctas → resultado del recomendador.
    alt: 'Max aprueba tu misión con el pulgar arriba',
    width: 407,
    height: 763,
    widths: [160, 240, 407],
  },
  explicando: {
    // «Explicando»: para tutoriales y dudas → preguntas frecuentes.
    alt: 'Max, el astronauta de AI Academy, explicando con su portátil',
    width: 436,
    height: 762,
    widths: [180, 280, 436],
  },
};
