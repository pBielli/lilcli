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