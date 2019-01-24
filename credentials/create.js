const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const CALENDAR_CONST = {
    SCOPES: ['https://www.googleapis.com/auth/calendar.readonly'],
    TOKEN_PATH: './credentials/token_google_calendar.json'
};
const YOUTUBE_CONST = {
    SCOPES: ['https://www.googleapis.com/auth/youtube'],
    TOKEN_PATH: './credentials/token_google_youtube.json'
};
const PEOPLE_CONST = {
    SCOPES: ['profile', 'https://www.googleapis.com/auth/contacts.readonly'],
    TOKEN_PATH: './credentials/token_google_people.json'
};

const {client_secret, client_id, redirect_uris} = require('./credentials_google.json').installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);


//getAccessTokenGoogle(oAuth2Client, CALENDAR_CONST);
//getAccessTokenGoogle(oAuth2Client, YOUTUBE_CONST);
//getAccessTokenGoogle(oAuth2Client, PEOPLE_CONST);
getAccessTokenInstagram();

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessTokenGoogle(oAuth2Client, INFO) {
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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessTokenInstagram() {
    // Example with express
 
    // Your redirect url where you will handle the code param
    const redirectUri = 'https://www.instagram.com/oauth/authorize/?client_id=d52377ff91dc450fb9f9a13a65c33f31&redirect_uri=https://github.com/Sousa99/DiscordBot&response_type=code';
    
    // First redirect user to instagram oauth
    app.get('/auth/instagram', (req, res) => {
    res.redirect(
        instagram.getAuthorizationUrl(
        redirectUri,
        {
            // an array of scopes
            scope: ['basic', 'likes'],
        },
        )
        );
    });
    
    // Handle auth code and get access_token for user
    app.get('/auth/instagram/callback', async (req, res) => {
        try {
            // The code from the request, here req.query.code for express
            const code = req.query.code;
            const data = await instagram.authorizeUser(code, redirectUri);
            // data.access_token contain the user access_token
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    });
}