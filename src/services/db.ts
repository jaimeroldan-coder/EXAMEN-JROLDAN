import { IntentoExamen, Pregunta, RepasoEspaciadoItem } from '../types';
import { PREGUNTAS_DEMOSTRACION } from './demoData';
import { BANCO_COMPLETO_EFJ_110 } from './bancoPreguntasOficialEFJ';

const DB_NAME = 'SimuladorJudicialEcuadorDB';
const DB_VERSION = 2;

export class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store preguntas
        if (!db.objectStoreNames.contains('preguntas')) {
          const store = db.createObjectStore('preguntas', { keyPath: 'id' });
          store.createIndex('materia', 'materia', { unique: false });
          store.createIndex('estado', 'estado', { unique: false });
          store.createIndex('esDemostracion', 'esDemostracion', { unique: false });
        }

        // Store intentos
        if (!db.objectStoreNames.contains('intentos')) {
          const store = db.createObjectStore('intentos', { keyPath: 'id' });
          store.createIndex('fechaInicio', 'fechaInicio', { unique: false });
          store.createIndex('modalidad', 'modalidad', { unique: false });
        }

        // Store repaso espaciado
        if (!db.objectStoreNames.contains('repaso')) {
          db.createObjectStore('repaso', { keyPath: 'preguntaId' });
        }

        // Store metadata & settings
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'clave' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async inicializarDatos(): Promise<void> {
    await this.openDB();
    // Instalar las 402 preguntas oficiales del usuario (105 Constitucional + 63 Penal + 48 Procedimientos + 60 Contravenciones + 63 Violencia + 63 Tránsito) con 4 opciones
    if (typeof window !== 'undefined' && !localStorage.getItem('sje_banco_jr_402_instalado')) {
      await this.vaciarBancoCompleto();
      await this.cargarBancoOficialEFJ();
      localStorage.setItem('sje_banco_jr_402_instalado', 'true');
    } else {
      const count = await this.contarPreguntas();
      if (count === 0 && BANCO_COMPLETO_EFJ_110.length > 0) {
        await this.cargarBancoOficialEFJ();
      }
    }
  }

  async vaciarBancoCompleto(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async contarPreguntas(): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readonly');
      const store = tx.objectStore('preguntas');
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async cargarBancoOficialEFJ(): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      for (const p of PREGUNTAS_DEMOSTRACION) {
        store.put(p);
      }
      for (const p of BANCO_COMPLETO_EFJ_110) {
        store.put(p);
      }
      tx.oncomplete = () => resolve(BANCO_COMPLETO_EFJ_110.length);
      tx.onerror = () => reject(tx.error);
    });
  }

  async cargarDatosDemostracion(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      for (const p of PREGUNTAS_DEMOSTRACION) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async eliminarDatosDemostracion(): Promise<number> {
    const db = await this.openDB();
    const todas = await this.getPreguntas();
    const demo = todas.filter((p) => p.esDemostracion || p.id.startsWith('DEMO-'));
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      for (const p of demo) {
        store.delete(p.id);
      }
      tx.oncomplete = () => resolve(demo.length);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPreguntas(): Promise<Pregunta[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readonly');
      const store = tx.objectStore('preguntas');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async savePregunta(pregunta: Pregunta): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      store.put(pregunta);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async savePreguntasBatch(preguntas: Pregunta[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      for (const p of preguntas) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deletePregunta(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('preguntas', 'readwrite');
      const store = tx.objectStore('preguntas');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getIntentos(): Promise<IntentoExamen[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('intentos', 'readonly');
      const store = tx.objectStore('intentos');
      const req = store.getAll();
      req.onsuccess = () => {
        const items: IntentoExamen[] = req.result || [];
        // Orden descendente por fecha de inicio
        items.sort(
          (a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        );
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getIntentoById(id: string): Promise<IntentoExamen | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('intentos', 'readonly');
      const store = tx.objectStore('intentos');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveIntento(intento: IntentoExamen): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('intentos', 'readwrite');
      const store = tx.objectStore('intentos');
      store.put(intento);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteIntento(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('intentos', 'readwrite');
      const store = tx.objectStore('intentos');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getRepasoItems(): Promise<RepasoEspaciadoItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('repaso', 'readonly');
      const store = tx.objectStore('repaso');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveRepasoItem(item: RepasoEspaciadoItem): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('repaso', 'readwrite');
      const store = tx.objectStore('repaso');
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async exportarCopiaSeguridad(): Promise<string> {
    const preguntas = await this.getPreguntas();
    const intentos = await this.getIntentos();
    const repaso = await this.getRepasoItems();

    const backup = {
      version: 1,
      fechaExportacion: new Date().toISOString(),
      aplicacion: 'SIMULADOR JUDICIAL ECUADOR',
      preguntas,
      intentos,
      repaso,
    };

    return JSON.stringify(backup, null, 2);
  }

  async restaurarCopiaSeguridad(
    jsonStr: string
  ): Promise<{ preguntas: number; intentos: number; repaso: number }> {
    const data = JSON.parse(jsonStr);
    if (!data.preguntas || !Array.isArray(data.preguntas)) {
      throw new Error('El archivo no contiene un formato de respaldo válido de preguntas.');
    }

    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['preguntas', 'intentos', 'repaso'], 'readwrite');
      const pStore = tx.objectStore('preguntas');
      const iStore = tx.objectStore('intentos');
      const rStore = tx.objectStore('repaso');

      for (const p of data.preguntas) {
        pStore.put(p);
      }
      if (Array.isArray(data.intentos)) {
        for (const it of data.intentos) {
          iStore.put(it);
        }
      }
      if (Array.isArray(data.repaso)) {
        for (const rep of data.repaso) {
          rStore.put(rep);
        }
      }

      tx.oncomplete = () => {
        resolve({
          preguntas: data.preguntas.length,
          intentos: Array.isArray(data.intentos) ? data.intentos.length : 0,
          repaso: Array.isArray(data.repaso) ? data.repaso.length : 0,
        });
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new LocalDatabase();
