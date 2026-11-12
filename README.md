# 🚗 CarMaintenance

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Pug-A86454?style=for-the-badge&logo=pug&logoColor=white"/>
  <img src="https://img.shields.io/badge/Bootstrap_Icons-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white"/>
</p>

---

## 📌 Cos'è questo progetto

**CarMaintenance** è un'applicazione web per il **monitoraggio e la registrazione degli interventi di manutenzione della propria auto**. Permette di tenere traccia nel tempo di tutti i lavori effettuati sul veicolo: tagliandi, sostituzioni, riparazioni e qualsiasi altro tipo di intervento.

Nata come progetto di studio e approfondimento personale su **Node.js**, **Express** e **MongoDB** con template engine **Pug**, l'applicazione segue l'architettura **MVC** classica con rendering server-side.

---

La modalità di archiviazione è selezionata automaticamente dall'ambiente:

1. **Sviluppo e test**:
   * Utilizza il backend Node.js / Express con **MongoDB** e **Mongoose ORM**.
   * Connessione centralizzata in `config/database.js` con mascheramento credenziali nei log e supporto a database di test isolati (`carmaintenance_test`).
2. **Produzione**:
   * **Zero dipendenze esterne**: tutti i dati vengono archiviati e gestiti direttamente nel browser dell'utente tramite **IndexedDB** (con fallback su `LocalStorage`).
   * Il client esegue CRUD completo, calcolo statistiche, ricerca, filtri ed esportazione interamente in locale.
   * Include un dataset dimostrativo iniziale pronto all'uso al primo avvio.

Non è disponibile un selettore: lo storage non può essere cambiato dal browser. Impostare `NODE_ENV=production` abilita lo storage browser; negli altri ambienti viene utilizzato MongoDB.

---

## ⚙️ Come funziona

```
  Browser
     │
     ▼ HTTP Request
  ┌───────────────────────────────────┐
  │       Express.js Server           │
  │  ┌──────────┐  ┌──────────────┐   │
  │  │  Routes   │  │  Controllers    │
  │  └─────┬────┘  └──────┬───────┘   │
  │        │              │           │
  │  ┌──────▼──────────▼────   ┐      │
  │  │    Mongoose Models      │      │
  │  └─────────────────────────┘      │
  │              │                    │
  │  ┌──────────▼────────┐            │
  │  │   Pug Templates    │           │
  │  └────────────────────┘           │
  └───────────────────────────────────┘
               │
               ▼
  ┌───────────────────────────────────┐
  │           MongoDB Atlas           │
  └───────────────────────────────────┘
```

L'utente può:
- **Aggiungere** un nuovo intervento (tipo, data, km, note, costo)
- **Visualizzare** l'elenco di tutti gli interventi in ordine cronologico
- **Modificare** o **eliminare** interventi esistenti
- Consultare lo storico filtrato per tipo di manutenzione

---

## 🛠️ Stack Tecnico

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 8 |
| Template Engine | Pug 3 |
| Styling | Bootstrap Icons |
| Date Handling | Moment.js |
| Test | Mocha + Chai + Supertest |
| Dev Server | Nodemon |
| Tunneling | Ngrok (sviluppo/test) |

---

## 🚀 Come avviarlo

### Prerequisiti
- Node.js 18+
- MongoDB in esecuzione locale o stringa URI di MongoDB Atlas nel file `.env`

### Installazione e avvio

```bash
# Clona il repository
git clone https://github.com/Lele97/CarMaintenance.git
cd CarMaintenance

# Installa le dipendenze
npm install

### 3. Configurazione Ambiente
Copia il file di configurazione di esempio:
```bash
cp .env.example .env
```
Parametri configurabili in `.env`:
* `PORT`: porta del server HTTP (default: `4000`)
* `HOST`: interfaccia di ascolto (default: `127.0.0.1`)
* `NODE_ENV`: ambiente (`development`, `production`, `test`)
* `MONGODB_URI`: URI di connessione MongoDB
* `ENABLE_NGROK`: abilita ngrok se impostato su `true`

### 4. Esecuzione dei Test
```bash
npm test
```

Apri `http://localhost:3000` nel browser.

### Test

```bash
npm test
```

---

## 📂 Struttura del progetto

```
CarMaintenance/
├── bin/             # Entry point server (www)
├── models/          # Modelli Mongoose
├── routes/          # Definizione rotte Express
├── views/           # Template Pug (layout, pagine)
├── public/          # Asset statici (CSS, JS, immagini)
├── test/            # Test con Mocha/Chai
├── app.js           # Configurazione Express
└── package.json     # Dipendenze e script
```

---

## 👤 Autore

**Gabriele Grandinetti**
- 🌐 [gabrielegrandinetti.dev](https://gabrielegrandinetti.dev)
- 💼 [GitHub @Lele97](https://github.com/Lele97)
- 📧 gabriele.grandinetti@hotmail.com

> Progetto realizzato a scopo di studio e approfondimento personale su Node.js, Express, MongoDB con pattern MVC e template engine Pug.
