  $(function () {
      function motd() {
        const now = new Date();
        const header = "Welcome to Ubuntu 24.04 LTS (GNU/Linux web-kernel x86_64)";
        const help = [
          " * Documentation: https://help.ubuntu.com",
          " * Management:    https://landscape.canonical.com",
          " * Support:       https://ubuntu.com/advantage"
        ];
        const info = [
          "",
          "System information as of " + now.toUTCString(),
          "  System load: " + Math.random().toFixed(2) + "               Processes: " + Math.floor(Math.random() * 100 + 20),
          "  Memory usage: " + Math.floor(performance.memory?.usedJSHeapSize / 1024 / 1024) + "MiB",
          "  Uptime: " + Math.floor(performance.now() / 3600000) + "h",
        ];
        const updates = [
          "",
          Math.floor(Math.random() * 10) + " updates can be applied immediately.",
          Math.floor(Math.random() * 5) + " of these are security updates."
        ];
        const last = ["", "Last login: " + now.toUTCString() + " from 192.168.1.100"];
        return [header, ...help, ...info, ...updates, ...last].join("\n");
      };
      function getNode(path) {
        if (path === '/') return fileSystem['/'];  // subito ritorna la root
        const parts = path.split('/').filter(Boolean);
        let node = fileSystem['/'];
        for (const part of parts) {
          if (!node[part]) return null; // cartella o file non esiste
          node = node[part];
        }
        return node;
      }

      function normalizePath(path) {
        if (!path) return '/';
        const parts = path.split('/').filter(p => p !== '');
        const stack = [];
        for (const part of parts) {
          if (part === '.') continue;
          else if (part === '..') {
            if (stack.length > 0) stack.pop();
          } else {
            stack.push(part);
          }
        }
        return '/' + stack.join('/');
      }

      const sysInfo = () => {
        const lines = [
          "Ubuntu 24.04 LTS \\n",
          "Host: pat‑pc",
          "Kernel: " + navigator.platform + " web‑kernel",
          "Uptime: " + Math.floor(performance.now() / 3600000) + "h",
          "Packages: ~2000",
          "Shell: bash 5.0",
          "CPU: Virtual JS CPU",
          "Memory: " + Math.floor(window.performance.memory?.usedJSHeapSize / 1024 / 1024) + "MiB used"
        ];
        return lines.join("\n");
      };
      let user = "pat";
      let position = "~";
      const fileSystem = {
        '/': {
          'home': {
            [user]: {
              'file1.txt': 'content1',
              'file2.log': 'content2',
              'docs': {
                'readme.md': 'doc content'
              }
            }
          },
          'var': {
            'log': {
              'syslog': 'log content',
              'kern.log': 'kernel log'
            }
          },
          'etc': {}
        }
      };

      let commands;
      commands = {
        sysinfo: function () {
          this.echo(sysInfo());
        },
        uname: function (option) {
          this.echo("Linux pat-pc 5.15.0-1000-generic x86_64 GNU/Linux");
        },
        help: function () {
          const commandList = Object.keys(commands).join(", ");
          this.echo("Comandi disponibili: clear, " + commandList);
        },
        echo: function (val) {
          this.echo(val);
        },

        whoami: function (val) {
          this.echo(user);
        },
        pwd: function () {
          if (position === '~') {
            this.echo('/home/' + user);
          } else {
            this.echo(position);
          }
        },
        cd: function (val) {
          if (!val || val === '~') {
            const homePath = '/home/' + user;
            if (getNode(homePath)) {
              position = homePath;
            } else {
              this.echo("cd: non esiste la directory home");
            }
            return;
          }

          if (val === '/') {
            position = '/';
            return;
          }

          let newPos;

          if (val.startsWith('/')) {
            newPos = normalizePath(val);
          } else if (val === '..') {
            const parts = position.split('/');
            if (parts.length > 1) {
              parts.pop();
              if (parts[parts.length - 1] === '') parts.pop();
              newPos = parts.join('/') || '/';
            } else {
              newPos = '/';
            }
          } else {
            if (position === '/') {
              newPos = '/' + val;
            } else {
              newPos = position + '/' + val;
            }
            newPos = normalizePath(newPos);
          }

          if (getNode(newPos) && typeof getNode(newPos) === 'object') {
            position = newPos;
          } else {
            this.echo(`cd: nessuna directory: ${val}`);
          }
        },

        ls: function (option) {
          if (option === "./")
            option = position
          if (option === "~")
            option = "/home/" + user;
          // per ora ignora opzioni tipo -l, -a ecc (posso aggiungerle se vuoi)
          let targetPath = position;
          if (option && option.trim() !== '') {
            if (option.startsWith('/')) {
              targetPath = option;
            } else {
              // path relativo
              targetPath = position === '/' ? '/' + option : position + '/' + option;
              targetPath = normalizePath(targetPath);
            }
          }
          const node = getNode(targetPath);
          if (!node) {
            this.echo(`ls: impossibile accedere '${option || targetPath}': No such file or directory`);
            return;
          }

          if (typeof node === 'string') {
            // È un file, stampa solo il nome (ultima parte del path)
            const parts = targetPath.split('/');
            this.echo(parts[parts.length - 1]);
            return;
          }

          // È una directory, stampa elenco nomi (file e cartelle)
          const entries = Object.keys(node);
          this.echo(entries.join('\t'));
        },
        cat: function (path) {
          if (!path) {
            this.echo("cat: file mancante");
            return;
          }

          let targetPath;

          // Gestione path speciali
          if (path === './') {
            targetPath = position === '~' ? '/home/' + user : position;
          } else if (path === '../') {
            if (position === '/' || position === '~') {
              targetPath = '/';
            } else {
              const parts = (position === '~' ? '/home/' + user : position).split('/');
              parts.pop();
              targetPath = parts.join('/') || '/';
            }
          } else if (path === '~') {
            targetPath = '/home/' + user;
          } else {
            // Path relativo o assoluto
            if (path.startsWith('/')) {
              targetPath = path;
            } else {
              targetPath = (position === '~' ? '/home/' + user : position) + '/' + path;
            }
          }

          targetPath = normalizePath(targetPath);

          const node = getNode(targetPath);

          if (!node) {
            this.echo(`cat: ${path}: File o directory non trovato`);
            return;
          }

          if (typeof node === 'object') {
            this.echo(`cat: ${path}: È una directory`);
            return;
          }

          this.echo(node);
        }
      };
      $('body').terminal(commands, {
        greetings: motd(),
        name: 'web_unix',
        prompt: () => `${user}@ubuntu:${position}$ `,
        completion: function (line, callback) {
          const parts = line.trim().split(/\s+/);
          const command = parts[0];
          const arg = parts.length > 1 ? parts[parts.length - 1] : '';

          // Completamento comandi
          if (parts.length === 1 && !line.endsWith(' ')) {
            const cmds = Object.keys(commands).filter(c => c.startsWith(command));
            callback(cmds);
            return;
          }

          // Completamento file/directory
          let path = arg;
          let basePath = (position === '~') ? '/home/' + user : position;

          if (path.startsWith('/')) {
            basePath = '/';
          } else if (path.startsWith('~')) {
            basePath = '/home/' + user;
            path = path.substring(2); // rimuove ~/
          } else if (path.includes('/')) {
            const split = path.split('/');
            path = split.pop(); // nome file parziale
            const rel = split.join('/');
            basePath = normalizePath((position === '~' ? '/home/' + user : position) + '/' + rel);
          }

          const dirNode = getNode(basePath);
          if (!dirNode || typeof dirNode !== 'object') {
            callback([]);
            return;
          }

          const matches = Object.keys(dirNode)
            .filter(name => name.startsWith(path))
            .map(name => {
              const isDir = typeof dirNode[name] === 'object';
              const fullPath = (arg.includes('/') ? arg.replace(/[^/]*$/, '') : '') + name + (isDir ? '/' : '');
              return fullPath;
            });

          callback(matches);
        }

      });

    });
