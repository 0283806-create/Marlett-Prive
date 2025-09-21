// Filtro de contenido inapropiado para eventos y formularios
// Incluye palabras ofensivas, contenido sexual, drogas, violencia, etc.

const inappropriateWords = [
  // Palabras ofensivas generales
  'puto', 'puta', 'pendejo', 'pendeja', 'cabrón', 'cabrona', 'hijo de puta',
  'hija de puta', 'joder', 'coño', 'cojones', 'gilipollas', 'imbécil',
  'estúpido', 'estúpida', 'idiota', 'retrasado', 'retrasada', 'maricón',
  'marica', 'bollera', 'tortillera', 'perra', 'zorra', 'golfa',
  
  // Contenido sexual explícito
  'sexo', 'porno', 'pornografía', 'prostituta', 'prostituto', 'escort',
  'stripper', 'striptease', 'orgía', 'gang bang', 'bukkake', 'fetiche',
  'bdsm', 'sadomasoquismo', 'masturbación', 'masturbarse', 'correrse',
  'eyacular', 'penetrar', 'follar', 'coger', 'tirar', 'culear',
  
  // Drogas y sustancias
  'cocaína', 'heroína', 'marihuana', 'cannabis', 'éxtasis', 'lsd',
  'anfetaminas', 'metanfetamina', 'crack', 'opio', 'morfina', 'fentanilo',
  'droga', 'drogas', 'narcótico', 'narcóticos', 'dealer', 'traficante',
  'trapicheo', 'porro', 'churro', 'maría', 'hierba', 'mota',
  
  // Violencia y contenido peligroso
  'matar', 'asesinar', 'homicidio', 'suicidio', 'suicidarse', 'violación',
  'violar', 'abusar', 'maltrato', 'tortura', 'torturar', 'secuestro',
  'secuestrar', 'bomba', 'explosivo', 'terrorismo', 'terrorista',
  'arma', 'pistola', 'rifle', 'escopeta', 'cuchillo', 'navaja',
  
  // Contenido discriminatorio
  'nazi', 'fascista', 'racista', 'xenófobo', 'homófobo', 'transfóbico',
  'supremacista', 'ku klux klan', 'kkk', 'hitler', 'holocausto',
  
  // Actividades ilegales
  'lavado de dinero', 'blanqueo', 'evasión fiscal', 'soborno', 'corrupción',
  'extorsión', 'chantaje', 'fraude', 'estafa', 'robo', 'hurto',
  'piratería', 'falsificación', 'contrabando', 'trata de personas',
  
  // Contenido religioso ofensivo o extremista
  'blasfemia', 'herejía', 'satanismo', 'ritual satánico', 'secta',
  'culto', 'extremismo religioso', 'fundamentalismo',
  
  // Eventos claramente inapropiados para un restaurante
  'funeral', 'velorio', 'sepelio', 'entierro', 'cremación', 'autopsia',
  'morgue', 'cementerio', 'cadáver', 'muerto', 'difunto',
  'rito satánico', 'sesión espiritista', 'ouija', 'exorcismo',
  
  // Palabras que podrían indicar eventos problemáticos
  'pelea', 'riña', 'bronca', 'conflicto', 'venganza', 'revancha',
  'ajuste de cuentas', 'duelo', 'desafío', 'confrontación',
  
  // Contenido político extremo
  'golpe de estado', 'revolución armada', 'insurrección', 'sedición',
  'traición', 'conspiración', 'subversión'
];

const inappropriatePatterns = [
  // Patrones de texto problemático
  /\b(fuck|shit|damn|hell|bitch|asshole|bastard)\b/i,
  /\b(drug\s+deal|sell\s+drugs|buy\s+drugs)\b/i,
  /\b(kill\s+someone|murder\s+plan|assassination)\b/i,
  /\b(sex\s+party|orgy|gang\s+bang)\b/i,
  /\b(nazi\s+party|white\s+power|heil\s+hitler)\b/i,
  /\b(suicide\s+pact|mass\s+suicide)\b/i,
  /\b(money\s+laundering|tax\s+evasion)\b/i,
  
  // Patrones de repetición de caracteres (spam)
  /(.)\1{4,}/i, // 5 o más caracteres repetidos
  
  // Patrones de texto sin sentido
  /^[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{5,}$/i, // Solo símbolos/números
  /^\s*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+\s*$/i // Solo símbolos
];

export function containsInappropriateContent(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const normalizedText = text.toLowerCase().trim();
  
  // Verificar palabras prohibidas
  for (const word of inappropriateWords) {
    if (normalizedText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  // Verificar patrones problemáticos
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(normalizedText)) {
      return true;
    }
  }
  
  return false;
}

export function isValidEventType(eventType: string): boolean {
  if (!eventType || typeof eventType !== 'string') return false;
  
  const trimmed = eventType.trim();
  
  // Verificar longitud mínima y máxima
  if (trimmed.length < 3 || trimmed.length > 50) return false;
  
  // Verificar contenido inapropiado
  if (containsInappropriateContent(trimmed)) return false;
  
  // Verificar que contenga al menos algunas letras
  if (!/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(trimmed)) return false;
  
  // Lista de tipos de eventos apropiados (palabras clave que SÍ son aceptables)
  const appropriateEventKeywords = [
    'boda', 'matrimonio', 'casamiento', 'wedding',
    'cumpleaños', 'birthday', 'aniversario', 'anniversary',
    'graduación', 'graduation', 'titulación',
    'quinceañera', 'quince años', 'sweet sixteen',
    'baby shower', 'despedida de soltera', 'despedida de soltero',
    'bautizo', 'comunión', 'confirmación', 'bar mitzvah', 'bat mitzvah',
    'corporativo', 'empresa', 'trabajo', 'business', 'corporate',
    'conferencia', 'seminario', 'workshop', 'capacitación', 'training',
    'presentación', 'lanzamiento', 'launch', 'networking',
    'cena', 'almuerzo', 'desayuno', 'brunch', 'dinner', 'lunch',
    'gala', 'premiación', 'reconocimiento', 'homenaje', 'tribute',
    'celebración', 'fiesta', 'party', 'celebration', 'festejo',
    'reunión', 'meeting', 'junta', 'encuentro', 'gathering',
    'navidad', 'año nuevo', 'christmas', 'new year', 'pascua',
    'día de la madre', 'día del padre', 'san valentín', 'valentine',
    'halloween', 'día de muertos', 'thanksgiving', 'acción de gracias',
    'inauguración', 'apertura', 'opening', 'clausura', 'closing',
    'exposición', 'exhibition', 'muestra', 'feria', 'fair',
    'concierto', 'concert', 'recital', 'show', 'espectáculo',
    'teatro', 'obra', 'performance', 'actuación',
    'deportivo', 'sports', 'competencia', 'torneo', 'championship',
    'charity', 'caridad', 'beneficencia', 'solidaridad', 'fundraising',
    'cultural', 'arte', 'art', 'literatura', 'poetry', 'poesía'
  ];
  
  // Si contiene palabras clave apropiadas, es más probable que sea válido
  const hasAppropriateKeywords = appropriateEventKeywords.some(keyword => 
    trimmed.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Si no tiene palabras clave apropiadas, ser más estricto
  if (!hasAppropriateKeywords) {
    // Verificar que no sea solo números o caracteres especiales
    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'.,]+$/.test(trimmed)) {
      return false;
    }
  }
  
  return true;
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Limpiar espacios extra y caracteres problemáticos
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-'.,]/g, '') // Solo caracteres permitidos
    .substring(0, 100); // Limitar longitud
}

export function getInappropriateContentMessage(text: string): string {
  if (containsInappropriateContent(text)) {
    return 'El contenido ingresado contiene palabras o frases inapropiadas. Por favor, utiliza un lenguaje respetuoso y apropiado para eventos familiares.';
  }
  
  if (!isValidEventType(text)) {
    return 'Por favor, ingresa un tipo de evento válido y apropiado para un restaurante familiar (ej: Cumpleaños, Boda, Evento Corporativo, Graduación, etc.).';
  }
  
  return '';
}