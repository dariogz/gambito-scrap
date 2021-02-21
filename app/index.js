import Server from './components/server/server.main';
import Browser from './components/browsers/browsers.puppeteer';
import Logger from './components/logger';

Logger.info("Server starting...");
Server.start();

(async () => {
  Logger.info("Browser starting...");
  Browser.start();
})();