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

## 🎯 A cosa è pensata

CarMaintenance è pensata per:
- Chi vuole tenere uno storico digitale degli interventi sul proprio veicolo
- Chi studia lo stack **Node.js + Express + MongoDB + Pug** e vuole un progetto pratico di riferimento
- Chi vuole approfondire il pattern **MVC** lato server con routing strutturato

---

## ⚙️ Come funziona

```
  Browser
     │
     ▼ HTTP Request
  ┌───────────────────────────────────┐
  │       Express.js Server             │
  │  ┌──────────┐  ┌──────────────┐  │
  │  │  Routes   │  │  Controllers   │  │
  │  └─────┬────┘  └──────┬───────┘  │
  │         │              │            │
  │  ┌──────▼──────────▼────┐    │
  │  │    Mongoose Models          │    │
  │  └─────────────────────────┘    │
  │              │                    │
  │  ┌──────────▼────────┐          │
  │  │   Pug Templates        │          │
  │  └────────────────────┘          │
  └───────────────────────────────────┘
               │
               ▼
  ┌───────────────────────────────────┐
  │           MongoDB Atlas              │
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

# Crea il file .env con la tua URI MongoDB
echo "MONGODB_URI=mongodb://localhost:27017/carmaintenance" > .env

# Avvio in sviluppo (con auto-reload)
npm start
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
