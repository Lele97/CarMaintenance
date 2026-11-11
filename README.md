# 🚗 CarMaintenance

> **Traccia, monitora e ottimizza la manutenzione del tuo veicolo.**  
> Applicazione full-stack moderna con architettura a doppio storage (MongoDB in sviluppo, Browser Storage IndexedDB in produzione), dashboard statistica avanzata, grafici interattivi e dossier storico esportabile.

---

## 🎨 Design System & Nuova UI/UX

L'applicazione è stata completamente riprogettata con un'interfaccia moderna, fluida e ad alto impatto visivo ispirata a componenti **Shadcn Dashboard UI**:

* **Palette di Colori**:
  * **Bianco / Neutri Chiari** (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`) per card, contrasti e superfici.
  * **Nero / Ardesia Scuro** (`#090D16`, `#0F172A`, `#1E293B`) per navbar, intestazioni e tipografia ad alta leggibilità.
  * **Arancione Vivace** (`#FF6B00`, `#EA580C`) per call-to-action primarie, badge e soglie di attenzione.
  * **Blu Tech Elettrico** (`#2563EB`, `#3B82F6`) per grafici, icone, filtri e collegamenti.
* **Componenti Dashboard**:
  * **KPI & Statistiche**: 4 card metriche in evidenza con Spesa Totale, Chilometraggio massimo registrato, Numero interventi con costo medio, e Stato Salute complessivo.
  * **Grafici Interattivi (Chart.js)**:
    1. *Andamento Spese nel Tempo*: istogramma mensile combinato con linea di tendenza.
    2. *Distribuzione per Categoria*: grafico a ciambella (Tagliando, Freni, Pneumatici, Olio, Revisione, ecc.).
    3. *Evoluzione Chilometrica*: progressione dell'odometro nel tempo.
  * **Scadenze & Tagliandi Smart**: monitoraggio automatico di tagliandi (ogni 15.000 km / 12 mesi), revisione ministeriale (ogni 2 anni) e usura freni con indicatore di stato (*In Regola*, *Imminente*, *Scaduto*).
  * **Board & Tabella Interventi**: ricerca full-text in tempo reale, filtro per categoria, ordinamento avanzato, card responsive per smartphone e tabella per desktop con modali per modifica ed eliminazione sicura.
  * **Dossier & Backup**: esportazione ed importazione istantanea in formati portabili **JSON** e **CSV**.

---

## 💾 Architettura Dual-Storage: Sviluppo vs Produzione

Per garantire test reali in ambienti di produzione senza dover configurare o esporre database MongoDB remoti, l'applicazione supporta una **doppia modalità di archiviazione**:

1. **Modalità Sviluppo (`STORAGE_MODE=mongodb`)**:
   * Utilizza il backend Node.js / Express con **MongoDB** e **Mongoose ORM**.
   * Connessione centralizzata in `config/database.js` con mascheramento credenziali nei log e supporto a database di test isolati (`carmaintenance_test`).
2. **Modalità Produzione (`STORAGE_MODE=browser` o deploy reale)**:
   * **Zero dipendenze esterne**: tutti i dati vengono archiviati e gestiti direttamente nel browser dell'utente tramite **IndexedDB** (con fallback su `LocalStorage`).
   * Il client esegue CRUD completo, calcolo statistiche, ricerca, filtri ed esportazione interamente in locale.
   * Include un dataset dimostrativo iniziale pronto all'uso al primo avvio.
   * Il selettore nella barra di navigazione permette di alternare in qualsiasi momento la modalità attiva per scopi di collaudo o sincronizzazione.

---

## 🛠️ Stack Tecnologico

* **Runtime**: Node.js & Express 4
* **Database (Dev)**: MongoDB con Mongoose ORM
* **Client Storage (Prod)**: IndexedDB + LocalStorage API
* **Template Engine**: Pug
* **Grafica & UI**: CSS personalizzato moderno, Bootstrap 5.3, Bootstrap Icons, Google Fonts (Inter)
* **Grafici**: Chart.js 4.4
* **Testing**: Mocha, Chai, Supertest (100% deterministico e isolato)

---

## 📋 Risoluzione Issue Prioritarie

Con questo rilascio sono state risolte le issue a priorità critica (**P0**) e le principali issue funzionali (**P1**):

* **#14 - Centralizzare configurazione e connessione MongoDB (P0)**:
  * Creata configurazione centralizzata (`config/database.js`) con validazione URI e timeout.
  * Aggiunto file `.env.example` privo di segreti.
  * Rimossa la connessione inline dai router; nessuna credenziale esposta nei log.
* **#15 - Validare e normalizzare i dati degli interventi (P0)**:
  * Creato validatore condiviso (`utils/validator.js`) applicato a inserimento e modifica.
  * Vincoli rigorosi: data valida, descrizione tra 2 e 200 caratteri, chilometri >= 0, costo >= 0 arrotondato a due decimali, categoria controllata da enum.
  * Feedback chiaro degli errori senza perdita dei dati nei form.
* **#16 - Correggere metodi HTTP, home page e gestione errori (P0)**:
  * Eliminata la chiamata HTTP `fetch("http://127.0.0.1:4000/data")` in `routes/index.js`, sostituita con `interventionService.js`.
  * Supportati verbi REST corretti (`PUT`, `DELETE`) con `method-override`.
  * Gestione degli errori con firma Express a 4 argomenti `(err, req, res, next)`.
  * Validazione degli ID MongoDB (`400` per ID malformati, `404` per record inesistenti).
  * Stack trace nascosto in produzione.
* **#17 - Evitare esposizione Internet involontaria e proteggere le operazioni (P0)**:
  * `ngrok` disabilitato di default (`ENABLE_NGROK=false`), attivabile solo esplicitamente se configurato il token.
  * Ascolto predefinito su `127.0.0.1` per evitare esposizione non protetta su reti pubbliche.
  * Aggiunti header di sicurezza Express (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`) e limiti alle dimensioni dei body (`1mb`).
* **#18 - Isolare i test e chiudere correttamente le risorse (P0)**:
  * Test completamente indipendenti e deterministici in `test/`, ciascuno con fixture dedicate e pulizia automatica.
  * Hook `after` con chiusura aggraziata del database: `npm test` termina con codice 0 senza rimanere appeso.
* **#20 - Rendere l'interfaccia accessibile, responsive e coerente (P1)**:
  * Eliminati i testi segnaposto e corretto il footer.
  * Contrasti ad alta leggibilità WCAG 2.2, focus visibile per navigazione da tastiera e supporto mobile ottimizzato.
* **#24 - Aggiungere ricerca, filtri, ordinamento e paginazione (P1)**:
  * Filtro istantaneo per testo, categoria e ordinamento cronologico, odometro o costo.
* **#25 - Esportare e importare lo storico in formati portabili (P1)**:
  * Esportazione del dossier in JSON e CSV; importazione con validazione.
* **#28 - Mostrare manutenzioni imminenti e scadute (P1)**:
  * Modulo promemoria calcolato su odometro e tempo per tagliando, freni e revisione.
* **#29 - Creare dashboard di costi e andamento manutenzione (P1)**:
  * Nuova dashboard con grafici mensili, ripartizione costi e KPI aggregati.

---

## 🚀 Guida Rapida

### 1. Prerequisiti
* Node.js v18+ 
* (Opzionale per modalità dev) MongoDB locale attivo su porta 27017

### 2. Installazione
```bash
git clone https://github.com/Lele97/CarMaintenance.git
cd CarMaintenance
npm install
```

### 3. Configurazione Ambiente
Copia il file di configurazione di esempio:
```bash
cp .env.example .env
```
Parametri configurabili in `.env`:
* `PORT`: porta del server HTTP (default: `4000`)
* `HOST`: interfaccia di ascolto (default: `127.0.0.1`)
* `NODE_ENV`: ambiente (`development`, `production`, `test`)
* `STORAGE_MODE`: `mongodb` per database server, `browser` per archiviazione locale IndexedDB
* `MONGODB_URI`: URI di connessione MongoDB
* `ENABLE_NGROK`: abilita ngrok se impostato su `true`

### 4. Esecuzione dei Test
```bash
npm test
```
Tutti i test di integrazione e route vengono eseguiti con isolamento automatico del database e chiusura pulita delle connessioni.

### 5. Avvio Applicazione
```bash
npm start
```
Accedi con il browser su **`http://localhost:4000`**.

---

## 🗺️ Struttura delle Rotte & API

| Metodo | Rotta | Descrizione |
|---|---|---|
| `GET` | `/` | Dashboard principale con grafici, KPI, promemoria e tabella interventi |
| `GET` | `/data` | Restituisce la lista degli interventi in formato JSON (supporta filtri) |
| `GET` | `/data/stats` | Restituisce metriche e statistiche aggregate |
| `GET` | `/data/export` | Esporta il dossier in formato JSON o CSV (`?format=csv`) |
| `GET` | `/add` | Form per l'inserimento di un nuovo intervento |
| `POST` | `/add/insert` | Endpoint per la registrazione di un intervento |
| `GET` | `/update/:id` | Form di modifica dell'intervento specificato |
| `PUT` | `/update/:id` | Aggiornamento dell'intervento (supporta `_method=put`) |
| `DELETE` | `/delete/:id` | Cancellazione dell'intervento (supporta `_method=delete`) |
| `GET` | `/api/status` | Stato del server, modalità storage e connessione al DB |
| `GET` | `/api/interventions` | REST API per sincronizzazione con client |

---

## 👤 Autore
* **Gabriele Grandinetti (@Lele97)** - [GitHub](https://github.com/Lele97/CarMaintenance)
