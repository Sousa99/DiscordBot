const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const CALENDAR_CONST = {
    SCOPES: ['https://www.googleapis.com/auth/calendar.readonly'],
    TOKEN_PATH: './credentials/token_google_calendar.json'
};
const YOUTUBE_CONST = {
    SCOPES: ['https://www.googleapis.com/auth/youtube.readonly'],
    TOKEN_PATH: './credentials/token_google_youtube.json'
};

const {client_secret, client_id, redirect_uris} = require('./credentials_google.json').installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);


//getAccessToken(oAuth2Client, CALENDAR_CONST);
//getAccessToken(oAuth2Client, YOUTUBE_CONST);

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessToken(oAuth2Client, INFO) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: INFO.SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(INFO.TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) console.error(err);
            console.log('Token stored to', INFO.TOKEN_PATH);
            });
        });
    });
}