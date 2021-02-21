class CSGoEmpireScripts {
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters
  getMainRollingLabel () {
    const target = [...document.querySelectorAll("div")]
      .filter(a => a.textContent == "Rolling");

    if (typeof target[0] !== 'undefined') {
      return target[0].parentNode.parentNode;
    }

    console.log("Try again...");
    return false;
  }

  getCountLabel() {
    return this.getMainRollingLabel().lastElementChild.lastElementChild.textContent;
  }

  getWinnerLabel() {
    const target = document.querySelectorAll('.bet-btn--win .bet-btn__image');
    if (typeof target[0] !== 'undefined') {
      return target[0];
    }
    return false;
  }

  getWinnerFromElement(element) {
    return element.alt;
  }

  getBetsData() {
    NodeList.prototype.forEach = Array.prototype.forEach;
    const bets = document.querySelectorAll('.bets-container');
    const results = {};
    bets.forEach(function (bet) {
      const peopleDivs = [...bet.querySelectorAll('div')]
        .filter(el => el.innerText.includes("Bets Total"));
      const people = parseInt(peopleDivs[peopleDivs.length - 1].innerText);
      const ammount = bet.querySelectorAll('.font-numeric')[0]
        .textContent;
      const team = bet.querySelectorAll('img')[0]
        .alt;

      results[team] = {
        people,
        ammount,
        team
      }
    })

    return results;
  }

  getLast100Data() {
    const results = {};
    const teams = ['ct', 'bonus', 't'];
    const target = [...document.querySelectorAll('div')].filter(el => el.innerText === 'Last 100')[0];
    teams.forEach((team) => {
      const teamElement = target.parentNode.querySelectorAll('.coin-'+team)
        [0].nextElementSibling.innerText;
      results[team] = parseInt(teamElement);
    });

    return results;
  }

  // Wait for certain states
  async waitUntilGetsRollingLabel() {
    return new Promise(function (resolve, reject) {
      (function waitForElement(){
        if (Scripts.getMainRollingLabel()) return resolve();
        setTimeout(waitForElement, 30);
      })();
    });
  }

  async waitUntilRoundEnds() {
    return new Promise(function (resolve, reject) {
      (async function waitForRound() {
        const actualValue = parseFloat(Scripts.getMainRollingLabel().lastElementChild.lastElementChild.textContent);
        console.log("Counting... " + actualValue);

        if(Scripts.globalCount && Scripts.globalCount > 0 && actualValue === 0) {
          console.log("Terminaron las apuestas");
          Scripts.globalCount = actualValue;
          await Scripts.waitUntilWinner();
          return resolve();
        }

        Scripts.globalCount = actualValue;
        setTimeout(waitForRound, 30);
      })();
    });
  }

  async waitUntilWinner() {
    let bets = [];
    return new Promise(function (resolve, reject) {
      (function waitForWinner() {
        const actualWinner = Scripts.getWinnerLabel();
        bets.push(Scripts.getBetsData());
        if (bets.length > 10) {
          bets = bets.slice(1, 11);
        }

        if(actualWinner) {
          const winner = Scripts.getWinnerFromElement(actualWinner);
          console.log("Winner: " + winner);
          Scripts.finishRound(winner, bets);
          return resolve();
        }

        setTimeout(waitForWinner, 30);
      })();
    });
  }

  finishRound(winner, betsArr) {
    const bets = betsArr[0];
    const timestamp = Date.now();
    const last100 = this.getLast100Data();

    const data = {
      winner,
      timestamp,
      bets,
      last100
    }

    console.log("Fetching >>>");
    fetch('http://localhost:3000', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } 
}

// Init scripts
const Scripts = new CSGoEmpireScripts();