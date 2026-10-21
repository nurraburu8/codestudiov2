/**
 * Mapeo del Drive del cliente ("WEB CODE") → trabajos del sitio.
 * Lo consume scripts/upload-drive.mjs.
 *
 * Por trabajo (clave = slug del .md en src/content/trabajos/):
 *   main:   video principal de la ficha (escribe `cloudinaryId`)
 *   videos: videos extra → `gallery` (string o { file, caption, publicId })
 *   photos: fotos → `gallery`
 * `publicId` fuerza un id existente en Cloudinary (videos ya subidos antes
 * desde source-videos/, para no duplicarlos).
 *
 * No incluidos a propósito:
 *   - "Fotos de equipo/": no es un proyecto (son fotos para Nosotros).
 *   - "PROYECTOS PRINCIPALES INICIO/": define qué va en el home; sus videos
 *     largos ya están en las carpetas de cada proyecto y los intro-*.mp4 son
 *     los clips del hero (se procesan con gen:clips, no van a Cloudinary).
 */
export const DRIVE_DIR = 'fotos_videos/drive';

const range = (dir, files) => files.map((f) => `${dir}/${f}`);

export const MANIFEST = {
  'antel-summit': {
    main: 'Proyecto Antel Summit/resumen-SUMMIT-16-9_final.mp4',
    videos: [
      { file: 'Proyecto Antel Summit/Historias en vivo/Historia_Hernan_Casciari.mp4', caption: 'Hernán Casciari' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Roberto Musso.mp4', caption: 'Roberto Musso' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Irene Solaiman.mp4', caption: 'Irene Solaiman' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Helena Rovner_1.mp4', caption: 'Helena Rovner' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Laura Maccio_1.mp4', caption: 'Laura Maccio' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Paco Martin.mp4', caption: 'Paco Martín' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Networking.mp4', caption: 'Networking' },
      { file: 'Proyecto Antel Summit/Historias en vivo/Reel Stands 0.mp4', caption: 'Stands' },
      { file: 'Proyecto Antel Summit/Historias en vivo/01.mp4', caption: 'Historia en vivo' },
    ],
    photos: range('Proyecto Antel Summit/Fotografía Summit', [
      '@Codestudio-0040.jpg', '@Codestudio-0191.jpg', '@Codestudio-0265.jpg',
      '@Codestudio-0366.jpg', '@Codestudio-0548.jpg', '@Codestudio-0657.jpg',
      '@Codestudio-0985.jpg', '@Codestudio-1005.jpg', '@Codestudio-1027.jpg',
      '@codestudio-3.jpg', '@Codestudio-4675.jpg', '@codestudio-5.jpg',
      '@codestudio-6.jpg', '@codestudio.jpg', '@codestudio.uy-2.jpg',
    ]),
  },

  cif: {
    main: 'Proyecto CIF/Copia de Mi hogar mi templo v2.mp4',
    videos: [
      { file: 'Proyecto CIF/Copia de Clean Tok v3.mp4', caption: 'Clean Tok' },
      { file: 'Proyecto CIF/Copia de NARRATORv2.mp4', caption: 'Narrator' },
      { file: 'Proyecto CIF/Copia de 05 SQED.mp4', caption: 'SQED' },
    ],
  },

  'copa-rdlp-2026': {
    main: 'Proyecto Copa ToYota/AftermovieCopaRdlP26.mp4',
    mainPublicId: 'codestudio/aftermoviecopardlp26',
    videos: [
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel 01 - Toyota2.mp4', caption: 'Reel en vivo · Toyota' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel 02 - Presentación.mp4', caption: 'Reel en vivo · Presentación' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel 03 - Entrevista.mp4', caption: 'Reel en vivo · Entrevista' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel Toyota3.mp4', caption: 'Reel en vivo · Toyota' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel Monster 01.mp4', caption: 'Reel en vivo · Monster' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel Monster 2.mp4', caption: 'Reel en vivo · Monster' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel Vans 1.mp4', caption: 'Reel en vivo · Vans' },
      { file: 'Proyecto Copa ToYota/REELS EN VIVO/Reel Vans2.mp4', caption: 'Reel en vivo · Vans' },
    ],
    photos: range('Proyecto Copa ToYota/FOTOS', [
      '086A4836.jpg', '086A5011.jpg', '086A5092.jpg', '086A5459.jpg', '086A5918.jpg',
      '086A5934.jpg', '7IV01483.jpg', '7IV02229.jpg', '7IV03490.jpg', '7IV03568.jpg',
      '7IV03600.jpg', '@codestudio.uy-@lecorchphoto-36.jpg',
      '@codestudio.uy-@lecorchphoto-44.jpg', '@codestudio.uy-@lecorchphoto-48.jpg',
      'IMG_3746.JPG',
    ]),
  },

  foton: {
    main: 'Proyecto FOTON/Homero-FOTON.mp4',
  },

  vans: {
    main: 'Proyecto Paulo VANS/VLOG PAULO X VANS_2.mp4',
    videos: [
      { file: 'Proyecto Paulo VANS/backstage vans x paulo_2.mp4', caption: 'Backstage' },
      { file: 'Proyecto Paulo VANS/Knu-Vans-camp1_qt.mp4', caption: 'Campaña · 1' },
      { file: 'Proyecto Paulo VANS/Vans-camp2.mp4', caption: 'Campaña · 2' },
      { file: 'Proyecto Paulo VANS/CAPSULAS CAMUFLADO 2.mp4', caption: 'Cápsula Camuflado · 1' },
      { file: 'Proyecto Paulo VANS/CAPSULAS CAMUFLADO_2.mp4', caption: 'Cápsula Camuflado · 2' },
    ],
  },

  'vans-x-harlem-2025': {
    main: 'Proyecto Vans Harlem/VANS X HARLEM v2.mp4',
    mainPublicId: 'codestudio/vans-x-harlem-v2',
    photos: range('Proyecto Vans Harlem/Fotografia Harlem', [
      '086A0244.JPEG', '1O9A1196.JPEG', '1O9A6890.jpg', '1O9A7195.jpg', '1O9A7380.jpg',
      '1O9A7475.jpg', '1O9A7593.jpg', '1O9A7636.jpg', '1O9A7680.jpg', '1O9A7753.jpg',
      '1O9A7953.jpg', '1O9A9024.jpg',
    ]),
  },

  'gira-fito-paez': {
    main: 'Proyectos con Fito Paez/Fito - Estadio Uno La Plata.mp4',
    mainPublicId: 'codestudio/fito-estadio-uno-la-plata',
    videos: [
      { file: 'Proyectos con Fito Paez/Fito Movistar Noviembre A .mp4', caption: 'Movistar Arena · Noviembre' },
      { file: 'Proyectos con Fito Paez/Fito Movistar Diciembre.mp4', caption: 'Movistar Arena · Diciembre' },
      { file: 'Proyectos con Fito Paez/Fito Uruguay.MP4', caption: 'Uruguay' },
    ],
  },

  'canelones-suena-bien-26': {
    main: 'ProyectoS CSB/CSB 2026 - V5.mp4',
    mainPublicId: 'codestudio/csb-2026-v5',
  },

  'canelones-suena-bien-2025': {
    main: 'ProyectoS CSB/Suena Bien 2025.mp4',
  },

  'no-sleep-club': {
    main: 'Proyectos No Sleep/Aftermovie Sara Landry v2.mp4',
    videos: [
      { file: 'Proyectos No Sleep/Aftermovie Danny Avila', caption: 'Danny Ávila' },
      { file: 'Proyectos No Sleep/Aftermovie Nico Moreno.mp4', caption: 'Nico Moreno' },
      { file: 'Proyectos No Sleep/AFTERMOVIE-DEBORAH.mp4', caption: 'Deborah' },
      { file: 'Proyectos No Sleep/aftermvoie_space.mp4', caption: 'Space 92' },
    ],
  },

  'la-planta': {
    main: 'Proyectos TLP/The la Planta V2.mp4',
    videos: [{ file: 'Proyectos TLP/planta colonial 2.mp4', caption: 'La Planta Colonial' }],
    photos: range('Proyectos TLP/FOTOS', [
      '023A3451.jpg', '023A3527.jpg', '023A8103.jpg', '023A8479.jpg', '023A8784.jpg',
      '086A9533-2.jpg', '086A9584.jpg', '086A9731.jpg',
    ]),
  },

  // Fiesta de la Cerveza y La Bajada: los videos del Drive ya estaban subidos
  // (fdlc-2025-16-9, fdlc-2026-after, aftermovie-la-bajada-5).
};
