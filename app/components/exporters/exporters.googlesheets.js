import Path from 'path';
import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

class GoogleSheets { 
  prepareData(json) {
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

    this.data = data;
  }

  updateSpreadsheet() {
    fs.readFile(Path.join(__dirname, '../../../credentials.json'), (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      this.authorize(JSON.parse(content), this.addRow, this.data);
    });
  }

  authorize(credentials, callback, data) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return this.getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, data);
    });
  }

  getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client, data);
      });
    });
  }


  addRow(auth, data) {
    const sheets = google.sheets({version: 'v4', auth});
    console.log(data);

    sheets.spreadsheets.values.append({
      spreadsheetId: '1XJMKEMJZaN9KjCIih9fAroBKicXzNKEHoLDfXO7B61U',
      range: 'SCRAP',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
          data
        ],
      }
    }, (err, response) => {
      if (err) return console.error(err)
    });
  }
}

export default new GoogleSheets();