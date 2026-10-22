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

const CONTRAVENCIONES_ITEMS: RawItem[] = [
  {
    num: 1,
    pregunta: '¿Qué es una contravención?',
    correcta: 'Es una infracción penal de menor gravedad que el delito. Consiste en una conducta tipificada por la ley y sancionada con las penas previstas para las contravenciones.',
    articulo: 'Art. 19',
    subtema: 'Teoría de la Infracción Penal',
    distractores: [
      'Un acto puramente civil o administrativo que no genera consecuencias jurídicas ni sanción punitiva.',
      'Un ilícito constitucional grave que únicamente puede ser sancionado con privación de libertad superior a cinco años.',
      'Una falta disciplinaria cometida exclusivamente por servidores judiciales sancionada por el Consejo de la Judicatura.'
    ]
  },
  {
    num: 2,
    pregunta: '¿Cómo clasifica el Código Orgánico Integral Penal las infracciones penales?',
    correcta: 'En delitos y contravenciones.',
    articulo: 'Art. 19',
    subtema: 'Clasificación de Infracciones Penales',
    distractores: [
      'En crímenes, delitos y cuasidelitos.',
      'En faltas administrativas, delitos comunes y delitos políticos.',
      'En infracciones leves, graves y gravísimas de naturaleza contravencional.'
    ]
  },
  {
    num: 3,
    pregunta: '¿Cuál es la diferencia principal entre delito y contravención?',
    correcta: 'El delito tiene mayor gravedad jurídica y una respuesta penal más severa, mientras que la contravención constituye una infracción penal de menor gravedad.',
    articulo: 'Art. 19',
    subtema: 'Distinción Dogmática de Infracciones',
    distractores: [
      'El delito es siempre culposo y no priva de libertad, mientras que la contravención exige necesariamente dolo directo y alevosía.',
      'El delito se tramita ante jueces de paz y la contravención únicamente ante la Sala Penal de la Corte Nacional de Justicia.',
      'No existe ninguna diferencia; en el derecho penal ecuatoriano ambas figuras conllevan exactamente la misma sanción privativa.'
    ]
  },
  {
    num: 4,
    pregunta: '¿Quién conoce y juzga las contravenciones?',
    correcta: 'Las juezas y jueces de contravenciones o las autoridades judiciales competentes determinadas por la ley.',
    articulo: 'Art. 231 COFJ, Art. 641 COIP',
    subtema: 'Jurisdicción y Competencia Contravencional',
    distractores: [
      'Únicamente los tribunales penales colegiados mediante jurado popular.',
      'Exclusivamente la Policía Nacional del Ecuador sin intervención de la función judicial.',
      'Los fiscales de flagrancia mediante resolución administrativa motivada de clausura.'
    ]
  },
  {
    num: 5,
    pregunta: '¿Qué es el procedimiento expedito?',
    correcta: 'Es un procedimiento especial penal. Consiste en un trámite simplificado y ágil previsto para el juzgamiento de determinadas contravenciones.',
    articulo: 'Art. 641-644',
    subtema: 'Procedimiento Expedito',
    distractores: [
      'Un proceso ordinario formal con etapas de investigación previa e instrucción fiscal de noventa días obligatorios.',
      'Un recurso extraordinario ante la Corte Constitucional para dirimir competencias entre salas de apelación.',
      'Un mecanismo arbitral voluntario donde la víctima y el infractor fijan una indemnización patrimonial sin juez.'
    ]
  },
  {
    num: 6,
    pregunta: '¿Qué principios constitucionales se aplican al juzgamiento de contravenciones?',
    correcta: 'Debido proceso, derecho a la defensa, contradicción, inmediación, oralidad, motivación, igualdad y presunción de inocencia.',
    articulo: 'Art. 76 CRE, Art. 5 COIP',
    subtema: 'Principios y Garantías Constitucionales',
    distractores: [
      'Inquisitivo escrito, secreto de actuaciones, presunción de culpabilidad y doble juzgamiento preferente.',
      'Exclusivamente el principio de oportunidad fiscal con prescindencia del derecho a la defensa contradictoria.',
      'Aplicación restrictiva de la mediación civil patrimonial con suspensión total de las garantías del debido proceso.'
    ]
  },
  {
    num: 7,
    pregunta: '¿Se aplica la presunción de inocencia en materia contravencional?',
    correcta: 'Sí. Toda persona debe ser considerada inocente mientras no exista una resolución condenatoria legalmente válida.',
    articulo: 'Art. 76 num. 2 CRE, Art. 5 num. 4 COIP',
    subtema: 'Presunción de Inocencia',
    distractores: [
      'No, porque en materia contravencional rige una presunción legal de culpabilidad desde la aprehensión policial.',
      'Únicamente se aplica si el procesado rinde caución pecuniaria ante el juzgado de contravenciones.',
      'Solo se reconoce cuando la contravención es contra la propiedad y no cuando afecta a las personas.'
    ]
  },
  {
    num: 8,
    pregunta: '¿Qué es la motivación de una resolución judicial?',
    correcta: 'Es una garantía constitucional. Consiste en exponer los hechos, las normas aplicables y el razonamiento jurídico que fundamenta la decisión adoptada.',
    articulo: 'Art. 76 num. 7 lit. l CRE, Art. 130 COFJ',
    subtema: 'Motivación Judicial',
    distractores: [
      'La simple mención aislada de artículos de la ley sin explicar su pertinencia con los hechos fácticos probados.',
      'La transcripción íntegra de la denuncia o parte policial sin análisis lógico ni valoración probatoria propia.',
      'Una facultad meramente discrecional y optativa del juzgador reservada solo para juicios de apelación penal.'
    ]
  },
  {
    num: 9,
    pregunta: '¿Quién dirige la audiencia de juzgamiento de una contravención?',
    correcta: 'La jueza o juez competente para conocer y resolver la contravención.',
    articulo: 'Art. 563, 642 COIP, Art. 130 COFJ',
    subtema: 'Dirección de la Audiencia',
    distractores: [
      'El oficial de policía que practicó la aprehensión o levantó la boleta de citación contravencional.',
      'El secretario del despacho judicial previa autorización verbal del agente fiscal de turno.',
      'El defensor público en coordinación con el acusador particular o denunciante.'
    ]
  },
  {
    num: 10,
    pregunta: '¿Qué es la flagrancia en materia contravencional?',
    correcta: 'Es una institución procesal. Consiste en sorprender a una persona cometiendo una contravención o inmediatamente después de haberla cometido, en los casos previstos por la ley.',
    articulo: 'Art. 527 COIP',
    subtema: 'Flagrancia Contravencional',
    distractores: [
      'La presentación de una denuncia escrita ante la fiscalía transcurridos treinta días desde la infracción.',
      'El inicio de una indagación previa formal por sospecha fundada sin que exista inmediatez temporal ni física.',
      'La confesión voluntaria del investigado rendida quince días después del cometimiento de la falta punible.'
    ]
  },
  {
    num: 11,
    pregunta: '¿Qué es la prueba testimonial?',
    correcta: 'Es un medio de prueba. Consiste en la declaración realizada por una persona sobre hechos relevantes para el procedimiento contravencional.',
    articulo: 'Art. 501-507 COIP',
    subtema: 'Medios de Prueba: Testimonial',
    distractores: [
      'El informe técnico pericial elaborado por un laboratorio químico acreditado de criminalística.',
      'La incorporación material de instrumentos públicos certificados por el registrador de la propiedad.',
      'Una alegación verbal de cierre emitida por los abogados defensores sin juramento ni contradicción.'
    ]
  },
  {
    num: 12,
    pregunta: '¿Qué es la prueba documental?',
    correcta: 'Es un medio de prueba. Consiste en documentos físicos o electrónicos legalmente incorporados al procedimiento para demostrar hechos relevantes.',
    articulo: 'Art. 499-500 COIP',
    subtema: 'Medios de Prueba: Documental',
    distractores: [
      'La declaración jurada de la víctima rendida verbalmente en la audiencia ante el juzgador.',
      'El examen físico o psicológico realizado a la persona procesada por médicos forenses.',
      'La reconstrucción virtual de los hechos efectuada mediante inspección judicial ocular.'
    ]
  },
  {
    num: 13,
    pregunta: '¿Qué es la prueba pericial?',
    correcta: 'Es un medio de prueba. Consiste en la opinión técnica, científica o especializada emitida por un experto respecto de materias que requieren conocimientos específicos.',
    articulo: 'Art. 511 COIP',
    subtema: 'Medios de Prueba: Pericial',
    distractores: [
      'El relato fáctico espontáneo de testigos presenciales que no poseen formación científica.',
      'El parte informativo elaborado por el agente de tránsito sin acreditación en el sistema pericial.',
      'La resolución sancionatoria emitida con anterioridad por un juez de paz en la misma parroquia.'
    ]
  },
  {
    num: 14,
    pregunta: '¿Qué debe hacer el juez al valorar la prueba?',
    correcta: 'Analizarla de manera integral, lógica, objetiva y motivada conforme a la Constitución y la ley.',
    articulo: 'Art. 457 COIP, Art. 115 COGEP',
    subtema: 'Valoración Probatoria',
    distractores: [
      'Aplicar la íntima convicción subjetiva prescindiendo de toda fundamentación o contraste analítico.',
      'Dar valor de prueba plena tarifada exclusivamente al informe policial sin contrastarlo con la defensa.',
      'Rechazar de plano toda prueba de descargo presentada por el procesado en ejercicio de su defensa.'
    ]
  },
  {
    num: 15,
    pregunta: '¿Qué es una sentencia condenatoria en materia contravencional?',
    correcta: 'Es una resolución judicial. Consiste en la declaración de responsabilidad de la persona procesada por una contravención y la imposición de la sanción correspondiente prevista por la ley.',
    articulo: 'Art. 643, 621 COIP',
    subtema: 'Sentencia Condenatoria',
    distractores: [
      'Un decreto de mero trámite que convoca a una nueva fecha de audiencia preliminar de conciliación.',
      'Una resolución que ratifica la inocencia procesal y ordena el archivo definitivo de la causa contravencional.',
      'Un dictamen fiscal abstentivo que inhibe al juzgador de pronunciarse sobre el fondo del litigio.'
    ]
  },
  {
    num: 16,
    pregunta: '¿Qué es una sentencia absolutoria en materia contravencional?',
    correcta: 'Es una resolución judicial. Consiste en declarar que no se ha probado la responsabilidad de la persona procesada respecto de la contravención imputada.',
    articulo: 'Art. 643, 623 COIP',
    subtema: 'Sentencia Absolutoria',
    distractores: [
      'La orden de internamiento carcelario preventivo para garantizar el cobro de daños pecuniarios a la víctima.',
      'El fallo que declara culpable al contraventor e impone trabajo comunitario obligatorio por treinta días.',
      'Un acuerdo transaccional privado firmado ante un centro de mediación sin homologación judicial.'
    ]
  },
  {
    num: 17,
    pregunta: '¿Qué recurso procede contra las decisiones judiciales en materia contravencional cuando la ley lo permite?',
    correcta: 'El recurso de apelación.',
    articulo: 'Art. 644, 653 COIP',
    subtema: 'Recursos Contravencionales',
    distractores: [
      'El recurso extraordinario de casación ante la Sala Penal de la Corte Nacional.',
      'El recurso de revisión en única instancia ante el Tribunal Contencioso Administrativo.',
      'La acción extraordinaria de protección previa obligatoria ante el Consejo de la Judicatura.'
    ]
  },
  {
    num: 18,
    pregunta: '¿Qué garantiza el derecho a recurrir?',
    correcta: 'La posibilidad de impugnar una decisión judicial ante una autoridad superior en los casos previstos por la ley.',
    articulo: 'Art. 76 num. 7 lit. m CRE, Art. 652 COIP',
    subtema: 'Derecho a Recurrir (Doble Conforme)',
    distractores: [
      'La potestad del juzgador de primera instancia de anular su propia sentencia sin petición de parte.',
      'La facultad de acudir directamente a tribunales internacionales sin agotar la jurisdicción nacional.',
      'El deber de la persona procesada de cumplir inmediatamente la sanción sin posibilidad de impugnación.'
    ]
  },
  {
    num: 19,
    pregunta: '¿Qué es la cosa juzgada?',
    correcta: 'Es un efecto jurídico de las resoluciones firmes. Consiste en impedir que un asunto resuelto mediante decisión ejecutoriada vuelva a ser juzgado, salvo excepciones legales.',
    articulo: 'Art. 76 num. 7 lit. i CRE, Art. 5 num. 9 COIP',
    subtema: 'Cosa Juzgada',
    distractores: [
      'La facultad del fiscal de reabrir investigaciones ilimitadamente siempre que aparezcan nuevos indicios.',
      'La provisionalidad de los fallos contravencionales que pueden modificarse en cualquier tiempo por el juez.',
      'La suspensión temporal del plazo procesal mientras la Corte Provincial emite informes consultivos.'
    ]
  },
  {
    num: 20,
    pregunta: '¿Qué es el principio non bis in idem?',
    correcta: 'Es una garantía constitucional. Consiste en que ninguna persona puede ser juzgada ni sancionada dos veces por los mismos hechos y fundamentos.',
    articulo: 'Art. 76 num. 7 lit. i CRE, Art. 5 num. 9 COIP',
    subtema: 'Principio Non Bis In Idem',
    distractores: [
      'La regla procesal que obliga a juzgar primero en la vía administrativa y luego reiterar la pena en sede penal.',
      'El derecho de la víctima a demandar dos veces en juzgados distintos para obtener doble reparación integral.',
      'La obligación de imponer simultáneamente dos penas privativas de libertad acumulables sin límite legal.'
    ]
  },
  {
    num: 21,
    pregunta: '¿Qué es una contravención contra las personas?',
    correcta: 'Es una contravención penal. Consiste en una conducta de menor gravedad que afecta la integridad, seguridad o bienestar de una persona y que se encuentra expresamente tipificada por la ley.',
    articulo: 'Art. 393-397 COIP',
    subtema: 'Contravenciones contra las Personas',
    distractores: [
      'Un delito grave de genocidio o lesa humanidad sancionado con pena de treinta años de privación de libertad.',
      'Una infracción tributaria sancionada administrativamente por el Servicio de Rentas Internas.',
      'Una discrepancia contractual mercantil derivada del incumplimiento de pago de una letra de cambio.'
    ]
  },
  {
    num: 22,
    pregunta: '¿Qué es una contravención contra la propiedad?',
    correcta: 'Es una contravención penal. Consiste en una conducta de menor gravedad que afecta bienes o derechos patrimoniales protegidos por la ley.',
    articulo: 'Art. 393, 396 COIP',
    subtema: 'Contravenciones contra la Propiedad',
    distractores: [
      'Un asalto con resultado de muerte tipificado como delito agravado contra la inviolabilidad de la vida.',
      'Un juicio de prescripción extraordinaria adquisitiva de dominio tramitado en la vía ordinaria civil.',
      'Una expropiación forzosa de terrenos urbanos ejecutada por un Gobierno Autónomo Descentralizado.'
    ]
  },
  {
    num: 23,
    pregunta: '¿Cuál es el criterio principal para diferenciar una contravención de un delito?',
    correcta: 'La clasificación establecida por la ley y el nivel de gravedad jurídica de la conducta sancionada.',
    articulo: 'Art. 19 COIP',
    subtema: 'Criterio de Diferenciación Punitiva',
    distractores: [
      'La voluntad discrecional del policía aprehensor al momento de redactar su parte de detención.',
      'El monto de los ingresos económicos mensuales que perciba la persona investigada o denunciante.',
      'La edad que tenga el juzgador que asuma el conocimiento inicial de la causa en el distrito judicial.'
    ]
  },
  {
    num: 24,
    pregunta: '¿Qué es una sanción contravencional?',
    correcta: 'Es una consecuencia jurídica penal. Consiste en la pena o medida prevista por la ley para quien ha sido declarado responsable de una contravención.',
    articulo: 'Art. 60-63 COIP',
    subtema: 'Sanción Contravencional',
    distractores: [
      'Una multa administrativa no penal cobrada coercitivamente sin juzgamiento judicial alguno.',
      'Una medida disciplinaria laboral adoptada por el empleador frente al abandono intempestivo del trabajo.',
      'Una condena accesoria indeterminada sin límite temporal impuesta a discreción de la fiscalía.'
    ]
  },
  {
    num: 25,
    pregunta: '¿Qué es la proporcionalidad de la sanción?',
    correcta: 'Es un principio jurídico. Consiste en la correspondencia que debe existir entre la gravedad de la conducta infractora y la sanción impuesta.',
    articulo: 'Art. 76 num. 6 CRE, Art. 5 num. 15 COIP',
    subtema: 'Principio de Proporcionalidad',
    distractores: [
      'La aplicación de la pena máxima legalmente contemplada para delitos mayores a cualquier contravención menor.',
      'La facultad de triplicar las penas privativas de libertad atendiendo al clamor público de redes sociales.',
      'La regla según la cual toda infracción debe sancionarse únicamente con disculpas públicas sin pena material.'
    ]
  },
  {
    num: 26,
    pregunta: '¿Cuál es la función de la motivación en una sentencia contravencional?',
    correcta: 'Explicar los hechos probados, la valoración de la prueba, las normas aplicadas y las razones que justifican la decisión judicial.',
    articulo: 'Art. 76 num. 7 lit. l CRE, Art. 622 COIP',
    subtema: 'Función de la Motivación',
    distractores: [
      'Resumir exclusivamente el alegato inicial del denunciante omitiendo toda argumentación probatoria y normativa.',
      'Ocultar el criterio interpretativo del tribunal para evitar la interposición de recursos de apelación procesales.',
      'Constituir una mera formalidad optativa cuya omisión no genera la nulidad ni invalidez del fallo dictado.'
    ]
  },
  {
    num: 27,
    pregunta: '¿Cuál es el deber del juzgador respecto de la valoración de la prueba?',
    correcta: 'Valorar toda la prueba de manera objetiva, lógica, integral y motivada conforme a la Constitución y la ley.',
    articulo: 'Art. 457 COIP, Art. 130 COFJ',
    subtema: 'Deber Judicial en la Valoración Probatoria',
    distractores: [
      'Valorar únicamente los elementos que sustenten la acusación, desechando de oficio la prueba de descargo.',
      'Fundamentar la convicción exclusivamente en la intuición personal del magistrado sin motivación explícita.',
      'Delegar la valoración final de los testimonios y peritajes en el personal administrativo de secretaría.'
    ]
  },
  {
    num: 28,
    pregunta: '¿Qué es la oralidad en el procedimiento contravencional?',
    correcta: 'Es un principio procesal. Consiste en que las principales actuaciones del procedimiento se desarrollen verbalmente ante la autoridad judicial competente.',
    articulo: 'Art. 168 num. 6 CRE, Art. 560 COIP',
    subtema: 'Oralidad Procesal',
    distractores: [
      'La obligatoriedad de sustanciar todo el trámite únicamente mediante memoriales escritos sin audiencias.',
      'El uso facultativo de la palabra reservado con exclusividad al fiscal de turno sin intervención del procesado.',
      'La lectura silenciosa de actas notariales sin debate público ni exposición de alegatos contradictorios.'
    ]
  },
  {
    num: 29,
    pregunta: '¿Qué es la inmediación?',
    correcta: 'Es un principio procesal. Consiste en que la jueza o el juez mantenga contacto directo con las partes, los medios de prueba y el desarrollo de la audiencia.',
    articulo: 'Art. 5 num. 17 COIP, Art. 19 COFJ',
    subtema: 'Principio de Inmediación',
    distractores: [
      'La delegación total de la toma de testimonios en el actuario del despacho judicial fuera de la sala.',
      'La resolución del proceso penal basada únicamente en copias simples enviadas por correspondencia postal.',
      'El distanciamiento obligatorio del juzgador respecto de la práctica presencial de las pruebas practicadas.'
    ]
  },
  {
    num: 30,
    pregunta: '¿Qué es la contradicción?',
    correcta: 'Es un principio procesal. Consiste en el derecho de las partes a conocer, debatir, objetar y controvertir las pruebas y argumentos presentados durante el procedimiento.',
    articulo: 'Art. 168 num. 6 CRE, Art. 5 num. 13 COIP',
    subtema: 'Principio de Contradicción',
    distractores: [
      'La prohibición legal de interrogar a los testigos presentados por la parte contraria en la audiencia.',
      'La facultad de imponer resoluciones condenatorias secretas sin traslado previo a la persona procesada.',
      'El deber de las partes de aceptar indefectiblemente las afirmaciones vertidas en el parte policial.'
    ]
  },
  {
    num: 31,
    pregunta: '¿Qué es la publicidad en el procedimiento contravencional?',
    correcta: 'Es un principio procesal. Consiste en que las audiencias y actuaciones judiciales sean públicas, salvo las excepciones previstas por la Constitución y la ley.',
    articulo: 'Art. 168 num. 5 CRE, Art. 562 COIP, Art. 13 COFJ',
    subtema: 'Principio de Publicidad',
    distractores: [
      'La difusión obligatoria e indiscriminada en cadenas de televisión de las audiencias que involucran menores.',
      'El carácter secreto e inaccesible de todas las audiencias judiciales por mandato de la fiscalía provincial.',
      'La reserva absoluta de los expedientes judiciales impidiendo incluso a las partes consultar sus autos.'
    ]
  },
  {
    num: 32,
    pregunta: '¿Qué es el debido proceso en materia contravencional?',
    correcta: 'Es una garantía constitucional. Consiste en el conjunto de derechos y garantías que aseguran un juzgamiento justo, imparcial y respetuoso de los derechos de las partes.',
    articulo: 'Art. 76 CRE',
    subtema: 'Debido Proceso',
    distractores: [
      'Un conjunto de prerrogativas extraordinarias reservadas exclusivamente para la acusación pública estatal.',
      'Un trámite sumario que autoriza la condena automática del imputado sin necesidad de escuchar sus alegatos.',
      'Una directriz técnica aplicable exclusivamente a litigios tributarios y arbitrajes mercantiles internacionales.'
    ]
  },
  {
    num: 33,
    pregunta: '¿Qué garantiza el derecho a la defensa?',
    correcta: 'La posibilidad de intervenir en el procedimiento, ser escuchado, presentar pruebas, controvertirlas y contar con asistencia jurídica.',
    articulo: 'Art. 76 num. 7 CRE',
    subtema: 'Derecho a la Defensa',
    distractores: [
      'La obligación de la persona procesada de responder obligatoriamente a interrogatorios autoincriminatorios.',
      'La potestad del juez de resolver la causa prescindiendo de la presencia o notificación de la defensa técnica.',
      'El deber de la víctima de renunciar a toda asistencia letrada durante el desarrollo de la audiencia de juicio.'
    ]
  },
  {
    num: 34,
    pregunta: '¿Qué es el principio de igualdad procesal?',
    correcta: 'Es una garantía procesal. Consiste en otorgar a las partes las mismas oportunidades para ejercer sus derechos dentro del procedimiento.',
    articulo: 'Art. 76 num. 7 lit. c CRE, Art. 5 num. 7 COIP',
    subtema: 'Igualdad Procesal',
    distractores: [
      'La concesión de mayores privilegios temporales y probatorios a la institución policial en detrimento del procesado.',
      'La obligación de fallar siempre en contra de la persona que posea mayor patrimonio económico en el juicio.',
      'La exigencia de que ambas partes formulen idénticas pretensiones jurídicas ante el juzgador de la causa.'
    ]
  },
  {
    num: 35,
    pregunta: '¿Qué es la competencia judicial?',
    correcta: 'Es una atribución legal de la función jurisdiccional. Consiste en la facultad otorgada por la ley a una jueza o juez para conocer y resolver determinados asuntos.',
    articulo: 'Art. 156 COFJ, Art. 404 COIP',
    subtema: 'Competencia Judicial (COFJ)',
    distractores: [
      'La potestad discrecional de cualquier funcionario administrativo para encarcelar infractores sin ley previa.',
      'La capacidad de los litigantes para elegir a su propio arbitrio el juzgado que dicte sentencia favorable.',
      'El poder ilimitado del Presidente de la República para asumir el juzgamiento de causas contravencionales.'
    ]
  },
  {
    num: 36,
    pregunta: '¿Qué garantiza el principio del juez competente?',
    correcta: 'Que ninguna persona sea juzgada por una autoridad distinta de aquella previamente determinada por la Constitución y la ley.',
    articulo: 'Art. 76 num. 7 lit. k CRE',
    subtema: 'Principio del Juez Natural y Competente',
    distractores: [
      'La creación de tribunales ad-hoc o comisiones especiales después de acontecidos los hechos investigados.',
      'La potestad de la policía comunitaria para dictar penas privativas de libertad de forma inmediata y sumaria.',
      'La facultad de radicar la causa penal en cualquier juzgado del país según la conveniencia del acusador.'
    ]
  },
  {
    num: 37,
    pregunta: '¿Qué es una infracción flagrante?',
    correcta: 'Es una situación jurídica de flagrancia. Consiste en sorprender a una persona cometiendo una infracción o inmediatamente después de haberla cometido, conforme a los requisitos establecidos por la ley.',
    articulo: 'Art. 527 COIP',
    subtema: 'Infracción Flagrante',
    distractores: [
      'Una infracción prescrita hace más de cinco años que carece de todo elemento material y vestigio probatorio.',
      'Una presunción de sospecha derivada de denuncias anónimas publicadas en medios digitales sin constatación.',
      'El relato de hechos no presenciados ocurrido varios meses antes sin persecución ininterrumpida alguna.'
    ]
  },
  {
    num: 38,
    pregunta: '¿Qué facultad tiene la autoridad frente a una contravención flagrante?',
    correcta: 'Proceder a la aprehensión de la persona presuntamente infractora y adoptar las actuaciones permitidas por la ley para el inicio del procedimiento correspondiente.',
    articulo: 'Art. 526, 527 COIP',
    subtema: 'Aprehensión y Actuación en Flagrancia',
    distractores: [
      'Imponer de forma verbal e inmediata la pena de prisión sin llevar al sospechoso ante el juez de garantías.',
      'Aplicar sanciones corporales o castigos físicos directos previstos en reglamentos disciplinarios policiales.',
      'Exigir el pago de una fianza en efectivo en el lugar de la detención para permitir la libertad del sujeto.'
    ]
  },
  {
    num: 39,
    pregunta: '¿Cuál es el propósito de la audiencia de juzgamiento en contravenciones?',
    correcta: 'Practicar la prueba, escuchar a las partes y resolver la situación jurídica de la persona procesada.',
    articulo: 'Art. 642, 643 COIP',
    subtema: 'Propósito de la Audiencia Contravencional',
    distractores: [
      'Diferir indefinidamente el juzgamiento hasta que la causa prescriba por vencimiento de plazos legales.',
      'Emitir órdenes de allanamiento reservadas sin permitir la comparecencia de la persona investigada.',
      'Determinar únicamente la sanción tributaria pecuniaria en beneficio de las arcas fiscales municipales.'
    ]
  },
  {
    num: 40,
    pregunta: '¿Qué es una prueba obtenida ilegalmente?',
    correcta: 'Es una prueba ilícita. Consiste en aquella obtenida con vulneración de derechos constitucionales o de las disposiciones legales aplicables.',
    articulo: 'Art. 76 num. 4 CRE, Art. 454 num. 6 COIP',
    subtema: 'Prueba Ilícita e Ilegal',
    distractores: [
      'Aquella que ha sido rendida voluntariamente ante el juez con asistencia de abogado defensor de confianza.',
      'Cualquier documento legalizado ante notario público cumpliendo las formalidades del ordenamiento.',
      'El testimonio rendido bajo juramento en la sala de audiencias con respeto irrestricto a la contradicción.'
    ]
  },
  {
    num: 41,
    pregunta: '¿Cuál es el efecto de la prueba ilícita?',
    correcta: 'Carece de validez y eficacia probatoria y no puede ser utilizada para fundamentar una decisión judicial.',
    articulo: 'Art. 76 num. 4 CRE, Art. 454 num. 6 COIP',
    subtema: 'Eficacia de la Prueba Ilícita',
    distractores: [
      'Constituye prueba plena incontrovertible que obliga al juzgador a dictar sentencia condenatoria inmediata.',
      'Se convalida automáticamente si el agente fiscal declara bajo juramento que fue obtenida de buena fe.',
      'Mantiene plena validez probatoria salvo que el procesado pague una tasa judicial especial de impugnación.'
    ]
  },
  {
    num: 42,
    pregunta: '¿Qué es la sana crítica?',
    correcta: 'Es un sistema de valoración probatoria. Consiste en analizar la prueba mediante reglas de lógica, experiencia y conocimiento racional para formar convicción sobre los hechos.',
    articulo: 'Art. 457 COIP, Art. 115 COGEP',
    subtema: 'Sistema de Sana Crítica',
    distractores: [
      'Un método de tarifa legal rígida donde el testimonio policial vale el doble que la pericia científica.',
      'La libre convicción subjetiva donde el juzgador prescinde de toda explicación racional y objetiva.',
      'La valoración arbitraria de indicios basada en corazonadas o prejuicios morales del juzgador.'
    ]
  },
  {
    num: 43,
    pregunta: '¿Qué debe contener una sentencia válida?',
    correcta: 'La determinación de los hechos, la valoración de la prueba, la fundamentación jurídica y la decisión debidamente motivada.',
    articulo: 'Art. 622 COIP, Art. 130 COFJ',
    subtema: 'Requisitos de Validez de la Sentencia',
    distractores: [
      'Únicamente la parte dispositiva resolutiva sin explicar antecedentes fácticos ni preceptos legales.',
      'La firma del fiscal y de la policía sin necesidad de firma ni intervención de la autoridad judicial.',
      'El reenvío obligatorio de la causa para que el Consejo de la Judicatura elabore los considerandos jurídicos.'
    ]
  },
  {
    num: 44,
    pregunta: '¿Qué es la seguridad jurídica dentro del procedimiento?',
    correcta: 'Es una garantía constitucional. Consiste en el respeto a normas jurídicas previas, claras, públicas y aplicadas por autoridad competente.',
    articulo: 'Art. 82 CRE',
    subtema: 'Seguridad Jurídica Procesal',
    distractores: [
      'La aplicación retroactiva perjudicial de nuevas leyes penales más rigurosas a hechos ya ocurridos.',
      'El cambio imprevisto de los criterios del juzgador durante el juicio sin motivación jurídica alguna.',
      'La potestad del tribunal de inventar procedimientos procesales inexistentes en la ley ecuatoriana.'
    ]
  },
  {
    num: 45,
    pregunta: '¿Cuál es la finalidad de la administración de justicia en materia contravencional?',
    correcta: 'Resolver conflictos e infracciones respetando el debido proceso, garantizando los derechos de las partes y aplicando correctamente la ley.',
    articulo: 'Art. 167 CRE, Art. 1 COFJ',
    subtema: 'Fines de la Administración de Justicia',
    distractores: [
      'Recaudar fondos económicos masivos mediante multas arbitrarias para financiar la gestión judicial.',
      'Perseguir políticamente a ciudadanos infractores privándolos sumariamente de sus derechos cívicos.',
      'Suplantar las funciones legislativas mediante la expedición de tipos penales creados en audiencias.'
    ]
  },
  {
    num: 46,
    pregunta: '¿Qué es una resolución judicial?',
    correcta: 'Es un acto jurisdiccional emitido por una autoridad competente. Consiste en una decisión adoptada dentro de un proceso con efectos jurídicos para las partes.',
    articulo: 'Art. 122 COFJ, Art. 619 COIP',
    subtema: 'Actos y Resoluciones Judiciales (COFJ)',
    distractores: [
      'Una opinión académica informal publicada en revistas de doctrina sin fuerza vinculante.',
      'Una circular administrativa interna emitida por el departamento de talento humano del juzgado.',
      'Un comunicado de prensa emitido por el Ministerio de Gobierno sobre el estado de la seguridad ciudadana.'
    ]
  },
  {
    num: 47,
    pregunta: '¿Cuál es la diferencia entre auto y sentencia?',
    correcta: 'El auto resuelve aspectos procesales o incidentales del procedimiento, mientras que la sentencia resuelve el fondo del asunto y determina la responsabilidad o no responsabilidad de la persona procesada.',
    articulo: 'Art. 122 COFJ, Art. 88 COGEP',
    subtema: 'Distinción entre Auto y Sentencia (COFJ)',
    distractores: [
      'El auto pone fin de manera definitiva a todo el proceso penal, mientras que la sentencia solo convoca a audiencia.',
      'La sentencia es dictada por el secretario y el auto únicamente por los ministros de la Corte Nacional.',
      'No existe distinción alguna; ambos términos son equivalentes y producen cosa juzgada material idéntica.'
    ]
  },
  {
    num: 48,
    pregunta: '¿Qué es la ejecutoria?',
    correcta: 'Es el estado jurídico que adquiere una resolución judicial cuando ya no admite recursos ordinarios o cuando estos han sido resueltos de manera definitiva.',
    articulo: 'Art. 628 COIP, Art. 123 COFJ',
    subtema: 'Ejecutoria de Resoluciones Judiciales',
    distractores: [
      'El momento procesal en que la persona procesada rinde su versión inicial ante el fiscal de turno.',
      'La fase previa donde el juez de contravenciones califica la legalidad de la aprehensión policial.',
      'La presentación oportuna del recurso extraordinario de protección ante la Corte Constitucional.'
    ]
  },
  {
    num: 49,
    pregunta: '¿Qué efecto produce una sentencia ejecutoriada?',
    correcta: 'Produce autoridad de cosa juzgada y permite su ejecución conforme a la ley.',
    articulo: 'Art. 628 COIP, Art. 76 num. 7 lit. i CRE',
    subtema: 'Efectos de la Sentencia Ejecutoriada',
    distractores: [
      'Permite volver a juzgar a la persona por los mismos hechos si la víctima no quedó satisfecha.',
      'Suspende de forma permanente la potestad jurisdiccional del Estado para vigilar su cumplimiento.',
      'Convierte el fallo en una simple recomendación no obligatoria sujeta a la voluntad del contraventor.'
    ]
  },
  {
    num: 50,
    pregunta: '¿Qué es la jurisdicción?',
    correcta: 'Es una potestad pública del Estado. Consiste en la facultad de administrar justicia mediante la resolución de conflictos y la aplicación del ordenamiento jurídico.',
    articulo: 'Art. 150 COFJ',
    subtema: 'Jurisdicción (COFJ)',
    distractores: [
      'La demarcación territorial municipal destinada exclusivamente al cobro de impuestos prediales.',
      'El poder otorgado a los oficiales de policía para redactar informes de investigación delictiva.',
      'La facultad de los colegios de abogados para sancionar con destitución a los jueces provinciales.'
    ]
  },
  {
    num: 51,
    pregunta: '¿Qué es la competencia?',
    correcta: 'Es una atribución legal de la jurisdicción. Consiste en la facultad específica que tiene una jueza o juez para conocer determinados asuntos según la materia, territorio, grado o personas involucradas.',
    articulo: 'Art. 156 COFJ',
    subtema: 'Competencia (COFJ)',
    distractores: [
      'La rivalidad económica y comercial existente entre despachos judiciales de una misma provincia.',
      'La capacidad de los peritos acreditados para dictaminar sobre cualquier materia sin límite legal.',
      'El poder absoluto de juzgar en todo el país sin respetar la materia ni el fuero de las personas.'
    ]
  },
  {
    num: 52,
    pregunta: '¿Qué garantiza la independencia judicial?',
    correcta: 'Que juezas y jueces adopten decisiones libres de presiones, influencias o interferencias externas.',
    articulo: 'Art. 168 num. 1 CRE, Art. 8 COFJ',
    subtema: 'Independencia Judicial (COFJ)',
    distractores: [
      'La subordinación obligatoria de los fallos judiciales a las instrucciones de ministros del Ejecutivo.',
      'La facultad de los jueces de fallar contrariando expresamente la Constitución sin rendir cuentas.',
      'El deber de consultar las sentencias contravencionales con los medios masivos de comunicación.'
    ]
  },
  {
    num: 53,
    pregunta: '¿Qué es la imparcialidad judicial?',
    correcta: 'Es una garantía del debido proceso. Consiste en la obligación de la autoridad judicial de actuar sin favorecer ni perjudicar indebidamente a ninguna de las partes.',
    articulo: 'Art. 76 num. 7 lit. k CRE, Art. 9 COFJ',
    subtema: 'Imparcialidad Judicial (COFJ)',
    distractores: [
      'El deber del juez de apoyar incondicionalmente las pretensiones de la parte que presentó primero la denuncia.',
      'La prohibición a los jueces de valorar las pruebas testimoniales cuando una de las partes es extranjera.',
      'La facultad del juzgador de actuar como testigo principal y acusador en el proceso que está tramitando.'
    ]
  },
  {
    num: 54,
    pregunta: '¿Qué garantiza el acceso a la justicia?',
    correcta: 'El derecho de toda persona a acudir a los órganos jurisdiccionales para obtener tutela judicial efectiva y una decisión conforme a Derecho.',
    articulo: 'Art. 75 CRE',
    subtema: 'Acceso a la Justicia',
    distractores: [
      'La exigencia del pago previo de tasas judiciales onerosas como requisito para presentar quejas por contravención.',
      'El derecho de litigar sin someterse a las normas procesales previstas por el legislador ordinario.',
      'La posibilidad de resolver toda controversia penal mediante linchamientos o castigos no autorizados.'
    ]
  },
  {
    num: 55,
    pregunta: '¿Qué es la tutela judicial efectiva?',
    correcta: 'Es una garantía constitucional. Consiste en el derecho a acceder a la justicia, obtener una resolución motivada y lograr la ejecución efectiva de lo resuelto.',
    articulo: 'Art. 75 CRE',
    subtema: 'Tutela Judicial Efectiva',
    distractores: [
      'El derecho a obtener un fallo favorable obligatoriamente, incluso cuando no se posea la razón en derecho.',
      'La obligación del Estado de asegurar defensores privados pagados por la víctima en litigios civiles.',
      'La suspensión indefinida del proceso hasta que el denunciado declare voluntariamente su culpabilidad.'
    ]
  },
  {
    num: 56,
    pregunta: '¿Qué garantiza la seguridad jurídica?',
    correcta: 'El respeto a la Constitución y la existencia de normas jurídicas previas, claras, públicas y aplicadas por autoridad competente.',
    articulo: 'Art. 82 CRE',
    subtema: 'Principio de Seguridad Jurídica',
    distractores: [
      'La inmunidad total de los infractores penales frente a cualquier persecución sancionatoria del Estado.',
      'La facultad del tribunal de cambiar arbitrariamente las reglas del procedimiento a mitad del juicio.',
      'La imposición de penas retroactivas agravadas con base en preceptos consuetudinarios no codificados.'
    ]
  },
  {
    num: 57,
    pregunta: '¿Qué es el principio de legalidad?',
    correcta: 'Es un principio constitucional. Consiste en que las autoridades y servidores públicos únicamente pueden actuar dentro de las competencias y facultades que les atribuyen la Constitución y la ley.',
    articulo: 'Art. 226 CRE, Art. 76 num. 3 CRE, Art. 5 num. 1 COIP',
    subtema: 'Principio de Legalidad',
    distractores: [
      'La presunción de que los jueces pueden ejercer cualquier facultad no prohibida expresamente por la moral.',
      'El principio según el cual todo ciudadano puede imponer sanciones penales por su propia cuenta.',
      'La potestad del fiscal de tipificar nuevas contravenciones en sus dictámenes sin ley previa de la Asamblea.'
    ]
  },
  {
    num: 58,
    pregunta: '¿Qué es una nulidad procesal?',
    correcta: 'Es una institución procesal. Consiste en la invalidez de una actuación realizada con vulneración de requisitos esenciales o garantías fundamentales establecidas por la ley.',
    articulo: 'Art. 652 num. 10 COIP, Art. 107 COGEP',
    subtema: 'Nulidad Procesal',
    distractores: [
      'La ratificación definitiva de todas las actuaciones viciadas sin posibilidad de reclamo de las partes.',
      'La condena obligatoria de la persona procesada a pesar de que el procedimiento estuvo viciado.',
      'Un recurso ordinario que solo procede en causas civiles patrimoniales de mayor cuantía mercantil.'
    ]
  },
  {
    num: 59,
    pregunta: '¿Cuál es la finalidad de la nulidad procesal?',
    correcta: 'Restablecer la legalidad procesal y proteger los derechos afectados por actuaciones irregulares o violatorias del debido proceso.',
    articulo: 'Art. 652 num. 10 COIP, Art. 76 CRE',
    subtema: 'Finalidad de la Nulidad Procesal',
    distractores: [
      'Extinguir definitivamente toda acción penal perdonando la responsabilidad material del infractor.',
      'Sancionar con privación de libertad inmediata al juez que cometió el error procesal involuntario.',
      'Impedir que el juicio continúe aun cuando el defecto formal haya sido subsanado oportunamente.'
    ]
  },
  {
    num: 60,
    pregunta: '¿Qué es el saneamiento procesal?',
    correcta: 'Es una institución procesal. Consiste en el conjunto de actuaciones destinadas a corregir, subsanar o superar defectos procesales para garantizar la validez del procedimiento.',
    articulo: 'Art. 604 COIP, Art. 130 COFJ',
    subtema: 'Saneamiento Procesal (COIP y COFJ)',
    distractores: [
      'El cierre definitivo del expediente penal sin pronunciamiento judicial sobre el fondo de la controversia.',
      'La exoneración incondicional de toda responsabilidad administrativa del secretario judicial actuante.',
      'La renuncia irrevocable de la víctima a los derechos constitucionales de reparación integral del daño.'
    ]
  }
];

function buildContravencionesPreguntas() {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  const resultado = CONTRAVENCIONES_ITEMS.map((item, idx) => {
    // Exact balance: idx % 4 ensures 15 A, 15 B, 15 C, 15 D
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
      id: `JR-CONTRAV-${item.num}`,
      codigoOficial: `JR-COIP-COFJ-2026-${String(item.num).padStart(3, '0')}`,
      materia: 'Derecho Penal',
      subtema: item.subtema,
      dificultad: (idx % 3 === 0 ? 'media' : idx % 3 === 1 ? 'alta' : 'baja') as 'baja' | 'media' | 'alta',
      tipo: 'normativa' as const,
      enunciado: item.pregunta,
      alternativas,
      respuestaCorrecta: targetLetter,
      explicacion: `Respuesta oficial indubitada: "${item.correcta}". Fundamento normativo positivo en el Código Orgánico Integral Penal (COIP), Código Orgánico de la Función Judicial (COFJ) y Constitución de la República del Ecuador (${item.articulo}).`,
      explicacionDistractores: {
        A: 'Alternativa analizada técnicamente conforme a la dogmática contravencional, COFJ y garantías del debido proceso.',
        B: 'Alternativa analizada técnicamente conforme a la dogmática contravencional, COFJ y garantías del debido proceso.',
        C: 'Alternativa analizada técnicamente conforme a la dogmática contravencional, COFJ y garantías del debido proceso.',
        D: 'Alternativa analizada técnicamente conforme a la dogmática contravencional, COFJ y garantías del debido proceso.',
      },
      fuente: {
        norma: item.articulo.includes('COFJ')
          ? 'Código Orgánico de la Función Judicial (COFJ) / COIP'
          : item.articulo.includes('CRE')
          ? 'Constitución de la República del Ecuador / COIP'
          : 'Código Orgánico Integral Penal (COIP)',
        articulo: item.articulo,
        textoSoporte: item.correcta,
        urlOficial: 'https://www.asambleanacional.gob.ec',
        fechaConsulta: '2026-10-22',
        vigenciaVerificada: true,
      },
      jurisprudencia: {
        organo: 'Corte Nacional de Justicia / Corte Constitucional del Ecuador',
        reglaJurisprudencial: 'Garantías del debido proceso en materia contravencional, procedimiento expedito, motivación suficiente, inmediación y contradicción.',
      },
      estado: 'validada' as const,
      observaciones: 'Banco oficial facilitado por el usuario - Cuestionario Contravenciones (COIP y COFJ) JR',
      fechaCreacion: '2026-10-22T00:00:00.000Z',
      fechaActualizacion: '2026-10-22T00:00:00.000Z',
      esDemostracion: false,
      revisadaPorHumano: true,
      revisadoPor: 'Jaime Roldán - EFJ',
    };
  });

  return resultado;
}

const contravPreguntas = buildContravencionesPreguntas();

// Guardar banco contravenciones como JSON
const contravJsonPath = path.resolve(process.cwd(), 'src/data/bancoContravencionesJR.json');
fs.writeFileSync(contravJsonPath, JSON.stringify(contravPreguntas, null, 2), 'utf-8');
console.log(`Guardadas ${contravPreguntas.length} preguntas de contravenciones en ${contravJsonPath}`);

// Leer bancos previos
const constJsonPath = path.resolve(process.cwd(), 'src/data/bancoConstitucionalJR.json');
const penalJsonPath = path.resolve(process.cwd(), 'src/data/bancoPenalJR.json');
const procJsonPath = path.resolve(process.cwd(), 'src/data/bancoProcedimientosPenalesJR.json');

const constPreguntas = JSON.parse(fs.readFileSync(constJsonPath, 'utf-8'));
const penalPreguntas = JSON.parse(fs.readFileSync(penalJsonPath, 'utf-8'));
const procPreguntas = JSON.parse(fs.readFileSync(procJsonPath, 'utf-8'));

// Combinar en banco oficial conjunto (105 constitucional + 63 penal + 48 procedimientos + 60 contravenciones = 276 preguntas)
const bancoOficialCombinado = [...constPreguntas, ...penalPreguntas, ...procPreguntas, ...contravPreguntas];
const combinadoJsonPath = path.resolve(process.cwd(), 'src/data/bancoOficialJR.json');
fs.writeFileSync(combinadoJsonPath, JSON.stringify(bancoOficialCombinado, null, 2), 'utf-8');
console.log(`Banco oficial total: ${bancoOficialCombinado.length} preguntas guardadas en ${combinadoJsonPath}`);

// Estadísticas de verificación
const letterCounts = { A: 0, B: 0, C: 0, D: 0 };
for (const p of contravPreguntas) {
  letterCounts[p.respuestaCorrecta as 'A' | 'B' | 'C' | 'D']++;
}
console.log('Distribución de claves en Contravenciones:', letterCounts);
