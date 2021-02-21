import express from 'express'
import bodyParser from 'body-parser';
import GoogleSheetsExporter from '../exporters/exporters.googlesheets.js';
import Logger from '../logger';

class Server {
  start() {
    const app = express();
    app.post('/', bodyParser.json(), async function (req, res) { 
      try {

        // Body
        const json = req.body;
        if (!json) {
          throw "Error no Json!";
        }

        // Export to Google Sheets
        Logger.info("Sending data to Google Sheets...");
        GoogleSheetsExporter.prepareData(json);
        GoogleSheetsExporter.updateSpreadsheet();
        Logger.info(json);
        Logger.info("Data sent OK");
        res.status(200).send("OK");
      } catch (err) {
        Logger.error(json);
        res.end('Error: ' + err.message);
      }
    });

    app.listen(3000, function () {
      Logger.info('Server listening on port 3000.');
    });
  }
}

export default new Server();