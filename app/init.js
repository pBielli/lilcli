logo=`\
  ██████ ▓█████  ▄████▄   ▒█████   ███▄    █ ▓█████▄     ▄████▄   ██░ ██  ██▓ ██▓    ▓█████▄ 
▒██    ▒ ▓█   ▀ ▒██▀ ▀█  ▒██▒  ██▒ ██ ▀█   █ ▒██▀ ██▌   ▒██▀ ▀█  ▓██░ ██▒▓██▒▓██▒    ▒██▀ ██▌
░ ▓██▄   ▒███   ▒▓█    ▄ ▒██░  ██▒▓██  ▀█ ██▒░██   █▌   ▒▓█    ▄ ▒██▀▀██░▒██▒▒██░    ░██   █▌
  ▒   ██▒▒▓█  ▄ ▒▓▓▄ ▄██▒▒██   ██░▓██▒  ▐▌██▒░▓█▄   ▌   ▒▓▓▄ ▄██▒░▓█ ░██ ░██░▒██░    ░▓█▄   ▌
▒██████▒▒░▒████▒▒ ▓███▀ ░░ ████▓▒░▒██░   ▓██░░▒████▓    ▒ ▓███▀ ░░▓█▒░██▓░██░░██████▒░▒████▓ 
▒ ▒▓▒ ▒ ░░░ ▒░ ░░ ░▒ ▒  ░░ ▒░▒░▒░ ░ ▒░   ▒ ▒  ▒▒▓  ▒    ░ ░▒ ▒  ░ ▒ ░░▒░▒░▓  ░ ▒░▓  ░ ▒▒▓  ▒ 
░ ░▒  ░ ░ ░ ░  ░  ░  ▒     ░ ▒ ▒░ ░ ░░   ░ ▒░ ░ ▒  ▒      ░  ▒    ▒ ░▒░ ░ ▒ ░░ ░ ▒  ░ ░ ▒  ▒ 
░  ░  ░     ░   ░        ░ ░ ░ ▒     ░   ░ ░  ░ ░  ░    ░         ░  ░░ ░ ▒ ░  ░ ░    ░ ░  ░ 
      ░     ░  ░░ ░          ░ ░           ░    ░       ░ ░       ░  ░  ░ ░      ░  ░   ░    
                ░                             ░         ░                             ░      `;




var term= new WebTerminal({
  user: "tech",
  machineName: "secondchild",
  initialPosition: "~",
  startupPrint: `\n\n\n` + logo + `\n\nWelcome to your web terminal!\nType 'help' for a list of commands.\n`,
  // motdFunction: () =>{},
  //  sysInfoFunction: () => "Personalizzata info sistema!",
  //   "Benvenuto, Pat!",
  // fileSystemData: {
  //   "/": {
  //     home: {
  //       pat: {
  //         "file.txt": "Contenuto del file"
  //       }
  //     }
  //   }
  // },
  additionalCommands: {
    date: function () {
      this.echo(new Date().toString());
    }
  }
});
// document.onload = () => {term.echo(logo, { raw: true });}