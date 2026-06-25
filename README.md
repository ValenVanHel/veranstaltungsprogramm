# Veranstaltungsprogramm Webversion App

Next.js-Oberfläche für das Veranstaltungsprogramm.

## Start

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Der Dev-Server bindet an `0.0.0.0`, damit die Oberfläche auch über die lokale Netzwerk-IP erreichbar ist, zum Beispiel:

```text
http://192.168.2.53:3000
```

Falls `npm` mit `node.exe wurde nicht gefunden` fehlschlägt, kann die vorbereitete portable Node-Version genutzt werden:

```powershell
.\start-dev-portable.ps1
```

In `.env.local` müssen die Supabase-Werte gesetzt werden:

```env
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=DEIN_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=DEIN_SERVICE_ROLE_KEY
```

Die Rollenverwaltung nutzt den Service-Role-Key serverseitig, damit Role- und Root-Owner-Änderungen nicht an RLS-Regeln im Browser scheitern.

Ohne Supabase-Werte startet die Oberfläche im Demo-Modus mit Beispieldaten.

## Status

- `npm audit`: 0 Vulnerabilities
- `npm run build`: erfolgreich
