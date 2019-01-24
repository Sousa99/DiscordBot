const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');

const {credential_google, token_google_people} = require('./config.json');

const googleSecrets = JSON.parse(fs.readFileSync(credential_google)).installed;
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

const token = fs.readFileSync(token_google_people);
oauth2Client.setCredentials(JSON.parse(token));

/**
 * Print my contact
 * @param callback used to output information
 */
function getMyContact(callback) {
    var service = google.people('v1');
    service.people.get({
            auth: oauth2Client,
            resourceName: 'people/me',
            personFields: 'names,emailAddresses,nicknames,birthdays'
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            var person = response.data;
            var string = "Contact:\n";
            string += printContact(person);

            callback.reply(string);
        });
}

/**
 * Print contact info
 * @param person which information is going to be printed
 */
function printContact(person) {
    // TODO: Add this kind of information to my google account
    var string;
    string = "Name: " + person.names[0].displayName + "\n";
    //string += "Nickname: " + person.nicknames[0].value + "\n";
    //string += "Email: " + person.emailAddresses[0].value;
    //string += "Birthday: " + person.birthdays[0].text + "\n";
    return string;
}

module.exports = {
    getMyContact
}