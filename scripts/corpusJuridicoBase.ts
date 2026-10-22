/**
 * Corpus Jurídico Ecuatoriano Estructurado para el Simulador de la Función Judicial
 * Fuente: Constitución, COIP, COGEP, COFJ, LOGJCC, CONA, LOIPEVCM y Precedentes Vinculantes Corte Constitucional/Corte Nacional
 */

export interface NucleoNormativo {
  materia: string;
  subtema: string;
  perfil: string[];
  norma: string;
  articulo: string;
  textoSoporte: string;
  urlOficial: string;
  sentencia?: string;
  organo?: string;
  reglaJurisprudencial?: string;
  items: Array<{
    dificultad: 'baja' | 'media' | 'alta';
    tipo: 'normativa' | 'jurisprudencial' | 'caso_practico' | 'doctrinaria';
    enunciado: string;
    correcta: string;
    distractores: [string, string, string];
    explicacion: string;
    explDistractores: { A?: string; B?: string; C?: string; D?: string };
  }>;
}

export const CORPUS_CONSTITUCIONAL: NucleoNormativo[] = [
  {
    materia: 'Derecho Constitucional',
    subtema: 'Disposiciones comunes de las garantías jurisdiccionales',
    perfil: ['penal', 'personalizado'],
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 86 numeral 1',
    textoSoporte: 'Cualquier persona, grupo de personas, comunidad, pueblo o nacionalidad podrá proponer las acciones previstas en la Constitución.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    sentencia: '001-16-PJO-CC',
    organo: 'Corte Constitucional del Ecuador',
    reglaJurisprudencial: 'Legitimación activa amplia y universal sin requerimiento de interés directo o patrocinio profesional obligatorios.',
    items: [
      {
        dificultad: 'baja',
        tipo: 'normativa',
        enunciado: 'Según el Art. 86 numeral 1 de la Constitución de la República del Ecuador, ¿quién ostenta legitimación activa para presentar una acción de protección u otra garantía jurisdiccional?',
        correcta: 'Cualquier persona, grupo de personas, comunidad, pueblo o nacionalidad, por sus propios derechos o en representación colectiva.',
        distractores: [
          'Únicamente la Defensoría del Pueblo previo dictamen de admisibilidad institucional.',
          'Solamente la víctima directa que cuente con abogado colegiado en el foro local.',
          'Exclusivamente personas jurídicas domiciliadas en la provincia donde ocurrió el hecho.'
        ],
        explicacion: 'El Art. 86.1 de la CRE consagra la legitimación activa universal y difusa para la tutela de derechos constitucionales.',
        explDistractores: {}
      },
      {
        dificultad: 'media',
        tipo: 'caso_practico',
        enunciado: 'Un colectivo ambiental no registrado formalmente presenta una acción de protección alegando la contaminación inminente de un estero comunal. El juez de primer nivel inadmite a trámite la demanda por falta de personería jurídica. ¿Es jurídicamente acertada la decisión del juez?',
        correcta: 'No, porque la Constitución garantiza legitimación activa a cualquier grupo de personas o comunidad sin exigir personería jurídica previa.',
        distractores: [
          'Sí, porque el Código Orgánico General de Procesos suple esta norma exigiendo acta constitutiva notariada.',
          'Sí, toda vez que solo el Ministerio del Ambiente puede accionar en defensa del agua.',
          'No, pero debió ordenar caución pecuniaria antes de continuar con la sustanciación de la causa.'
        ],
        explicacion: 'El principio pro actione y el Art. 86.1 CRE impiden rechazar garantías por formalismos societarios o personería jurídica ausente.',
        explDistractores: {}
      },
      {
        dificultad: 'alta',
        tipo: 'jurisprudencial',
        enunciado: 'Conforme a la jurisprudencia vinculante de la Corte Constitucional en la sentencia 001-16-PJO-CC, ¿qué ocurre si el accionante en una garantía comparece sin patrocinio letrado?',
        correcta: 'El juzgador debe proveer la petición inmediatamente y designar o coordinar con la Defensoría Pública si el accionante lo requiere, sin suspender el trámite.',
        distractores: [
          'Debe archivar de plano la acción por defecto sustancial insubsanable de la pretensión procesal.',
          'Debe otorgar 3 días bajo prevención de declarar el abandono definitivo de la garantía constitucional.',
          'Debe remitir el expediente al Tribunal Contencioso Administrativo para saneamiento previo.'
        ],
        explicacion: 'La garantía jurisdiccional no exige patrocinio legal como requisito habilitante de validez procesal.',
        explDistractores: {}
      }
    ]
  },
  {
    materia: 'Derecho Constitucional',
    subtema: 'Competencia en garantías jurisdiccionales',
    perfil: ['penal', 'personalizado'],
    norma: 'Ley Orgánica de Garantías Jurisdiccionales y Control Constitucional',
    articulo: 'Art. 7',
    textoSoporte: 'Será competente cualquier jueza o juez de primera instancia del lugar donde se origina el acto u omisión o donde se producen sus efectos.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    sentencia: '102-13-SEP-CC',
    organo: 'Corte Constitucional del Ecuador',
    reglaJurisprudencial: 'Competencia territorial a elección del accionante entre el lugar de la vulneración y el de sus efectos lesivos.',
    items: [
      {
        dificultad: 'baja',
        tipo: 'normativa',
        enunciado: 'Conforme al Art. 7 de la LOGJCC, ¿cuál es la regla de competencia territorial para conocer una acción constitucional de protección en primera instancia?',
        correcta: 'Será competente cualquier jueza o juez de primera instancia del lugar donde se origina el acto/omisión o donde se producen sus efectos.',
        distractores: [
          'Únicamente el juez de la Sala Civil y Mercantil de la Corte Provincial de Justicia respectiva.',
          'El juez penal de la sede principal de la Defensoría del Pueblo en Quito exclusivamente.',
          'El juez del domicilio fiscal de la institución pública accionada forzosamente.'
        ],
        explicacion: 'El Art. 7 LOGJCC otorga al accionante la prerrogativa de demandar en el lugar de origen del acto o donde se proyectan sus efectos directos.',
        explDistractores: {}
      },
      {
        dificultad: 'media',
        tipo: 'caso_practico',
        enunciado: 'Un ciudadano domiciliado en Loja es desvinculado mediante un acto administrativo emitido en Quito con efectos inmediatos sobre su remuneración y funciones en la ciudad de Loja. El ciudadano presenta la acción de protección ante un juez de la Unidad Judicial de Loja. La entidad pública excepciona incompetencia territorial alegando que la resolución se firmó en Quito. ¿Cómo debe resolver el juez?',
        correcta: 'Rechazar la excepción de incompetencia, pues los efectos perjudiciales del acto se produjeron y desplegaron en Loja.',
        distractores: [
          'Aceptar la excepción de incompetencia y remitir el expediente a los jueces de Quito en el término de 48 horas.',
          'Declarar la nulidad de todo lo actuado disponiendo que se plantee demanda contencioso-administrativa en Cuenca.',
          'Remitir el conflicto de competencia ante el pleno de la Corte Nacional de Justicia.'
        ],
        explicacion: 'El Art. 7 de la LOGJCC establece claramente la competencia concurrente en el lugar de producción de los efectos de la vulneración.',
        explDistractores: {}
      },
      {
        dificultad: 'alta',
        tipo: 'doctrinaria',
        enunciado: 'En la teoría procesal constitucional ecuatoriana, ¿qué principio rector fundamenta la asignación de competencia a cualquier juez de primer nivel independientemente de su materia ordinaria?',
        correcta: 'El principio de justicia constitucional difusa y preferente, que inviste a todo juzgador ordinario de potestad de juez constitucional.',
        distractores: [
          'El principio de especialidad orgánica estricta consagrado en el derecho canónico.',
          'El fuero de atracción absoluto de los tribunales de lo contencioso tributario.',
          'La delegación administrativa temporal regulada en el Código Orgánico Administrativo.'
        ],
        explicacion: 'En Ecuador todo juez de primera instancia es juez constitucional para conocer acciones de protección, medidas cautelares y hábeas corpus.',
        explDistractores: {}
      }
    ]
  },
  {
    materia: 'Derecho Constitucional',
    subtema: 'Medidas cautelares constitucionales',
    perfil: ['penal', 'personalizado'],
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 87',
    textoSoporte: 'Se podrán ordenar medidas cautelares conjunta o independientemente de las acciones constitucionales de protección de derechos, con el objeto de evitar o hacer cesar la violación o amenaza de violación de un derecho.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    sentencia: '034-13-SCN-CC',
    organo: 'Corte Constitucional del Ecuador',
    reglaJurisprudencial: 'Naturaleza preventiva y urgente de las medidas cautelares frente a daño inminente e irreparable.',
    items: [
      {
        dificultad: 'baja',
        tipo: 'normativa',
        enunciado: 'De acuerdo con el Art. 87 de la Constitución, ¿cuál es el objeto específico de las medidas cautelares constitucionales?',
        correcta: 'Evitar o hacer cesar la violación o amenaza inminente de violación de un derecho reconocido en la Constitución.',
        distractores: [
          'Asegurar el cobro de créditos de dinero adeudados por el Estado mediante embargo de cuentas.',
          'Suspender de forma indefinida las leyes de la República hasta que la Asamblea Nacional legisle de nuevo.',
          'Imponer sanciones de privación de libertad a funcionarios negligentes sin juicio previo.'
        ],
        explicacion: 'El Art. 87 CRE define con precisión el fin preventivo o cesatorio de las medidas cautelares constitucionales.',
        explDistractores: {}
      },
      {
        dificultad: 'media',
        tipo: 'caso_practico',
        enunciado: 'Se solicita una medida cautelar constitucional autónoma para evitar la demolición de un inmueble patrimonial ante una orden administrativa de derrocamiento prevista para el día siguiente. ¿Qué requisito esencial debe evaluar el juez para su concesión inmediata sin necesidad de audiencia previa?',
        correcta: 'La verosimilitud de la amenaza y la inminencia de un daño grave e irreparable al derecho tutelado.',
        distractores: [
          'El pago previo de una caución monetaria equivalente al 10% del avalúo catastral del bien.',
          'El informe favorable del Procurador General del Estado emitido por escrito.',
          'Que se haya agotado obligatoriamente la vía del reclamo administrativo ante el Municipio.'
        ],
        explicacion: 'El Art. 27 LOGJCC prescribe que las medidas cautelares se conceden con base en verosimilitud e inminencia de daño grave.',
        explDistractores: {}
      },
      {
        dificultad: 'alta',
        tipo: 'jurisprudencial',
        enunciado: 'Según la jurisprudencia consolidada de la Corte Constitucional (sentencia 034-13-SCN-CC), ¿cuándo procede la revocatoria de una medida cautelar autónoma?',
        correcta: 'Cuando se demuestre fehacientemente que ha cesado la amenaza o violación, o que no existían los fundamentos fácticos que la motivaron.',
        distractores: [
          'De forma automática transcurridos 15 días desde su notificación sin importar el estado del derecho.',
          'Únicamente cuando el presidente del Consejo de la Judicatura lo ordene mediante circular administrativa.',
          'Solamente si la parte accionada deposita una fianza bancaria a satisfacción del accionante.'
        ],
        explicacion: 'La medida cautelar cesa o se revoca cuando cesa la amenaza o se comprueba la inexistencia de vulneración inminente.',
        explDistractores: {}
      }
    ]
  },
  {
    materia: 'Derecho Constitucional',
    subtema: 'Acción de Hábeas Corpus',
    perfil: ['penal', 'personalizado'],
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 89',
    textoSoporte: 'La acción de hábeas corpus tiene por objeto recuperar la libertad de quien se encuentre privado de ella de forma ilegal, arbitraria o ilegítima, por orden de autoridad pública o de cualquier persona, así como proteger la vida y la integridad física de las personas privadas de libertad.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    sentencia: '253-20-JH/22',
    organo: 'Corte Constitucional del Ecuador',
    reglaJurisprudencial: 'Tutela de la vida, salud e integridad física en privación de libertad y prohibición de desnaturalización frente a medidas cautelares penales.',
    items: [
      {
        dificultad: 'baja',
        tipo: 'normativa',
        enunciado: '¿Cuáles son los dos bienes jurídicos primordiales protegidos por la Acción de Hábeas Corpus conforme al Art. 89 de la Constitución?',
        correcta: 'La libertad personal frente a privaciones ilegales, arbitrarias o ilegítimas, así como la vida e integridad física de la persona privada de libertad.',
        distractores: [
          'El derecho a la propiedad privada sobre vehículos incautados y la indemnización económica.',
          'La reserva de las investigaciones penales y el secreto bancario institucional.',
          'El derecho al trabajo remunerado en cargos de libre nombramiento y remoción.'
        ],
        explicacion: 'El Art. 89 CRE protege la libertad ambulatoria y los derechos a la vida y a la integridad personal de quien sufre encierro.',
        explDistractores: {}
      },
      {
        dificultad: 'media',
        tipo: 'caso_practico',
        enunciado: 'Una persona privada de la libertad con prisión preventiva vigente sufre una enfermedad catastrófica que no puede ser tratada en el centro penitenciario por falta de insumos, poniendo en riesgo inminente su vida. Se presenta un hábeas corpus correctivo solicitando medidas de protección de salud. La jueza niega la acción argumentando que la prisión preventiva fue dictada legítimamente por un juez penal. ¿Es correcta la resolución constitucional?',
        correcta: 'No, porque el hábeas corpus correctivo procede para proteger la vida y la salud, independientemente de la legalidad formal de la orden de detención.',
        distractores: [
          'Sí, porque ningún juez constitucional puede revisar las condiciones de salud de un recluso sin autorización del SNAI.',
          'Sí, ya que la única vía legal permitida en el COIP es el recurso de casación penal.',
          'No, pero la jueza debió declarar la absolución penal definitiva de todos los delitos imputados.'
        ],
        explicacion: 'El hábeas corpus correctivo tutela la vida, salud e integridad personal aunque la detención originaria haya sido legal.',
        explDistractores: {}
      },
      {
        dificultad: 'alta',
        tipo: 'jurisprudencial',
        enunciado: 'En la jurisprudencia vinculante 253-20-JH/22, ¿qué precisó la Corte Constitucional respecto al hábeas corpus cuando una orden de prisión preventiva fue dictada con fuero de Corte Provincial?',
        correcta: 'La competencia para conocer el hábeas corpus contra órdenes de prisión preventiva dictadas por jueces con fuero corresponde a la Sala de la Corte Nacional de Justicia que corresponda.',
        distractores: [
          'Puede ser resuelto por cualquier juez de paz de la parroquia rural más cercana.',
          'Queda suspendida la acción constitucional hasta que termine el juicio penal ordinario.',
          'Corresponde privativamente a la Corte Interamericana de Derechos Humanos en San José.'
        ],
        explicacion: 'Las reformas y la sentencia 253-20-JH determinan las reglas de competencia para evitar el uso distorsionado del hábeas corpus.',
        explDistractores: {}
      }
    ]
  },
  {
    materia: 'Derecho Constitucional',
    subtema: 'Acción Extraordinaria de Protección',
    perfil: ['penal', 'personalizado'],
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 94',
    textoSoporte: 'La acción extraordinaria de protección procederá contra sentencias o autos definitivos en los que se haya violado por acción u omisión derechos reconocidos en la Constitución o el debido proceso.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    sentencia: '1967-14-EP/20',
    organo: 'Corte Constitucional del Ecuador',
    reglaJurisprudencial: 'La AEP no constituye una instancia adicional para reexaminar hechos o valoración probatoria ordinaria.',
    items: [
      {
        dificultad: 'baja',
        tipo: 'normativa',
        enunciado: '¿Ante qué órgano jurisdiccional se interpone y resuelve de forma exclusiva la Acción Extraordinaria de Protección?',
        correcta: 'Ante la Corte Constitucional del Ecuador.',
        distractores: [
          'Ante el Pleno de la Corte Nacional de Justicia.',
          'Ante el Tribunal Contencioso Electoral.',
          'Ante las Cortes Provinciales de Justicia en sala única.'
        ],
        explicacion: 'El Art. 94 de la CRE y la LOGJCC asignan privativamente el conocimiento de la AEP a la Corte Constitucional.',
        explDistractores: {}
      },
      {
        dificultad: 'media',
        tipo: 'normativa',
        enunciado: '¿Cuál es el término general para interponer la Acción Extraordinaria de Protección a partir de la notificación del auto o sentencia ejecutoriada?',
        correcta: 'Veinte (20) días término contados desde que la decisión judicial quedó ejecutoriada.',
        distractores: [
          'Cinco (5) días hábiles improrrogables.',
          'Sesenta (60) días calendario seguidos.',
          'Tres (3) meses contados desde la presentación de la demanda originaria.'
        ],
        explicacion: 'El Art. 60 de la LOGJCC fija el término preclusivo de 20 días para presentar la acción extraordinaria de protección.',
        explDistractores: {}
      },
      {
        dificultad: 'alta',
        tipo: 'jurisprudencial',
        enunciado: 'En la sentencia 1967-14-EP/20, ¿qué criterio sentó la Corte Constitucional respecto al examen de mera legalidad en la Acción Extraordinaria de Protección?',
        correcta: 'La AEP es improcedente si el accionante pretende que la Corte Constitucional actúe como un tribunal de casación o revise la valoración probatoria de la justicia ordinaria.',
        distractores: [
          'La Corte Constitucional está obligada a repetir todas las pericias y testimonios practicados en el tribunal penal de origen.',
          'Cualquier discrepancia de interpretación legal del COIP habilita la nulidad automática de la sentencia penal.',
          'El accionante puede solicitar peritajes contables directos ante los jueces constitucionales para fijar intereses.'
        ],
        explicacion: 'La Corte Constitucional ha reiterado que la AEP no es una cuarta instancia ni un recurso de casación sobre cuestiones de legalidad.',
        explDistractores: {}
      }
    ]
  }
];
