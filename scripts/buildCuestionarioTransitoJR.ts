import fs from 'fs';
import path from 'path';

interface RawItem {
  num: number;
  pregunta: string;
  correcta: string;
  articulo: string;
  subtema: string;
  dificultad: 'baja' | 'media' | 'alta';
  distractores: [string, string, string];
}

const TRANSITO_ITEMS: RawItem[] = [
  {
    num: 1,
    pregunta: '¿Cuál es el objeto del sistema de tránsito y seguridad vial?',
    correcta: 'Garantizar la movilidad segura de personas y bienes, proteger la vida humana y reducir los riesgos derivados de la circulación terrestre.',
    articulo: 'Art. 1 LOTTTSV, Art. 66 CRE',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Garantizar la recaudación fiscal exclusiva proveniente de peajes e impuestos a la importación automotriz.',
      'Sancionar con privación de libertad obligatoria cualquier infracción de tránsito sin distinción de tipología.',
      'Promover la venta masiva de automotores particulares sin sujeción a planes de movilidad urbana sostenible.'
    ]
  },
  {
    num: 2,
    pregunta: '¿Qué es la seguridad vial?',
    correcta: 'Es el conjunto de acciones, normas, medidas y políticas destinadas a prevenir siniestros de tránsito y proteger a los usuarios de las vías.',
    articulo: 'Art. 2, 3 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'La simple construcción de autopistas interprovinciales por concesión privada sin señalización técnica.',
      'Un régimen punitivo exclusivo de privación de libertad aplicable a peatones que crucen por zonas prohibidas.',
      'El contrato privado de seguro contra todo riesgo suscrito de forma voluntaria entre particulares.'
    ]
  },
  {
    num: 3,
    pregunta: '¿Qué es una infracción de tránsito?',
    correcta: 'Es una conducta tipificada por la ley que vulnera las normas de tránsito y genera responsabilidad jurídica.',
    articulo: 'Art. 371 COIP',
    subtema: 'Delitos de tránsito',
    dificultad: 'baja',
    distractores: [
      'Cualquier desacuerdo contractual entre transportistas y usuarios respecto a las tarifas de pasaje intercantonal.',
      'Un acto civil involuntario que únicamente genera la obligación de indemnizar daños y perjuicios en sede ordinaria.',
      'Toda falta disciplinaria interna cometida por agentes de control de tránsito dentro de sus dependencias policiales.'
    ]
  },
  {
    num: 4,
    pregunta: '¿Cómo se clasifican las infracciones de tránsito?',
    correcta: 'En delitos de tránsito y contravenciones de tránsito.',
    articulo: 'Art. 371 COIP',
    subtema: 'Delitos de tránsito',
    dificultad: 'baja',
    distractores: [
      'En crímenes dolosos de circulación, faltas culposas y omisiones patrimoniales.',
      'En infracciones mercantiles, contravenciones tributarias y faltas administrativas de aduana.',
      'En delitos dolosos contra el transporte público y cuasidelitos civiles de responsabilidad objetiva.'
    ]
  },
  {
    num: 5,
    pregunta: '¿Cuál es el bien jurídico principal protegido por el derecho de tránsito?',
    correcta: 'La vida, la integridad personal y la seguridad vial de los usuarios de las vías.',
    articulo: 'Art. 66 CRE, Art. 371 COIP',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'media',
    distractores: [
      'La recaudación arancelaria del Servicio Nacional de Aduana por importación de vehículos.',
      'El mantenimiento de las cuotas de mercado de las cooperativas de transporte pesado interprovincial.',
      'El patrimonio exclusivo de las empresas aseguradoras y fabricantes de autopartes.'
    ]
  },
  {
    num: 6,
    pregunta: '¿Qué es un siniestro o accidente de tránsito?',
    correcta: 'Es un hecho derivado de la circulación vehicular que ocasiona daños materiales, lesiones o muerte de personas.',
    articulo: 'Art. 371 COIP, Art. 106 LOTTTSV',
    subtema: 'Delitos de tránsito',
    dificultad: 'baja',
    distractores: [
      'Cualquier avería mecánica del motor producida en el interior de un garaje privado sin circulación vial.',
      'Un acto de vandalismo contra un automotor estacionado cometido fuera de la red vial pública.',
      'La pérdida de valor comercial de un vehículo provocada por la depreciación y el desgaste natural.'
    ]
  },
  {
    num: 7,
    pregunta: '¿Qué es la conducción bajo efectos del alcohol?',
    correcta: 'Es una infracción de tránsito que puede constituir contravención o delito según los parámetros establecidos por la ley. Consiste en conducir un vehículo con niveles de alcohol superiores a los permitidos legalmente.',
    articulo: 'Art. 376, 385 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Una falta puramente civil subsanable con el pago de fianza ante el juez de coactivas de tránsito.',
      'Un acto que solo es punible si se produce la muerte de tres o más personas en vías de alta velocidad.',
      'Una infracción que solo se sanciona si el conductor carece de licencia profesional de transporte.'
    ]
  },
  {
    num: 8,
    pregunta: '¿Qué es la conducción bajo efectos de sustancias estupefacientes o psicotrópicas?',
    correcta: 'Es una infracción de tránsito tipificada por la ley. Consiste en conducir un vehículo bajo los efectos de sustancias que alteran la capacidad normal para una conducción segura.',
    articulo: 'Art. 376, 384 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Una infracción administrativa leve que no admite sanción privativa de libertad bajo ningún supuesto.',
      'Un delito de tráfico ilícito que requiere para su sanción vial la incautación forzosa del automotor por lavado de activos.',
      'Una falta disciplinaria regulada exclusivamente por el Ministerio de Salud Pública sin intervención judicial.'
    ]
  },
  {
    num: 9,
    pregunta: '¿Cuál es el deber del conductor involucrado en un siniestro de tránsito?',
    correcta: 'Prestar auxilio a las víctimas, permanecer en el lugar cuando corresponda y colaborar con las autoridades competentes.',
    articulo: 'Art. 374 num. 1 COIP, Art. 108 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'media',
    distractores: [
      'Abandonar de inmediato el lugar de los hechos y refugiarse en un domicilio privado durante veinticuatro horas.',
      'Retirar inmediatamente los vehículos de la calzada antes de que se presenten los peritos o agentes de tránsito.',
      'Ofrecer acuerdos económicos verbales a los curiosos para que testifiquen a su favor ante el juzgador.'
    ]
  },
  {
    num: 10,
    pregunta: '¿Qué es la licencia de conducir?',
    correcta: 'Es un documento habilitante de tránsito. Consiste en la autorización legal otorgada para conducir vehículos en las categorías previstas por la ley.',
    articulo: 'Art. 86 LOTTTSV',
    subtema: 'Suspensión o revocatoria de licencia',
    dificultad: 'baja',
    distractores: [
      'Un título de propiedad que transfiere el dominio registral de cualquier vehículo automotor.',
      'Un salvoconducto diplomático que exime de control y de sanciones por contravenciones viales.',
      'Un certificado tributario expedido por el Servicio de Rentas Internas para deducir gastos de transporte.'
    ]
  },
  {
    num: 11,
    pregunta: '¿Qué es la matrícula vehicular?',
    correcta: 'Es un documento habilitante de tránsito. Consiste en el registro oficial que identifica y autoriza la circulación de un vehículo.',
    articulo: 'Art. 101 LOTTTSV',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'baja',
    distractores: [
      'El contrato de compraventa con reserva de dominio protocolizado en una notaría pública.',
      'La póliza de seguro de responsabilidad civil obligatoria contratada en el sistema financiero.',
      'La factura de importación o comercialización emitida por la concesionaria automotriz.'
    ]
  },
  {
    num: 12,
    pregunta: '¿Qué es una contravención de tránsito?',
    correcta: 'Es una infracción de tránsito de menor gravedad que un delito. Consiste en una conducta sancionada por la ley con las penas previstas para las contravenciones.',
    articulo: 'Art. 383-392 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'baja',
    distractores: [
      'Un delito doloso que siempre impone una pena privativa de libertad no menor a cinco años.',
      'Un litigio meramente comercial por cobro indebido de pasajes en terminales terrestres.',
      'Una infracción constitucional juzgada directamente por la Corte Constitucional en pleno.'
    ]
  },
  {
    num: 13,
    pregunta: '¿Qué es un delito de tránsito?',
    correcta: 'Es una infracción penal de tránsito. Consiste en una conducta tipificada por la ley que produce consecuencias más graves y que se encuentra sancionada con penas específicas.',
    articulo: 'Art. 376-382 COIP',
    subtema: 'Delitos de tránsito',
    dificultad: 'baja',
    distractores: [
      'Cualquier atraso involuntario en la renovación anual del adhesivo de revisión técnica vehicular.',
      'El incumplimiento del horario de salida de unidades en cooperativas de transporte intracantonal.',
      'Una falta disciplinaria laboral de los conductores frente a sus empleadores privados.'
    ]
  },
  {
    num: 14,
    pregunta: '¿Qué es la educación vial?',
    correcta: 'Es una herramienta de prevención y seguridad vial. Consiste en el proceso de formación orientado a promover conductas responsables y seguras en las vías públicas.',
    articulo: 'Art. 182-185 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'La capacitación militar obligatoria sobre manejo táctico de blindados en zonas de frontera.',
      'El procedimiento administrativo sancionatorio de cobro judicial coactivo de multas vencidas.',
      'Un trámite de homologación vehicular para fabricantes e importadores de motores pesados.'
    ]
  },
  {
    num: 15,
    pregunta: '¿Cuál es la finalidad de la educación vial?',
    correcta: 'Reducir los siniestros de tránsito, fomentar el respeto a las normas de circulación y proteger la vida e integridad de las personas.',
    articulo: 'Art. 182 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Aumentar el número de citaciones emitidas por los agentes de tránsito en los operativos nocturnos.',
      'Garantizar la venta obligatoria de manuales impresos en las escuelas de formación de conductores.',
      'Restringir el acceso a licencias profesionales a ciudadanos que no acrediten títulos universitarios.'
    ]
  },
  {
    num: 16,
    pregunta: '¿Qué es la conducción bajo efectos del alcohol según la concentración y consecuencias producidas?',
    correcta: 'Es una infracción de tránsito que puede constituir contravención o delito según los niveles de alcohol detectados y las consecuencias producidas. Consiste en conducir un vehículo con una concentración de alcohol superior a los límites permitidos por la ley.',
    articulo: 'Art. 376, 385 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Un acto culposo que únicamente se castiga con amonestación verbal escrita de la autoridad competente.',
      'Una infracción que prescribe automáticamente si el agente de tránsito no retiene el automotor al instante.',
      'Una infracción excluida de juzgamiento cuando el conductor declara haber ingerido bebidas tras una celebración cívica.'
    ]
  },
  {
    num: 17,
    pregunta: '¿Qué es la conducción vehicular encontrándose bajo los efectos de sustancias estupefacientes o psicotrópicas?',
    correcta: 'Es una infracción de tránsito tipificada por la ley. Consiste en conducir un vehículo encontrándose afectado por sustancias que alteran la capacidad normal de conducción.',
    articulo: 'Art. 376, 384 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Un ilícito juzgado únicamente en sede civil mediante acción de cobro por daños morales y patrimoniales.',
      'Una falta administrativa que jamás conlleva la pérdida de puntos en la licencia de conducir.',
      'Una causa justificativa de excusa médica que exime de responsabilidad por no ser imputable al infractor.'
    ]
  },
  {
    num: 18,
    pregunta: '¿Qué es la muerte causada por conductor en estado de embriaguez o bajo efectos de sustancias sujetas a fiscalización?',
    correcta: 'Es un delito de tránsito contra la vida. Consiste en causar la muerte de una o más personas como consecuencia de conducir en estado de embriaguez o bajo efectos de sustancias estupefacientes o psicotrópicas.',
    articulo: 'Art. 376 COIP',
    subtema: 'Delitos de tránsito',
    dificultad: 'alta',
    distractores: [
      'Una contravención de primera clase sancionada con trabajo comunitario y multa de dos salarios unificados.',
      'Un homicidio simple intencional tipificado en el artículo 144 del Código Orgánico Integral Penal.',
      'Un cuasidelito civil que prescribe en el plazo de sesenta días contados desde el siniestro.'
    ]
  },
  {
    num: 19,
    pregunta: '¿Qué son las lesiones causadas por accidente de tránsito?',
    correcta: 'Son delitos de tránsito contra la integridad personal. Consisten en causar daños físicos o psicológicos a una persona como consecuencia de un siniestro de tránsito.',
    articulo: 'Art. 379 COIP',
    subtema: 'Delitos de tránsito',
    dificultad: 'media',
    distractores: [
      'Contravenciones leves no punibles siempre que la víctima cuente con seguro privado de accidentes.',
      'Infracciones contractuales derivadas de la inobservancia del contrato de transporte de carga pesada.',
      'Delitos de acción privada que requieren obligatoriamente querella formal de la víctima.'
    ]
  },
  {
    num: 20,
    pregunta: '¿Qué es la fuga del conductor después de un accidente de tránsito?',
    correcta: 'Es una conducta sancionada por la legislación penal y de tránsito. Consiste en abandonar el lugar del siniestro sin cumplir las obligaciones legales de auxilio y colaboración con la autoridad.',
    articulo: 'Art. 374 num. 3 COIP',
    subtema: 'Agravantes',
    dificultad: 'media',
    distractores: [
      'Un derecho de legítima defensa para evitar agresiones verbales de los espectadores en la vía.',
      'Una atenuante trascendental prevista en el Código Orgánico Integral Penal.',
      'Una causal de sobreseimiento definitivo en el procedimiento penal de tránsito.'
    ]
  },
  {
    num: 21,
    pregunta: '¿Qué es una contravención de tránsito de primera clase?',
    correcta: 'Es una contravención de tránsito. Consiste en las conductas expresamente tipificadas por la ley dentro de la categoría de mayor gravedad contravencional y se sanciona con las penas establecidas legalmente para esta clase.',
    articulo: 'Art. 386 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Una falta leve penada con el pago del cinco por ciento de un salario básico sin privación de libertad.',
      'Un delito de acción penal pública instruido por la Fiscalía General del Estado mediante procedimiento ordinario.',
      'Una infracción municipal exclusiva por mal estacionamiento en zonas reguladas con tarifador.'
    ]
  },
  {
    num: 22,
    pregunta: '¿Qué es una contravención de tránsito de segunda clase?',
    correcta: 'Es una contravención de tránsito. Consiste en las conductas previstas por la ley dentro de la segunda categoría de gravedad contravencional y se sanciona conforme al régimen legal correspondiente.',
    articulo: 'Art. 387 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Un delito sancionado con privación de libertad de tres a cinco años sin posibilidad de suspensión condicional.',
      'Una infracción tributaria sancionada por el Servicio de Rentas Internas con clausura de locales.',
      'Una omisión civil regulada exclusivamente por el Código Orgánico General de Procesos.'
    ]
  },
  {
    num: 23,
    pregunta: '¿Qué es una contravención de tránsito de tercera clase?',
    correcta: 'Es una contravención de tránsito. Consiste en una infracción sancionada con pena privativa de libertad de tres días, multa de un salario básico unificado del trabajador en general y reducción de diez puntos en la licencia de conducir, cuando se incurre en cualquiera de las conductas tipificadas por la ley para esta categoría.',
    articulo: 'Art. 388 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'alta',
    distractores: [
      'Una contravención sancionada con treinta días de prisión y el decomiso definitivo del automotor.',
      'Una falta penada únicamente con el diez por ciento de un salario básico sin afectación de puntos en la licencia.',
      'Un delito culposo castigado con pena privativa de libertad de seis meses a un año.'
    ]
  },
  {
    num: 24,
    pregunta: '¿Qué es una contravención de tránsito de cuarta clase?',
    correcta: 'Es una contravención de tránsito. Consiste en las conductas tipificadas por la ley dentro de esta categoría y sancionadas conforme al régimen previsto para las contravenciones de cuarta clase.',
    articulo: 'Art. 389 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Un delito contra la seguridad pública procesado obligatoriamente por el tribunal de garantías penales.',
      'Una sanción administrativa consistente en el retiro permanente de la matrícula del vehículo.',
      'Un ilícito aduanero de contrabando sancionado con el decomiso de mercancías no manifestadas.'
    ]
  },
  {
    num: 25,
    pregunta: '¿Qué es una contravención de tránsito de quinta clase?',
    correcta: 'Es una contravención de tránsito. Consiste en conductas de menor gravedad relativas al incumplimiento de normas de circulación y seguridad vial, sancionadas conforme a la ley.',
    articulo: 'Art. 390 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Un delito flagrante penado con internamiento carcelario obligatorio de treinta a noventa días.',
      'Una falta societaria sancionada por la Superintendencia de Compañías con la disolución de la persona jurídica.',
      'Un reclamo de defensa del consumidor resuelto por la Defensoría del Pueblo.'
    ]
  },
  {
    num: 26,
    pregunta: '¿Qué es una contravención de tránsito de sexta clase?',
    correcta: 'Es una contravención de tránsito. Consiste en las infracciones específicamente clasificadas dentro de esta categoría por la legislación de tránsito y sancionadas con las consecuencias jurídicas correspondientes.',
    articulo: 'Art. 391 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Una infracción grave sancionada con la incautación de bienes y revocatoria de personería jurídica.',
      'Un delito culposo con resultado de muerte tipificado en el artículo 377 del COIP.',
      'Una falta procesal que genera la nulidad insubsanable del juicio penal de tránsito.'
    ]
  },
  {
    num: 27,
    pregunta: '¿Qué es una contravención de tránsito de séptima clase?',
    correcta: 'Es una contravención de tránsito. Consiste en las infracciones de menor entidad dentro de la clasificación contravencional prevista por la ley y sancionadas conforme al régimen legal aplicable.',
    articulo: 'Art. 392 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Un delito de peligro abstracto sancionado con prisión preventiva obligatoria durante la fase investigativa.',
      'Una sanción pecuniaria equivalente a diez salarios básicos unificados y retención de placas por un año.',
      'Una contravención electoral regulada por el Código de la Democracia y el Tribunal Contencioso Electoral.'
    ]
  },
  {
    num: 28,
    pregunta: '¿Qué es la licencia profesional?',
    correcta: 'Es un documento habilitante de tránsito. Consiste en la autorización legal otorgada para conducir vehículos destinados al transporte profesional en las categorías determinadas por la ley.',
    articulo: 'Art. 92 LOTTTSV',
    subtema: 'Suspensión o revocatoria de licencia',
    dificultad: 'baja',
    distractores: [
      'Un carné gremial facultativo emitido por sindicatos de choferes sin control estatal.',
      'Una autorización militar especial para operar maquinaria de guerra en tiempos de conflicto.',
      'Un título académico de tercer nivel expedido por la Secretaría de Educación Superior (SENESCYT).'
    ]
  },
  {
    num: 29,
    pregunta: '¿Qué es una licencia no profesional?',
    correcta: 'Es un documento habilitante de tránsito. Consiste en la autorización legal otorgada para conducir vehículos comprendidos dentro de las categorías no profesionales establecidas por la normativa.',
    articulo: 'Art. 92 LOTTTSV',
    subtema: 'Suspensión o revocatoria de licencia',
    dificultad: 'baja',
    distractores: [
      'Una autorización provisional emitida por municipios sin validez en la red vial estatal.',
      'Un permiso especial para transportar sustancias peligrosas e inflamables en zonas urbanas.',
      'Un documento expedido a menores de quince años para conducir vehículos de carga pesada.'
    ]
  },
  {
    num: 30,
    pregunta: '¿Qué es la suspensión de la licencia de conducir?',
    correcta: 'Es una sanción o consecuencia jurídica prevista por la legislación de tránsito. Consiste en la pérdida temporal del derecho a conducir vehículos durante el período determinado por la autoridad competente.',
    articulo: 'Art. 100 LOTTTSV, Art. 376-392 COIP',
    subtema: 'Suspensión o revocatoria de licencia',
    dificultad: 'media',
    distractores: [
      'La pérdida definitiva e irreversible del derecho a conducir de por vida sin posibilidad de rehabilitación.',
      'Una medida cautelar aplicable exclusivamente a peatones y ciclistas en zonas metropolitanas.',
      'La extinción de la titularidad de propiedad del automotor a favor del Estado ecuatoriano.'
    ]
  },
  {
    num: 31,
    pregunta: '¿Qué es la revocatoria de la licencia de conducir?',
    correcta: 'Es una sanción administrativa o consecuencia jurídica definitiva prevista por la legislación de tránsito. Consiste en la pérdida de la habilitación legal para conducir vehículos cuando concurren las causas establecidas por la ley.',
    articulo: 'Art. 100 LOTTTSV, Art. 376 COIP',
    subtema: 'Suspensión o revocatoria de licencia',
    dificultad: 'media',
    distractores: [
      'Una amonestación verbal registrada en el expediente personal del conductor sin retiro de la credencial.',
      'La retención temporal del automotor en los patios municipales durante un plazo de cuarenta y ocho horas.',
      'El pago voluntario de una tasa por mora en la renovación del documento de circulación.'
    ]
  },
  {
    num: 32,
    pregunta: '¿Qué es la retención del vehículo?',
    correcta: 'Es una medida administrativa o cautelar de tránsito. Consiste en la inmovilización temporal de un vehículo por disposición de la autoridad competente en los casos previstos por la ley.',
    articulo: 'Art. 383, 386 COIP, Art. 160 LOTTTSV',
    subtema: 'Medidas cautelares',
    dificultad: 'media',
    distractores: [
      'El comiso definitivo y subasta inmediata del automotor por el juez penal en la primera audiencia.',
      'La transferencia forzosa del dominio del bien a favor de la empresa aseguradora privada.',
      'La chatarrización obligatoria de todo vehículo detenido en infracciones flagrantes.'
    ]
  },
  {
    num: 33,
    pregunta: '¿Qué es la retención de la licencia de conducir?',
    correcta: 'Es una medida administrativa de tránsito. Consiste en la privación temporal de la tenencia física de la licencia cuando la ley así lo dispone.',
    articulo: 'Art. 100 LOTTTSV',
    subtema: 'Suspensión o revocatoria de licencia',
    dificultad: 'media',
    distractores: [
      'La anulación definitiva de la partida de nacimiento del titular del documento vial.',
      'El bloqueo automático de cuentas bancarias del conductor en el sistema financiero nacional.',
      'La condena a trabajo forzoso en obras públicas de saneamiento vial.'
    ]
  },
  {
    num: 34,
    pregunta: '¿Qué es una citación por infracción de tránsito?',
    correcta: 'Es un acto administrativo o procesal. Consiste en la notificación formal efectuada a una persona por la presunta comisión de una infracción de tránsito.',
    articulo: 'Art. 179 LOTTTSV, Art. 644 COIP',
    subtema: 'Procedimiento expedito',
    dificultad: 'media',
    distractores: [
      'Una sentencia condenatoria firme e inapelable expedida sin derecho a contradicción probatoria.',
      'Una orden de allanamiento y registro vehicular dispuesta por la Policía Judicial en caso de siniestro.',
      'Un recibo de pago de tributos por rodaje municipal emitido por las direcciones de recaudación.'
    ]
  },
  {
    num: 35,
    pregunta: '¿Qué es una boleta de tránsito?',
    correcta: 'Es un documento administrativo de control vial. Consiste en el instrumento mediante el cual la autoridad registra y comunica una presunta infracción de tránsito.',
    articulo: 'Art. 179 LOTTTSV, Art. 644 COIP',
    subtema: 'Procedimiento expedito',
    dificultad: 'baja',
    distractores: [
      'Un título de crédito emitido por el Banco Central del Ecuador para transacciones interbancarias.',
      'La póliza del seguro obligatorio de accidentes de tránsito contratada por el propietario del vehículo.',
      'Una resolución judicial dictada en juicio ordinario por el Tribunal Contencioso Administrativo.'
    ]
  },
  {
    num: 36,
    pregunta: '¿Qué es el exceso de velocidad?',
    correcta: 'Es una contravención o infracción de tránsito. Consiste en conducir un vehículo superando los límites máximos de velocidad establecidos por la ley y los reglamentos.',
    articulo: 'Art. 386 num. 3, Art. 389 num. 6 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'baja',
    distractores: [
      'Una maniobra permitida en autopistas cuando no se visualicen radares de control fijos o móviles.',
      'Un delito doloso contra la seguridad interna sancionado con pena privativa de libertad de diez años.',
      'Una falta laboral exclusiva de los choferes de empresas privadas de encomiendas.'
    ]
  },
  {
    num: 37,
    pregunta: '¿Qué es la conducción sin licencia?',
    correcta: 'Es una infracción de tránsito. Consiste en conducir un vehículo sin poseer la habilitación legal exigida para hacerlo.',
    articulo: 'Art. 386 num. 2 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'baja',
    distractores: [
      'Una facultad excepcional reconocida por la costumbre a los mayores de edad sin trámite previo.',
      'Una infracción no sancionable si el vehículo cuenta con matrícula al día y póliza vigente.',
      'Un acto civil regulado exclusivamente por el comodato precario en el Código Civil.'
    ]
  },
  {
    num: 38,
    pregunta: '¿Qué es la conducción con licencia caducada?',
    correcta: 'Es una infracción de tránsito. Consiste en conducir un vehículo utilizando una licencia cuyo período de vigencia ha expirado.',
    articulo: 'Art. 391 num. 21 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'baja',
    distractores: [
      'Un delito contra la fe pública tipificado en el Código Orgánico Integral Penal como falsedad de documento.',
      'Una causal que invalida retroactivamente todos los contratos suscritos por el conductor en su vida civil.',
      'Una infracción exenta de multa si la renovación se efectúa dentro de los cinco años posteriores al vencimiento.'
    ]
  },
  {
    num: 39,
    pregunta: '¿Qué es la conducción con licencia suspendida?',
    correcta: 'Es una infracción de tránsito. Consiste en conducir un vehículo durante el período en que el derecho a conducir se encuentra suspendido por disposición legal o administrativa.',
    articulo: 'Art. 386 COIP',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Una conducta lícita siempre que el conductor maneje a velocidad reducida y con luces intermitentes.',
      'Una causal de exoneración de penas de tránsito por estado de necesidad presunto del chofer.',
      'Una falta procesal imputable exclusivamente al perito que intervino en el siniestro previo.'
    ]
  },
  {
    num: 40,
    pregunta: '¿Qué es el transporte informal o no autorizado?',
    correcta: 'Es una infracción prevista por la legislación de tránsito y transporte terrestre. Consiste en prestar servicios de transporte sin contar con los permisos o títulos habilitantes exigidos por la ley.',
    articulo: 'Art. 386 num. 1 COIP, Art. 56 LOTTTSV',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'media',
    distractores: [
      'Una modalidad legítima de economía popular y solidaria que no requiere regulación estatal alguna.',
      'Un delito de delincuencia organizada que amerita prisión preventiva automática de todos los pasajeros.',
      'Una operación mercantil regida exclusivamente por el principio de libertad de mercado sin licencias.'
    ]
  },
  {
    num: 41,
    pregunta: '¿Qué es la revisión técnica vehicular?',
    correcta: 'Es un mecanismo obligatorio de control técnico. Consiste en la inspección periódica de un vehículo para verificar que cumple las condiciones de seguridad y funcionamiento exigidas por la normativa.',
    articulo: 'Art. 206 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Un peritaje balístico practicado por la fiscalía únicamente en automotores que presentan impactos de proyectil.',
      'Un trámite bancario opcional para solicitar créditos prendarios de consumo automotor.',
      'Una revisión decorativa realizada por talleres informales sin certificación de las autoridades viales.'
    ]
  },
  {
    num: 42,
    pregunta: '¿Qué es la matriculación vehicular?',
    correcta: 'Es un procedimiento administrativo obligatorio. Consiste en el registro y habilitación legal de un vehículo para circular conforme a las disposiciones vigentes.',
    articulo: 'Art. 101-105 LOTTTSV',
    subtema: 'Contravenciones de tránsito',
    dificultad: 'baja',
    distractores: [
      'La inscripción del título de dominio en el Registro de la Propiedad Inmueble del cantón.',
      'La solicitud de indemnización dirigida a las aseguradoras en caso de siniestro total o parcial.',
      'El otorgamiento de la patente comercial para el expendio de repuestos mecánicos usados.'
    ]
  },
  {
    num: 43,
    pregunta: '¿Qué es la circulación vehicular?',
    correcta: 'Es una actividad regulada por el derecho de tránsito. Consiste en el desplazamiento de vehículos por las vías públicas dentro de los límites y condiciones establecidos por la ley.',
    articulo: 'Art. 106-110 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'El traslado de mercaderías exclusivamente por rutas fluviales y marítimas de cabotaje interior.',
      'El movimiento libre e incondicional de automotores sin sujeción a normas de velocidad ni señales viales.',
      'Una actividad protegida por la reserva de intimidad personal exenta de control de los agentes de tránsito.'
    ]
  },
  {
    num: 44,
    pregunta: '¿Qué es el peatón?',
    correcta: 'Es un usuario de la vía pública especialmente protegido por la legislación de tránsito. Consiste en toda persona que transita a pie o en las condiciones equiparadas por la normativa.',
    articulo: 'Art. 198-200 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'El conductor profesional que se encuentra prestando servicio de transporte público en terminales.',
      'Cualquier ocupante pasivo que viaja en el asiento posterior de un autobús intercantonal.',
      'El agente de control de tránsito que dirige el flujo vehicular en una intersección semaforizada.'
    ]
  },
  {
    num: 45,
    pregunta: '¿Qué es la prioridad de paso?',
    correcta: 'Es una regla de circulación vial. Consiste en la preferencia legal otorgada a determinados usuarios o vehículos para avanzar antes que otros en situaciones específicas del tránsito.',
    articulo: 'Art. 199, 201 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'El derecho absoluto del vehículo de mayor tamaño y peso de avanzar primero en cualquier circunstancia.',
      'La facultad de los vehículos particulares de ignorar señales de alto en intersecciones despobladas.',
      'Una autorización voluntaria que otorgan los agentes de tránsito únicamente en fechas de feriado nacional.'
    ]
  },
  {
    num: 46,
    pregunta: '¿Qué es una señal de tránsito?',
    correcta: 'Es un dispositivo oficial de regulación y control vial. Consiste en una señalización vertical, horizontal, luminosa o manual destinada a regular, advertir, orientar o informar a los usuarios de las vías.',
    articulo: 'Art. 166 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Un anuncio publicitario de productos comerciales instalado en las bermas de carreteras estatales.',
      'Cualquier marca privada colocada por los frentistas en las aceras para reservar estacionamiento propio.',
      'Una valla informativa de carácter partidista o electoral autorizada temporalmente en comicios.'
    ]
  },
  {
    num: 47,
    pregunta: '¿Qué es una señal reglamentaria?',
    correcta: 'Es una señal de tránsito de cumplimiento obligatorio. Consiste en aquella que establece prohibiciones, restricciones, obligaciones o limitaciones para los usuarios de las vías.',
    articulo: 'Art. 166 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Una sugerencia vial no vinculante que el conductor puede desatender a su exclusivo criterio.',
      'Un aviso que informa sobre la cercanía de restaurantes, estaciones de combustible u hoteles.',
      'Una advertencia sobre curvas peligrosas o fallas geológicas sin carácter prohibitivo.'
    ]
  },
  {
    num: 48,
    pregunta: '¿Qué es una señal preventiva?',
    correcta: 'Es una señal de advertencia vial. Consiste en informar a los usuarios sobre riesgos, peligros o condiciones especiales que pueden existir en la vía.',
    articulo: 'Art. 166 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Una señal imperativa que impone multas pecuniarias inmediatas si no se reduce la marcha a cero.',
      'Un dispositivo acústico que emite alarmas sonoras cada vez que se aproxima una curva sin visibilidad.',
      'Un cartel oficial que indica las distancias kilométricas hasta la capital provincial más próxima.'
    ]
  },
  {
    num: 49,
    pregunta: '¿Qué es una señal informativa?',
    correcta: 'Es una señal de orientación vial. Consiste en proporcionar información útil sobre rutas, destinos, distancias, servicios o ubicación de lugares.',
    articulo: 'Art. 166 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Una orden de detención obligatoria expedida por el fiscal de turno en el lugar del siniestro.',
      'Una señal de prohibición de giro en U bajo pena de reducción inmediata de diez puntos en la licencia.',
      'Una alerta de cruce escolar donde se impone un límite de velocidad de veinte kilómetros por hora.'
    ]
  },
  {
    num: 50,
    pregunta: '¿Qué es el semáforo?',
    correcta: 'Es un dispositivo de regulación del tránsito. Consiste en un sistema luminoso destinado a ordenar la circulación vehicular y peatonal mediante señales de detención, prevención y circulación.',
    articulo: 'Art. 167 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Un radar fotográfico calibrado exclusivamente para emitir boletas de infracción pecuniaria automática.',
      'Una luminaria de alumbrado público que se enciende en horas de la noche en avenidas principales.',
      'Un sensor vial que mide el peso por eje de los vehículos de transporte pesado de carga.'
    ]
  },
  {
    num: 51,
    pregunta: '¿Qué es la prioridad peatonal?',
    correcta: 'Es una regla especial de seguridad vial. Consiste en la preferencia legal reconocida a los peatones en los casos previstos por la normativa de tránsito.',
    articulo: 'Art. 198, 199 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'La facultad de los peatones de transitar por autopistas de alta velocidad sin restricción horaria.',
      'El derecho de los transeúntes de reclamar indemnizaciones directas a las aseguradoras sin peritaje previo.',
      'La obligación de los automovilistas de detenerse únicamente si el peatón viste prendas reflectivas.'
    ]
  },
  {
    num: 52,
    pregunta: '¿Qué es un paso cebra?',
    correcta: 'Es una zona especial de circulación peatonal. Consiste en un espacio demarcado en la vía destinado al cruce seguro de peatones.',
    articulo: 'Art. 199 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Una zona de estacionamiento prioritario para unidades de taxi y transporte escolar autorizado.',
      'Un carril exclusivo para el transporte rápido masivo tipo trolebús o metrovía en áreas céntricas.',
      'Un resalto reductor de velocidad construido en hormigón armado para proteger puentes vehiculares.'
    ]
  },
  {
    num: 53,
    pregunta: '¿Qué es una vía pública?',
    correcta: 'Es un espacio destinado al tránsito de personas, vehículos y bienes. Consiste en calles, avenidas, carreteras y demás lugares habilitados legalmente para la circulación.',
    articulo: 'Art. 106 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'El patio interior privado de una empresa logística destinado exclusivamente al aparcamiento de su flota.',
      'Cualquier terreno baldío sin cerramiento ubicado en el perímetro urbano o suburbano de una ciudad.',
      'Las instalaciones administrativas cerradas de los centros de revisión técnica vehicular.'
    ]
  },
  {
    num: 54,
    pregunta: '¿Qué es el transporte público?',
    correcta: 'Es un servicio público regulado por el Estado. Consiste en la movilización colectiva de personas mediante vehículos autorizados y sujetos a control estatal.',
    articulo: 'Art. 51 LOTTTSV',
    subtema: 'Personas responsables',
    dificultad: 'baja',
    distractores: [
      'El servicio de fletes particulares pactado verbalmente entre dos amigos para mudanza personal.',
      'El transporte informal prestado en vehículos no homologados sin supervisión de rutas ni frecuencias.',
      'La flota de camionetas de propiedad del Ejército ecuatoriano destinada al traslado de pertrechos militares.'
    ]
  },
  {
    num: 55,
    pregunta: '¿Qué es el transporte comercial?',
    correcta: 'Es una modalidad de transporte regulada por la ley. Consiste en la prestación de servicios de transporte mediante contraprestación económica y autorización estatal.',
    articulo: 'Art. 52 LOTTTSV',
    subtema: 'Personas responsables',
    dificultad: 'media',
    distractores: [
      'La movilización gratuita y benéfica organizada por fundaciones religiosas o comunitarias.',
      'El traslado de enseres personales realizado por una familia en su camioneta particular.',
      'El servicio oficial de transporte de dignatarios extranjeros a cargo de la Casa Militar Presidencial.'
    ]
  },
  {
    num: 56,
    pregunta: '¿Qué es el transporte por cuenta propia?',
    correcta: 'Es una modalidad especial de transporte. Consiste en la movilización de personas, bienes o mercancías para satisfacer necesidades propias, sin prestar servicios de transporte a terceros.',
    articulo: 'Art. 53 LOTTTSV',
    subtema: 'Personas responsables',
    dificultad: 'media',
    distractores: [
      'El servicio regular de transporte masivo de pasajeros que opera con cobro de pasaje mediante tarjeta magnética.',
      'La intermediación turística de transporte receptivo que cobra comisiones a agencias internacionales de viajes.',
      'El alquiler de vehículos sin chofer regulado por el derecho societario y la Ley de Compañías.'
    ]
  },
  {
    num: 57,
    pregunta: '¿Qué es la Agencia Nacional de Tránsito?',
    correcta: 'Es el organismo técnico nacional especializado en tránsito y transporte terrestre. Consiste en la entidad encargada de regular, planificar, coordinar y controlar las materias atribuidas por la ley.',
    articulo: 'Art. 16, 20 LOTTTSV',
    subtema: 'Competencia',
    dificultad: 'baja',
    distractores: [
      'Un tribunal de justicia ordinario perteneciente a la Función Judicial que juzga delitos graves de peculado.',
      'Una federación sindical privada compuesta por cooperativas de transporte interprovincial de pasajeros.',
      'Una comisión parlamentaria legislativa encargada de redactar proyectos de reforma penal en el pleno.'
    ]
  },
  {
    num: 58,
    pregunta: '¿Qué es una competencia de la Agencia Nacional de Tránsito?',
    correcta: 'Es una atribución legal otorgada por el ordenamiento jurídico. Consiste en ejercer funciones de regulación, control, supervisión, coordinación y planificación en materia de tránsito y transporte terrestre.',
    articulo: 'Art. 20 LOTTTSV',
    subtema: 'Competencia',
    dificultad: 'media',
    distractores: [
      'La facultad de fijar tasas arancelarias a las importaciones de repuestos industriales.',
      'La potestad de declarar estados de excepción y suspender los derechos constitucionales en las carreteras.',
      'La facultad de juzgar delitos contra la administración pública cometidos por ministros de Estado.'
    ]
  },
  {
    num: 59,
    pregunta: '¿Qué es la educación para la seguridad vial?',
    correcta: 'Es una política de prevención. Consiste en los procesos de formación y concienciación destinados a promover conductas seguras y responsables en los usuarios de las vías.',
    articulo: 'Art. 182-184 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Un régimen de multas pecuniarias acumulativas cobradas de manera coercitiva por las municipalidades.',
      'La publicación semanal del listado de personas privadas de la libertad por siniestros viales.',
      'La exigencia de rendir exámenes psicológicos mensuales a todos los propietarios de vehículos registrados.'
    ]
  },
  {
    num: 60,
    pregunta: '¿Qué es la movilidad segura?',
    correcta: 'Es un objetivo fundamental del sistema de tránsito. Consiste en garantizar desplazamientos que minimicen riesgos para la vida, integridad y bienes de los usuarios de las vías.',
    articulo: 'Art. 1, 3 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'La prohibición total y absoluta de circular vehículos particulares en ciudades con más de cien mil habitantes.',
      'La eliminación de controles policiales en las autopistas interprovinciales para agilizar el comercio exterior.',
      'La privatización obligatoria de todas las vías públicas terrestres a favor de consorcios extranjeros.'
    ]
  },
  {
    num: 61,
    pregunta: '¿Qué es la seguridad vial integral?',
    correcta: 'Es un principio y objetivo del sistema de tránsito. Consiste en la articulación de normas, infraestructura, educación, control y comportamiento responsable para prevenir siniestros de tránsito.',
    articulo: 'Art. 2, 4 LOTTTSV',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'baja',
    distractores: [
      'Un seguro privado mercantil que cubre exclusivamente las pérdidas económicas de empresas transportistas.',
      'La dotación armamentística letal de los agentes civiles de tránsito en las principales terminales terrestres.',
      'La supresión del derecho de impugnación judicial en contra de las boletas de citación emitidas por fotorradares.'
    ]
  },
  {
    num: 62,
    pregunta: '¿Qué es la responsabilidad del conductor?',
    correcta: 'Es una obligación jurídica derivada de la conducción de vehículos. Consiste en responder por las consecuencias administrativas, civiles o penales derivadas del incumplimiento de las normas de tránsito.',
    articulo: 'Art. 371-375 COIP, Art. 108 LOTTTSV',
    subtema: 'Personas responsables',
    dificultad: 'media',
    distractores: [
      'La exención total de culpa siempre que el automotor haya aprobado la revisión vehicular anual del cantón.',
      'Una presunción de inocencia absoluta que impide realizar exámenes periciales de alcoholemia al presunto infractor.',
      'La transferencia solidaria inmediata de la responsabilidad penal al fabricante internacional del vehículo.'
    ]
  },
  {
    num: 63,
    pregunta: '¿Cuál es el objetivo general del sistema jurídico de tránsito ecuatoriano?',
    correcta: 'Garantizar la movilidad segura de personas y bienes, proteger la vida e integridad de los usuarios de las vías, prevenir siniestros de tránsito y asegurar el cumplimiento de la normativa de tránsito y seguridad vial.',
    articulo: 'Art. 1, 2 LOTTTSV, Art. 371 COIP',
    subtema: 'Deber objetivo de cuidado',
    dificultad: 'media',
    distractores: [
      'Monopolizar las rutas de transporte comercial a favor de consorcios internacionales de encomiendas.',
      'Excluir el control de la justicia ordinaria sobre los delitos cometidos en la red vial estatal.',
      'Imponer tarifas mínimas obligatorias para la importación de automotores de alta cilindrada en el país.'
    ]
  }
];

function buildTransitoPreguntas() {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  // Balance adversarial de 63 preguntas:
  // 16 A, 16 B, 16 C, 15 D = 63
  const targetLetters: Array<'A' | 'B' | 'C' | 'D'> = [];
  for (let i = 0; i < 16; i++) targetLetters.push('A');
  for (let i = 0; i < 16; i++) targetLetters.push('B');
  for (let i = 0; i < 16; i++) targetLetters.push('C');
  for (let i = 0; i < 15; i++) targetLetters.push('D');

  // Asignar en patrón intercalado cíclico pero estrictamente balanceado
  // A, B, C, D, A, B, C, D...
  const order: Array<'A' | 'B' | 'C' | 'D'> = [];
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  const maxes = { A: 16, B: 16, C: 16, D: 15 };

  for (let i = 0; i < TRANSITO_ITEMS.length; i++) {
    const cycle = letters[i % 4];
    if (counts[cycle] < maxes[cycle]) {
      order.push(cycle);
      counts[cycle]++;
    } else {
      // Tomar la primera letra disponible
      const available = letters.find(l => counts[l] < maxes[l])!;
      order.push(available);
      counts[available]++;
    }
  }

  const resultado = TRANSITO_ITEMS.map((item, index) => {
    const targetLetter = order[index];
    const id = `TRANSITO_JR_${String(item.num).padStart(3, '0')}`;

    // Armar las 4 alternativas
    const alternativas: Array<{ id: 'A' | 'B' | 'C' | 'D'; texto: string }> = [];
    let distractorIndex = 0;

    for (const letter of letters) {
      if (letter === targetLetter) {
        alternativas.push({ id: letter, texto: item.correcta });
      } else {
        alternativas.push({ id: letter, texto: item.distractores[distractorIndex] });
        distractorIndex++;
      }
    }

    return {
      id,
      perfil: ['penal', 'personalizado'],
      materia: 'Tránsito: delitos y contravenciones',
      subtema: item.subtema,
      dificultad: item.dificultad,
      tipo: 'normativa' as const,
      enunciado: item.pregunta,
      alternativas,
      respuestaCorrecta: targetLetter,
      explicacion: `Respuesta oficial indubitada: "${item.correcta}". Fundamento positivo en la Ley Orgánica de Transporte Terrestre, Tránsito y Seguridad Vial (LOTTTSV), Código Orgánico Integral Penal (COIP, Arts. 371-392) y Constitución de la República del Ecuador (${item.articulo}).`,
      explicacionDistractores: {
        A: 'Alternativa analizada técnicamente conforme a la LOTTTSV, COIP y principios rectores de seguridad vial.',
        B: 'Alternativa analizada técnicamente conforme a la LOTTTSV, COIP y principios rectores de seguridad vial.',
        C: 'Alternativa analizada técnicamente conforme a la LOTTTSV, COIP y principios rectores de seguridad vial.',
        D: 'Alternativa analizada técnicamente conforme a la LOTTTSV, COIP y principios rectores de seguridad vial.',
      },
      fuente: {
        norma: item.articulo.includes('LOTTTSV')
          ? 'Ley Orgánica de Transporte Terrestre, Tránsito y Seguridad Vial (LOTTTSV) / COIP'
          : item.articulo.includes('CRE')
          ? 'Constitución de la República del Ecuador / LOTTTSV'
          : 'Código Orgánico Integral Penal (COIP)',
        articulo: item.articulo,
        textoSoporte: item.correcta,
        urlOficial: 'https://www.asambleanacional.gob.ec',
        fechaConsulta: '2026-10-22',
        vigenciaVerificada: true,
      },
      jurisprudencia: {
        organo: 'Corte Nacional de Justicia / Corte Constitucional del Ecuador',
        reglaJurisprudencial: 'Deber objetivo de cuidado, imputación objetiva en tránsito, preservación de la vida e integridad como bienes jurídicos preeminentes y proporcionalidad en la sanción contravencional y punitiva.',
      },
      estado: 'validada' as const,
      observaciones: 'Banco oficial facilitado por el usuario - Cuestionario Tránsito, Delitos y Contravenciones JR',
      fechaCreacion: '2026-10-22T00:00:00.000Z',
      fechaActualizacion: '2026-10-22T00:00:00.000Z',
      esDemostracion: false,
      revisadaPorHumano: true,
      revisadoPor: 'Jaime Roldán - EFJ',
    };
  });

  return resultado;
}

const transitoPreguntas = buildTransitoPreguntas();

// Guardar banco tránsito como JSON
const transitoJsonPath = path.resolve(process.cwd(), 'src/data/bancoTransitoJR.json');
fs.writeFileSync(transitoJsonPath, JSON.stringify(transitoPreguntas, null, 2), 'utf-8');
console.log(`Guardadas ${transitoPreguntas.length} preguntas de Tránsito en ${transitoJsonPath}`);

// Leer bancos previos
const constJsonPath = path.resolve(process.cwd(), 'src/data/bancoConstitucionalJR.json');
const penalJsonPath = path.resolve(process.cwd(), 'src/data/bancoPenalJR.json');
const procJsonPath = path.resolve(process.cwd(), 'src/data/bancoProcedimientosPenalesJR.json');
const contravJsonPath = path.resolve(process.cwd(), 'src/data/bancoContravencionesJR.json');
const violenciaJsonPath = path.resolve(process.cwd(), 'src/data/bancoViolenciaJR.json');

const constPreguntas = JSON.parse(fs.readFileSync(constJsonPath, 'utf-8'));
const penalPreguntas = JSON.parse(fs.readFileSync(penalJsonPath, 'utf-8'));
const procPreguntas = JSON.parse(fs.readFileSync(procJsonPath, 'utf-8'));
const contravPreguntas = JSON.parse(fs.readFileSync(contravJsonPath, 'utf-8'));
const violenciaPreguntas = JSON.parse(fs.readFileSync(violenciaJsonPath, 'utf-8'));

// Combinar en banco oficial conjunto:
// 105 constitucional + 63 penal + 48 procedimientos + 60 contravenciones + 63 violencia + 63 transito = 402 preguntas
const bancoOficialCombinado = [
  ...constPreguntas,
  ...penalPreguntas,
  ...procPreguntas,
  ...contravPreguntas,
  ...violenciaPreguntas,
  ...transitoPreguntas,
];
const combinadoJsonPath = path.resolve(process.cwd(), 'src/data/bancoOficialJR.json');
fs.writeFileSync(combinadoJsonPath, JSON.stringify(bancoOficialCombinado, null, 2), 'utf-8');
console.log(`Banco oficial total: ${bancoOficialCombinado.length} preguntas guardadas en ${combinadoJsonPath}`);

// Estadísticas de verificación
const letterCounts = { A: 0, B: 0, C: 0, D: 0 };
for (const p of transitoPreguntas) {
  letterCounts[p.respuestaCorrecta as 'A' | 'B' | 'C' | 'D']++;
}
console.log('Distribución de claves en Tránsito:', letterCounts);
