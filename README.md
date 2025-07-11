![lilcli](https://github.com/pBielli/lilcli/blob/3288f86fd68ec3385cd03359feb8444056271806/logo.png?raw=true)
# lilcli - Web Terminal Emulator

**lilcli** è un emulatore di terminale Linux completamente in JavaScript, eseguibile direttamente in un browser. Supporta filesystem virtuale, comandi base Unix, prompt personalizzabile e autocompletamento intelligente. È ideale per progetti web interattivi, educational o semplicemente per divertirsi!

---

## ✨ Caratteristiche

- Emulazione terminale ispirata a Ubuntu/Linux
- File system simulato in JSON
- Prompt realistico `utente@macchina:~$`
- Comandi inclusi:
  - `ls`, `cd`, `pwd`, `cat`, `echo`
  - `sysinfo`, `uname`, `whoami`, `help`
  - `date` (aggiuntivo)
- Completamento automatico di comandi e path
- Supporto per comandi personalizzati
- Animazione del titolo (`ubuntu - lilTerm -`, ecc.)
- Supporto per motd (`message of the day`) e system info dinamici
- Icona animata nel titolo in stile spinner
- Interfaccia responsive e minimalista in stile Unix

---

## 🖥️ Demo

Puoi vedere il terminale in azione semplicemente aprendo `index.html` in un browser moderno (Chrome/Firefox).

---

## 📦 Esempio di utilizzo

```javascript
var term = new WebTerminal({
  user: "tech",
  machineName: "secondchild",
  initialPosition: "~",
  startupPrint: `\n\n\n` + logo + `\n\nWelcome to your web terminal!\nType 'help' for a list of commands.\n`,
  additionalCommands: {
    date: function () {
      this.echo(new Date().toString());
    }
  }
});
```

---

## 🗂️ File system virtuale (esempio)

```json
{
  "/": {
    "home": {
      "tech": {
        "file1.txt": "content1",
        "file2.log": "content2",
        "docs": {
          "readme.md": "doc content"
        }
      }
    },
    "var": {
      "log": {
        "syslog": "log content",
        "kern.log": "kernel log"
      }
    },
    "etc": {}
  }
}
```

---

## 🧱 Tecnologie usate

- [jQuery Terminal](https://terminal.jcubic.pl/)
- HTML/CSS (monospace style)
- JavaScript Vanilla
- JSON per filesystem

---

## ⚙️ Requisiti

- Browser moderno (supporto per `fetch`, `performance`, `window.memory`)
- Nessun server richiesto: è tutto client-side!

---

## 🚀 Avvio rapido

1. Clona il repository
2. Apri `index.html` in un browser
3. Interagisci con il terminale!

---

## 📄 License

MIT © 2025 - Pat & Friends



## ⚙️ Configurazione

Il terminale web `lilTerm` è altamente configurabile tramite il costruttore della classe `WebTerminal`.

### 🔧 Parametri disponibili

| Parametro             | Tipo       | Default                          | Descrizione |
|----------------------|------------|----------------------------------|-------------|
| `user`               | `string`   | `"pat"`                          | Il nome utente visualizzato nel prompt. |
| `machineName`        | `string`   | `"ubuntu"`                       | Nome macchina visualizzato nel prompt. |
| `initialPosition`    | `string`   | `"~"`                            | Path iniziale del terminale. |
| `homePath`           | `string`   | `"/home/${user}"`                | Path della home directory. |
| `startupPrint`       | `string`   | Messaggio di benvenuto           | Testo visualizzato all'avvio del terminale. |
| `fileSystemFilePath` | `string`   | `"fileSystem.json"`              | Path da cui caricare il file system JSON se non fornito direttamente. |
| `fileSystemData`     | `object` o `string` | `null`                   | Oggetto JSON o URL per popolare il file system virtuale. |
| `motdFunction`       | `function` | `defaultMotd()`                  | Funzione che restituisce il messaggio del giorno (motd). |
| `sysInfoFunction`    | `function` | `defaultSysInfo()`               | Funzione per mostrare le info di sistema (comando `sysinfo`). |
| `additionalCommands` | `object`   | `{}`                             | Mappa di comandi personalizzati. |

### 🧪 Esempio di inizializzazione

```js
const term = new WebTerminal({
  user: "tech",
  machineName: "secondchild",
  initialPosition: "~",
  startupPrint: `\n\nBenvenuto in lilTerm!\nDigita 'help' per iniziare.\n`,
  motdFunction: () => "Benvenuto, Pat!",
  sysInfoFunction: () => "Sistema personalizzato!",
  fileSystemData: {
    "/": {
      home: {
        tech: {
          "file.txt": "Contenuto di esempio"
        }
      }
    }
  },
  additionalCommands: {
    date: function () {
      this.echo(new Date().toString());
    },
    greet: function () {
      this.echo("Ciao dal terminale configurato!");
    }
  }
});
```

👉 Ogni comando può accedere al terminale con `this.terminal`.

### 🖼️ Logo animato nella tab del browser

Il titolo della pagina simula un'animazione `spinner` aggiornando l'icona della tab con `-`, `\`, `|`, `/` ogni 250ms.

