const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');

const {credential_google, token_google_youtube} = require('./config.json');

const max_subscriptions_shown = 50;

const googleSecrets = JSON.parse(fs.readFileSync(credential_google)).installed;
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

const token = fs.readFileSync(token_google_youtube);
oauth2Client.setCredentials(JSON.parse(token));

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function subscriptionsList(message) {
    var service = google.youtube('v3');
    service.subscriptions.list({
            auth: oauth2Client,
            part: 'id,snippet,contentDetails',
            maxResults: max_subscriptions_shown ,
            order: 'relevance',
            mine: true
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            var channels = response.data.items;
            if (channels.length == 0) {
                var string = "You are not subscribed to any channel.";
            } else {
                var string = "Channels that you are subscribed to:"
                channels.forEach((element, i) => {
                    string += "\n" + (i + 1) + ". " + printChannel(element);
                });
            }

            message.reply(string);
        });
}

function printChannel(channel) {
    return `${channel.snippet.title} - ${channel.contentDetails.totalItemCount} videos`;
}

module.exports = {
    subscriptionsList
}