/**
 * CarMaintenance - Browser Storage Engine (IndexedDB + LocalStorage Fallback)
 * Consente l'esecuzione dell'app in produzione direttamente nel browser
 * senza dipendenza da un database MongoDB server-side.
 */
'use strict';

const CarStorage = (() => {
  const DB_NAME = 'CarMaintenanceDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'interventions';
  const SETTINGS_KEY = 'carmaintenance_settings';

  let dbInstance = null;

  // Dati di default iniziali per prima esecuzione
  const INITIAL_SEED_DATA = [
    {
      id: 'seed-1',
      date: '2024-01-10',
      veicolo: 'Volkswagen Golf 7',
      categoria: 'Tagliando',
      intervento: 'Tagliando completo dei 90.000 km: olio Castrol Edge 5W-30, filtro olio, filtro aria e filtro carburante',
      kilometri: 90200,
      costo: 245.50,
      note: 'Officina Autorizzata VW - Controllo generale eseguito'
    },
    {
      id: 'seed-2',
      date: '2024-03-22',
      veicolo: 'Volkswagen Golf 7',
      categoria: 'Freni',
      intervento: 'Sostituzione pastiglie e dischi freno anteriori Brembo',
      kilometri: 93500,
      costo: 185.00,
      note: 'Sostituzione fai da te con ricambi originali OEM'
    },
    {
      id: 'seed-3',
      date: '2024-05-15',
      veicolo: 'Volkswagen Golf 7',
      categoria: 'Pneumatici',
      intervento: 'Montaggio treno pneumatici estivi Michelin Pilot Sport 4 e convergenza ruote',
      kilometri: 96800,
      costo: 480.00,
      note: 'Gommista Rossi - Pressione impostata a 2.3 bar'
    },
    {
      id: 'seed-4',
      date: '2024-08-04',
      veicolo: 'Volkswagen Golf 7',
      categoria: 'Revisione',
      intervento: 'Revisione periodica ministeriale biennale con superamento test emissioni',
      kilometri: 101200,
      costo: 79.00,
      note: 'Centro Revisioni DEKRA - Esito regolare'
    },
    {
      id: 'seed-5',
      date: '2024-10-18',
      veicolo: 'Volkswagen Golf 7',
      categoria: 'Batteria',
      intervento: 'Sostituzione batteria avviamento AGM 70Ah Start&Stop',
      kilometri: 104500,
      costo: 140.00,
      note: 'Batteria Varta con codifica centralina'
    }
  ];

  function openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        return resolve(null); // Fallback su LocalStorage
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('kilometri', 'kilometri', { unique: false });
          store.createIndex('categoria', 'categoria', { unique: false });
        }
      };
      req.onsuccess = () => {
        dbInstance = req.result;
        resolve(dbInstance);
      };
      req.onerror = () => resolve(null);
    });
  }

  // LocalStorage Fallback helpers
  function getLocalItems() {
    try {
      const raw = localStorage.getItem(STORE_NAME);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setLocalItems(items) {
    try {
      localStorage.setItem(STORE_NAME, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage limit reached or disabled:', e);
    }
  }

  async function init() {
    await openIndexedDB();
    const existing = await getAll();
    if (!existing || existing.length === 0) {
      for (const item of INITIAL_SEED_DATA) {
        await add(item);
      }
    }
    return true;
  }

  function generateId() {
    return 'item-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  async function getAll(filterOpts = {}) {
    let items = [];
    if (dbInstance) {
      items = await new Promise((resolve) => {
        const tx = dbInstance.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(getLocalItems() || []);
      });
    } else {
      items = getLocalItems() || [];
    }

    // Filtri
    const { search, categoria, veicolo, sortBy, sortOrder } = filterOpts;

    let filtered = items.map(item => ({
      ...item,
      id: item.id || item._id,
      costo: Number(item.costo) || 0,
      kilometri: Number(item.kilometri) || 0
    }));

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(i =>
        (i.intervento && i.intervento.toLowerCase().includes(q)) ||
        (i.note && i.note.toLowerCase().includes(q))
      );
    }

    if (categoria && categoria !== 'Tutte' && categoria !== '') {
      filtered = filtered.filter(i => i.categoria === categoria);
    }

    if (veicolo && veicolo !== 'Tutti' && veicolo !== '') {
      filtered = filtered.filter(i => i.veicolo === veicolo);
    }

    // Ordinamento
    const order = sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (sortBy === 'kilometri') return (a.kilometri - b.kilometri) * order;
      if (sortBy === 'costo') return (a.costo - b.costo) * order;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
    });

    return filtered;
  }

  async function getById(id) {
    const all = await getAll();
    return all.find(i => (i.id === id || i._id === id)) || null;
  }

  async function add(data) {
    const item = {
      ...data,
      id: data.id || generateId(),
      costo: Number(data.costo) || 0,
      kilometri: Number(data.kilometri) || 0,
      createdAt: new Date().toISOString()
    };

    if (dbInstance) {
      await new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    }

    const current = getLocalItems() || [];
    const idx = current.findIndex(i => (i.id === item.id || i._id === item.id));
    if (idx >= 0) current[idx] = item;
    else current.push(item);
    setLocalItems(current);

    return item;
  }

  async function update(id, data) {
    const existing = await getById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      id,
      costo: Number(data.costo !== undefined ? data.costo : existing.costo) || 0,
      kilometri: Number(data.kilometri !== undefined ? data.kilometri : existing.kilometri) || 0,
      updatedAt: new Date().toISOString()
    };

    if (dbInstance) {
      await new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(updated);
        req.onsuccess = () => resolve(updated);
        req.onerror = () => reject(req.error);
      });
    }

    const current = getLocalItems() || [];
    const idx = current.findIndex(i => (i.id === id || i._id === id));
    if (idx >= 0) current[idx] = updated;
    setLocalItems(current);

    return updated;
  }

  async function remove(id) {
    if (dbInstance) {
      await new Promise((resolve) => {
        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    }

    const current = getLocalItems() || [];
    const filtered = current.filter(i => (i.id !== id && i._id !== id));
    setLocalItems(filtered);

    return true;
  }

  function calculateStats(items = []) {
    const totalCost = items.reduce((acc, curr) => acc + (Number(curr.costo) || 0), 0);
    const totalCount = items.length;
    const avgCost = totalCount > 0 ? totalCost / totalCount : 0;

    let maxKm = 0;
    let minKm = null;
    items.forEach(i => {
      const km = Number(i.kilometri) || 0;
      if (km > maxKm) maxKm = km;
      if (minKm === null || km < minKm) minKm = km;
    });

    const kmCovered = minKm !== null && maxKm >= minKm ? maxKm - minKm : 0;
    const costPerKm = kmCovered > 0 ? totalCost / kmCovered : null;

    const categoriesMap = {};
    items.forEach(i => {
      const c = i.categoria || 'Altro';
      categoriesMap[c] = (categoriesMap[c] || 0) + (Number(i.costo) || 0);
    });

    const monthlyMap = {};
    const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach(i => {
      const d = new Date(i.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + (Number(i.costo) || 0);
      }
    });

    // Scadenze & Tagliandi
    const now = new Date();
    const upcoming = [];

    // Tagliando
    const tagliandi = items.filter(i => i.categoria === 'Tagliando' || /tagliando/i.test(i.intervento));
    const ultimoTagliando = tagliandi.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (ultimoTagliando) {
      const kmDelta = maxKm - ultimoTagliando.kilometri;
      const kmMancanti = Math.max(0, 15000 - kmDelta);
      const mesiDelta = (now.getFullYear() - new Date(ultimoTagliando.date).getFullYear()) * 12 +
        (now.getMonth() - new Date(ultimoTagliando.date).getMonth());

      let status = 'ok';
      if (kmDelta >= 15000 || mesiDelta >= 12) status = 'scaduto';
      else if (kmDelta >= 13000 || mesiDelta >= 10) status = 'imminente';

      upcoming.push({
        titolo: 'Prossimo Tagliando',
        descrizione: `Soglia ogni 15.000 km o 12 mesi (Ultimo a ${ultimoTagliando.kilometri.toLocaleString('it-IT')} km)`,
        kmMancanti,
        status,
        priorita: status === 'scaduto' ? 'Alta' : (status === 'imminente' ? 'Media' : 'Bassa')
      });
    }

    // Revisione
    const revisioni = items.filter(i => i.categoria === 'Revisione' || /revisione/i.test(i.intervento));
    const ultimaRevisione = revisioni.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (ultimaRevisione) {
      const dataRev = new Date(ultimaRevisione.date);
      const scadenza = new Date(dataRev);
      scadenza.setFullYear(dataRev.getFullYear() + 2);
      const giorniMancanti = Math.round((scadenza - now) / (1000 * 60 * 60 * 24));

      let status = 'ok';
      if (giorniMancanti < 0) status = 'scaduto';
      else if (giorniMancanti <= 60) status = 'imminente';

      upcoming.push({
        titolo: 'Revisione Ministeriale',
        descrizione: `Scadenza stimata entro 2 anni (Ultima: ${dataRev.toLocaleDateString('it-IT')})`,
        giorniMancanti,
        status,
        priorita: status === 'scaduto' ? 'Alta' : (status === 'imminente' ? 'Alta' : 'Bassa')
      });
    }

    // Freni
    const freni = items.filter(i => i.categoria === 'Freni' || /fren/i.test(i.intervento));
    const ultimiFreni = freni.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (ultimiFreni) {
      const deltaFreni = maxKm - ultimiFreni.kilometri;
      const kmFreniMancanti = Math.max(0, 30000 - deltaFreni);
      let status = 'ok';
      if (deltaFreni >= 30000) status = 'scaduto';
      else if (deltaFreni >= 25000) status = 'imminente';

      upcoming.push({
        titolo: 'Controllo Freni & Pastiglie',
        descrizione: `Soglia ogni 30.000 km (Ultimo a ${ultimiFreni.kilometri.toLocaleString('it-IT')} km)`,
        kmMancanti: kmFreniMancanti,
        status,
        priorita: status === 'scaduto' ? 'Alta' : 'Media'
      });
    }

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalCount,
      avgCost: Math.round(avgCost * 100) / 100,
      maxKm,
      costPerKm: costPerKm !== null ? Math.round(costPerKm * 1000) / 1000 : null,
      categoriesMap,
      monthlyMap,
      upcoming
    };
  }

  // Esportazione JSON
  async function exportJSON() {
    const items = await getAll();
    const payload = {
      app: 'CarMaintenance',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      count: items.length,
      data: items
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `carmaintenance-dossier-${new Date().toISOString().slice(0, 10)}.json`);
  }

  // Esportazione CSV
  async function exportCSV() {
    const items = await getAll();
    const headers = ['id', 'date', 'veicolo', 'categoria', 'intervento', 'kilometri', 'costo', 'note'];
    const rows = items.map(i => [
      i.id || i._id,
      new Date(i.date).toISOString().slice(0, 10),
      `"${(i.veicolo || 'Veicolo Principale').replace(/"/g, '""')}"`,
      `"${(i.categoria || 'Altro').replace(/"/g, '""')}"`,
      `"${(i.intervento || '').replace(/"/g, '""')}"`,
      i.kilometri || 0,
      i.costo || 0,
      `"${(i.note || '').replace(/"/g, '""')}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `carmaintenance-dossier-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // Importazione
  async function importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const items = Array.isArray(parsed) ? parsed : (parsed.data || []);
      if (!Array.isArray(items)) throw new Error('Struttura file non valida');

      let importedCount = 0;
      for (const item of items) {
        if (item.intervento && item.date) {
          await add(item);
          importedCount++;
        }
      }
      return { success: true, count: importedCount };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Modalità Storage preferita (browser o server)
  function getStorageMode() {
    return localStorage.getItem('carmaintenance_mode') || 'browser';
  }

  function setStorageMode(mode) {
    localStorage.setItem('carmaintenance_mode', mode);
  }

  return {
    init,
    getAll,
    getById,
    add,
    update,
    remove,
    calculateStats,
    exportJSON,
    exportCSV,
    importJSON,
    getStorageMode,
    setStorageMode
  };
})();

// Inizializzazione al caricamento
if (typeof window !== 'undefined') {
  window.CarStorage = CarStorage;
  CarStorage.init().catch(console.error);
}
