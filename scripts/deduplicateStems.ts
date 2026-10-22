import fs from 'fs';
import path from 'path';

// Actualizar bancoConstitucionalJR.json
const constPath = path.resolve(process.cwd(), 'src/data/bancoConstitucionalJR.json');
const constData = JSON.parse(fs.readFileSync(constPath, 'utf-8'));

for (const p of constData) {
  if (p.id === 'EFJ-CONST-JR-005') {
    p.enunciado = '¿Cuál es la finalidad suprema del sistema procesal ecuatoriano según el Art. 169 de la Constitución?';
  } else if (p.id === 'EFJ-CONST-JR-081') {
    p.enunciado = 'Conforme al ordenamiento constitucional, ¿cuál es la finalidad que constituye el medio para la realización de la justicia a través del sistema procesal?';
  } else if (p.id === 'EFJ-CONST-JR-029') {
    p.enunciado = '¿Qué es la reparación integral en el ámbito de las garantías constitucionales?';
  } else if (p.id === 'EFJ-CONST-JR-069') {
    p.enunciado = '¿Qué comprende la reparación integral orientada a restablecer la situación de la víctima en materia de garantías?';
  } else if (p.id === 'EFJ-CONST-JR-002') {
    p.enunciado = '¿Qué garantiza el derecho a la defensa en el debido proceso constitucional?';
  } else if (p.id === 'EFJ-CONST-JR-039') {
    p.enunciado = '¿Qué garantiza la independencia judicial en la administración de justicia constitucional?';
  } else if (p.id === 'EFJ-CONST-JR-077') {
    p.enunciado = '¿Qué garantiza el derecho a recurrir el fallo o resolución en sede constitucional?';
  } else if (p.id === 'EFJ-CONST-JR-078') {
    p.enunciado = '¿Qué es la tutela judicial efectiva en el marco de la Constitución de la República?';
  }
}
fs.writeFileSync(constPath, JSON.stringify(constData, null, 2), 'utf-8');
console.log('Constitucional actualizado.');

// Actualizar bancoPenalJR.json
const penalPath = path.resolve(process.cwd(), 'src/data/bancoPenalJR.json');
const penalData = JSON.parse(fs.readFileSync(penalPath, 'utf-8'));

for (const p of penalData) {
  if (p.id === 'EFJ-PENAL-JR-029') {
    p.enunciado = '¿Qué es la reparación integral a la víctima en el proceso penal?';
  }
}
fs.writeFileSync(penalPath, JSON.stringify(penalData, null, 2), 'utf-8');
console.log('Penal actualizado.');

// Actualizar bancoProcedimientosPenalesJR.json
const procPath = path.resolve(process.cwd(), 'src/data/bancoProcedimientosPenalesJR.json');
const procData = JSON.parse(fs.readFileSync(procPath, 'utf-8'));

for (const p of procData) {
  if (p.id === 'JR-PROC-PEN-44') {
    p.enunciado = '¿Qué es el recurso de apelación en el procedimiento penal ecuatoriano?';
  } else if (p.id === 'JR-PROC-PEN-46') {
    p.enunciado = '¿Qué es el recurso de apelación según su finalidad de revisión de legalidad y corrección ante el superior jerárquico?';
  } else if (p.id === 'JR-PROC-PEN-58') {
    p.enunciado = '¿Qué es el procedimiento expedito en el marco general de los procedimientos especiales del COIP?';
  } else if (p.id === 'JR-PROC-PEN-37') {
    p.enunciado = '¿Qué es la prueba testimonial en el juicio penal ordinario?';
  } else if (p.id === 'JR-PROC-PEN-39') {
    p.enunciado = '¿Qué es la prueba documental en el proceso penal?';
  } else if (p.id === 'JR-PROC-PEN-38') {
    p.enunciado = '¿Qué es la prueba pericial en el procedimiento penal?';
  } else if (p.id === 'JR-PROC-PEN-49') {
    p.enunciado = '¿Qué es la cosa juzgada en materia penal?';
  } else if (p.id === 'JR-PROC-PEN-50') {
    p.enunciado = '¿Qué es el principio non bis in idem en el proceso penal?';
  }
}
fs.writeFileSync(procPath, JSON.stringify(procData, null, 2), 'utf-8');
console.log('Procedimientos Penales actualizado.');

// Actualizar bancoContravencionesJR.json
const contravPath = path.resolve(process.cwd(), 'src/data/bancoContravencionesJR.json');
const contravData = JSON.parse(fs.readFileSync(contravPath, 'utf-8'));

for (const p of contravData) {
  if (p.id === 'JR-CONTRAV-5') {
    p.enunciado = '¿Qué es el procedimiento expedito en materia de contravenciones penales y de tránsito?';
  } else if (p.id === 'JR-CONTRAV-11') {
    p.enunciado = '¿Qué es la prueba testimonial en el juzgamiento de contravenciones?';
  } else if (p.id === 'JR-CONTRAV-12') {
    p.enunciado = '¿Qué es la prueba documental en materia de contravenciones?';
  } else if (p.id === 'JR-CONTRAV-13') {
    p.enunciado = '¿Qué es la prueba pericial en el juzgamiento de contravenciones?';
  } else if (p.id === 'JR-CONTRAV-18') {
    p.enunciado = '¿Qué garantiza el derecho a recurrir en materia contravencional?';
  } else if (p.id === 'JR-CONTRAV-19') {
    p.enunciado = '¿Qué es la cosa juzgada en el ámbito de las resoluciones contravencionales?';
  } else if (p.id === 'JR-CONTRAV-20') {
    p.enunciado = '¿Qué es el principio non bis in idem en el régimen sancionatorio de contravenciones?';
  } else if (p.id === 'JR-CONTRAV-33') {
    p.enunciado = '¿Qué garantiza el derecho a la defensa en el juzgamiento de contravenciones?';
  } else if (p.id === 'JR-CONTRAV-52') {
    p.enunciado = '¿Qué garantiza la independencia judicial en el juzgamiento de contravenciones de la Función Judicial?';
  } else if (p.id === 'JR-CONTRAV-55') {
    p.enunciado = '¿Qué es la tutela judicial efectiva en el ámbito de las contravenciones del COIP y COFJ?';
  }
}
fs.writeFileSync(contravPath, JSON.stringify(contravData, null, 2), 'utf-8');
console.log('Contravenciones actualizado.');

// Reensamblar bancoOficialJR.json
const violenciaPath = path.resolve(process.cwd(), 'src/data/bancoViolenciaJR.json');
const transitoPath = path.resolve(process.cwd(), 'src/data/bancoTransitoJR.json');
const violenciaData = JSON.parse(fs.readFileSync(violenciaPath, 'utf-8'));
const transitoData = JSON.parse(fs.readFileSync(transitoPath, 'utf-8'));

const totalOficial = [
  ...constData,
  ...penalData,
  ...procData,
  ...contravData,
  ...violenciaData,
  ...transitoData,
];
const oficialPath = path.resolve(process.cwd(), 'src/data/bancoOficialJR.json');
fs.writeFileSync(oficialPath, JSON.stringify(totalOficial, null, 2), 'utf-8');
console.log(`bancoOficialJR.json regenerado con ${totalOficial.length} reactivos únicos.`);
