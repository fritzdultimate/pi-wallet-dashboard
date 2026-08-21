# pi-wallet-dashboard

React/Vite dashboard for pi-wallet-server.

## Setup

```
npm install
cp .env.example .env   # point VITE_API_URL at your backend, default http://localhost:3000/api
npm run dev
```

Open the printed local URL, sign in with the password you set up in the backend's `.env`
(the plaintext password, not the hash), and you're in.

## Pages

Wallets, Claims, Send, Health (funder wallet scoring + red flags), Backup (encrypted key
export), Co-sign (on-demand transaction co-signing), Logs (full audit trail), Settings.
