/* Code Studio — Works database
   Centralised data: id is the URL key (work.html?id=<id>).
   Each entry is fully self-contained — gallery, slideshow and detail
   pages all read from here.

   To add a new work, append an object with: id, type, client, category,
   year, location, video, tagline, description (array of paragraphs),
   credits (object), stats (array of {k,v}). */

window.WORKS = [
  /* 1 ─────────────────────────────────────────────── */
  {
    id: 'fiesta-cerveza-26',
    type: 'AFTERMOVIE',
    client: 'FIESTA DE LA CERVEZA',
    category: 'Shows & Fiestas',
    year: 2026,
    location: 'Paysandú, Uruguay',
    video: 'assets/video/logoanimation.mp4',
    cover: '',
    tagline: 'Cuatro días, una ciudad entera bailando.',
    description: [
      'La Fiesta de la Cerveza es la cita popular más grande del litoral uruguayo y este año la documentamos desde adentro: backstage de bandas, foso de cámara durante los headliners y los rituales más íntimos de los productores de la fiesta.',
      'El aftermovie alterna ritmo frenético con respiros más reposados, dejando entrar las pequeñas escenas que un evento de este tamaño suele dejar afuera: el armado del escenario al amanecer, los abrazos entre artistas, las miradas del público en el último tema de la noche.',
      'Una pieza pensada tanto para las redes de la marca como para uso institucional el resto del año.'
    ],
    credits: {
      'Dirección': 'Valentí Prieto',
      'Producción ejecutiva': 'Franco Lorenzi',
      'Dirección de fotografía': 'Santiago Mondo',
      'Cámaras': 'Code Studio (6 operadores)',
      'Edición': 'Mateo Rodríguez Murias',
      'Color & post': 'Code Studio',
      'Música': 'Provista por la organización'
    },
    stats: [
      { k: 'Días de rodaje', v: '4' },
      { k: 'Asistentes',     v: '80K+' },
      { k: 'Cámaras',        v: '6' }
    ]
  },

  /* 2 ─────────────────────────────────────────────── */
  {
    id: 'antel-fibra',
    type: 'COMERCIAL',
    client: 'ANTEL FIBRA',
    category: 'Marcas',
    year: 2026,
    location: 'Montevideo, Uruguay',
    video: 'assets/video/trabajos/2026-05-15_23h11_32.mp4',
    cover: '',
    tagline: 'Conectar como un acto cotidiano, no como una promesa.',
    description: [
      'Pieza publicitaria de 60" para la nueva campaña de Antel Fibra. El brief pedía hablar de velocidad pero el desafío era no caer en clichés tecnológicos: nada de partículas, ni rayos de luz, ni planos de fibra óptica.',
      'Optamos por construir una narrativa coral: tres familias, tres edades, tres formas distintas de usar internet en el mismo momento. La pieza sostiene un único plano-secuencia simulado que conecta los tres mundos a través de una transición invisible por luz.',
      'Versionada en 60", 30" y 15" para redes, con un cutdown vertical para TikTok e Instagram Reels.'
    ],
    credits: {
      'Dirección': 'Franco Lorenzi',
      'Productor': 'Code Studio',
      'Director de Fotografía': 'Valentí Prieto',
      'Gaffer': 'Externo — Luz Estudio',
      'Edición': 'Santiago Mondo',
      'Color': 'Mateo Rodríguez Murias',
      'Sonido': 'Externo — Tres Audio'
    },
    stats: [
      { k: 'Duración', v: '60"' },
      { k: 'Versiones', v: '4' },
      { k: 'Formato',  v: '4K HDR' }
    ]
  },

  /* 3 ─────────────────────────────────────────────── */
  {
    id: 'ntvg',
    type: 'VIDEOCLIP',
    client: 'NO TE VA A GUSTAR',
    category: 'Shows & Fiestas',
    year: 2026,
    location: 'Montevideo, Uruguay',
    video: 'assets/video/trabajos/2026-05-15_23h12_29.mp4',
    cover: '',
    tagline: 'Un videoclip que es, en realidad, un cortometraje.',
    description: [
      'Videoclip oficial para "Cielo de un solo amor", primer corte del próximo álbum de NTVG. La banda pidió expresamente alejarse del videoclip de banda en vivo y armar algo más cinematográfico.',
      'Trabajamos con dos actores no profesionales, todo en exterior nocturno y un solo lente fijo durante el 80% del clip. La banda aparece apenas dos veces, casi como una presencia espiritual de fondo.',
      'Estreno simultáneo en YouTube y MTV Latam el pasado marzo.'
    ],
    credits: {
      'Dirección': 'Santiago Mondo',
      'Guion': 'Santiago Mondo & NTVG',
      'Producción': 'Code Studio',
      'DF': 'Valentí Prieto',
      'Asistente de cámara': 'Franco Lorenzi',
      'Edición & color': 'Mateo Rodríguez Murias',
      'Vestuario': 'Externo'
    },
    stats: [
      { k: 'Duración', v: '4\'12"' },
      { k: 'Locaciones', v: '5' },
      { k: 'Plays YouTube', v: '410K' }
    ]
  },

  /* 4 ─────────────────────────────────────────────── */
  {
    id: 'punta-del-este',
    type: 'DOCUMENTAL',
    client: 'INTENDENCIA DE MALDONADO',
    category: 'Eventos',
    year: 2026,
    location: 'Punta del Este, Uruguay',
    video: 'assets/video/trabajos/2026-05-15_23h13_02.mp4',
    cover: '',
    tagline: 'La postal cuando se van los turistas.',
    description: [
      'Documental corto comisionado por la Intendencia de Maldonado para mostrar Punta del Este fuera de temporada. La idea era romper el imaginario de "balneario de verano" y mostrar la vida de los locales que viven todo el año en el lugar.',
      'Rodaje durante 7 días en julio. Entrevistas a 14 vecinos: pescadores, una bibliotecaria, un guardavida fuera de temporada, dueños de almacenes de barrio, una pareja de jubilados que llegaron desde Argentina hace 30 años.',
      'Pieza con un montaje pausado, con bastante texto en pantalla pensado para sala de cine institucional.'
    ],
    credits: {
      'Dirección': 'Mateo Rodríguez Murias',
      'Entrevistas': 'Mateo Rodríguez Murias',
      'Cámara': 'Santiago Mondo',
      'Sonido directo': 'Franco Lorenzi',
      'Edición': 'Valentí Prieto',
      'Música original': 'Joaquín Mello'
    },
    stats: [
      { k: 'Duración',     v: '12\'' },
      { k: 'Entrevistas',  v: '14' },
      { k: 'Días',         v: '7' }
    ]
  },

  /* 5 ─────────────────────────────────────────────── */
  {
    id: 'vans-harlem',
    type: 'EVENTO',
    client: 'VANS × HARLEM',
    category: 'Marcas',
    year: 2025,
    location: 'Montevideo, Uruguay',
    video: 'assets/video/logoanimation.mp4',
    cover: '',
    tagline: 'Skate, música y barrio en un mismo plano.',
    description: [
      'Cobertura del evento Vans × Harlem, una colaboración entre la marca de skate y la tienda local Harlem. El evento tenía tres bloques —skate park, set DJ y after— y cada bloque pedía un lenguaje visual distinto.',
      'Resolvimos con tres equipos de cámara en paralelo: GoPro para el skate, drone y handheld para la música, y solo cámaras de mano grabando en 24fps para el after. La pieza final unifica todo con grading.',
      'Se entregaron 6 versiones: una larga para el cliente, una de 90" para web y cuatro cortes de 15" para reels.'
    ],
    credits: {
      'Dirección': 'Franco Lorenzi',
      'Producción': 'Code Studio',
      'Cámara A': 'Valentí Prieto',
      'Cámara B': 'Santiago Mondo',
      'GoPro / skate': 'Mateo Rodríguez Murias',
      'Drone': 'Externo — UAV.uy',
      'Edición': 'Franco Lorenzi'
    },
    stats: [
      { k: 'Versiones', v: '6' },
      { k: 'Asistentes', v: '2.5K' },
      { k: 'Cámaras',  v: '4' }
    ]
  },

  /* 6 ─────────────────────────────────────────────── */
  {
    id: 'fito-paez',
    type: 'GIRA',
    client: 'FITO PÁEZ',
    category: 'Shows & Fiestas',
    year: 2025,
    location: 'Uruguay & Argentina',
    video: 'assets/video/trabajos/2026-05-15_23h11_32.mp4',
    cover: '',
    tagline: 'Seguir a una leyenda durante nueve fechas.',
    description: [
      'Acompañamos a Fito Páez durante 9 fechas en Uruguay y Argentina para producir el documental oficial de la gira "El amor 30 años después". El acceso fue total: backstage, ensayos, viaje, hotel, conciertos completos.',
      'A diferencia del clásico "behind the scenes" de gira, pedimos —y obtuvimos— ralentizar el tono: planos largos, mucho silencio, pocos cortes. La idea era que se sintiera más como un retrato que como un making-of.',
      'Entregable final: un largo de 78 minutos + 8 cápsulas cortas para redes.'
    ],
    credits: {
      'Dirección': 'Valentí Prieto',
      'Producción ejecutiva': 'Code Studio',
      'DF': 'Santiago Mondo',
      'Operadores': 'Franco Lorenzi, Mateo Rodríguez Murias',
      'Edición': 'Mateo Rodríguez Murias',
      'Sonido directo': 'Externo — equipo argentino',
      'Color': 'Code Studio'
    },
    stats: [
      { k: 'Fechas',   v: '9' },
      { k: 'Países',   v: '2' },
      { k: 'Material', v: '40h+' }
    ]
  },

  /* 7 ─────────────────────────────────────────────── */
  {
    id: 'cro',
    type: 'AFTERMOVIE',
    client: 'NTVG FILARMÓNICO',
    category: 'Shows & Fiestas',
    year: 2025,
    location: 'Teatro de Verano, Montevideo',
    video: 'assets/video/trabajos/2026-05-15_23h12_29.mp4',
    cover: '',
    tagline: 'Cuando una banda de rock toca con orquesta.',
    description: [
      'Show especial donde No Te Va a Gustar tocó dos noches con la Orquesta Filarmónica de Montevideo en el Teatro de Verano. Documentamos los ensayos previos —cuatro días de trabajo entre los arregladores y los músicos— y las dos funciones en vivo.',
      'Fue uno de los proyectos técnicamente más complejos del año: 7 cámaras en simultáneo, 38 músicos en escena, sonido tomado directo del consorcio. Editamos los dos shows en una sola pieza maestra de 11 minutos.',
      'La pieza se estrenó en streaming exclusivo el mes pasado.'
    ],
    credits: {
      'Dirección': 'Santiago Mondo',
      'Productor': 'Franco Lorenzi',
      'Switch / multicam': 'Externo — Stream.uy',
      'Operadores cámara': 'Code Studio + 4 freelancers',
      'Edición & color': 'Mateo Rodríguez Murias',
      'Mezcla audio': 'Externo'
    },
    stats: [
      { k: 'Cámaras', v: '7' },
      { k: 'Músicos', v: '38' },
      { k: 'Shows',   v: '2' }
    ]
  },

  /* 8 ─────────────────────────────────────────────── */
  {
    id: 'no-sleep-club',
    type: 'EVENTO',
    client: 'NO SLEEP CLUB',
    category: 'Eventos',
    year: 2024,
    location: 'Galpón W, Montevideo',
    video: 'assets/video/trabajos/2026-05-15_23h13_02.mp4',
    cover: '',
    tagline: 'La noche que no termina hasta que sale el sol.',
    description: [
      'Aftermovie de la 12ª edición de No Sleep Club, fiesta electrónica recurrente en un galpón industrial al sur de Montevideo. La consigna del cliente fue simple: "capten la energía, eviten los lugares comunes del género".',
      'Lo resolvimos apostando por planos de detalle (manos, gestos, transpiración, luces sobre rostros) en lugar del clásico plano general de pista llena. El montaje sigue el arco de la noche: del primer set hasta el cierre con luz natural entrando por las claraboyas.',
      'Pieza usada para promocionar la edición siguiente y para la propuesta de la marca a sponsors internacionales.'
    ],
    credits: {
      'Dirección': 'Franco Lorenzi',
      'DF': 'Valentí Prieto',
      'Edición': 'Santiago Mondo',
      'Color': 'Mateo Rodríguez Murias',
      'Música': 'Sets originales — DJ Tula, DJ Pez'
    },
    stats: [
      { k: 'Duración',   v: '2\'30"' },
      { k: 'Asistentes', v: '1.2K' },
      { k: 'Sets',       v: '8' }
    ]
  }
];

/* Helper: lookup work by id */
window.getWork = function(id){
  if (!id) return null;
  return window.WORKS.find(w => w.id === id) || null;
};
