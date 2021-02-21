const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer');
const googleSheets = require("./google-sheets");
const mainUrl = 'https://csgoempire.com/';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {

  // Backend Server
  let jsonParser = bodyParser.json();
  app.post('/', jsonParser, async function (req, res) { 
    try {
      const json = req.body;
      console.log(json);

      if (!json) {
        throw "Error no Json!";
      }
      const formattedDateDate = new Date(json.timestamp);
      const formattedDate = formattedDateDate.toLocaleDateString('es-AR') + " " + formattedDateDate.toLocaleTimeString('es-AR');
      const data = [
        json.timestamp,
        formattedDate,
        json.bets.ct.ammount,
        json.bets.ct.people,
        json.last100.ct,
        json.bets.t.ammount,
        json.bets.t.people,
        json.last100.t,
        json.bets.bonus.ammount,
        json.bets.bonus.people,
        json.last100.bonus,
        json.winner
      ];

      console.log(data);
      googleSheets.updateSpreadsheet(data);
      console.log(data);
      res.status(200).send("OK");
    } catch (err) {
      res.end('Error: ' + err.message);
    }
  });
  app.listen(3000, function () {
    console.log('Server listening on port 3000.');
  });
  // await sleep(1000000);

  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ['--enable-automation'],
    headless: true,
    args: ['--start-maximized', '--disable-web-security'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto(mainUrl);

  // Preparation
  await sleep(300);
  console.log("Mi cubanaa   ( • )( • )ԅ(‾⌣‾ԅ)")
  await page.waitForSelector('.wheel__item');
  await sleep(100);

  // Main evaluation
  await page.evaluate(async function() {

    // Helpers
    const sleepHelper = function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Getters
    const getMainRollingLabel = () => {
      const target = [...document.querySelectorAll("div")]
          .filter(a => a.textContent == "Rolling");

      if (typeof target[0] !== 'undefined') {
        return target[0].parentNode.parentNode;
      }

      console.log("Try again...");
      return false;
    }
    const getCountLabel = () => {
      return getMainRollingLabel().lastElementChild.lastElementChild.textContent;
    }
    const getWinnerLabel = () => {
      const target = document.querySelectorAll('.bet-btn--win .bet-btn__image');
      if (typeof target[0] !== 'undefined') {
        return target[0];
      }
      return false;
    }
    const getWinnerFromElement = (element) => {
      return element.alt;
    }
    const getBetsData = () => {
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
    const getLast100Data = () => {
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
    const waitUntilGetsRollingLabel = async function() {
      return new Promise(function (resolve, reject) {
        (function waitForElement(){
          if (getMainRollingLabel()) return resolve();
          setTimeout(waitForElement, 30);
        })();
      });
    }
    const waitUntilRoundEnds = async function() {
      return new Promise(function (resolve, reject) {
        (async function waitForRound() {
          const actualValue = parseFloat(getMainRollingLabel().lastElementChild.lastElementChild.textContent);
          console.log("Counting... " + actualValue);

          if(globalCount && globalCount > 0 && actualValue === 0) {
            console.log("Terminaron las apuestas");
            globalCount = actualValue;
            await waitUntilWinner();
            return resolve();
          }

          globalCount = actualValue;
          setTimeout(waitForRound, 30);
        })();
      });
    }
    const waitUntilWinner = async function() {
      let bets = [];
      return new Promise(function (resolve, reject) {
        (function waitForWinner() {
          const actualWinner = getWinnerLabel();
          bets.push(getBetsData());
          if (bets.length > 10) {
            bets = bets.slice(1, 11);
          }

          if(actualWinner) {
            const winner = getWinnerFromElement(actualWinner);
            console.log("Winner: " + winner);
            finishRound(winner, bets);
            return resolve();
          }

          setTimeout(waitForWinner, 30);
        })();
      });
    }
    const finishRound = (winner, betsArr) => {
      const bets = betsArr[0];
      const timestamp = Date.now();
      const last100 = getLast100Data();

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


    await waitUntilGetsRollingLabel();
    let globalCount = getCountLabel();
    while (true) {
      console.log("Iniciando Ronda...");
      await waitUntilRoundEnds();
      console.log("Finalizando ronda...");
      await sleepHelper(3000);
    }

  }).catch((error) => {
    console.log("CATCH ERROR! Promise Rejected");
    console.log(error);
  });

  process.exit();

  // await page.close()
  // await browser.close()
})();