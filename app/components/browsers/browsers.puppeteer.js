import Puppeteer from 'puppeteer';
import CSGoEmpire from '../sites/sites.csgoempire.com';
import Helpers from '../helpers';
import Logger from '../logger';
const { timeoutPromise } = Helpers;

class Browser {
  constructor() {
    this.target = new CSGoEmpire();
  }

  async setup() {
    this.browser = await Puppeteer.launch({
      ignoreDefaultArgs: ['--enable-automation'],
      headless: false,
      args: ['--start-maximized', '--disable-web-security'],
      defaultViewport: null
    });
    this.page = await this.browser.newPage();
    await this.page.goto(this.target.url);
  }

  async start() {
    await this.setup();
    await this.target.setPage(this.page);
    await this.target.readiness();
    this.scrapMainLoop();
  }

  async scrapMainLoop() {
    let counter = 1;
    while (true) {
      Logger.info("Starting round #" + counter);
      await timeoutPromise(40000, this.target.evaluateRound(counter))
        .then(response => Logger.info("Resolve > " + response))
        .catch(error => {
          Logger.error("ERROR!! > " + error);
          process.exit();
        });
      counter++;
    }
  }
}

export default new Browser();