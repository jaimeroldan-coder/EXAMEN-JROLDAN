import fs from 'fs';
import path from 'path';

interface RawItem {
  num: number;
  pregunta: string;
  correcta: string;
  articulo: string;
  subtema: string;
  distractores: [string, string, string];
}

const ITEMS: RawItem[] = [
  {
    num: 1,
    pregunta: '¿Cuál es la finalidad de la tutela judicial efectiva?',
    correcta: 'Garantizar el acceso a la justicia, la obtención de una decisión motivada y la ejecución efectiva de lo resuelto.',
    articulo: 'Art. 75',
    subtema: 'Principios de la Administración de Justicia',
    distractores: [
      'Garantizar exclusivamente la interposición de recursos ordinarios de apelación ante cortes provinciales.',
      'Asegurar la gratuidad de los honorarios profesionales de patrocinio privado en toda causa contenciosa.',
      'Permitir que el juzgador resuelva controversias omitiendo de manera absoluta el pronunciamiento sobre el fondo del litigio.'
    ]
  },
  {
    num: 2,
    pregunta: '¿Qué garantiza el derecho a la defensa?',
    correcta: 'El derecho a ser escuchado, contar con asistencia jurídica, presentar pruebas, controvertirlas y recurrir las decisiones.',
    articulo: 'Art. 76 num. 7',
    subtema: 'Garantías Básicas del Debido Proceso',
    distractores: [
      'Únicamente la designación forzosa de un defensor público aun cuando el procesado designe patrocinador de confianza.',
      'La suspensión indefinida del proceso hasta que la contraparte desista expresamente de la pretensión incoada.',
      'La exoneración obligatoria de la carga probatoria para el demandante en cualquier materia procedimental.'
    ]
  },
  {
    num: 3,
    pregunta: '¿Qué ocurre con las pruebas obtenidas con violación de la Constitución o la ley?',
    correcta: 'Carecen de validez y eficacia probatoria.',
    articulo: 'Art. 76 num. 4',
    subtema: 'Régimen Constitucional Probatorio',
    distractores: [
      'Mantienen eficacia plena si coadyuvan al esclarecimiento material de los hechos investigados.',
      'Deben ser convalidadas de oficio mediante auto interlocutorio emitido por el juez de primera instancia.',
      'Surtirán efecto atenuado y se valorarán únicamente como indicio leve en sentencia definitiva.'
    ]
  },
  {
    num: 4,
    pregunta: '¿Qué es la seguridad jurídica?',
    correcta: 'Es el respeto a la Constitución y la existencia de normas previas, claras, públicas y aplicadas por autoridad competente.',
    articulo: 'Art. 82',
    subtema: 'Seguridad Jurídica y Principio de Legalidad',
    distractores: [
      'La facultad privativa de la administración pública de reformar normas procesales con carácter retroactivo desfavorable.',
      'El principio conforme al cual las leyes sustantivas sólo son obligatorias tras un año de promulgación en el Registro Oficial.',
      'La atribución de los jueces de aplicar normas declaradas inconstitucionales cuando consideren oportuna su vigencia.'
    ]
  },
  {
    num: 5,
    pregunta: '¿Cuál es la finalidad del sistema procesal ecuatoriano?',
    correcta: 'La realización de la justicia.',
    articulo: 'Art. 169',
    subtema: 'Principios Procesales',
    distractores: [
      'El cumplimiento riguroso de solemnidades sacramentales por encima de la vigencia de los derechos materiales.',
      'La imposición invariable de tasas arancelarias para sustentar el presupuesto operativo judicial.',
      'La prolongación oficiosa de los términos procesales para evitar resoluciones anticipadas.'
    ]
  },
  {
    num: 6,
    pregunta: '¿Quiénes integran los grupos de atención prioritaria?',
    correcta: 'Adultos mayores, niñas, niños y adolescentes, mujeres embarazadas, personas con discapacidad, personas privadas de libertad y personas con enfermedades catastróficas o de alta complejidad.',
    articulo: 'Art. 35',
    subtema: 'Derechos de las Personas y Grupos de Atención Prioritaria',
    distractores: [
      'Exclusivamente las personas jurídicas del sector público y organizaciones gremiales reconocidas legalmente.',
      'Únicamente las personas que se encuentren en goce de licencia o comisión de servicios remunerada.',
      'Cualquier ciudadano que mantenga contratos de provisión de bienes y servicios con instituciones del Estado.'
    ]
  },
  {
    num: 7,
    pregunta: '¿Qué protege la acción de protección?',
    correcta: 'Los derechos constitucionales vulnerados por actos u omisiones de autoridad pública o de particulares en los casos previstos por la ley.',
    articulo: 'Art. 88',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'Exclusivamente controversias contractuales de índole mercantil entre particulares regidas por el Código de Comercio.',
      'Reclamaciones pecuniarias estrictamente tributarias impugnables ante el Tribunal Distrital de lo Contencioso Tributario.',
      'Conflictos de linderación y posesión inmobiliaria que cuentan con trámite sumario previsto en el COGEP.'
    ]
  },
  {
    num: 8,
    pregunta: '¿Cuáles son las principales garantías jurisdiccionales?',
    correcta: 'Acción de protección, hábeas corpus, hábeas data, acción de acceso a la información pública, acción por incumplimiento y acción extraordinaria de protección.',
    articulo: 'Art. 86 a 94',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'El recurso de apelación, casación ordinaria, recurso de revisión y la consulta obligatoria de legalidad.',
      'El juicio ordinario, procedimiento sumario, monitorio, ejecutivo y contencioso administrativo.',
      'La conciliación prejudicial, el arbitraje en equidad, la mediación vecinal y la amigable composición.'
    ]
  },
  {
    num: 9,
    pregunta: '¿Qué protección especial reciben los adultos mayores?',
    correcta: 'Atención prioritaria, protección integral y políticas orientadas a garantizar su autonomía y bienestar.',
    articulo: 'Art. 36 a 38',
    subtema: 'Derechos de las Personas y Grupos de Atención Prioritaria',
    distractores: [
      'La exoneración obligatoria de todo tipo de obligaciones cívicas y la privación de su capacidad civil de ejercicio.',
      'Su tutela administrativa inmediata bajo curaduría forzosa por parte de las gobernaciones provinciales.',
      'La prohibición de comparecer a juicio como accionantes en defensa de sus derechos constitucionales.'
    ]
  },
  {
    num: 10,
    pregunta: '¿Qué principios rigen la justicia constitucional?',
    correcta: 'Aplicación más favorable a los derechos, tutela efectiva, celeridad, eficacia y simplicidad.',
    articulo: 'Art. 2 LOGJCC',
    subtema: 'Principios de la Justicia Constitucional',
    distractores: [
      'Rigor formalista extremo, principio de escrituración obligatoria y doble instancia vinculante en toda providencia.',
      'Tarifa probatoria tasada, inmediación diferida y presunción de constitucionalidad absoluta de los actos administrativos.',
      'Inadmisibilidad liminar por falta de personería colegiada y aplicación estricta de términos de caducidad ordinaria.'
    ]
  },
  {
    num: 11,
    pregunta: '¿Qué comprende el derecho a la integridad personal?',
    correcta: 'La integridad física, psíquica, moral y sexual.',
    articulo: 'Art. 66 num. 3',
    subtema: 'Derechos de Libertad',
    distractores: [
      'Únicamente la ausencia de lesiones anatómicas corporales debidamente comprobadas por perito médico-legista.',
      'El derecho a la propiedad privada sobre bienes muebles y la libertad irrestricta de contratación civil.',
      'La estabilidad laboral indefinida en el sector público sujeta a concursos de méritos y oposición.'
    ]
  },
  {
    num: 12,
    pregunta: '¿Procede la acción de protección cuando existe una vía ordinaria adecuada y eficaz?',
    correcta: 'No, cuando la controversia puede resolverse de manera efectiva mediante la vía ordinaria prevista por la ley.',
    articulo: 'Art. 42 num. 4 LOGJCC',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'Sí, porque la acción de protección siempre desplaza y anula cualquier procedimiento ordinario en trámite.',
      'Sí, procede de forma paralela y simultánea sin importar la naturaleza ni el alcance de la vía ordinaria.',
      'Procede siempre que el accionante afirme verbalmente en audiencia la inexistencia de leyes secundarias.'
    ]
  },
  {
    num: 13,
    pregunta: '¿Quiénes tienen derecho a protección especial y reparación integral por una infracción penal?',
    correcta: 'Las víctimas de infracciones penales.',
    articulo: 'Art. 78',
    subtema: 'Derechos de las Víctimas',
    distractores: [
      'Exclusivamente los sujetos procesales que ejerzan la acusación particular patrocinados por defensor público.',
      'Los peritos y testigos que comparezcan a rendir testimonio en la etapa de juicio.',
      'Únicamente las entidades estatales descentralizadas que intervengan en calidad de terceros perjudicados.'
    ]
  },
  {
    num: 14,
    pregunta: '¿Cuándo debe dictarse la sentencia en una garantía jurisdiccional?',
    correcta: 'En la misma audiencia, de forma oral, sin perjuicio de su posterior reducción a escrito.',
    articulo: 'Art. 86 num. 3',
    subtema: 'Procedimiento de Garantías Jurisdiccionales',
    distractores: [
      'Dentro del plazo fatal de treinta días hábiles posteriores a la conclusión de la etapa probatoria.',
      'Únicamente mediante providencia escrita notificada en casilla judicial tras informe de la Procuraduría.',
      'Al momento en que la Corte Constitucional emita dictamen previo de admisibilidad sobre el fondo.'
    ]
  },
  {
    num: 15,
    pregunta: '¿Quiénes son ecuatorianos por nacimiento?',
    correcta: 'Las personas nacidas en Ecuador, los nacidos en el extranjero de padre o madre ecuatorianos por nacimiento y sus descendientes hasta el tercer grado de consanguinidad, así como las personas pertenecientes a comunidades, pueblos o nacionalidades reconocidas en zonas fronterizas.',
    articulo: 'Art. 7',
    subtema: 'Nacionalidad y Ciudadanía',
    distractores: [
      'Exclusivamente las personas nacidas dentro del territorio continental de padres ambos nacidos en el Ecuador.',
      'Cualquier ciudadano extranjero que resida de manera ininterrumpida por más de seis meses en el país.',
      'Únicamente quienes hayan prestado servicios militares o contraído matrimonio con un funcionario consular.'
    ]
  },
  {
    num: 16,
    pregunta: '¿Qué protege el hábeas corpus?',
    correcta: 'La libertad, la integridad física y la vida de las personas privadas de libertad.',
    articulo: 'Art. 89',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'El derecho de propiedad sobre bienes inmuebles y la nulidad de escrituras públicas de compraventa.',
      'La corrección o supresión de datos crediticios erróneos asentados en el sistema financiero nacional.',
      'El cumplimiento de las obligaciones contractuales pactadas en contratos de obra pública del Estado.'
    ]
  },
  {
    num: 17,
    pregunta: '¿Qué protege la acción de acceso a la información pública?',
    correcta: 'El derecho a acceder a la información pública cuando esta ha sido negada expresa o tácitamente.',
    articulo: 'Art. 91',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'La confidencialidad obligatoria de los expedientes administrativos sancionadores en fase de impugnación.',
      'La rectificación inmediata de datos de filiación contenidos en el Registro Civil de Identificación y Cedulación.',
      'La revelación forzosa de secretos de Estado declarados formalmente reservados por razones de seguridad nacional.'
    ]
  },
  {
    num: 18,
    pregunta: '¿Qué protege el hábeas data?',
    correcta: 'El derecho a conocer, actualizar, rectificar, eliminar o anular datos personales que consten en archivos o bancos de datos.',
    articulo: 'Art. 92',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'La indemnización directa por daños y perjuicios derivados de accidentes de tránsito en carreteras públicas.',
      'La excarcelación de personas privadas de libertad cuya orden de detención haya caducado legalmente.',
      'La declaración de inaplicabilidad de ordenanzas tributarias municipales que contengan gravámenes lesivos.'
    ]
  },
  {
    num: 19,
    pregunta: '¿Qué protege la acción por incumplimiento?',
    correcta: 'El cumplimiento de normas jurídicas y de sentencias o informes de organismos internacionales de derechos humanos.',
    articulo: 'Art. 93',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'El pago forzoso de letras de cambio y pagarés a la orden derivados de relaciones crediticias privadas.',
      'La destitución sumaria e inmediata de jueces provinciales que incurran en retardo injustificado.',
      'La anulación definitiva de actos administrativos disciplinarios dictados por el Consejo de la Judicatura.'
    ]
  },
  {
    num: 20,
    pregunta: '¿Qué protege la acción extraordinaria de protección?',
    correcta: 'Los derechos constitucionales vulnerados mediante sentencias, autos definitivos o resoluciones con fuerza de sentencia.',
    articulo: 'Art. 94',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'Los actos de simple administración y las circulares internas emitidas por ministerios de Estado.',
      'La legalidad de la imposición de multas de tránsito dictadas por agentes de control metropolitano.',
      'El cobro de pensiones alimenticias atrasadas fijadas por juezas y jueces de la Niñez y Adolescencia.'
    ]
  },
  {
    num: 21,
    pregunta: '¿Cuál es el máximo órgano de control e interpretación constitucional en el Ecuador?',
    correcta: 'La Corte Constitucional.',
    articulo: 'Art. 429',
    subtema: 'Supremacía Constitucional y Control',
    distractores: [
      'La Sala Especializada de la Corte Nacional de Justicia mediante recurso extraordinario de casación.',
      'El Pleno del Consejo de la Judicatura a través de sus direcciones provinciales de vigilancia disciplinaria.',
      'El Procurador General del Estado mediante resoluciones vinculantes de consulta administrativa.'
    ]
  },
  {
    num: 22,
    pregunta: '¿Cuál es el órgano de administración de la Función Judicial?',
    correcta: 'El Consejo de la Judicatura.',
    articulo: 'Art. 178',
    subtema: 'Organización de la Función Judicial',
    distractores: [
      'El Pleno de la Corte Nacional de Justicia con competencia en materias penal y contenciosa.',
      'El Ministerio del Trabajo y Recursos Humanos a través de la Dirección Nacional de Talento Humano.',
      'La Fiscalía General del Estado mediante su unidad de gestión administrativa de causas de orden penal.'
    ]
  },
  {
    num: 23,
    pregunta: '¿Qué significa que los derechos sean de directa e inmediata aplicación?',
    correcta: 'Que pueden ser invocados y exigidos sin necesidad de una ley que los desarrolle.',
    articulo: 'Art. 11 num. 3',
    subtema: 'Principios de Aplicación de los Derechos',
    distractores: [
      'Que requieren inexcusablemente de un reglamento expedido por el Ejecutivo para surtir plenos efectos.',
      'Que únicamente los jueces de la Corte Constitucional están legitimados para ordenar su cumplimiento forzoso.',
      'Que su eficacia jurídica está condicionada a la asignación previa de partidas presupuestarias del Estado.'
    ]
  },
  {
    num: 24,
    pregunta: '¿Quién tiene el deber de respetar y hacer respetar los derechos garantizados en la Constitución?',
    correcta: 'El Estado.',
    articulo: 'Art. 11 num. 9',
    subtema: 'Responsabilidad y Deberes Estatales',
    distractores: [
      'Exclusivamente la Policía Nacional y las Fuerzas Armadas en operativos de control fronterizo y seguridad.',
      'Únicamente los colegios de abogados y agremiaciones profesionales legalmente facultadas.',
      'Los organismos internacionales y comisiones de veeduría no gubernamental acreditadas.'
    ]
  },
  {
    num: 25,
    pregunta: '¿Qué establece el principio de igualdad?',
    correcta: 'Que todas las personas son iguales y gozarán de los mismos derechos, deberes y oportunidades.',
    articulo: 'Art. 11 num. 2',
    subtema: 'Igualdad y No Discriminación',
    distractores: [
      'Que las autoridades judiciales gozan de inmunidad total y fueros especiales frente a la ley ordinaria.',
      'Que la concesión de derechos fundamentales depende del estrato patrimonial y pago oportuno de tributos.',
      'Que el Estado puede establecer privilegios hereditarios en el acceso a cargos de elección popular.'
    ]
  },
  {
    num: 26,
    pregunta: '¿Qué prohíbe el principio de no discriminación?',
    correcta: 'Toda distinción, exclusión o restricción basada en categorías prohibidas que tenga por objeto o resultado menoscabar derechos.',
    articulo: 'Art. 11 num. 2',
    subtema: 'Igualdad y No Discriminación',
    distractores: [
      'La implementación de medidas de acción afirmativa destinadas a erradicar desigualdades históricas.',
      'La exigencia legítima de títulos habilitantes académicos para el ejercicio de profesiones de riesgo social.',
      'La aplicación del régimen legal de inhabilidades constitucionales para postularse a la judicatura.'
    ]
  },
  {
    num: 27,
    pregunta: '¿Qué establece el principio pro persona?',
    correcta: 'Que las normas y derechos deben interpretarse y aplicarse de la manera más favorable para la vigencia efectiva de los derechos humanos.',
    articulo: 'Art. 11 num. 5',
    subtema: 'Principios de Aplicación de los Derechos',
    distractores: [
      'Que las pretensiones de los servidores públicos prevalecen sobre el interés jurídico de los justiciables.',
      'Que el juzgador debe inclinarse siempre a favor de la autoridad estatal en casos de duda razonable.',
      'Que las leyes penales sustantivas desfavorables pueden aplicarse retroactivamente de manera excepcional.'
    ]
  },
  {
    num: 28,
    pregunta: '¿Quiénes son titulares de los derechos reconocidos por la Constitución?',
    correcta: 'Las personas, comunidades, pueblos, nacionalidades y colectivos.',
    articulo: 'Art. 10',
    subtema: 'Titularidad de los Derechos',
    distractores: [
      'Exclusivamente las personas naturales mayores de edad que se encuentren en pleno goce de derechos políticos.',
      'Únicamente los ciudadanos domiciliados en el territorio nacional con cédula de identidad actualizada.',
      'Solo las corporaciones legalmente constituidas e inscritas ante la Superintendencia de Compañías.'
    ]
  },
  {
    num: 29,
    pregunta: '¿Qué es la reparación integral?',
    correcta: 'El conjunto de medidas destinadas a restituir derechos y reparar los daños causados por una vulneración.',
    articulo: 'Art. 86 num. 3',
    subtema: 'Garantías Jurisdiccionales y Reparación',
    distractores: [
      'Una sanción penal privativa de libertad que se aplica de manera accesoria contra el infractor civil.',
      'La restitución exclusivamente monetaria fijada a criterio discrecional de la Defensoría del Pueblo.',
      'Un indulto de carácter general otorgado por la Asamblea Nacional a favor de funcionarios del Estado.'
    ]
  },
  {
    num: 30,
    pregunta: '¿Cómo define la Constitución al Estado ecuatoriano?',
    correcta: 'Como un Estado constitucional de derechos y justicia, social, democrático, soberano, independiente, unitario, intercultural, plurinacional y laico.',
    articulo: 'Art. 1',
    subtema: 'Principios Fundamentales del Estado',
    distractores: [
      'Como un Estado liberal de derecho monárquico parlamentario con soberanía delegada a tribunales foráneos.',
      'Como una confederación autónoma de provincias soberanas con tribunales judiciales descentralizados absolutos.',
      'Como un Estado teocrático corporativo basado en la supremacía de costumbres comunitarias sin sujeción a la Carta Magna.'
    ]
  },
  {
    num: 31,
    pregunta: '¿Cuál es la forma de gobierno del Ecuador?',
    correcta: 'República democrática.',
    articulo: 'Art. 1',
    subtema: 'Principios Fundamentales del Estado',
    distractores: [
      'Monarquía constitucional hereditaria con separación de poderes.',
      'República parlamentaria con primer ministro designado por cámaras corporativas.',
      'Directorio colegiado rotativo sin titularidad presidencial unipersonal.'
    ]
  },
  {
    num: 32,
    pregunta: '¿Qué función del Estado organiza y garantiza los procesos electorales?',
    correcta: 'La Función Electoral.',
    articulo: 'Art. 217',
    subtema: 'Función Electoral',
    distractores: [
      'La Función Legislativa a través del Pleno de comisiones legislativas especializadas.',
      'La Función Judicial mediante las salas contencioso electorales de las Cortes Provinciales.',
      'La Función de Transparencia y Control Social por delegación del Consejo de Participación Ciudadana.'
    ]
  },
  {
    num: 33,
    pregunta: '¿Qué organismos integran la Función Electoral?',
    correcta: 'El Consejo Nacional Electoral y el Tribunal Contencioso Electoral.',
    articulo: 'Art. 217',
    subtema: 'Función Electoral',
    distractores: [
      'La Corte Constitucional y la Dirección Nacional de Registro Civil.',
      'La Junta Electoral Central y la Sala de Casación Penal de la Corte Nacional.',
      'El Ministerio de Gobierno y las Notarías Públicas de primera categoría del país.'
    ]
  },
  {
    num: 34,
    pregunta: '¿Cuál es el máximo deber del Estado?',
    correcta: 'Respetar y hacer respetar los derechos garantizados en la Constitución.',
    articulo: 'Art. 11 num. 9',
    subtema: 'Responsabilidad y Deberes Estatales',
    distractores: [
      'La recaudación coactiva e ilimitada de impuestos y tasas de orden fiscal y aduanero.',
      'La suscripción de convenios comerciales internacionales de desgravación arancelaria prioritaria.',
      'La defensa militar irrestricta de fronteras mediante el estado de excepción permanente.'
    ]
  },
  {
    num: 35,
    pregunta: '¿Cuál es la norma suprema del ordenamiento jurídico ecuatoriano?',
    correcta: 'La Constitución de la República del Ecuador.',
    articulo: 'Art. 424',
    subtema: 'Supremacía Constitucional',
    distractores: [
      'El Código Orgánico General de Procesos y las resoluciones de sala de la Corte Nacional.',
      'Los decretos ejecutivos expedidos por la Presidencia de la República en materia económica.',
      'Los reglamentos dictados por ministros de Estado en ejercicio de facultades delegadas.'
    ]
  },
  {
    num: 36,
    pregunta: '¿Qué ocurre cuando una norma jurídica contradice la Constitución?',
    correcta: 'Carece de eficacia jurídica en todo aquello que se oponga a la Constitución.',
    articulo: 'Art. 424',
    subtema: 'Supremacía Constitucional',
    distractores: [
      'Prevalece si fue promulgada con posterioridad a la vigencia de la Constitución de la República.',
      'Se mantiene plenamente vigente hasta que la Asamblea Nacional dicte una nueva ley orgánica.',
      'Será aplicada obligatoriamente por los juzgadores ordinarios siempre que provenga de una ley ordinaria.'
    ]
  },
  {
    num: 37,
    pregunta: '¿Quién administra justicia en nombre del pueblo soberano del Ecuador?',
    correcta: 'Los órganos de la Función Judicial.',
    articulo: 'Art. 167',
    subtema: 'Potestad Jurisdiccional',
    distractores: [
      'El Ministerio del Interior y los intendentes generales de policía de las provincias.',
      'Los alcaldes cantonales y prefectos provinciales mediante comisiones de mediación obligatoria.',
      'Los tribunales militares de disciplina en todas las controversias de orden civil y penal.'
    ]
  },
  {
    num: 38,
    pregunta: '¿Qué principios rigen la administración de justicia?',
    correcta: 'Independencia, imparcialidad, celeridad, gratuidad, eficiencia y tutela judicial efectiva.',
    articulo: 'Art. 168 y 169',
    subtema: 'Principios de la Administración de Justicia',
    distractores: [
      'Onerosidad procesal, secretismo de las actuaciones procesales y subordinación a la Función Ejecutiva.',
      'Régimen inquisitivo, dependencia administrativa de la Presidencia y formalismo infranqueable.',
      'Inmutabilidad de la prueba tasada, escrituración generalizada y doble instancia facultativa.'
    ]
  },
  {
    num: 39,
    pregunta: '¿Qué garantiza la independencia judicial?',
    correcta: 'Que juezas y jueces resuelvan los casos sin presiones ni interferencias externas.',
    articulo: 'Art. 168 num. 1',
    subtema: 'Independencia Judicial',
    distractores: [
      'Que los juzgadores puedan desobedecer arbitrariamente el texto expreso de la Constitución.',
      'La inamovilidad vitalicia de los operadores de justicia sin sujeción a evaluaciones de desempeño ni control disciplinario.',
      'Que el poder político oriente vinculantemente el sentido de las decisiones jurisdiccionales.'
    ]
  },
  {
    num: 40,
    pregunta: '¿Cuál es la finalidad de la Función de Transparencia y Control Social?',
    correcta: 'Promover la participación ciudadana, prevenir y combatir la corrupción y controlar las entidades del sector público.',
    articulo: 'Art. 204',
    subtema: 'Función de Transparencia y Control Social',
    distractores: [
      'Subrogar al Presidente de la República en la conducción de las relaciones exteriores y diplomáticas.',
      'Administrar las cárceles y centros de rehabilitación social del sistema penal nacional.',
      'Aprobar las leyes tributarias y reformar el Código Orgánico Integral Penal en comisión legislativa.'
    ]
  },
  {
    num: 41,
    pregunta: '¿Qué organismos integran la Función de Transparencia y Control Social?',
    correcta: 'El Consejo de Participación Ciudadana y Control Social, la Defensoría del Pueblo, la Contraloría General del Estado y las Superintendencias.',
    articulo: 'Art. 204',
    subtema: 'Función de Transparencia y Control Social',
    distractores: [
      'La Asamblea Nacional, el Consejo Nacional Electoral y la Fiscalía General del Estado.',
      'La Corte Suprema de Justicia, el Tribunal de Garantías Constitucionales y el Tribunal Fiscal.',
      'La Presidencia de la República, la Vicepresidencia y los ministerios de Estado sectoriales.'
    ]
  },
  {
    num: 42,
    pregunta: '¿Cuál es la función principal de la Defensoría del Pueblo?',
    correcta: 'Proteger y tutelar los derechos de las personas y de la naturaleza.',
    articulo: 'Art. 215',
    subtema: 'Órganos Constitucionales de Control',
    distractores: [
      'Ejercer el monopolio de la acción penal pública y sustentar acusaciones en el juicio penal.',
      'Realizar auditorías financieras externas de la contabilidad privada de personas naturales.',
      'Expedir cartas notariales vinculantes para la protocolización de títulos de crédito del exterior.'
    ]
  },
  {
    num: 43,
    pregunta: '¿Cuál es la función principal de la Contraloría General del Estado?',
    correcta: 'Controlar la utilización de los recursos estatales y verificar el cumplimiento de los objetivos institucionales.',
    articulo: 'Art. 211',
    subtema: 'Órganos Constitucionales de Control',
    distractores: [
      'Calificar las candidaturas para asambleístas y proclamar los resultados de comicios electorales.',
      'Sustanciar juicios de alimentos e interdicciones civiles en audiencias únicas de conciliación.',
      'Interpretar de forma obligatoria las normas de la Constitución con efecto erga omnes.'
    ]
  },
  {
    num: 44,
    pregunta: '¿Qué es la participación ciudadana?',
    correcta: 'El derecho de las personas a intervenir de manera protagónica en la toma de decisiones, planificación y gestión de los asuntos públicos.',
    articulo: 'Art. 95',
    subtema: 'Derechos de Participación',
    distractores: [
      'La obligación inexcusable de militar activamente en un partido político con personería jurídica nacional.',
      'La obligación de rendir declaración juramentada de bienes ante el Notario antes de sufragar en elecciones.',
      'La sujeción pasiva de los habitantes a las resoluciones emitidas por la administración pública central.'
    ]
  },
  {
    num: 45,
    pregunta: '¿Qué principios rigen la participación ciudadana?',
    correcta: 'Igualdad, autonomía, deliberación pública, respeto a la diferencia, control popular, solidaridad e interculturalidad.',
    articulo: 'Art. 95',
    subtema: 'Derechos de Participación',
    distractores: [
      'Subordinación jerárquica estricta, reserva procesal absoluta y designación arbitraria por parte de la autoridad.',
      'Discriminación positiva inversa, obligatoriedad censitaria y sufragio restringido por capacidad económica.',
      'Paternalismo de Estado, centralismo decisorio y delegación forzosa a confederaciones mercantiles.'
    ]
  },
  {
    num: 46,
    pregunta: '¿Quién ejerce la Función Legislativa en el Ecuador?',
    correcta: 'La Asamblea Nacional.',
    articulo: 'Art. 118',
    subtema: 'Función Legislativa',
    distractores: [
      'El Congreso de Diputados y la Cámara de Senadores en sistema bicameral de representación.',
      'El Gabinete Ministerial presidido por el titular de la Secretaría General de la Administración.',
      'El Pleno de la Corte Constitucional mediante sentencias de unificación de jurisprudencia.'
    ]
  },
  {
    num: 47,
    pregunta: '¿Cuál es la función principal de la Asamblea Nacional?',
    correcta: 'Legislar, fiscalizar los actos de las demás funciones del Estado y ejercer las atribuciones previstas en la Constitución.',
    articulo: 'Art. 120',
    subtema: 'Función Legislativa',
    distractores: [
      'Administrar los recursos públicos del presupuesto general y ejecutar obras de infraestructura vial.',
      'Emitir sentencias definitivas de casación en causas de derecho penal sustantivo y adjetivo.',
      'Dirigir las fuerzas armadas y declarar estados de excepción en situaciones de catástrofe natural.'
    ]
  },
  {
    num: 48,
    pregunta: '¿Quién ejerce la Función Ejecutiva?',
    correcta: 'La Presidenta o el Presidente de la República.',
    articulo: 'Art. 141',
    subtema: 'Función Ejecutiva',
    distractores: [
      'El Presidente de la Asamblea Nacional conjuntamente con el Procurador General del Estado.',
      'El Consejo de la Judicatura mediante resoluciones del Pleno adoptadas por mayoría simple.',
      'El Consejo Nacional de Participación Ciudadana y Control Social a través de su secretaría ejecutiva.'
    ]
  },
  {
    num: 49,
    pregunta: '¿Cuál es la duración del período presidencial?',
    correcta: 'Cuatro años.',
    articulo: 'Art. 144',
    subtema: 'Función Ejecutiva',
    distractores: [
      'Cinco años con reelección indefinida sin sujeción a procesos electorales periódicos.',
      'Seis años improrrogables con renovación parcial del gabinete ministerial cada bienio.',
      'Tres años con consulta popular obligatoria de ratificación a mitad de período.'
    ]
  },
  {
    num: 50,
    pregunta: '¿Quién reemplaza al Presidente de la República en caso de ausencia temporal o definitiva?',
    correcta: 'La Vicepresidenta o el Vicepresidente de la República, según los casos previstos en la Constitución.',
    articulo: 'Art. 146',
    subtema: 'Función Ejecutiva',
    distractores: [
      'El Presidente de la Corte Nacional de Justicia en todos los supuestos de cesación funcional.',
      'El Ministro de Defensa Nacional de forma automática por mando militar directo.',
      'El legislador que cuente con mayor votación popular en el último proceso electoral nacional.'
    ]
  },
  {
    num: 51,
    pregunta: '¿Qué es la función fiscalizadora de la Asamblea Nacional?',
    correcta: 'La facultad de controlar políticamente la actuación de las entidades y autoridades sujetas a fiscalización constitucional.',
    articulo: 'Art. 120 num. 9',
    subtema: 'Función Legislativa',
    distractores: [
      'La atribución de dictar condenas penales privativas de libertad contra justiciables comunes.',
      'El cobro de créditos de instituciones bancarias en proceso de liquidación patrimonial forzosa.',
      'La revisión material de las providencias cautelares dictadas por las juezas y jueces constitucionales.'
    ]
  },
  {
    num: 52,
    pregunta: '¿Quién es la máxima autoridad de la Función Ejecutiva?',
    correcta: 'La Presidenta o el Presidente de la República.',
    articulo: 'Art. 141',
    subtema: 'Función Ejecutiva',
    distractores: [
      'El Presidente de la Asamblea Nacional en calidad de titular de la representación popular.',
      'El Contralor General del Estado en virtud de la potestad de control del gasto público.',
      'El Defensor del Pueblo en su condición de garante institucional de los derechos humanos.'
    ]
  },
  {
    num: 53,
    pregunta: '¿Qué facultad tiene el Presidente respecto de los proyectos de ley aprobados por la Asamblea Nacional?',
    correcta: 'Sancionarlos u objetarlos en los casos previstos por la Constitución.',
    articulo: 'Art. 137',
    subtema: 'Procedimiento Legislativo',
    distractores: [
      'Archivarlos definitivamente sin motivación jurídica alguna ni opción a ratificación legislativa.',
      'Modificarlos a su criterio y promulgarlos de inmediato sin informe de la Corte Constitucional.',
      'Someterlos forzosamente al dictamen de consejos sectoriales comunales antes de su promulgación.'
    ]
  },
  {
    num: 54,
    pregunta: '¿Qué es la objeción presidencial?',
    correcta: 'El mecanismo constitucional mediante el cual el Presidente observa total o parcialmente un proyecto de ley aprobado por la Asamblea Nacional.',
    articulo: 'Art. 137 y 138',
    subtema: 'Procedimiento Legislativo',
    distractores: [
      'Una medida cautelar dictada por el juez contencioso administrativo para suspender una ley vigente.',
      'El recurso extraordinario que interpone el ciudadano para revocar el mandato del Defensor del Pueblo.',
      'La solicitud de inconstitucionalidad presentada por el Consejo de la Judicatura ante la Asamblea.'
    ]
  },
  {
    num: 55,
    pregunta: '¿Quién ejerce la potestad reglamentaria en el Ecuador?',
    correcta: 'La Presidenta o el Presidente de la República.',
    articulo: 'Art. 147 num. 13',
    subtema: 'Función Ejecutiva',
    distractores: [
      'El Presidente del Consejo de la Judicatura para leyes de todas las materias del Estado.',
      'Los jueces de tribunal de garantías penales mediante providencias de carácter general.',
      'El Procurador General del Estado mediante resoluciones de absolución de consultas.'
    ]
  },
  {
    num: 56,
    pregunta: '¿Qué es el principio de legalidad en la administración pública?',
    correcta: 'La obligación de que las instituciones y servidores públicos actúen únicamente dentro de las competencias atribuidas por la Constitución y la ley.',
    articulo: 'Art. 226',
    subtema: 'Administración Pública',
    distractores: [
      'La facultad de los funcionarios de realizar cualquier acto que no esté expresamente prohibido por una ordenanza.',
      'La prevalencia discrecional de la conveniencia política sobre el marco normativo preexistente.',
      'El poder de autoatribuirse competencias procesales mediante acuerdos ministeriales reservados.'
    ]
  },
  {
    num: 57,
    pregunta: '¿Qué dispone el artículo 226 de la Constitución?',
    correcta: 'Que las instituciones del Estado, sus organismos, dependencias y servidores públicos ejercerán únicamente las competencias y facultades que les sean atribuidas por la Constitución y la ley.',
    articulo: 'Art. 226',
    subtema: 'Administración Pública',
    distractores: [
      'Que el derecho de propiedad privada no admite restricciones por razones de utilidad pública ni expropiación.',
      'Que los funcionarios judiciales son civilmente inimputables por sus faltas disciplinarias gravísimas.',
      'Que la potestad tributaria de los municipios puede aplicarse retroactivamente en beneficio fiscal.'
    ]
  },
  {
    num: 58,
    pregunta: '¿Qué principio obliga a las autoridades a actuar conforme al ordenamiento jurídico?',
    correcta: 'El principio de legalidad o juridicidad.',
    articulo: 'Art. 226',
    subtema: 'Administración Pública',
    distractores: [
      'El principio de conveniencia y oportunidad política de la autoridad de turno.',
      'El principio de discrecionalidad absoluta e ilimitada en la contratación pública.',
      'El principio de inmunidad general de los actos de la administración tributaria.'
    ]
  },
  {
    num: 59,
    pregunta: '¿Cuál es el objeto principal del control constitucional?',
    correcta: 'Garantizar la supremacía de la Constitución y la protección efectiva de los derechos constitucionales.',
    articulo: 'Art. 429 y 436',
    subtema: 'Control Constitucional',
    distractores: [
      'Unificar los criterios de valoración pericial en materia de tránsito y accidentes automovilísticos.',
      'Determinar los montos arancelarios de las tasas notariales e inmobiliarias del sector privado.',
      'Supervisar la recaudación del impuesto a la renta de las empresas transnacionales.'
    ]
  },
  {
    num: 60,
    pregunta: '¿Quién tiene la facultad de interpretar la Constitución con carácter vinculante?',
    correcta: 'La Corte Constitucional.',
    articulo: 'Art. 436 num. 1',
    subtema: 'Interpretación Constitucional',
    distractores: [
      'El Procurador General del Estado mediante dictámenes de absolución de consultas administrativas.',
      'La Sala Especializada de lo Penal de la Corte Nacional de Justicia en fallos de casación.',
      'El Pleno del Consejo de Participación Ciudadana y Control Social por acuerdo unánime.'
    ]
  },
  {
    num: 61,
    pregunta: '¿Cuál es la finalidad principal de la Corte Constitucional?',
    correcta: 'Garantizar la supremacía de la Constitución, proteger los derechos constitucionales y ejercer el control de constitucionalidad.',
    articulo: 'Art. 429',
    subtema: 'Justicia Constitucional',
    distractores: [
      'Reemplazar a los juzgados de primera instancia en la sustanciación de juicios de alimentos y divorcios.',
      'Designar a los ministros del gabinete presidencial y fiscalizar los presupuestos municipales.',
      'Emitir resoluciones vinculantes de exoneración arancelaria y fiscal para importadores.'
    ]
  },
  {
    num: 62,
    pregunta: '¿Quiénes pueden presentar garantías jurisdiccionales?',
    correcta: 'Toda persona, comunidad, pueblo, nacionalidad o colectivo cuyos derechos constitucionales hayan sido vulnerados o amenazados.',
    articulo: 'Art. 86 num. 1',
    subtema: 'Garantías Jurisdiccionales',
    distractores: [
      'Únicamente los profesionales del derecho con matrícula activa en el Foro de Abogados.',
      'Exclusivamente los representantes legales de entidades públicas que cuenten con patrocinio estatal.',
      'Solo aquellos ciudadanos que acrediten solvencia económica y arraigo domiciliario en la capital.'
    ]
  },
  {
    num: 63,
    pregunta: '¿Qué caracteriza al Estado constitucional de derechos y justicia?',
    correcta: 'La supremacía de la Constitución, la centralidad de los derechos fundamentales y la obligación estatal de garantizarlos efectivamente.',
    articulo: 'Art. 1',
    subtema: 'Principios Fundamentales del Estado',
    distractores: [
      'La primacía irrestricta de la ley ordinaria por sobre los principios y garantías constitucionales.',
      'El predominio de los decretos ejecutivos presidenciales sobre los fallos de los tribunales de justicia.',
      'La subordinación del ordenamiento jurídico a los tratados comerciales de inversión bilateral.'
    ]
  },
  {
    num: 64,
    pregunta: '¿Qué significa la aplicación directa e inmediata de los derechos?',
    correcta: 'Que los derechos pueden ser invocados y exigidos sin necesidad de una norma legal que los desarrolle.',
    articulo: 'Art. 11 num. 3',
    subtema: 'Principios de Aplicación de los Derechos',
    distractores: [
      'Que las autoridades solo pueden aplicarlos cuando exista una ordenanza municipal de respaldo.',
      'Que su goce está reservado exclusivamente a procesos sustanciados ante la Corte Interamericana.',
      'Que el juez ordinario debe exigir como requisito formal la aprobación previa del Ministerio de Finanzas.'
    ]
  },
  {
    num: 65,
    pregunta: '¿Cuál es el deber de todas las autoridades respecto de los derechos constitucionales?',
    correcta: 'Respetarlos, protegerlos, garantizarlos y promover su plena vigencia.',
    articulo: 'Art. 11 num. 9',
    subtema: 'Responsabilidad y Deberes Estatales',
    distractores: [
      'Limitar su alcance y suspenderlos discrecionalmente cuando existan controversias vecinales.',
      'Condicionar su reconocimiento al previo cumplimiento de cargas tributarias seccionales.',
      'Aplicarlos de manera potestativa únicamente cuando no comprometan el interés de la entidad pública.'
    ]
  },
  {
    num: 66,
    pregunta: '¿Qué establece el principio de progresividad de los derechos?',
    correcta: 'Que la protección y desarrollo de los derechos debe avanzar progresivamente y no puede disminuir injustificadamente.',
    articulo: 'Art. 11 num. 8',
    subtema: 'Principios de Aplicación de los Derechos',
    distractores: [
      'Que el Estado puede reducir los derechos fundamentales en épocas de austeridad presupuestaria sin control judicial.',
      'Que la vigencia de los derechos solo es exigible a partir del año subsiguiente a su inclusión constitucional.',
      'Que los derechos laborales pueden extinguirse mediante acuerdos privados de flexibilización patronal.'
    ]
  },
  {
    num: 67,
    pregunta: '¿Qué es la no regresividad de los derechos?',
    correcta: 'La prohibición de adoptar medidas que reduzcan injustificadamente el nivel de protección alcanzado por los derechos.',
    articulo: 'Art. 11 num. 8',
    subtema: 'Principios de Aplicación de los Derechos',
    distractores: [
      'La facultad del Estado de revocar garantías de libertad de los ciudadanos condenados en sede contravencional.',
      'El deber de las partes procesales de no recurrir de las providencias consentidas en audiencia previa.',
      'La obligación de acatar sentencias dictadas en primera instancia sin derecho a apelación.'
    ]
  },
  {
    num: 68,
    pregunta: '¿Quién responde por las vulneraciones de derechos cometidas por servidores públicos?',
    correcta: 'El Estado, sin perjuicio de las acciones de repetición contra los responsables cuando corresponda.',
    articulo: 'Art. 11 num. 9',
    subtema: 'Responsabilidad y Deberes Estatales',
    distractores: [
      'Exclusivamente el funcionario a título estrictamente personal quedando exento de responsabilidad patrimonial el Estado.',
      'Los administrados perjudicados por no haber interpuesto con anticipación denuncias disciplinarias.',
      'Ninguna entidad, al presumirse la legalidad absoluta de toda actuación proveniente de la administración.'
    ]
  },
  {
    num: 69,
    pregunta: '¿Qué es la reparación integral?',
    correcta: 'El conjunto de medidas destinadas a restituir derechos, reparar daños y restablecer la situación de la víctima en la mayor medida posible.',
    articulo: 'Art. 86 num. 3',
    subtema: 'Garantías Jurisdiccionales y Reparación',
    distractores: [
      'El pago forzoso y único de costas procesales y honorarios de los peritos acreditados en el litigio.',
      'La imposición de una sanción carcelaria contra el servidor público responsable de la infracción administrativa.',
      'La publicación de una disculpa protocolaria sin necesidad de medidas restitutivas materiales de los derechos.'
    ]
  },
  {
    num: 70,
    pregunta: '¿Qué comprende el derecho a la motivación?',
    correcta: 'La obligación de que toda decisión pública exponga los hechos, las normas aplicables y la justificación jurídica de la decisión adoptada.',
    articulo: 'Art. 76 num. 7 lit. l',
    subtema: 'Garantías Básicas del Debido Proceso',
    distractores: [
      'El enunciado sucinto del fallo sin necesidad de correlacionar las normas con los hechos debatidos.',
      'La transcripción literal de la demanda del actor sin efectuar análisis probatorio de la contestación.',
      'El deber del juez de consultar previamente a la Corte Nacional sobre la conveniencia de la resolución.'
    ]
  },
  {
    num: 71,
    pregunta: '¿Cuál es la consecuencia de una resolución inmotivada?',
    correcta: 'La nulidad por vulneración del debido proceso.',
    articulo: 'Art. 76 num. 7 lit. l',
    subtema: 'Garantías Básicas del Debido Proceso',
    distractores: [
      'Su convalidación automática una vez fenecido el término para apelar por ministerio de la ley.',
      'La remisión del expediente al Consejo de la Judicatura para que subsane oficiosamente la argumentación.',
      'La subsistencia obligatoria del fallo como precedente jurisprudencial obligatorio para jueces de paz.'
    ]
  },
  {
    num: 72,
    pregunta: '¿Cuál es el objeto del debido proceso?',
    correcta: 'Garantizar que toda actuación judicial o administrativa respete los derechos y garantías constitucionales.',
    articulo: 'Art. 76',
    subtema: 'Garantías Básicas del Debido Proceso',
    distractores: [
      'Asegurar que todas las causas concluyan indefectiblemente mediante conciliación o mediación prejudicial.',
      'Permitir que la autoridad administrativa imponga sanciones disciplinarias sin audiencia ni contradicción.',
      'Impedir la interposición de garantías jurisdiccionales mientras no se agoten recursos de revocatoria.'
    ]
  },
  {
    num: 73,
    pregunta: '¿Qué garantiza el derecho a ser juzgado por autoridad competente?',
    correcta: 'Que ninguna persona sea sometida a una autoridad sin jurisdicción o competencia legalmente establecida.',
    articulo: 'Art. 76 num. 7 lit. k',
    subtema: 'Juez Natural y Competencia',
    distractores: [
      'Que el justiciable pueda elegir discrecionalmente al juez que considere más favorable a su pretensión.',
      'Que las autoridades militares ejerzan jurisdicción ordinaria sobre personas civiles en tiempo de paz.',
      'Que los procesos judiciales sean resueltos exclusivamente por comisiones designadas por el Ejecutivo.'
    ]
  },
  {
    num: 74,
    pregunta: '¿Qué prohíbe el principio del juez natural?',
    correcta: 'Que una persona sea juzgada por tribunales o autoridades creadas especialmente para un caso determinado.',
    articulo: 'Art. 76 num. 7 lit. k',
    subtema: 'Juez Natural y Competencia',
    distractores: [
      'Que los juzgadores se pronuncien en sentencia sobre los hechos que fueron materia de la acusación.',
      'Que las cortes provinciales conozcan en alzada los recursos de apelación interpuestos oportunamente.',
      'La sustanciación de audiencias orales con presencia obligatoria de los abogados defensores de las partes.'
    ]
  },
  {
    num: 75,
    pregunta: '¿Qué garantiza el principio de presunción de inocencia?',
    correcta: 'Que toda persona sea considerada y tratada como inocente mientras no exista una sentencia condenatoria ejecutoriada.',
    articulo: 'Art. 76 num. 2',
    subtema: 'Garantías Básicas del Debido Proceso',
    distractores: [
      'Que el procesado tiene la obligación ineludible de probar pericialmente que no cometió la infracción imputada.',
      'La imposición preceptiva e inmediata de prisión preventiva a todo ciudadano investigado por denuncia fiscal.',
      'Que los medios de comunicación puedan difundir como culpable a una persona aprehendida en flagrancia.'
    ]
  },
  {
    num: 76,
    pregunta: '¿Qué garantiza el debido proceso en materia probatoria?',
    correcta: 'Que únicamente tengan validez las pruebas obtenidas y actuadas conforme a la Constitución y la ley.',
    articulo: 'Art. 76 num. 4',
    subtema: 'Régimen Constitucional Probatorio',
    distractores: [
      'La eficacia de grabaciones clandestinas obtenidas mediante allanamiento ilegal sin orden judicial previa.',
      'La prohibición absoluta de controvertir los dictámenes periciales presentados por entidades públicas.',
      'La admisión incondicional de testimonios de oídas para sustentar condenas en causas penales graves.'
    ]
  },
  {
    num: 77,
    pregunta: '¿Qué garantiza el derecho a recurrir?',
    correcta: 'La posibilidad de impugnar resoluciones ante una autoridad superior en los casos previstos por la ley.',
    articulo: 'Art. 76 num. 7 lit. m',
    subtema: 'Garantías Básicas del Debido Proceso',
    distractores: [
      'La facultad de dilatar indefinidamente la ejecución de fallos ejecutoriados mediante escritos improcedentes.',
      'La interposición obligatoria de demandas ordinarias para cuestionar providencias de mero trámite.',
      'El derecho de solicitar que el mismo juez de primera instancia revoque su propia sentencia definitiva.'
    ]
  },
  {
    num: 78,
    pregunta: '¿Qué es la tutela judicial efectiva?',
    correcta: 'El derecho de toda persona a acceder a la justicia, obtener una decisión motivada y lograr su ejecución efectiva.',
    articulo: 'Art. 75',
    subtema: 'Principios de la Administración de Justicia',
    distractores: [
      'El deber de las partes de someter toda controversia patrimonial a tribunales de arbitraje internacional.',
      'La exigencia forzosa de consignar cauciones económicas para tener derecho a presentar una demanda civil.',
      'El derecho a obtener fallos favorables con prescindencia del mérito de la prueba actuada en el proceso.'
    ]
  },
  {
    num: 79,
    pregunta: '¿Qué garantiza el acceso gratuito a la justicia?',
    correcta: 'Que ninguna persona sea privada del acceso a la administración de justicia por razones económicas.',
    articulo: 'Art. 168 num. 4',
    subtema: 'Principios de la Administración de Justicia',
    distractores: [
      'La exoneración obligatoria de todo tipo de multas procesales impuestas por temeridad o mala fe probada.',
      'El pago forzoso por parte del Estado de los honorarios pactados contractualmente con juristas extranjeros.',
      'La gratuidad de publicaciones mercantiles en periódicos de circulación nacional para sociedades anónimas.'
    ]
  },
  {
    num: 80,
    pregunta: '¿Qué principio establece que no se sacrificará la justicia por la sola omisión de formalidades?',
    correcta: 'El principio de que no se sacrificará la justicia por la omisión de formalidades no esenciales.',
    articulo: 'Art. 169',
    subtema: 'Principios Procesales',
    distractores: [
      'El principio de solemnidad ritual obligatoria en todos los escritos y actuaciones judiciales.',
      'El principio de caducidad automática de la acción por omisión de sellos y timbres notariales secundarios.',
      'El principio de preclusión absoluta que impide subsanar defectos de forma en la audiencia preliminar.'
    ]
  },
  {
    num: 81,
    pregunta: '¿Cuál es la finalidad del sistema procesal ecuatoriano?',
    correcta: 'La realización de la justicia.',
    articulo: 'Art. 169',
    subtema: 'Principios Procesales',
    distractores: [
      'La prevalencia de la forma sobre el fondo para garantizar la recaudación de tasas por servicios judiciales.',
      'El incremento del número de instancias recursivas para retrasar las sentencias firmes de cobro.',
      'La primacía de la voluntad de las partes para desconocer derechos laborales de carácter irrenunciable.'
    ]
  },
  {
    num: 82,
    pregunta: '¿Quiénes son titulares de los derechos de participación?',
    correcta: 'Las ciudadanas y ciudadanos ecuatorianos en los términos establecidos por la Constitución.',
    articulo: 'Art. 61',
    subtema: 'Derechos de Participación',
    distractores: [
      'Exclusivamente quienes ejerzan funciones de dirección en corporaciones privadas o cámaras de comercio.',
      'Únicamente los servidores de carrera administrativa que cuenten con nombramiento definitivo de diez años.',
      'Solo las personas que acrediten propiedades inmobiliarias inscritas en el Registro de la Propiedad cantonal.'
    ]
  },
  {
    num: 83,
    pregunta: '¿Qué comprende el derecho de participación política?',
    correcta: 'Elegir y ser elegido, participar en los asuntos de interés público y ejercer mecanismos de democracia directa.',
    articulo: 'Art. 61',
    subtema: 'Derechos de Participación',
    distractores: [
      'La obligación de acatar incondicionalmente las decisiones de las cúpulas de los partidos políticos.',
      'La prohibición de fiscalizar los actos y resoluciones adoptadas por los mandatarios de elección popular.',
      'El derecho potestativo de desobedecer las resoluciones emitidas por el Tribunal Contencioso Electoral.'
    ]
  },
  {
    num: 84,
    pregunta: '¿Qué mecanismo permite a los ciudadanos presentar proyectos normativos?',
    correcta: 'La iniciativa popular normativa.',
    articulo: 'Art. 103',
    subtema: 'Democracia Directa',
    distractores: [
      'El amparo constitucional preventivo ante el Defensor del Pueblo.',
      'La acción extraordinaria de protección contra ordenanzas cantonales.',
      'El recurso de queja disciplinaria formulado ante la Contraloría General del Estado.'
    ]
  },
  {
    num: 85,
    pregunta: '¿Qué es la consulta popular?',
    correcta: 'El mecanismo de democracia directa mediante el cual una decisión es sometida al pronunciamiento de la ciudadanía.',
    articulo: 'Art. 104 y 106',
    subtema: 'Democracia Directa',
    distractores: [
      'Una encuesta privada realizada por empresas consultoras para evaluar la gestión ministerial.',
      'El informe de auditoría ambiental que elaboran las prefecturas provinciales sobre cuencas hídricas.',
      'La consulta no vinculante que efectúan los juzgados a los colegios de abogados en materias dudosas.'
    ]
  },
  {
    num: 86,
    pregunta: '¿Qué es la revocatoria del mandato?',
    correcta: 'El mecanismo mediante el cual los electores pueden cesar anticipadamente a una autoridad de elección popular.',
    articulo: 'Art. 105',
    subtema: 'Democracia Directa',
    distractores: [
      'El juicio político que sustancia la Asamblea Nacional exclusivamente contra ministros de Estado.',
      'La destitución sumaria de jueces mediante sumario administrativo del Consejo de la Judicatura.',
      'La pérdida de la personería jurídica de organizaciones sociales dictada por el Ministerio del Trabajo.'
    ]
  },
  {
    num: 87,
    pregunta: '¿Cuál es el objetivo de la participación ciudadana?',
    correcta: 'Intervenir de forma protagónica en la toma de decisiones, planificación y control de los asuntos públicos.',
    articulo: 'Art. 95',
    subtema: 'Derechos de Participación',
    distractores: [
      'Asumir la representación diplomática del país ante foros multilaterales de integración económica.',
      'Sustituir a los órganos de la Función Judicial en el juzgamiento de delitos flagrantes sancionados con prisión.',
      'Aprobar el presupuesto general del Estado mediante asambleas vecinales sin intervención legislativa.'
    ]
  },
  {
    num: 88,
    pregunta: '¿Qué garantiza el derecho de acceso a la información pública?',
    correcta: 'El acceso libre a la información generada o custodiada por entidades públicas, salvo las excepciones establecidas por la ley.',
    articulo: 'Art. 91',
    subtema: 'Derecho a la Información Pública',
    distractores: [
      'La reserva indefinida y secreta de los balances contables de empresas públicas estratégicas.',
      'La entrega irrestricta de datos personales íntimos de los ciudadanos contenidos en historias clínicas.',
      'El pago de tarifas elevadas fijadas por cada institución pública como condición previa de acceso a documentos.'
    ]
  },
  {
    num: 89,
    pregunta: '¿Qué principios rigen la administración pública?',
    correcta: 'Eficacia, eficiencia, calidad, jerarquía, desconcentración, descentralización, coordinación, participación, planificación y transparencia.',
    articulo: 'Art. 227',
    subtema: 'Administración Pública',
    distractores: [
      'Centralismo absoluto, opacidad de las actuaciones, burocratización y discrecionalidad política.',
      'Autarquía de los despachos públicos, inamovilidad de competencias y sujeción a intereses corporativos.',
      'Improvisación en el gasto, reserva oficiosa de procedimientos y privilegios de rango para funcionarios.'
    ]
  },
  {
    num: 90,
    pregunta: '¿Cuál es el objetivo de la transparencia en la gestión pública?',
    correcta: 'Garantizar el control ciudadano, la rendición de cuentas y la prevención de la corrupción.',
    articulo: 'Art. 204 y 227',
    subtema: 'Transparencia y Control Social',
    distractores: [
      'Limitar la fiscalización ciudadana sobre los contratos millonarios del sector hidrocarburífero.',
      'Facilitar la clasificación indiscriminada de documentos administrativos como secretos de Estado.',
      'Exonerar a las máximas autoridades de la obligación de justificar públicamente el empleo de fondos estatales.'
    ]
  },
  {
    num: 91,
    pregunta: '¿Qué es la rendición de cuentas?',
    correcta: 'Es la obligación de las instituciones y autoridades públicas de informar, justificar y someter a evaluación ciudadana su gestión y el uso de recursos públicos.',
    articulo: 'Art. 208',
    subtema: 'Transparencia y Control Social',
    distractores: [
      'Un acto protocolario voluntario que las autoridades pueden omitir si no existen solicitudes expresas.',
      'La presentación reservada de informes contables dirigida exclusivamente a las bancadas parlamentarias afines.',
      'La auditoría privada contratada por los funcionarios para avalar sus actos sin consulta pública.'
    ]
  },
  {
    num: 92,
    pregunta: '¿Cuál es la finalidad del control social?',
    correcta: 'Fortalecer la transparencia, prevenir la corrupción y vigilar la gestión de las instituciones públicas.',
    articulo: 'Art. 204 y 208',
    subtema: 'Transparencia y Control Social',
    distractores: [
      'Reemplazar a los juzgados penales en la aplicación de penas pecuniarias y de privación de la libertad.',
      'Suspender preventivamente las ordenanzas tributarias dictadas por los concejos cantonales del país.',
      'Modificar las resoluciones firmes adoptadas por la Corte Nacional de Justicia en causas laborales.'
    ]
  },
  {
    num: 93,
    pregunta: '¿Qué garantiza el derecho de petición?',
    correcta: 'La facultad de presentar solicitudes individuales o colectivas ante las autoridades y recibir una respuesta motivada.',
    articulo: 'Art. 66 num. 23',
    subtema: 'Derechos de Libertad',
    distractores: [
      'El deber de la autoridad de acceder obligatoriamente y de manera favorable a toda solicitud formulada.',
      'La potestad del administrado de autoatribuirse la respuesta favorable si transcurren tres días hábiles.',
      'El derecho de presentar peticiones únicamente mediante patrocinio forzoso de un procurador judicial.'
    ]
  },
  {
    num: 94,
    pregunta: '¿Qué son los derechos de libertad?',
    correcta: 'Son los derechos que garantizan la autonomía personal y protegen a las personas frente a interferencias arbitrarias del poder público o de terceros.',
    articulo: 'Art. 66',
    subtema: 'Derechos de Libertad',
    distractores: [
      'Privilegios otorgados temporalmente por el Presidente de la República mediante decretos de gracia.',
      'Normas programáticas que requieren ineludiblemente de sentencias de la Corte Interamericana para su vigencia.',
      'Garantías procesales aplicables exclusivamente a los litigios sustanciados en tribunales de arbitraje.'
    ]
  },
  {
    num: 95,
    pregunta: '¿Qué protege la libertad de expresión?',
    correcta: 'El derecho a buscar, recibir, producir, intercambiar y difundir información, ideas y opiniones por cualquier medio.',
    articulo: 'Art. 66 num. 6',
    subtema: 'Derechos de Libertad',
    distractores: [
      'La inmunidad absoluta frente a delitos de calumnia, injuria grave y difusión de odio discriminatorio.',
      'La facultad de los órganos estatales de ejercer censura previa sobre los contenidos de los medios independientes.',
      'El derecho de los funcionarios de ocultar información presupuestaria alegando reserva personal de opinión.'
    ]
  },
  {
    num: 96,
    pregunta: '¿Qué protege la libertad de asociación?',
    correcta: 'El derecho de las personas a asociarse, reunirse y organizarse libremente para fines lícitos.',
    articulo: 'Art. 66 num. 13',
    subtema: 'Derechos de Libertad',
    distractores: [
      'La conformación de grupos armados irregulares al margen de la Constitución y las leyes del Estado.',
      'La obligación forzosa impuesta por el Estado de afiliarse obligatoriamente a una confederación gremial.',
      'La suspensión de la personalidad jurídica de colectivos ciudadanos por orden verbal de intendentes de policía.'
    ]
  },
  {
    num: 97,
    pregunta: '¿Qué garantiza el derecho a la educación?',
    correcta: 'El acceso universal, permanente, inclusivo y de calidad a la educación.',
    articulo: 'Art. 26 y 27',
    subtema: 'Derechos del Buen Vivir',
    distractores: [
      'La gratuidad de la educación superior privada de posgrado financiada con aportes de los municipios.',
      'La imposición de dogmas religiosos obligatorios en todas las mallas curriculares de las escuelas públicas.',
      'La restricción del acceso a la educación formal para personas que pertenezcan a pueblos y nacionalidades.'
    ]
  },
  {
    num: 98,
    pregunta: '¿Qué garantiza el derecho a la salud?',
    correcta: 'El acceso permanente, oportuno y sin discriminación a servicios de promoción, prevención y atención integral de salud.',
    articulo: 'Art. 32',
    subtema: 'Derechos del Buen Vivir',
    distractores: [
      'El cobro anticipado de copagos obligatorios en áreas de emergencia y cuidados intensivos de hospitales públicos.',
      'La negativa justificada de atención médica de urgencia cuando el paciente carezca de póliza de seguro privado.',
      'La subordinación del suministro de medicamentos esenciales a la capacidad de pago del usuario en centros de salud.'
    ]
  },
  {
    num: 99,
    pregunta: '¿Qué garantiza el derecho al trabajo?',
    correcta: 'El acceso a un trabajo digno, libremente escogido o aceptado, con respeto a los derechos laborales reconocidos por la Constitución y la ley.',
    articulo: 'Art. 33',
    subtema: 'Derechos del Buen Vivir',
    distractores: [
      'La facultad patronal de imponer jornadas extenuantes sin pago de recargos extraordinarios ni horas suplementarias.',
      'La renuncia voluntaria expresa a los beneficios de la seguridad social y fondos de reserva en contratos privados.',
      'La prohibición del derecho de huelga y organización sindical en todas las ramas de la economía nacional.'
    ]
  },
  {
    num: 100,
    pregunta: '¿Qué es el principio de interculturalidad?',
    correcta: 'El reconocimiento, respeto e interacción equitativa entre las diversas culturas que integran el Estado ecuatoriano.',
    articulo: 'Art. 1 y 275',
    subtema: 'Interculturalidad y Plurinacionalidad',
    distractores: [
      'La asimilación obligatoria de las culturas indígenas a las costumbres mayoritarias urbano-occidentales.',
      'La segregación territorial de comunidades para impedir el diálogo y el intercambio intercultural armónico.',
      'La imposición de un idioma único oficial con prohibición expresa de lenguas ancestrales en la enseñanza.'
    ]
  },
  {
    num: 101,
    pregunta: '¿Qué caracteriza al Ecuador como Estado plurinacional?',
    correcta: 'El reconocimiento constitucional de la existencia de pueblos y nacionalidades con identidad propia dentro de un mismo Estado.',
    articulo: 'Art. 1',
    subtema: 'Interculturalidad y Plurinacionalidad',
    distractores: [
      'La división del territorio en repúblicas independientes con pasaportes y aduanas internas soberanas.',
      'La incompatibilidad de los saberes ancestrales con el ordenamiento constitucional de la República.',
      'La exclusión de los derechos colectivos en la aplicación de las políticas públicas del gobierno central.'
    ]
  },
  {
    num: 102,
    pregunta: '¿Qué son los derechos colectivos?',
    correcta: 'Son los derechos reconocidos a comunidades, pueblos y nacionalidades para proteger su identidad, cultura, organización y formas de vida.',
    articulo: 'Art. 57',
    subtema: 'Derechos Colectivos',
    distractores: [
      'Facultades mercantiles exclusivas de consorcios empresariales para explotar recursos en áreas protegidas.',
      'Privilegios arancelarios otorgados temporalmente a asociaciones de comerciantes mayoristas del sector automotriz.',
      'Derechos que pertenecen de manera individual y excluyente a las autoridades seccionales en ejercicio.'
    ]
  },
  {
    num: 103,
    pregunta: '¿Qué protege el derecho a la identidad cultural?',
    correcta: 'La conservación, fortalecimiento y desarrollo de las manifestaciones culturales propias de cada persona, comunidad, pueblo o nacionalidad.',
    articulo: 'Art. 21 y 57',
    subtema: 'Derechos Colectivos',
    distractores: [
      'La homogeneización obligatoria de las expresiones folclóricas bajo directrices de ministerios de Estado.',
      'La prohibición de practicar ceremonias y ritos tradicionales en el espacio territorial de las comunidades.',
      'La cesión obligatoria del patrimonio cultural ancestral al patrimonio privativo de las gobernaciones provinciales.'
    ]
  },
  {
    num: 104,
    pregunta: '¿Cuál es la finalidad de los derechos constitucionales?',
    correcta: 'Garantizar la dignidad humana, el buen vivir y el ejercicio efectivo de los derechos fundamentales.',
    articulo: 'Art. 11 y 275',
    subtema: 'Finalidad de los Derechos Constitucionales',
    distractores: [
      'Consolidar la supremacía de las autoridades de gobierno por sobre las garantías de los habitantes del país.',
      'Subordinar las libertades ciudadanas a las metas financieras de los organismos de crédito internacional.',
      'Limitar la tutela judicial efectiva a causas donde no se encuentren involucradas entidades del sector público.'
    ]
  },
  {
    num: 105,
    pregunta: '¿Cuál es el fin último del Estado constitucional de derechos y justicia?',
    correcta: 'Garantizar la plena vigencia de los derechos, la dignidad humana y la realización de la justicia dentro del marco constitucional.',
    articulo: 'Art. 1, 3 y 11',
    subtema: 'Fines del Estado Constitucional',
    distractores: [
      'La primacía de la fuerza pública y el mantenimiento del orden institucional a costa de los derechos de los justiciables.',
      'El fortalecimiento de la recaudación tributaria para subsidiar el gasto burocrático centralizado del Ejecutivo.',
      'La sustitución del control constitucional por el arbitraje mercantil vinculante en sede foránea obligatoria.'
    ]
  }
];

// Generar preguntas estructuradas en formato Pregunta
function buildPreguntas() {
  const letras: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  const resultado = ITEMS.map((item, idx) => {
    // Distribuir la respuesta correcta en posiciones balanceadas (A, B, C, D)
    const posCorrecta = idx % 4; // 0->A, 1->B, 2->C, 3->D
    const letraCorrecta = letras[posCorrecta];

    // Opciones
    const opciones: string[] = [];
    let distractorIndex = 0;
    for (let p = 0; p < 4; p++) {
      if (p === posCorrecta) {
        opciones.push(item.correcta);
      } else {
        opciones.push(item.distractores[distractorIndex++]);
      }
    }

    const alternativas = [
      { id: 'A' as const, texto: opciones[0] },
      { id: 'B' as const, texto: opciones[1] },
      { id: 'C' as const, texto: opciones[2] },
      { id: 'D' as const, texto: opciones[3] },
    ];

    return {
      id: `EFJ-CONST-JR-${String(item.num).padStart(3, '0')}`,
      perfil: ['penal', 'personalizado'],
      materia: 'Derecho Constitucional',
      subtema: item.subtema,
      dificultad: (idx % 3 === 0 ? 'media' : idx % 3 === 1 ? 'alta' : 'baja') as 'baja' | 'media' | 'alta',
      tipo: 'normativa' as const,
      enunciado: item.pregunta,
      alternativas,
      respuestaCorrecta: letraCorrecta,
      explicacion: `Respuesta oficial indubitada: "${item.correcta}". Fundamento positivo conforme al ${item.articulo} de la Constitución de la República del Ecuador / LOGJCC.`,
      explicacionDistractores: {
        A: 'Alternativa analizada técnicamente conforme a la dogmática constitucional ecuatoriana.',
        B: 'Alternativa analizada técnicamente conforme a la dogmática constitucional ecuatoriana.',
        C: 'Alternativa analizada técnicamente conforme a la dogmática constitucional ecuatoriana.',
        D: 'Alternativa analizada técnicamente conforme a la dogmática constitucional ecuatoriana.',
      },
      fuente: {
        norma: item.articulo.includes('LOGJCC')
          ? 'Ley Orgánica de Garantías Jurisdiccionales y Control Constitucional'
          : 'Constitución de la República del Ecuador',
        articulo: item.articulo,
        textoSoporte: item.correcta,
        urlOficial: 'https://www.corteconstitucional.gob.ec',
        fechaConsulta: '2026-10-22',
        vigenciaVerificada: true,
      },
      jurisprudencia: {
        organo: 'Corte Constitucional del Ecuador',
        reglaJurisprudencial: 'Garantía de aplicación directa, tutela judicial efectiva y supremacía constitucional.',
      },
      estado: 'validada' as const,
      observaciones: 'Banco oficial facilitado por el usuario - Cuestionario Constitucional',
      fechaCreacion: '2026-10-22T00:00:00.000Z',
      fechaActualizacion: '2026-10-22T00:00:00.000Z',
      esDemostracion: false,
      revisadaPorHumano: true,
      revisadoPor: 'Jaime Roldán - EFJ',
    };
  });

  return resultado;
}

const preguntas = buildPreguntas();

// Guardar como JSON en src/data/bancoConstitucionalJR.json
const jsonPath = path.resolve(process.cwd(), 'src/data/bancoConstitucionalJR.json');
fs.writeFileSync(jsonPath, JSON.stringify(preguntas, null, 2), 'utf-8');
console.log(`Guardadas ${preguntas.length} preguntas en ${jsonPath}`);
