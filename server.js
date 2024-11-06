import express from 'express';
import { json } from 'body-parser';

const app = express();

// Middleware
app.use(json());

let users = [];  // Array per memorizzare gli utenti registrati
let orders = [];  // Array per memorizzare gli ordini
let sessions = []; // Array per memorizzare le sessioni

// API di registrazione
app.post('/register', (req, res) => {
  const { email, password, firstName, lastName, address, phone } = req.body;

  if (!firstName || !lastName || !address || !phone || !email || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'L\'utente esiste già' });
  }

  const newUser = { id: users.length + 1, firstName, lastName, address, phone, email, password };
  users.push(newUser);

  res.status(200).json({ message: 'Registrazione completata con successo', user: newUser });
});

// API di login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Email o password errati' });
  }

  const sessionId = Math.random().toString(36).substring(7);  // Genera una sessione finta (token)
  
  // Salva la sessione con l'email dell'utente
  sessions[sessionId] = { email: user.email, userId: user.id };  // Salva l'ID dell'utente

  // Restituisci il sessionId e i dati dell'utente al client
  res.status(200).json({ message: 'Login eseguito con successo', sessionId, user });
});


// API per ottenere i dati dell'utente (autenticato con sessionId)
app.get('/user', (req, res) => {
  const { sessionId } = req.query;  // Ricevi il sessionId tramite query parameter

  const email = sessions[sessionId];  // Trova l'email dell'utente dalla sessione
  if (!email) {
    return res.status(401).json({ message: 'Sessione non valida' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Utente non trovato' });
  }

  // Ritorna i dati dell'utente
  res.status(200).json(user);
});

// API per ottenere tutti gli utenti (solo per debugging)
app.get('/users', (req, res) => {
  res.json(users);
});


// API per effettuare un ordine
app.post('/orders', (req, res) => {
  const { userId, cartItems } = req.body; // Assicurati di ricevere userId

  // Controlla se l'ID dell'utente è valido
  if (!userId) {
    return res.status(401).json({ message: 'ID utente non valido' });
  }

  // Controlla se i dati del carrello sono validi
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: 'Dati del carrello non validi' });
  }

  // Calcola il totale
  const totale = cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);

  const newOrder = {
    userId, // Usa l'ID dell'utente ricevuto
    items: cartItems.map(item => ({
      img: item.immagine,
      nome: item.nome,
      colore: item.colore,
      taglia: item.taglia,
      prezzo: item.prezzo,
      quantita: item.quantita
    })),
    totale
  };

  orders.push(newOrder); // Aggiungi il nuovo ordine all'array degli ordini

  res.status(201).json({ message: 'Ordine creato con successo', order: newOrder });
});




// Avvia il server
app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});
