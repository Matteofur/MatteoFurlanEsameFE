# Frontend - Sistema Richieste Acquisto

Frontend React per il sistema di gestione richieste di acquisto.

## Tecnologie Utilizzate

- **React 19** - Framework JavaScript per l'interfaccia utente
- **TypeScript** - Linguaggio tipizzato per JavaScript
- **React Router** - Routing per l'applicazione
- **Axios** - Client HTTP per le chiamate API
- **Tailwind CSS** - Framework CSS per lo styling
- **Vite** - Build tool e dev server

## Struttura del Progetto

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── dashboard/
│       ├── DipendenteDashboard.tsx
│       └── ResponsabileDashboard.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Funzionalità

### Autenticazione
- **Login**: Accesso con email e password
- **Registrazione**: Creazione nuovo account con ruolo
- **Gestione Token**: Salvataggio e gestione automatica del token JWT

### Dashboard Dipendente
- **Nuova Richiesta**: Form per creare richieste di acquisto
- **Lista Richieste**: Visualizzazione delle proprie richieste
- **Modifica/Eliminazione**: Gestione richieste in attesa
- **Stati**: Visualizzazione dello stato delle richieste

### Dashboard Responsabile
- **Richieste in Attesa**: Lista di tutte le richieste da approvare
- **Approvazione/Rifiuto**: Pulsanti per gestire le richieste
- **Gestione Categorie**: Creazione di nuove categorie di acquisto

## Installazione e Avvio

1. **Installa le dipendenze**:
   ```bash
   npm install
   ```

2. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

3. **Apri il browser**:
   L'applicazione sarà disponibile su `http://localhost:5173`

## Configurazione

### Backend URL
Il frontend è configurato per comunicare con il backend su `http://localhost:3000/api`.
Per modificare l'URL, aggiorna la variabile `API_BASE_URL` in `src/services/api.ts`.

### Variabili d'Ambiente
Crea un file `.env` nella root del progetto per configurazioni specifiche:

```env
VITE_API_URL=http://localhost:3000/api
```

## Build per Produzione

```bash
npm run build
```

Il build sarà disponibile nella cartella `dist/`.

## Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea il build di produzione
- `npm run preview` - Anteprima del build di produzione
- `npm run lint` - Esegue il linting del codice

## Ruoli Utente

### Dipendente
- Visualizza solo le proprie richieste
- Può creare, modificare ed eliminare richieste (solo se in attesa)
- Non può approvare/rifiutare richieste

### Responsabile
- Visualizza tutte le richieste
- Può approvare/rifiutare richieste in attesa
- Può creare nuove categorie di acquisto
- Accesso completo al sistema

## Sicurezza

- **Autenticazione JWT**: Token salvato in localStorage
- **Autorizzazione**: Controllo ruoli per accesso alle funzionalità
- **Validazione**: Validazione lato client e server
- **Interceptor**: Gestione automatica degli errori di autenticazione

## Note Tecniche

- **TypeScript**: Tipizzazione completa per type safety
- **React Hooks**: Gestione dello stato con hooks moderni
- **Context API**: Gestione dello stato globale per l'autenticazione
- **Responsive Design**: Interfaccia ottimizzata per desktop e mobile
- **Error Handling**: Gestione completa degli errori con feedback utente
