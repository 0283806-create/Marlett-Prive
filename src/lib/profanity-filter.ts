// Filtro de contenido inapropiado para eventos y formularios
// Incluye palabras ofensivas, contenido sexual, drogas, violencia, etc.

const inappropriateWords = [
  // Palabras ofensivas generales
  'puto', 'puta', 'pendejo', 'pendeja', 'cabrón', 'cabrona', 'hijo de puta',
  'hija de puta', 'joder', 'coño', 'cojones', 'gilipollas', 'imbécil',
  'estúpido', 'estúpida', 'idiota', 'retrasado', 'retrasada', 'maricón',
  'marica', 'bollera', 'tortillera', 'perra', 'zorra', 'golfa',
  
  // Contenido sexual explícito y anatómico
  'sexo', 'porno', 'pornografía', 'prostituta', 'prostituto', 'escort',
  'stripper', 'striptease', 'orgía', 'gang bang', 'bukkake', 'fetiche',
  'bdsm', 'sadomasoquismo', 'masturbación', 'masturbarse', 'correrse',
  'eyacular', 'penetrar', 'follar', 'coger', 'tirar', 'culear',
  'pene', 'penes', 'verga', 'vergas', 'polla', 'pollas', 'pito', 'pitos',
  'vagina', 'vaginas', 'concha', 'conchas', 'chocha', 'chochas', 'coño', 'coños',
  'tetas', 'teta', 'chichis', 'chichi', 'pechos', 'senos', 'nalgas', 'culo', 'culos',
  'trasero', 'pompis', 'ano', 'anos', 'ojete', 'ojetes', 'clítoris',
  'testículos', 'huevos', 'bolas', 'pelotas', 'escroto',
  'dick', 'cock', 'penis', 'pussy', 'vagina', 'tits', 'boobs', 'ass', 'butt',
  'anus', 'asshole', 'balls', 'testicles', 'scrotum', 'clitoris',
  'blowjob', 'handjob', 'footjob', 'titjob', 'anal', 'oral',
  'mamada', 'chupada', 'pete', 'oral', 'anal', 'sexo oral', 'sexo anal',
  
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
  
  // Contenido discriminatorio y racista (español)
  'nazi', 'fascista', 'racista', 'xenófobo', 'homófobo', 'transfóbico',
  'supremacista', 'ku klux klan', 'kkk', 'hitler', 'holocausto',
  'negro de mierda', 'pinche negro', 'indio', 'naco', 'nacos', 'prieto', 'prieta',
  'mayate', 'chinito', 'chino de mierda', 'judío', 'judía', 'moro', 'mora',
  'gitano', 'gitana', 'sudaca', 'sudacas', 'pocho', 'pocha', 'gringo',
  'gabacho', 'gabacha', 'güero pendejo', 'blanquito', 'blanquita',
  'indígena de mierda', 'oaxaco', 'oaxaca', 'chiapaneco', 'yucateco',
  'norteño', 'sureño', 'chilango', 'provinciano', 'pueblerino',
  'wetback', 'beaner', 'spic', 'taco bender', 'border hopper',
  
  // Contenido discriminatorio (inglés)
  'nigger', 'nigga', 'negro', 'coon', 'spook', 'jungle bunny',
  'cotton picker', 'porch monkey', 'uncle tom', 'house nigger',
  'chink', 'gook', 'slant eye', 'yellow', 'jap', 'nip', 'rice eater',
  'towelhead', 'sand nigger', 'camel jockey', 'terrorist', 'bomber',
  'kike', 'heeb', 'jew boy', 'christ killer', 'money grubber',
  'wetback', 'beaner', 'spic', 'taco bender', 'fence jumper',
  'cracker', 'honky', 'white trash', 'redneck', 'hillbilly',
  'faggot', 'fag', 'dyke', 'queer', 'homo', 'tranny', 'shemale',
  'retard', 'retarded', 'mongoloid', 'downs', 'autistic',
  
  // Supremacismo blanco
  'white power', 'white pride', 'aryan', 'master race', 'pure blood',
  'blood and soil', 'fourteen words', '14 words', 'heil hitler',
  'sieg heil', 'swastika', 'confederate', 'dixie', 'rebel flag',
  
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
  // Patrones de texto problemático en inglés
  /\b(fuck|shit|damn|hell|bitch|asshole|bastard|motherfucker|cocksucker)\b/i,
  /\b(drug\s+deal|sell\s+drugs|buy\s+drugs|drug\s+party)\b/i,
  /\b(kill\s+someone|murder\s+plan|assassination|mass\s+shooting)\b/i,
  /\b(sex\s+party|orgy|gang\s+bang|bukkake\s+party)\b/i,
  /\b(nazi\s+party|white\s+power|heil\s+hitler|white\s+supremacy)\b/i,
  /\b(suicide\s+pact|mass\s+suicide|kill\s+yourself)\b/i,
  /\b(money\s+laundering|tax\s+evasion|drug\s+trafficking)\b/i,
  
  // Patrones racistas específicos en español
  /\b(negro\s+de\s+mierda|pinche\s+negro|indio\s+pendejo)\b/i,
  /\b(chino\s+de\s+mierda|judío\s+avaro|moro\s+terrorista)\b/i,
  /\b(gitano\s+ladrón|sudaca\s+de\s+mierda|gringo\s+pendejo)\b/i,
  /\b(poder\s+blanco|raza\s+superior|sangre\s+pura)\b/i,
  /\b(muerte\s+a\s+los|exterminar\s+a|eliminar\s+a)\b/i,
  
  // Patrones racistas en inglés
  /\b(white\s+power|black\s+lives\s+don't\s+matter|all\s+lives\s+matter)\b/i,
  /\b(send\s+them\s+back|go\s+back\s+to|you\s+people)\b/i,
  /\b(master\s+race|pure\s+blood|racial\s+purity)\b/i,
  /\b(kill\s+all|death\s+to|exterminate)\b/i,
  /\b(lynch|lynching|hang\s+them|burn\s+them)\b/i,
  
  // Códigos y símbolos de odio
  /\b(1488|14\/88|88|hh|wp)\b/i,
  /\b(blood\s+and\s+honor|rahowa|zog)\b/i,
  
  // Patrones de repetición de caracteres (spam)
  /(.)\1{4,}/i, // 5 o más caracteres repetidos
  
  // Patrones de texto sin sentido
  /^[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{5,}$/i, // Solo símbolos/números
  /^\s*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+\s*$/i, // Solo símbolos
  
  // Patrones de evasión (números por letras)
  /n[1i!]gg[3e]r/i,
  /f[4a@]gg[0o]t/i,
  /[kc][1i!]k[3e]/i,
  /sp[1i!]c/i,
  /ch[1i!]nk/i,
  
  // Patrones de contenido sexual con evasiones
  /p[3e]n[3e]/i, // pene con números
  /v[3e]rg[4a]/i, // verga con números
  /p[0o]ll[4a]/i, // polla con números
  /[ck][0o]n[ck]h[4a]/i, // concha con variaciones
  /[ck][0o]ñ[0o]/i, // coño con números
  /t[3e]t[4a]s?/i, // tetas con números
  /[ck]ul[0o]/i, // culo con números
  /n[4a]lg[4a]s/i, // nalgas con números
  /d[1i!][ck]k/i, // dick con números
  /[ck][0o][ck]k/i, // cock con números
  /p[0o]rn[0o]/i, // porno con números
  /s[3e]x[0o]/i // sexo con números
];

export function containsInappropriateContent(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const normalizedText = text.toLowerCase().trim();
  
  // Normalizar texto para detectar evasiones comunes
  const cleanedText = normalizedText
    .replace(/[0@]/g, 'o')
    .replace(/[1!]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[\-_\.\s]+/g, ' ') // Espacios, guiones, puntos a espacios
    .replace(/\s+/g, ' '); // Múltiples espacios a uno
  
  // Verificar palabras prohibidas en texto original
  for (const word of inappropriateWords) {
    const wordLower = word.toLowerCase();
    if (normalizedText.includes(wordLower)) {
      return true;
    }
    // También verificar en texto limpio (anti-evasión)
    if (cleanedText.includes(wordLower)) {
      return true;
    }
  }
  
  // Verificar patrones problemáticos
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(normalizedText) || pattern.test(cleanedText)) {
      return true;
    }
  }
  
  // Verificar variaciones con espacios entre letras (n i g g e r)
  const spacedPattern = /\b[nñ]\s*[i1!]\s*[gq]\s*[gq]\s*[e3]\s*[r]\b/i;
  if (spacedPattern.test(normalizedText)) {
    return true;
  }
  
  // Verificar otros patrones de evasión comunes
  const evasionPatterns = [
    /\bn\s*e\s*g\s*r\s*o/i,
    /\bj\s*u\s*d\s*i\s*o/i,
    /\bm\s*o\s*r\s*o/i,
    /\bg\s*i\s*t\s*a\s*n\s*o/i,
    /\bp\s*e\s*n\s*e/i,
    /\bv\s*e\s*r\s*g\s*a/i,
    /\bp\s*o\s*l\s*l\s*a/i,
    /\bc\s*o\s*ñ\s*o/i,
    /\bt\s*e\s*t\s*a\s*s/i,
    /\bc\s*u\s*l\s*o/i,
    /\bs\s*e\s*x\s*o/i,
    /\bp\s*o\s*r\s*n\s*o/i
  ];
  
  for (const pattern of evasionPatterns) {
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
    return 'Contenido no permitido. Usa un lenguaje apropiado para eventos familiares.';
  }
  
  if (!isValidEventType(text)) {
    return 'Ingresa un evento apropiado (ej: Cumpleaños, Boda, Graduación, Reunión).';
  }
  
  return '';
}
