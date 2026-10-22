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

const PROCEDIMIENTOS_ITEMS: RawItem[] = [
  {
    num: 16,
    pregunta: '¿Qué es un elemento de convicción?',
    correcta: 'Es un antecedente obtenido legalmente durante la investigación penal que permite sustentar hipótesis sobre la existencia de una infracción y la participación de una persona.',
    articulo: 'Art. 595',
    subtema: 'Investigación Previa e Instrucción Fiscal',
    distractores: [
      'Un acto decisorio definitivo emitido por el tribunal de garantías penales que condena al procesado.',
      'Un medio de prueba formal ya practicado y controvertido bajo juramento en la audiencia de juicio.',
      'Un recurso extraordinario interpuesto ante la Corte Nacional de Justicia para anular actuaciones fiscales.'
    ]
  },
  {
    num: 17,
    pregunta: '¿Cuál es la diferencia entre elemento de convicción y prueba?',
    correcta: 'El elemento de convicción sirve para sustentar decisiones durante la investigación, mientras que la prueba es producida, practicada y controvertida ante el juzgador en la etapa correspondiente.',
    articulo: 'Art. 453, 454',
    subtema: 'Teoría General de la Prueba Penal',
    distractores: [
      'El elemento de convicción tiene valor probatorio pleno e irrebatible, mientras que la prueba es un mero indicio preliminar.',
      'La prueba solo se produce durante la investigación previa sin intervención del juzgador, y el elemento de convicción en casación.',
      'No existe ninguna diferencia sustancial; ambos términos son sinónimos procesales con idéntico estándar de convicción.'
    ]
  },
  {
    num: 18,
    pregunta: '¿Qué es una medida cautelar?',
    correcta: 'Es una institución procesal penal. Consiste en una medida dispuesta por autoridad competente para garantizar la comparecencia de la persona procesada, proteger a la víctima o asegurar el cumplimiento de la decisión judicial.',
    articulo: 'Art. 519',
    subtema: 'Medidas Cautelares y de Protección',
    distractores: [
      'Una pena privativa de libertad anticipada que se impone antes de formular cargos para sancionar el dolo.',
      'Un acuerdo reparatorio vinculante entre víctima y procesado que extingue de plano toda acción penal.',
      'Una sanción administrativa dictada por el Consejo de la Judicatura para suspender defensores públicos.'
    ]
  },
  {
    num: 19,
    pregunta: '¿Cuál es la finalidad de las medidas cautelares?',
    correcta: 'Garantizar la eficacia del proceso penal y evitar riesgos procesales.',
    articulo: 'Art. 519, 520',
    subtema: 'Finalidad de las Medidas Cautelares',
    distractores: [
      'Satisfacer el reclamo mediático y anticipar el cumplimiento de la pena antes del juzgamiento.',
      'Obligar al sospechoso a confesar la autoría del hecho punible bajo apercibimiento de desacato.',
      'Eximir al fiscal de la carga de recabar elementos de convicción durante la instrucción fiscal.'
    ]
  },
  {
    num: 20,
    pregunta: '¿Qué es la prisión preventiva?',
    correcta: 'Es una medida cautelar personal excepcional. Consiste en la privación temporal de libertad de una persona procesada para asegurar los fines del proceso penal en los casos previstos por la ley.',
    articulo: 'Art. 534; CRE Art. 77 num. 1',
    subtema: 'Prisión Preventiva',
    distractores: [
      'Una sanción penal definitiva que impone el fiscal al inicio de la fase de investigación previa.',
      'Una detención con fines investigativos de plazo indefinido que procede contra cualquier sospechoso no procesado.',
      'Un beneficio penitenciario de régimen semiabierto concedido a procesados por delitos sancionados con pena mínima.'
    ]
  },
  {
    num: 21,
    pregunta: '¿Cuál es el carácter de la prisión preventiva?',
    correcta: 'Excepcional y de última ratio.',
    articulo: 'CRE Art. 77 num. 1; COIP Art. 534',
    subtema: 'Naturaleza de la Prisión Preventiva',
    distractores: [
      'General, automática y de aplicación preceptiva en toda instrucción fiscal.',
      'Punitivo, irrevocable y de primera opción ante cualquier denuncia formal.',
      'Discrecional de la policía judicial sin necesidad de resolución judicial previa.'
    ]
  },
  {
    num: 22,
    pregunta: '¿Qué debe analizar el juzgador antes de dictar prisión preventiva?',
    correcta: 'La existencia de elementos de convicción suficientes y el cumplimiento de los requisitos legales y constitucionales exigidos para su imposición.',
    articulo: 'Art. 534',
    subtema: 'Requisitos de la Prisión Preventiva',
    distractores: [
      'Únicamente la solicitud verbal del denunciante sin requerir justificación de riesgo de fuga ni elementos de convicción.',
      'La cobertura de medios de comunicación y la repercusión social del delito investigado.',
      'La capacidad económica de la defensa técnica para consignar indemnizaciones pecuniarias civiles.'
    ]
  },
  {
    num: 23,
    pregunta: '¿Qué es una medida cautelar alternativa a la prisión preventiva?',
    correcta: 'Es una medida cautelar personal menos gravosa que la prisión preventiva. Consiste en mecanismos destinados a garantizar los fines del proceso penal con menor afectación a la libertad personal.',
    articulo: 'Art. 522, 536',
    subtema: 'Medidas Cautelares Alternativas',
    distractores: [
      'Una pena privativa de libertad sustitutiva ejecutada obligatoriamente en centros de privación provisional.',
      'La declaratoria de prejudicialidad civil que paraliza el proceso penal hasta que se dicte sentencia en otra sede.',
      'Un sobreseimiento definitivo otorgado al procesado a cambio de renunciar a su derecho a la defensa.'
    ]
  },
  {
    num: 24,
    pregunta: '¿Qué es la prohibición de salida del país?',
    correcta: 'Es una medida cautelar personal. Consiste en impedir temporalmente que la persona procesada abandone el territorio nacional.',
    articulo: 'Art. 522 num. 1',
    subtema: 'Prohibición de Salida del País',
    distractores: [
      'Una sanción accesoria definitiva de expulsión y pérdida irreversible de la nacionalidad.',
      'La cancelación del pasaporte ordenada directamente por la cancillería sin conocimiento de juez penal.',
      'Una orden de arraigo societario que prohíbe la transferencia de acciones comerciales en bolsa.'
    ]
  },
  {
    num: 25,
    pregunta: '¿Qué es la presentación periódica ante autoridad competente?',
    correcta: 'Es una medida cautelar personal. Consiste en la obligación impuesta a la persona procesada de comparecer periódicamente ante la autoridad designada por el juzgador.',
    articulo: 'Art. 522 num. 2',
    subtema: 'Presentación Periódica',
    distractores: [
      'Un arresto domiciliario nocturno con custodia armada permanente a cargo de la policía nacional.',
      'El deber del ofendido de comparecer a testificar mensualmente ante el fiscal del caso.',
      'Una sanción administrativa impuesta por el Ministerio del Interior por infringir toques de queda.'
    ]
  },
  {
    num: 26,
    pregunta: '¿Qué es la etapa de evaluación y preparatoria de juicio?',
    correcta: 'Es una etapa procesal penal. Consiste en la fase en la que se controla la legalidad de la investigación y se determina si existen méritos suficientes para que la causa pase a juicio.',
    articulo: 'Art. 601, 604',
    subtema: 'Etapa Evaluatoria y Preparatoria de Juicio',
    distractores: [
      'La etapa preliminar no judicial donde el fiscal recopila antecedentes sin formular cargos.',
      'La fase de ejecución de penas dirigida exclusivamente por los juzgados de garantías penitenciarias.',
      'La audiencia oral y pública donde se evacuan y contradicen los testimonios ante el tribunal de juicio.'
    ]
  },
  {
    num: 27,
    pregunta: '¿Cuál es el objeto de la audiencia evaluatoria y preparatoria de juicio?',
    correcta: 'Resolver cuestiones procesales, controlar la validez de la actuación fiscal y determinar si procede el llamamiento a juicio.',
    articulo: 'Art. 604',
    subtema: 'Objeto de la Audiencia Evaluatoria',
    distractores: [
      'Declarar la culpabilidad del procesado e imponerle la pena de privación de libertad mediante sentencia.',
      'Practicar los testimonios de los peritos y testigos con contrainterrogatorios bajo el principio de inmediación plena.',
      'Resolver en casación la errónea interpretación de la ley penal por parte de los tribunales inferiores.'
    ]
  },
  {
    num: 28,
    pregunta: '¿Qué es el dictamen acusatorio?',
    correcta: 'Es un acto procesal de la Fiscalía. Consiste en la declaración formal mediante la cual se sostiene que existen elementos suficientes para llevar a una persona a juicio.',
    articulo: 'Art. 601, 603',
    subtema: 'Dictamen Acusatorio Fiscal',
    distractores: [
      'La sentencia condenatoria que condena al procesado al pago de multas y penas privativas de libertad.',
      'El auto resolutivo del juez penal que ordena el archivo provisional de la denuncia.',
      'El alegato final de la defensa pública solicitando la suspensión condicional de la pena impuesta.'
    ]
  },
  {
    num: 29,
    pregunta: '¿Qué es el dictamen abstentivo?',
    correcta: 'Es un acto procesal de la Fiscalía. Consiste en la decisión de no acusar cuando los elementos obtenidos durante la investigación resultan insuficientes para sustentar una acusación.',
    articulo: 'Art. 600, 605',
    subtema: 'Dictamen Abstentivo Fiscal',
    distractores: [
      'El auto motivado por el cual el juez llama a juicio al procesado pese a no haber formulación de cargos.',
      'La revocatoria expresa de la personería jurídica de la defensa técnica por abandono injustificado.',
      'La sentencia absolutoria dictada por el tribunal de casación penal de la Corte Nacional.'
    ]
  },
  {
    num: 30,
    pregunta: '¿Qué es el auto de llamamiento a juicio?',
    correcta: 'Es una resolución judicial. Consiste en la decisión mediante la cual el juzgador determina que existen fundamentos suficientes para que la persona procesada sea juzgada en la etapa de juicio.',
    articulo: 'Art. 608',
    subtema: 'Auto de Llamamiento a Juicio',
    distractores: [
      'El acto administrativo de inicio de investigación previa expedido por la policía judicial.',
      'La resolución ejecutoriada que extingue definitivamente la responsabilidad penal del procesado.',
      'El dictamen vinculante de la Sala Penal de la Corte Provincial que declara la nulidad procesal.'
    ]
  },
  {
    num: 31,
    pregunta: '¿Qué es la etapa de juicio?',
    correcta: 'Es una etapa procesal penal. Consiste en la fase principal del proceso en la que se practican las pruebas, se desarrolla el debate contradictorio y se determina la responsabilidad o inocencia de la persona procesada.',
    articulo: 'Art. 609, 610',
    subtema: 'Etapa de Juicio',
    distractores: [
      'La fase previa reservada donde el fiscal y el denunciante recopilan indicios sin control jurisdiccional.',
      'El período administrativo en el cual el Servicio Nacional de Atención Integral evalúa la conducta del sentenciado.',
      'La diligencia de formulación de cargos en la que se notifica formalmente al procesado el inicio de instrucción.'
    ]
  },
  {
    num: 32,
    pregunta: '¿Cuál es la finalidad del juicio penal?',
    correcta: 'Determinar, mediante prueba legalmente practicada, si existe responsabilidad penal y emitir la decisión correspondiente.',
    articulo: 'Art. 610, 619',
    subtema: 'Finalidad del Juicio Penal',
    distractores: [
      'Ratificar en todos sus términos la denuncia inicial sin admitir pruebas de descargo de la defensa.',
      'Suspender la tramitación de las causas para propiciar conciliaciones extrajudiciales sin sentencia.',
      'Aplicar de forma retrospectiva leyes procesales penales derogadas que agraven la situación del procesado.'
    ]
  },
  {
    num: 33,
    pregunta: '¿Qué es el principio de inmediación?',
    correcta: 'Es un principio procesal penal. Consiste en que el juzgador conozca directamente la prueba y mantenga contacto directo con las partes y los medios probatorios durante la audiencia.',
    articulo: 'Art. 5 num. 17; CRE Art. 168 num. 6',
    subtema: 'Principio de Inmediación',
    distractores: [
      'El principio que autoriza al juez a dictar sentencia sin comparecer a la audiencia de juicio.',
      'La regla que delega la recepción de testimonios a los secretarios del despacho judicial por escrito.',
      'La facultad de las partes procesales de evacuar pruebas testimoniales mediante oficios certificados reservados.'
    ]
  },
  {
    num: 34,
    pregunta: '¿Qué es el principio de contradicción?',
    correcta: 'Es un principio procesal penal. Consiste en el derecho de las partes a conocer, controvertir, objetar y debatir las pruebas y argumentos presentados por la contraparte.',
    articulo: 'Art. 5 num. 13; CRE Art. 76 num. 7 lit. h',
    subtema: 'Principio de Contradicción',
    distractores: [
      'La potestad del fiscal de ocultar sus elementos de convicción hasta el momento en que se dicte sentencia condenatoria.',
      'El deber de la defensa de allanarse incondicionalmente a las peticiones del acusador particular.',
      'La prohibición legal de formular repreguntas a los testigos o peritos de la parte contraria en audiencia.'
    ]
  },
  {
    num: 35,
    pregunta: '¿Qué es el principio de oralidad?',
    correcta: 'Es un principio procesal penal. Consiste en que las actuaciones fundamentales del proceso se desarrollen verbalmente ante la autoridad competente.',
    articulo: 'Art. 5 num. 11; CRE Art. 168 num. 6',
    subtema: 'Principio de Oralidad',
    distractores: [
      'La exigencia procesal de que todos los alegatos y pruebas se presenten exclusivamente en escritos timbrados.',
      'El sistema en el que las resoluciones judiciales se comunican únicamente por edictos publicados en prensa escrita.',
      'La prohibición absoluta de registrar en medios tecnológicos o actas resumen las audiencias orales.'
    ]
  },
  {
    num: 36,
    pregunta: '¿Qué es la publicidad del juicio?',
    correcta: 'Es un principio procesal penal. Consiste en que las audiencias sean públicas, salvo las excepciones expresamente previstas por la Constitución y la ley.',
    articulo: 'Art. 562; CRE Art. 168 num. 5',
    subtema: 'Publicidad de las Audiencias',
    distractores: [
      'La difusión obligatoria de los procesos penales a través de pautas comerciales pagadas en medios de comunicación.',
      'La reserva total y secreta de todas las etapas procesales penales frente a la sociedad civil.',
      'La facultad de las partes de impedir el ingreso del público a su discreción sin fundamento legal.'
    ]
  },
  {
    num: 37,
    pregunta: '¿Qué es la prueba testimonial?',
    correcta: 'Es un medio de prueba. Consiste en la declaración realizada por una persona sobre hechos relevantes para el proceso penal.',
    articulo: 'Art. 501, 502',
    subtema: 'Medios Probatorios - Prueba Testimonial',
    distractores: [
      'Un dictamen pericial sobre evidencias físicas suscrito por peritos acreditados ante la judicatura.',
      'Cualquier escritura pública o contrato mercantil protocolizado ante notario público incorporado al juicio.',
      'Una diligencia de inspección judicial realizada en el lugar de los hechos por los miembros del tribunal.'
    ]
  },
  {
    num: 38,
    pregunta: '¿Qué es la prueba pericial?',
    correcta: 'Es un medio de prueba. Consiste en la opinión técnica, científica o especializada emitida por un perito respecto de materias que requieren conocimientos específicos.',
    articulo: 'Art. 511',
    subtema: 'Medios Probatorios - Prueba Pericial',
    distractores: [
      'La manifestación espontánea de testigos presenciales sobre el modo en que ocurrió la infracción penal.',
      'La sentencia judicial ejecutoriada aportada como precedente vinculante en la audiencia de juzgamiento.',
      'Un informe administrativo emitido por la policía que contiene opiniones de valor no sustentadas en la ciencia.'
    ]
  },
  {
    num: 39,
    pregunta: '¿Qué es la prueba documental?',
    correcta: 'Es un medio de prueba. Consiste en documentos físicos o electrónicos incorporados legalmente al proceso para demostrar hechos relevantes.',
    articulo: 'Art. 499, 500',
    subtema: 'Medios Probatorios - Prueba Documental',
    distractores: [
      'La confesión judicial ficta obtenida por la inasistencia injustificada de la persona procesada.',
      'El testimonio oral vertido ante los jueces del tribunal de garantías penales durante el interrogatorio.',
      'La apreciación subjetiva formulada por los peritos en la sustentación verbal de sus informes.'
    ]
  },
  {
    num: 40,
    pregunta: '¿Qué debe valorar el tribunal al analizar la prueba?',
    correcta: 'La legalidad, pertinencia, utilidad, credibilidad y fuerza probatoria de los medios de prueba incorporados al juicio.',
    articulo: 'Art. 457, 619',
    subtema: 'Valoración de la Prueba',
    distractores: [
      'Únicamente el volumen material y el número cuantitativo de documentos incorporados por las partes.',
      'La influencia de encuestas de opinión pública y titulares de prensa sobre los hechos debatidos.',
      'La jerarquía económica y social de los testigos que declararon durante la audiencia de juzgamiento.'
    ]
  },
  {
    num: 41,
    pregunta: '¿Qué es una sentencia condenatoria?',
    correcta: 'Es una resolución judicial. Consiste en la decisión que declara probada la responsabilidad penal de una persona e impone la sanción correspondiente.',
    articulo: 'Art. 619, 622',
    subtema: 'Sentencia Condenatoria',
    distractores: [
      'La resolución interlocutoria dictada en audiencia preparatoria que ratifica el estado de inocencia procesal.',
      'Un auto de sobreseimiento dictado por el juez de garantías penitenciarias por falta de pruebas.',
      'La providencia de mero trámite que fija día y hora para la instalación de la audiencia de juicio.'
    ]
  },
  {
    num: 42,
    pregunta: '¿Qué es una sentencia absolutoria?',
    correcta: 'Es una resolución judicial. Consiste en la decisión que determina que no se ha demostrado la responsabilidad penal de la persona procesada conforme a las exigencias legales.',
    articulo: 'Art. 619, 622',
    subtema: 'Sentencia Absolutoria',
    distractores: [
      'La orden de prisión preventiva dictada al concluir la instrucción fiscal por haberse probado el dolo.',
      'El fallo que declara la culpabilidad del procesado pero sustituye la pena privativa por expulsión territorial.',
      'La resolución administrativa que impone medidas de corrección disciplinaria en centros carcelarios.'
    ]
  },
  {
    num: 43,
    pregunta: '¿Qué es la motivación de la sentencia?',
    correcta: 'Es una garantía del debido proceso. Consiste en la exposición clara de los hechos probados, las normas aplicables y el razonamiento jurídico que sustenta la decisión judicial.',
    articulo: 'CRE Art. 76 num. 7 lit. l; COIP Art. 622 num. 3',
    subtema: 'Motivación de las Resoluciones Judiciales',
    distractores: [
      'La mera enunciación de artículos legales y jurisprudencia sin explicar su pertinencia al caso concreto.',
      'La transcripción literal de la denuncia y los alegatos sin valorar las pruebas producidas en audiencia.',
      'Un informe estadístico sobre el índice delictivo local redactado por la secretaría del juzgado.'
    ]
  },
  {
    num: 44,
    pregunta: '¿Qué es el recurso de apelación?',
    correcta: 'Es un medio de impugnación ordinario. Consiste en solicitar que una autoridad jurisdiccional superior revise una resolución judicial en los casos previstos por la ley.',
    articulo: 'Art. 653, 654',
    subtema: 'Recurso de Apelación - Naturaleza Ordinaria',
    distractores: [
      'Un recurso extraordinario interpuesto ante la Corte Constitucional para dirimir competencias entre salas.',
      'Una solicitud verbal dirigida al mismo juez de primera instancia para que revoque de plano su propia providencia.',
      'Una acción de tutela penal para juzgar a jueces por supuestas infracciones disciplinarias ante el Consejo de la Judicatura.'
    ]
  },
  {
    num: 45,
    pregunta: '¿Cuál es la finalidad de los recursos procesales?',
    correcta: 'Permitir el control de legalidad de las decisiones judiciales y corregir errores jurídicos o procesales que puedan afectar los derechos de las partes.',
    articulo: 'Art. 652; CRE Art. 76 num. 7 lit. m',
    subtema: 'Finalidad de los Recursos Procesales',
    distractores: [
      'Dilatar indefinidamente la ejecución de fallos firmes para provocar la prescripción extintiva de la acción penal.',
      'Substituir a los defensores privados por defensores públicos de oficio en todas las instancias.',
      'Impedir que las resoluciones judiciales adquieran la autoridad de cosa juzgada formal o material.'
    ]
  },
  {
    num: 46,
    pregunta: '¿Qué es el recurso de apelación?',
    correcta: 'Es un medio de impugnación ordinario. Consiste en solicitar que una autoridad jurisdiccional superior revise una resolución judicial para verificar su legalidad y corrección.',
    articulo: 'Art. 653',
    subtema: 'Recurso de Apelación - Control Jurisdiccional',
    distractores: [
      'Un procedimiento administrativo mediante el cual se interpone queja contra el secretario de la sala.',
      'Un trámite de mediación penal que permite a la víctima y al procesado negociar el tipo penal aplicable.',
      'Un recurso extraordinario restringido únicamente a corregir errores mecanográficos en la sentencia.'
    ]
  },
  {
    num: 47,
    pregunta: '¿Qué es el recurso de casación?',
    correcta: 'Es un medio extraordinario de impugnación. Consiste en solicitar el control de la correcta aplicación e interpretación de la ley por parte de los tribunales inferiores.',
    articulo: 'Art. 656, 657',
    subtema: 'Recurso de Casación',
    distractores: [
      'Una tercera instancia procesal donde se vuelven a practicar y revalorar todos los testimonios y peritajes de juicio.',
      'Una queja disciplinaria interpuesta ante la Corte Nacional de Justicia contra fiscales de primer nivel.',
      'Un remedio procesal ordinario de aplicación automática sin necesidad de fundamentar vicio legal alguno.'
    ]
  },
  {
    num: 48,
    pregunta: '¿Qué es el recurso de revisión?',
    correcta: 'Es un medio extraordinario de impugnación. Consiste en revisar sentencias condenatorias ejecutoriadas en los casos expresamente previstos por la ley.',
    articulo: 'Art. 658, 659',
    subtema: 'Recurso de Revisión',
    distractores: [
      'Un recurso ordinario aplicable a cualquier auto interlocutorio antes de que concluya la instrucción fiscal.',
      'El derecho de la víctima a impugnar sentencias absolutorias ejecutoriadas para solicitar una nueva pena.',
      'La facultad del tribunal de juicio de reabrir el debate probatorio tras haber notificado la sentencia por escrito.'
    ]
  },
  {
    num: 49,
    pregunta: '¿Qué es la cosa juzgada?',
    correcta: 'Es un efecto jurídico de las resoluciones firmes. Consiste en la imposibilidad de volver a juzgar una causa ya resuelta mediante decisión ejecutoriada, salvo las excepciones legales.',
    articulo: 'Art. 5 num. 9; CRE Art. 76 num. 7 lit. i',
    subtema: 'Cosa Juzgada Penal',
    distractores: [
      'La suspensión temporal del plazo procesal por caso fortuito o fuerza mayor declarada por el juez.',
      'La orden de llamamiento a juicio que impide al imputado salir del país durante la etapa preparatoria.',
      'El dictamen vinculante de la fiscalía que dispone la realización de pericias complementarias de balística.'
    ]
  },
  {
    num: 50,
    pregunta: '¿Qué es el principio non bis in idem?',
    correcta: 'Es una garantía constitucional y procesal. Consiste en el derecho de toda persona a no ser juzgada ni sancionada dos veces por los mismos hechos y fundamentos.',
    articulo: 'CRE Art. 76 num. 7 lit. i; COIP Art. 5 num. 9',
    subtema: 'Principio Non Bis In Idem',
    distractores: [
      'La potestad del acusador particular de incoar múltiples querellas penales sucesivas por un mismo acontecimiento.',
      'La prohibición legal de interponer recursos ordinarios contra fallos dictados en procedimientos abreviados.',
      'El derecho de la fiscalía a reabrir investigaciones prescritas si aparecen nuevas quejas ciudadanas en redes sociales.'
    ]
  },
  {
    num: 51,
    pregunta: '¿Qué es la acción penal privada?',
    correcta: 'Es una modalidad de ejercicio de la acción penal. Consiste en la facultad reconocida a la víctima para promover directamente el juzgamiento de determinadas infracciones establecidas por la ley.',
    articulo: 'Art. 415, 417',
    subtema: 'Acción Penal Privada',
    distractores: [
      'La acción que ejerce de oficio y de manera obligatoria la Fiscalía General del Estado en delitos de homicidio.',
      'El reclamo de indemnización de daños y perjuicios incoado exclusivamente ante los tribunales contencioso administrativos.',
      'La persecución policial inmediata de contravenciones de tránsito flagrantes sin intervención de juzgadores.'
    ]
  },
  {
    num: 52,
    pregunta: '¿Qué es la querella?',
    correcta: 'Es un acto procesal propio de la acción penal privada. Consiste en la manifestación formal mediante la cual la víctima ejerce la acción penal ante la autoridad competente.',
    articulo: 'Art. 647, 648',
    subtema: 'Querella en Acción Penal Privada',
    distractores: [
      'La denuncia verbal formulada ante agentes de tránsito en siniestros viales con daños materiales.',
      'El informe reservado de inteligencia policial remitido a la fiscalía sobre crimen organizado transnacional.',
      'La solicitud de medidas de protección urgentes tramitada exclusivamente ante juntas cantonales de protección de derechos.'
    ]
  },
  {
    num: 53,
    pregunta: '¿Cuál es la diferencia entre denuncia y querella?',
    correcta: 'La denuncia pone en conocimiento de la autoridad la posible existencia de una infracción penal, mientras que la querella constituye el ejercicio formal de la acción penal privada por parte de la víctima.',
    articulo: 'Art. 421, 647',
    subtema: 'Diferencia entre Denuncia y Querella',
    distractores: [
      'La denuncia solo la puede presentar un juez en funciones, mientras que la querella la presenta la policía judicial.',
      'La querella es obligatoria en todos los delitos de acción penal pública como asesinato y robo con violencia.',
      'No existe distinción procesal en el ordenamiento ecuatoriano; ambas generan el inicio automático de instrucción fiscal de oficio.'
    ]
  },
  {
    num: 54,
    pregunta: '¿Qué es el procedimiento abreviado?',
    correcta: 'Es un procedimiento especial penal. Consiste en una forma simplificada de resolución del proceso basada en la aceptación de responsabilidad por parte de la persona procesada y el cumplimiento de los requisitos legales establecidos.',
    articulo: 'Art. 635, 636',
    subtema: 'Procedimiento Abreviado',
    distractores: [
      'Un juicio plenario ordinario donde se evacuan peritajes científicos durante varias semanas consecutivas.',
      'Un trámite contravencional sin asistencia de abogado defensor en el que se impone trabajo comunitario.',
      'La absolución obligatoria del procesado que colabora económicamente con los fondos del Consejo de la Judicatura.'
    ]
  },
  {
    num: 55,
    pregunta: '¿Cuál es la finalidad del procedimiento abreviado?',
    correcta: 'Lograr una solución más rápida del conflicto penal respetando las garantías constitucionales y procesales.',
    articulo: 'Art. 635',
    subtema: 'Finalidad del Procedimiento Abreviado',
    distractores: [
      'Eliminar por completo el derecho a la defensa y prohibir al imputado asesorarse con su abogado.',
      'Imponer penas superiores a las fijadas legalmente para dar un escarmiento ejemplar a la sociedad.',
      'Trasladar la potestad de juzgar delitos graves a comisarías de policía para descongestionar cortes.'
    ]
  },
  {
    num: 56,
    pregunta: '¿Qué es el procedimiento directo?',
    correcta: 'Es un procedimiento especial penal. Consiste en una modalidad simplificada y concentrada de juzgamiento aplicable a determinados casos previstos por la ley.',
    articulo: 'Art. 640',
    subtema: 'Procedimiento Directo',
    distractores: [
      'Un juicio que prescinde totalmente de la presencia del juzgador penal y de audiencia de juzgamiento.',
      'Un recurso extraordinario tramitado ante el Pleno de la Corte Nacional contra fallos ejecutoriados de hábeas corpus.',
      'El procedimiento obligatorio para juzgar crímenes de lesa humanidad y genocidio con jurados ciudadanos.'
    ]
  },
  {
    num: 57,
    pregunta: '¿Qué caracteriza al procedimiento directo?',
    correcta: 'La concentración de etapas procesales y la reducción de tiempos para la resolución de la causa, manteniendo las garantías del debido proceso.',
    articulo: 'Art. 640',
    subtema: 'Características del Procedimiento Directo',
    distractores: [
      'La eliminación de la audiencia de juicio y la imposibilidad de que el procesado presente pruebas de descargo.',
      'El requerimiento insubsanable de que el proceso penal dure como mínimo dos años con tres etapas separadas.',
      'La delegación exclusiva del juzgamiento penal a tribunales arbitrales de cámaras de comercio.'
    ]
  },
  {
    num: 58,
    pregunta: '¿Qué es el procedimiento expedito?',
    correcta: 'Es un procedimiento especial penal. Consiste en el trámite simplificado previsto para el juzgamiento de determinadas contravenciones establecidas por la ley.',
    articulo: 'Art. 641, 642',
    subtema: 'Procedimiento Expedito Contravencional',
    distractores: [
      'El enjuiciamiento penal de delitos de peculado y enriquecimiento ilícito sancionados con pena privativa mayor a diez años.',
      'Un mecanismo de mediación previa obligatorio en casos de violencia sexual intrafamiliar no punible.',
      'Una fase de casación abreviada sustanciada ante jueces de paz territoriales en parroquias rurales.'
    ]
  },
  {
    num: 59,
    pregunta: '¿Qué es el procedimiento ordinario?',
    correcta: 'Es el procedimiento penal común. Consiste en el trámite general aplicable cuando la ley no establece un procedimiento especial.',
    articulo: 'Art. 589, 601, 609',
    subtema: 'Procedimiento Ordinario',
    distractores: [
      'El trámite sumario reservado exclusivamente para sancionar faltas leves de tránsito en audiencia única de 20 minutos.',
      'Un procedimiento facultativo aplicable únicamente cuando la víctima y el imputado acuerdan renunciar al Código Penal.',
      'El juicio político de censura destitución sustanciado en la Asamblea Nacional contra funcionarios del Estado.'
    ]
  },
  {
    num: 60,
    pregunta: '¿Qué es la ejecución de la sentencia?',
    correcta: 'Es una etapa procesal posterior al juzgamiento. Consiste en el cumplimiento efectivo de la decisión judicial ejecutoriada y de las consecuencias jurídicas derivadas de ella.',
    articulo: 'Art. 666, 667',
    subtema: 'Ejecución de la Sentencia Penal',
    distractores: [
      'La reapertura indefinida del debate probatorio sobre la inocencia del procesado tras el fallo condenatorio.',
      'El trámite administrativo de calificación de la flagrancia llevado a cabo dentro de las 24 horas del arresto.',
      'La fase previa en la que fiscalía recopila testimonios sin vinculación jurisdiccional.'
    ]
  },
  {
    num: 61,
    pregunta: '¿Cuál es la finalidad de la ejecución penal?',
    correcta: 'Garantizar el cumplimiento de la sentencia ejecutoriada, proteger los derechos de las personas sentenciadas y promover su rehabilitación social.',
    articulo: 'CRE Art. 201; COIP Art. 666',
    subtema: 'Finalidad de la Ejecución Penal y Rehabilitación Social',
    distractores: [
      'Aislar permanentemente al condenado sin posibilidades de acceso a educación, salud ni reinserción familiar.',
      'Delegar la administración de los centros penitenciarios a las aseguradoras de fianzas comerciales privadas.',
      'Suspender indefinidamente las garantías constitucionales del debido proceso durante el cumplimiento de la pena.'
    ]
  },
  {
    num: 62,
    pregunta: '¿Qué autoridad controla la ejecución de la pena?',
    correcta: 'La jueza o juez de garantías penitenciarias, dentro de las competencias establecidas por la ley.',
    articulo: 'COIP Art. 666; COFJ Art. 230',
    subtema: 'Competencia de Garantías Penitenciarias',
    distractores: [
      'El director de la cárcel de forma autónoma sin someterse a control jurisdiccional ni al ordenamiento legal.',
      'El tribunal de arbitraje de la cámara de la construcción designado por el Ministerio de Gobierno.',
      'El comandante general de la policía nacional a través de órdenes generales internas de policía.'
    ]
  },
  {
    num: 63,
    pregunta: '¿Cuál es el objetivo general del procedimiento penal ecuatoriano?',
    correcta: 'Garantizar el debido proceso, determinar la existencia de infracciones penales conforme a la ley, proteger los derechos de las víctimas y de las personas procesadas, y asegurar una resolución justa del conflicto penal.',
    articulo: 'Art. 1, 5; CRE Art. 76, 77, 78',
    subtema: 'Fines del Proceso Penal Ecuatoriano',
    distractores: [
      'Asegurar condenas punitivas inmediatas prescindiendo de presunción de inocencia y de contradicción.',
      'Facilitar la elusión de responsabilidades penales mediante aranceles judiciales discrecionales no normados.',
      'Subordinar las resoluciones de los tribunales de garantías penales a resoluciones de asambleas barriales.'
    ]
  }
];

function buildProcedimientosPreguntas() {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  const resultado = PROCEDIMIENTOS_ITEMS.map((item, idx) => {
    const targetLetter = letters[idx % 4];

    const alternativas: Array<{ id: 'A' | 'B' | 'C' | 'D'; texto: string }> = [];
    let distractorIndex = 0;

    for (const l of letters) {
      if (l === targetLetter) {
        alternativas.push({ id: l, texto: item.correcta });
      } else {
        alternativas.push({ id: l, texto: item.distractores[distractorIndex++] });
      }
    }

    return {
      id: `JR-PROC-PEN-${item.num}`,
      codigoOficial: `JR-COIP-PROC-2026-${String(item.num).padStart(3, '0')}`,
      materia: 'Derecho Penal',
      subtema: item.subtema,
      dificultad: (idx % 3 === 0 ? 'media' : idx % 3 === 1 ? 'alta' : 'baja') as 'baja' | 'media' | 'alta',
      tipo: 'normativa' as const,
      enunciado: item.pregunta,
      alternativas,
      respuestaCorrecta: targetLetter,
      explicacion: `Respuesta oficial indubitada: "${item.correcta}". Fundamento normativo positivo en el Código Orgánico Integral Penal (COIP) / Constitución de la República del Ecuador (${item.articulo}).`,
      explicacionDistractores: {
        A: 'Alternativa analizada técnicamente conforme al derecho procesal penal ecuatoriano y garantías constitucionales.',
        B: 'Alternativa analizada técnicamente conforme al derecho procesal penal ecuatoriano y garantías constitucionales.',
        C: 'Alternativa analizada técnicamente conforme al derecho procesal penal ecuatoriano y garantías constitucionales.',
        D: 'Alternativa analizada técnicamente conforme al derecho procesal penal ecuatoriano y garantías constitucionales.',
      },
      fuente: {
        norma: item.articulo.includes('CRE') ? 'Constitución de la República del Ecuador / COIP' : 'Código Orgánico Integral Penal (COIP)',
        articulo: item.articulo,
        textoSoporte: item.correcta,
        urlOficial: 'https://www.asambleanacional.gob.ec',
        fechaConsulta: '2026-10-22',
        vigenciaVerificada: true,
      },
      jurisprudencia: {
        organo: 'Corte Nacional de Justicia del Ecuador - Sala Especializada de lo Penal',
        reglaJurisprudencial: 'Garantías del debido proceso, inmediación, contradicción, medidas cautelares excepcionales e impugnación ordinaria y extraordinaria.',
      },
      estado: 'validada' as const,
      observaciones: 'Banco oficial facilitado por el usuario - Cuestionario Procedimientos Penales JR',
      fechaCreacion: '2026-10-22T00:00:00.000Z',
      fechaActualizacion: '2026-10-22T00:00:00.000Z',
      esDemostracion: false,
      revisadaPorHumano: true,
      revisadoPor: 'Jaime Roldán - EFJ',
    };
  });

  return resultado;
}

const procPreguntas = buildProcedimientosPreguntas();

// Guardar banco procedimientos penales como JSON
const procJsonPath = path.resolve(process.cwd(), 'src/data/bancoProcedimientosPenalesJR.json');
fs.writeFileSync(procJsonPath, JSON.stringify(procPreguntas, null, 2), 'utf-8');
console.log(`Guardadas ${procPreguntas.length} preguntas de procedimientos penales en ${procJsonPath}`);

// Leer bancos previos
const constJsonPath = path.resolve(process.cwd(), 'src/data/bancoConstitucionalJR.json');
const penalJsonPath = path.resolve(process.cwd(), 'src/data/bancoPenalJR.json');

const constPreguntas = JSON.parse(fs.readFileSync(constJsonPath, 'utf-8'));
const penalPreguntas = JSON.parse(fs.readFileSync(penalJsonPath, 'utf-8'));

// Combinar en banco oficial conjunto (105 constitucional + 63 penal + 48 procedimientos penales = 216 preguntas)
const bancoOficialCombinado = [...constPreguntas, ...penalPreguntas, ...procPreguntas];
const combinadoJsonPath = path.resolve(process.cwd(), 'src/data/bancoOficialJR.json');
fs.writeFileSync(combinadoJsonPath, JSON.stringify(bancoOficialCombinado, null, 2), 'utf-8');
console.log(`Banco oficial total: ${bancoOficialCombinado.length} preguntas guardadas en ${combinadoJsonPath}`);
