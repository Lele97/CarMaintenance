# 🔧 CarMaintenance

_🛠️ Traccia, gestisci e conserva lo storico degli interventi sulla tua auto — perché ogni chilometro ha una storia._

## 🚀 Descrizione

**CarMaintenance** è un'app web full-stack pensata per aiutarti a documentare e visualizzare facilmente la manutenzione del tuo veicolo. Utilizza Node.js, Express, MongoDB e Pug per creare un'interfaccia leggera ma potente, perfetta per ogni amante del codice e del motore.

## 🧰 Stack Tecnologico

- **Backend**: Node.js + Express  
- **Frontend**: Pug + Bootstrap Icons  
- **Database**: MongoDB (Mongoose ORM)  
- **Librerie extra**:  
  - `body-parser`, `method-override`, `node-fetch`, `cookie-parser`, `morgan`

## 📦 Installazione

1. **Clona la repo**
   ```bash
   git clone https://github.com/Lele97/CarMaintenance.git
   cd CarMaintenance

2. Installa le dipendenze
  bash
  Copia
  Modifica
  npm install

3. Avvia MongoDB Assicurati che MongoDB sia attivo sulla porta 27017.

4. Avvia l'app
  npm start

5. Vai su http://localhost:4000 nel tuo browser.

✍️ Features
  📥 Inserisci nuovi interventi (data, descrizione, km, costo)
  ✏️ Modifica interventi esistenti
  📋 Visualizza tutti gli interventi ordinati per data
  🗑️ (Prossimamente) Cancella interventi
  💾 Tutto salvato in locale su MongoDB

🗺️ Struttura delle rotte
  Metodo	Rotta	Descrizione
  GET	/	Home page
  GET	/data	Lista interventi
  GET	/add	Form per nuovo intervento
  POST	/add/insert	Inserimento nuovo intervento
  GET	/update/:id	Form per aggiornamento intervento
  PUT	/update/:id	Salvataggio aggiornamento
🗃️ Model (Intervention)
js
Copia
Modifica
{
  date: Date,
  intervento: String,
  kilometri: Number,
  costo: Number
}
📁 Project Structure
csharp
Copia
Modifica
CarMaintenance/
├── models/              # Modelli Mongoose
├── public/              # CSS, JS, immagini
├── routes/              # Express routes
├── views/               # Template Pug
├── app.js               # Entry point
└── package.json
🌈 Cosa potresti aggiungere dopo?
🔐 Autenticazione (per proteggere i dati)

📈 Dashboard con grafici (costi, km nel tempo)

🛎️ Reminder per tagliandi/freni/olio

☁️ Deploy su Vercel o Render

❤️ Credits
Creato con passione da @Lele97
Pensato per chi ama tanto la propria auto quanto il proprio codice.
