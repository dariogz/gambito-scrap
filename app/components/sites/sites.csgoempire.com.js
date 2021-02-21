import Helpers from '../helpers';
import Path from 'path';
const { sleep } = Helpers;

class CSGoEmpire {
  constructor() {
    this.url = 'https://csgoempire.com/';
    this.scriptsFile = 'sites.csgoempire.com.scripts.js';
  }

  async setPage(page) {
    this.page = page;
    await this.setupScripts();
  }

  async setupScripts() {
    const scripts = Path.join(__dirname, this.scriptsFile);
    await this.page.addScriptTag({path: scripts});
  }

  async readiness() {
    await sleep(300);
    await this.page.waitForSelector('.wheel__item');
    await this.page.evaluate(async function() {
      await Scripts.waitUntilGetsRollingLabel();
    })
    await sleep(100);
  }

  async evaluateRound(counter) {
    await sleep(300);
    return new Promise(async (resolve, reject) => {
      await this.page.evaluate(async function(counter) {
        Scripts.globalCount = Scripts.getCountLabel();
        console.log("Starting Round...");
        await Scripts.waitUntilRoundEnds();
        console.log("...Finishing Round");
        await Scripts.sleep(2000);
      }, counter);
      resolve("Round ended OK");
    });
  }
}

export default CSGoEmpire;