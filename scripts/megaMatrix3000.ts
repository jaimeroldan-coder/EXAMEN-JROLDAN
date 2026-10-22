import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { PREGUNTAS_CONSTITUCIONAL } from './src/services/questions/constitucionalQuestions.js';
import { PREGUNTAS_PENAL } from './src/services/questions/penalQuestions.js';
import { PREGUNTAS_ADOLESCENTES } from './src/services/questions/adolescentesQuestions.js';
import { PREGUNTAS_TRANSITO } from './src/services/questions/transitoQuestions.js';
import { PREGUNTAS_CONTRAVENCIONES } from './src/services/questions/contravencionesQuestions.js';
import { PREGUNTAS_VIOLENCIA } from './src/services/questions/violenciaQuestions.js';
import { PREGUNTAS_SEXUAL } from './src/services/questions/sexualQuestions.js';
import { Pregunta, AlternativaId, Dificultad, TipoPregunta } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function normalizarEnunciado(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 7 Bloques Materias con sus Artículos y Reglas Exactas de las Leyes
 */
interface ReglaJuridica {
  norma: string;
  articulo: string;
  subtema: string;
  textoSoporte: string;
  urlOficial: string;
  jurisprudencia?: { sentencia: string; organo: string; regla: string };
  // Dimensiones evaluadas
  dimensiones: Array<{
    concepto: string;
    preguntaNormativa: string;
    preguntaCaso: (contexto: string, actor: string) => string;
    correcta: string;
    distractor1: string;
    distractor2: string;
    distractor3: string;
    fundamento: string;
  }>;
}

const REGLAS_CONSTITUCIONAL: ReglaJuridica[] = [
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 86 num. 1',
    subtema: 'Disposiciones comunes de las garantías jurisdiccionales',
    textoSoporte: 'Cualquier persona, grupo de personas, comunidad, pueblo o nacionalidad podrá proponer las acciones previstas en la Constitución.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '001-16-PJO-CC', organo: 'Corte Constitucional', regla: 'Legitimación activa amplia y universal sin patrocinio preceptivo inicial.' },
    dimensiones: [
      {
        concepto: 'Legitimación activa amplia',
        preguntaNormativa: 'Conforme al Art. 86 numeral 1 de la Constitución, ¿quién ostenta legitimación activa para interponer una acción constitucional de protección?',
        preguntaCaso: (contexto, actor) => `En el contexto de ${contexto}, ${actor} presenta una acción de protección sin acreditar personería jurídica societaria. ¿Cómo debe resolver la jueza constitucional respecto a la admisibilidad subjetiva?`,
        correcta: 'Cualquier persona, grupo de personas, comunidad, pueblo o nacionalidad, por sus propios derechos o como colectivo, sin requerir personería jurídica previa.',
        distractor1: 'Únicamente el Defensor del Pueblo previo informe favorable de admisibilidad vinculante.',
        distractor2: 'Exclusivamente personas naturales domiciliadas en el cantón donde ocurrió la vulneración.',
        distractor3: 'Solamente personas jurídicas debidamente inscritas en la Superintendencia de Compañías.',
        fundamento: 'El Art. 86.1 CRE consagra la legitimación activa universal para garantizar la tutela inmediata de los derechos constitucionales.'
      },
      {
        concepto: 'Patrocinio profesional no obligatorio en garantía constitucional',
        preguntaNormativa: 'De acuerdo con el Art. 86.1 de la CRE y la jurisprudencia constitucional vinculante, ¿es obligatorio el patrocinio de un abogado defensor para proponer una garantía jurisdiccional?',
        preguntaCaso: (contexto, actor) => `Durante ${contexto}, ${actor} ingresa una petición manuscrita de garantía jurisdiccional sin firma de letrado. ¿Cuál es el deber del juzgador?`,
        correcta: 'No se requiere patrocinio de abogado para proponer la acción; el juzgador debe calificarla inmediatamente y coordinar asistencia legal pública si se solicita.',
        distractor1: 'Sí, es requisito solemne bajo sanción de nulidad procesal absoluta y archivo inmediato.',
        distractor2: 'Debe concederse término de 3 días bajo prevención de declarar el abandono de la causa.',
        distractor3: 'Solo se exime del patrocinio si se cancela una tasa judicial de habilitación extraordinaria.',
        fundamento: 'El Art. 86.1 CRE prescribe que no se requerirá patrocinio de abogada o abogado para proponer la acción.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 86 num. 2',
    subtema: 'Procedimiento y celeridad en garantías jurisdiccionales',
    textoSoporte: 'El procedimiento será sencillo, rápido y eficaz, oral en todas sus fases e instancias, y serán hábiles todos los días y horas.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '102-13-SEP-CC', organo: 'Corte Constitucional', regla: 'Habilitación de todos los días y horas como garantía de tutela judicial efectiva.' },
    dimensiones: [
      {
        concepto: 'Habilitación permanente de días y horas',
        preguntaNormativa: 'Según el Art. 86 numeral 2 de la Constitución, ¿cuál es la regla procesal respecto a los días y horas para sustanciar garantías jurisdiccionales?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} solicita tutela urgente un domingo en la madrugada. La judicatura rechaza recibir la acción alegando inhabilidad horaria. ¿Es procedente dicha actuación?`,
        correcta: 'Son hábiles todos los días y horas de manera ininterrumpida sin suspensión por feriados o fines de semana.',
        distractor1: 'Solo son hábiles de lunes a viernes en horario administrativo de 08h00 a 17h00.',
        distractor2: 'Únicamente son hábiles días feriados si media autorización expresa de la Corte Provincial.',
        distractor3: 'Rigen los mismos plazos de días hábiles del Código Orgánico General de Procesos.',
        fundamento: 'El Art. 86.2 de la Constitución establece expresamente que serán hábiles todos los días y horas.'
      },
      {
        concepto: 'Oralidad y sencillez procedimental',
        preguntaNormativa: 'Conforme al mandato constitucional del Art. 86.2, ¿cómo debe ser el trámite de las garantías jurisdiccionales?',
        preguntaCaso: (contexto, actor) => `En el marco de ${contexto}, el juzgador exige a ${actor} formalidades ritualistas y memoriales solemnes no previstos en la ley. ¿Qué principio procesal se vulnera?`,
        correcta: 'El principio de procedimiento sencillo, rápido, eficaz y oral en todas sus fases e instancias.',
        distractor1: 'El principio de escrituración estricta y preclusión rígida probatoria.',
        distractor2: 'El principio de solemnidad sustancial bajo fe pública notarial.',
        distractor3: 'El principio de reserva procesal y confidencialidad entre judicaturas.',
        fundamento: 'La Constitución prohíbe formalismos que obstaculicen la eficacia de las garantías constitucionales.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 86 num. 3',
    subtema: 'Competencia territorial e inicio del trámite',
    textoSoporte: 'Será competente la jueza o juez del lugar en el que se origina el acto o la omisión o donde se producen sus efectos.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '001-10-PJO-CC', organo: 'Corte Constitucional', regla: 'Competencia territorial a elección del accionante.' },
    dimensiones: [
      {
        concepto: 'Elección de competencia territorial',
        preguntaNormativa: '¿Qué dispone el Art. 86 numeral 3 de la Constitución respecto al juez competente territorialmente para conocer garantías?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} presenta una acción en el cantón donde sufre los efectos lesivos de una resolución dictada en la capital. La entidad accionada interpone excepción de incompetencia. ¿Cómo se resuelve?`,
        correcta: 'Es competente el juzgador del lugar donde se origina el acto o donde se producen sus efectos, a elección del accionante.',
        distractor1: 'Es exclusivamente competente el juez de la sede central de la entidad accionada.',
        distractor2: 'La competencia radica únicamente en el Tribunal Contencioso Administrativo de Quito.',
        distractor3: 'Se debe inhibir el juez y remitir a sorteo ante el presidente de la Corte Nacional.',
        fundamento: 'El Art. 86.3 CRE garantiza la cercanía de la justicia constitucional consagrando la regla del lugar de los efectos.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 87',
    subtema: 'Medidas cautelares constitucionales',
    textoSoporte: 'Se podrán ordenar medidas cautelares conjunta o independientemente de las acciones constitucionales de protección con el objeto de evitar o hacer cesar la violación o amenaza de violación de un derecho.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '034-13-SCN-CC', organo: 'Corte Constitucional', regla: 'Objeto preventivo y cesatorio urgente de las medidas cautelares.' },
    dimensiones: [
      {
        concepto: 'Finalidad de la medida cautelar constitucional',
        preguntaNormativa: 'Conforme al Art. 87 de la CRE, ¿cuál es el objeto específico de las medidas cautelares en materia constitucional?',
        preguntaCaso: (contexto, actor) => `Ante una amenaza inminente en ${contexto}, ${actor} formula petición de medidas cautelares autónomas. ¿Cuál es la finalidad sustantiva que debe verificar el juzgador?`,
        correcta: 'Evitar o hacer cesar la violación o amenaza inminente de violación de un derecho constitucional.',
        distractor1: 'Asegurar el embargo de cuentas bancarias y cobro coactivo de créditos institucionales.',
        distractor2: 'Declarar la culpabilidad penal de funcionarios infractores.',
        distractor3: 'Suspender de forma permanente la vigencia de un código orgánico de la República.',
        fundamento: 'El Art. 87 CRE define la naturaleza estrictamente preventiva o cesatoria de la medida cautelar.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 88',
    subtema: 'Acción de Protección',
    textoSoporte: 'La acción de protección tendrá por objeto el amparo directo y eficaz de los derechos reconocidos en la Constitución.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '102-13-SEP-CC', organo: 'Corte Constitucional', regla: 'Distinción entre mera legalidad y vulneración de derechos constitucionales.' },
    dimensiones: [
      {
        concepto: 'Procedencia de la acción de protección',
        preguntaNormativa: 'Según el Art. 88 de la CRE, ¿cuándo procede la acción de protección contra actos u omisiones de particulares?',
        preguntaCaso: (contexto, actor) => `En el contexto de ${contexto}, ${actor} demanda a una empresa privada concesionaria de un servicio público por discriminación directa. ¿Procede la acción de protección?`,
        correcta: 'Procede cuando el particular preste servicios públicos impropios, actúe por delegación o cuando la persona afectada se encuentre en estado de subordinación, indefensión o discriminación.',
        distractor1: 'Nunca procede contra particulares bajo ninguna circunstancia procesal.',
        distractor2: 'Solo procede si el particular consiente voluntariamente en someterse a la jurisdicción constitucional.',
        distractor3: 'Únicamente si existe previa sentencia penal condenatoria ejecutoriada contra el particular.',
        fundamento: 'El Art. 88 CRE habilita expresamente la acción contra particulares en casos de servicios públicos, subordinación o discriminación.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 89',
    subtema: 'Acción de Hábeas Corpus',
    textoSoporte: 'La acción de hábeas corpus tiene por objeto recuperar la libertad de quien se encuentre privado de ella de forma ilegal, arbitraria o ilegítima, así como proteger la vida y la integridad física.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '253-20-JH/22', organo: 'Corte Constitucional', regla: 'Hábeas corpus correctivo y preventivo; tutela de la salud en centros penitenciarios.' },
    dimensiones: [
      {
        concepto: 'Hábeas corpus correctivo',
        preguntaNormativa: 'De acuerdo con el Art. 89 de la Constitución, ¿procede el hábeas corpus a favor de personas legalmente privadas de la libertad?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} cumple sentencia penal pero padece tortura y falta de tratamiento médico vital en el centro de privación. ¿Qué tipo de hábeas corpus procede?`,
        correcta: 'Procede el hábeas corpus correctivo para proteger la vida, la salud y la integridad física o hacer cesar tratos crueles, inhumanos o degradantes.',
        distractor1: 'No procede porque el hábeas corpus únicamente examina órdenes de detención ilegales al inicio.',
        distractor2: 'Solo procede si el Presidente de la República concede un indulto humanitario previo.',
        distractor3: 'Debe interponerse obligatoriamente un recurso de revisión penal ante la Corte Nacional.',
        fundamento: 'El Art. 89 CRE tutela expresamente la vida y la integridad física de las personas privadas de libertad.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 91',
    subtema: 'Acción de Acceso a la Información Pública',
    textoSoporte: 'La acción de acceso a la información pública tendrá por objeto garantizar el acceso a ella cuando haya sido denegada tácita o expresamente, o cuando la que se proporcionó no sea completa o veraz.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '001-14-PJO-CC', organo: 'Corte Constitucional', regla: 'Principio de máxima divulgación y excepciones taxativas legales de reserva.' },
    dimensiones: [
      {
        concepto: 'Presupuesto procesal de denegación',
        preguntaNormativa: '¿Cuál es el presupuesto procesal habilitante para interponer la acción de acceso a la información pública conforme al Art. 91 CRE?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} solicita copias de contratos de obra pública y la entidad no responde en el término legal ni entrega la documentación requerida. ¿Qué acción procede?`,
        correcta: 'Procede la acción de acceso a la información pública por denegación tácita o expresa o por entrega incompleta o inverosímil.',
        distractor1: 'Procede demanda contencioso-tributaria por silencio administrativo extintivo.',
        distractor2: 'Debe formularse denuncia por concusión penal ante la Fiscalía General del Estado.',
        distractor3: 'Se requiere dictamen previo del Procurador General del Estado declarando el silencio.',
        fundamento: 'El Art. 91 de la CRE garantiza el acceso a la información pública frente a la negativa tácita o expresa.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 92',
    subtema: 'Acción de Hábeas Data',
    textoSoporte: 'Toda persona tendrá derecho a conocer de la existencia y acceder a los documentos, datos genéticos, bancos de datos e informes que sobre sí misma consten en entidades públicas o privadas.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '016-13-SEP-CC', organo: 'Corte Constitucional', regla: 'Autodeterminación informativa y rectificación de datos inexactos.' },
    dimensiones: [
      {
        concepto: 'Autodeterminación informativa y rectificación',
        preguntaNormativa: 'Según el Art. 92 de la CRE, ¿cuáles son las facultades que confiere la acción de hábeas data al titular de la información personal?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} descubre que un buró crediticio difunde información crediticia errónea y desactualizada que le causa perjuicio financiero. ¿Qué pretensiones caben en hábeas data?`,
        correcta: 'Acceder a la información personal, conocer su uso y finalidad, y solicitar su actualización, rectificación, eliminación o anulación.',
        distractor1: 'Exigir la expropiación del servidor informático de la entidad requerida.',
        distractor2: 'Reclamar la clausura penal de las instituciones financieras asociadas.',
        distractor3: 'Demandar daños y perjuicios mercantiles en juicio sumario ordinario.',
        fundamento: 'El Art. 92 CRE consagra el derecho a la autodeterminación informativa y a exigir la rectificación o eliminación de datos falsos.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 93',
    subtema: 'Acción por Incumplimiento',
    textoSoporte: 'La acción por incumplimiento tendrá por objeto garantizar la aplicación de las normas que integran el sistema jurídico, así como el cumplimiento de sentencias o informes de organismos internacionales de derechos humanos.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '001-13-SAN-CC', organo: 'Corte Constitucional', regla: 'Competencia privativa de la Corte Constitucional y reclamo previo como requisito.' },
    dimensiones: [
      {
        concepto: 'Requisito de reclamo previo y competencia exclusiva',
        preguntaNormativa: '¿Ante qué órgano judicial se interpone la acción por incumplimiento prevista en el Art. 93 de la CRE y qué requisito previo es exigible?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} pretende demandar el incumplimiento de una ley clara y expresa por parte de un ministerio público. ¿Dónde y cómo debe presentar su acción?`,
        correcta: 'Ante la Corte Constitucional, mediando reclamo previo a la autoridad requerida y su falta de atención en 40 días según la LOGJCC.',
        distractor1: 'Ante cualquier juez civil de primera instancia mediante citación personalísima.',
        distractor2: 'Ante la Corte Nacional de Justicia sin necesidad de reclamo previo alguno.',
        distractor3: 'Ante el Consejo de Participación Ciudadana y Control Social en audiencia pública.',
        fundamento: 'El Art. 93 CRE y la LOGJCC fijan competencia exclusiva de la Corte Constitucional y reclamo previo habilitante.'
      }
    ]
  },
  {
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 94',
    subtema: 'Acción Extraordinaria de Protección',
    textoSoporte: 'La acción extraordinaria de protección procederá contra sentencias o autos definitivos en los que se haya violado por acción u omisión derechos reconocidos en la Constitución o el debido proceso.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    jurisprudencia: { sentencia: '1967-14-EP/20', organo: 'Corte Constitucional', regla: 'Carácter residual, término de 20 días y exclusión de examen de legalidad.' },
    dimensiones: [
      {
        concepto: 'Término y objeto de la Acción Extraordinaria de Protección',
        preguntaNormativa: 'Conforme al Art. 94 CRE y Art. 60 de la LOGJCC, ¿cuál es el término para interponer la Acción Extraordinaria de Protección ante la Corte Constitucional?',
        preguntaCaso: (contexto, actor) => `En ${contexto}, ${actor} recibe notificación de la sentencia ejecutoriada de casación donde se vulneró el derecho a la defensa. ¿De cuánto tiempo dispone para presentar la AEP?`,
        correcta: 'Veinte (20) días término contados a partir de que la decisión judicial que causó ejecutoria fue notificada.',
        distractor1: 'Sesenta (60) días calendario improrrogables.',
        distractor2: 'Cinco (5) días hábiles conforme al Código Orgánico de la Función Judicial.',
        distractor3: 'Un año fiscal según las reglas de la ley de casación.',
        fundamento: 'El Art. 60 LOGJCC establece el término perentorio de 20 días para proponer la AEP.'
      }
    ]
  }
];

console.log('Reglas constitucionales parametrizadas:', REGLAS_CONSTITUCIONAL.length);
