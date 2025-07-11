class WebTerminal {
    constructor({
        user = "pat",
        machineName = "ubuntu",
        initialPosition = "~",
        sysInfoFunction = null,
        motdFunction = null,
        fileSystemData = null,
        fileSystemFilePath = "fileSystem.json",
        additionalCommands = {},
        startupPrint = `\n\nWelcome to your web terminal!\nType 'help' for a list of commands.\n`,
        homePath = `/home/${user}`
    } = {}) {
        this.user = user;
        this.machineName = machineName;
        this.position = (initialPosition=== "~") ? `/home/${user}` : initialPosition;
        this.sysInfoFunction = sysInfoFunction || this.defaultSysInfo;
        this.motdFunction = motdFunction || this.defaultMotd;
        this.fileSystem = {};
        this.fileSystemFilePath = fileSystemFilePath;
        this.startupPrint = startupPrint;
        this.commands = this.defaultCommands();
        this.homePath = homePath;
        Object.assign(this.commands, additionalCommands); // aggiunta comandi extra

        this.initFileSystem(fileSystemData).then(() => {
            this.initTerminal();
        });
        document.addEventListener("DOMContentLoaded", () => {
            let icons = ["-", "\\", "|", "/"];
            let index = 0; // indice corrente
            setInterval(() => {
                let title = (this.machineName + " - lilTerm ");
                let ico = icons[index];
                document.querySelector("title").textContent = title + ico;
                index = (index + 1) % icons.length; // ciclo circolare
            }, 250);
        });
    }
  suggestPaths(fs, currentPath, inputPath, relative = true) {
    function getNode(path) {
        const parts = path.replace(/^\/+|\/+$/g, "").split("/");
        let node = fs["/"];
        for (const part of parts) {
            if (part === "") continue;
            if (node && typeof node === "object" && part in node) {
                node = node[part];
            } else {
                return null;
            }
        }
        return node;
    }

    // Risolvi inputPath: assoluto o relativo
    let resolvedPath = inputPath.startsWith("/")
        ? inputPath
        : (currentPath === "/" ? "" : currentPath) + "/" + inputPath;

    // Normalizza
    resolvedPath = resolvedPath.replace(/\/+/g, "/");

    const matches = [];

    // Caso 1: input esatto che punta a una directory senza slash finale, suggerisci con slash
    const node = getNode(resolvedPath.replace(/\/$/, ""));
    if (node && typeof node === "object" && !resolvedPath.endsWith("/")) {
        const suggestion = relative
            ? resolvedPath.replace(/.*\//, "") + "/"
            : resolvedPath + "/";
        matches.push(suggestion);
        return matches;
    }

    // Caso 2: input con slash finale -> suggerisci figli della dir
    if (resolvedPath.endsWith("/")) {
        const dirNode = getNode(resolvedPath.replace(/\/$/, ""));
        if (!dirNode || typeof dirNode !== "object") return [];

        for (const key in dirNode) {
            const fullPath = resolvedPath + key;
            matches.push(relative ? key : fullPath);
        }

        return matches;
    }

    // Caso 3: completamento normale (parziale)
    const basePathParts = resolvedPath.split("/");
    const prefix = basePathParts.pop(); // ultima parte (potrebbe essere incompleta)
    const dirPath = basePathParts.join("/") || "/";
    const dirNode = getNode(dirPath);
    if (!dirNode || typeof dirNode !== "object") return [];

    for (const key in dirNode) {
        if (key.startsWith(prefix)) {
            const fullPath = (dirPath === "/" ? "" : dirPath + "/") + key;
            matches.push(relative ? key : fullPath);
        }
    }

    return matches;
}



    defaultMotd() {
        const now = new Date();
        const header = `Welcome to Ubuntu 24.04 LTS (GNU/Linux web-kernel x86_64)`;
        const help = [
            " * Documentation: https://help.ubuntu.com",
            " * Management:    https://landscape.canonical.com",
            " * Support:       https://ubuntu.com/advantage"
        ];
        const info = [
            "",
            "System information as of " + now.toUTCString(),
            "  System load: " + Math.random().toFixed(2) + "               Processes: " + Math.floor(Math.random() * 100 + 20),
            "  Memory usage: " + Math.floor(window.performance.memory?.usedJSHeapSize / 1024 / 1024) + "MiB",
            "  Uptime: " + Math.floor(performance.now() / 3600000) + "h"
        ];
        const updates = [
            "",
            Math.floor(Math.random() * 10) + " updates can be applied immediately.",
            Math.floor(Math.random() * 5) + " of these are security updates."
        ];
        const last = ["", "Last login: " + now.toUTCString() + " from 192.168.1.100"];
        return [header, ...help, ...info, ...updates, ...last].join("\n");
    }

    defaultSysInfo() {
        return [
            "Ubuntu 24.04 LTS \\n",
            `Host: ${this.machineName}`,
            `Kernel: ${navigator.platform} web‑kernel`,
            `Uptime: ${Math.floor(performance.now() / 3600000)}h`,
            "Packages: ~2000",
            "Shell: bash 5.0",
            "CPU: Virtual JS CPU",
            "Memory: " + Math.floor(window.performance.memory?.usedJSHeapSize / 1024 / 1024) + "MiB used"
        ].join("\n");
    }

    normalizePath(path) {
        if (!path) return "/";
        const parts = path.split("/").filter(p => p !== "");
        const stack = [];
        for (const part of parts) {
            if (part === ".") continue;
            else if (part === "..") stack.pop();
            else stack.push(part);
        }
        return "/" + stack.join("/");
    }

    getNode(path) {
        if (path === "/") return this.fileSystem["/"];
        const parts = path.split("/").filter(Boolean);
        let node = this.fileSystem["/"];
        for (const part of parts) {
            if (!node[part]) return null;
            node = node[part];
        }
        return node;
    }

    async initFileSystem(jsonOrUrl) {
        const defaultFS = async () => {
            const fs = await this.fetchFileSystem(this.fileSystemFilePath);
            return fs || {
                "/": { home: { [this.user]: {} } }
            };
        };

        if (typeof jsonOrUrl === "string") {
            this.fileSystem = await this.fetchFileSystem(jsonOrUrl) || await defaultFS();
        } else if (typeof jsonOrUrl === "object") {
            this.fileSystem = this.loadJSON(jsonOrUrl) || await defaultFS();
        } else {
            this.fileSystem = await defaultFS();
        }
    }


    async fetchFileSystem(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Errore nel caricamento del file system:", error);
            return null;
        }
    }

    loadJSON(json) {
        if (typeof json === "string") {
            try {
                return JSON.parse(json);
            } catch (e) {
                console.warn("JSON non valido.");
                return null;
            }
        }
        if (typeof json === "object" && json !== null && !Array.isArray(json)) {
            return json;
        }
        return null;
    }

    defaultCommands() {
        return {
            sysinfo: function () {
                const t = this.terminal;
                this.echo(t.sysInfoFunction());
            },
            uname: function () {
                this.echo(`Linux ${this.terminal.user}-pc 5.15.0-1000-generic x86_64 GNU/Linux`);
            },
            help: function () {
                const cmds = Object.keys(this.terminal.commands).join(", ");
                this.echo("Comandi disponibili: clear, " + cmds);
            },
            echo: function (val) {
                this.echo(val);
            },
            whoami: function () {
                this.echo(this.terminal.user);
            },
            pwd: function () {
                this.echo(this.terminal.position === "~" ? `/home/${this.terminal.user}` : this.terminal.position);
            },
            cd: function (val) {
                const t = this.terminal;
                if (!val || val === "~" || val === t.homePath) {
                    if (t.getNode(t.homePath)) t.position = t.homePath;
                    else this.echo("cd: non esiste la directory home");
                    return;
                }

                let newPos;
                if (val === "/") newPos = "/";
                else if (val.startsWith("/")) newPos = t.normalizePath(val);
                else if (val === ".." || val === "../") {
                    let pos = t.position;
                    if (pos === "~") {
                        pos = t.homePath;
                    }
                    const parts = pos.split("/");
                    parts.pop();
                    newPos = parts.join("/") || "/";
                } else {
                    newPos = t.normalizePath((t.position === "/" ? "" : t.position) + "/" + val);
                }
                if (t.getNode(newPos) && typeof t.getNode(newPos) === "object") {
                    t.position = newPos;
                } else {
                    this.echo(`cd: nessuna directory: ${val}`);
                }
            },
            ls: function (option) {
                const t = this.terminal;
                let targetPath = t.position;
                if (!option) option = t.position;

                if (option) {
                    console.log("ls option:", option);
                    if (option == "./") {
                        option = t.position;
                        targetPath = t.position;
                    }
                    if (option == "~") {
                        option = t.homePath;
                        targetPath = option;
                    }
                    else
                        targetPath = option.startsWith("/") ? option : t.normalizePath(t.position + "/" + option);
                }

                const node = t.getNode(targetPath);
                if (!node) return this.echo(`ls: impossibile accedere '${option || targetPath}': No such file or directory`);

                if (typeof node === "string") return this.echo(targetPath.split("/").pop());
                this.echo(Object.keys(node).join("\t"));
            },
            cat: function (path) {
                const t = this.terminal;
                if (!path) return this.echo("cat: file mancante");

                let targetPath;
                if (path === "~") targetPath = t.homePath;
                else targetPath = path.startsWith("/") ? path : t.normalizePath((t.position === "~" ? t.homePath : t.position) + "/" + path);

                const node = t.getNode(targetPath);
                if (!node) return this.echo(`cat: ${path}: File o directory non trovato`);
                if (typeof node === "object") return this.echo(`cat: ${path}: È una directory`);
                this.echo(node);
            }, js: function (...code) {
                const input = code.join(" ");
                try {
                    const result = eval(input);
                    if (result instanceof Promise) {
                        result.then(res => this.echo(String(res))).catch(err => this.echo(`Errore: ${err}`));
                    } else {
                        this.echo(String(result));
                    }
                } catch (e) {
                    this.echo(`Errore JS: ${e.message}`);
                }
            },

        };
    }

    initTerminal() {
        const self = this;

        $('body').terminal(function (cmd, term) {
            term.terminal = self
            const parts = cmd.trim().split(/\s+/);
            const command = parts[0];
            const args = parts.slice(1);

            if (self.commands[command]) {
                try {
                    self.commands[command].apply(term, args);
                } catch (e) {
                    term.echo(`Errore durante l'esecuzione di '${command}': ${e.message}`);
                }
            } else {
                term.echo(`Comando non trovato: ${command}`);
            }
        }, {
            greetings: () => self.motdFunction() + self.startupPrint,
            name: 'web_unix',
            prompt: () => `${self.user}@${self.machineName}:${(self.position === `/home/${self.user}`) ? "~" : self.position}$ `,
            
            completion: function (line, callback, term=self) {
                let parts = line.split(/\s+/).filter(Boolean)||[""];
                // console.log('line:', line);
                // console.log('parts:', parts);
                // let flag=!(parts.length === 0);
                // if (!flag) {
                //     console.log('term.position:', term.position);
                //     parts=[term.position];
                //     const paths = self.suggestPaths(self.fileSystem, self.position,cmd,flag);
                //     return callback(allSuggestions);
                // }

                if (parts.length === 0) return callback([]);

                const cmd = parts[0];
                const arg = parts.length > 1 ? parts[parts.length - 1] : "";
//debug da lavorare
                console.log('cmd:', cmd, 'arg:', arg, 'parts:', parts);
                var cmds=[];
                if (parts.length === 1 && !line.endsWith(' ')) {
                    cmds = Object.keys(self.commands).filter(c => c.startsWith(cmd));
                
                    let flag = arg.startsWith('/');
                    const paths = self.suggestPaths(self.fileSystem, self.position,cmd,flag);
                    const allSuggestions = cmds.concat(paths).sort();
                    console.log('cmds:', cmds, 'paths:', paths);
                    return callback(allSuggestions);}
                    return callback([]); // se non è un comando, ritorna vuoto
            }


        }).terminal.terminal = this; // collega contesto terminale alla classe
    }
}
