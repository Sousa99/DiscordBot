const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');

const {credential_google, token_google} = require('./config.json');

const max_calendars_shown = 100;
const max_events_shown = 15;
const predefined_id = 'u77bbtdl86hevdfc2iau7v98uo@group.calendar.google.com';
//const predefined_id = '9nihtqkga5a3ebfu8e9p3l5rls@group.calendar.google.com';

const googleSecrets = JSON.parse(fs.readFileSync(credential_google)).installed;
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

const token = fs.readFileSync(token_google);
oauth2Client.setCredentials(JSON.parse(token));

/**
 * Lists all user's calendar.
 */
async function listCalendars(message) {
    const calendar = google.calendar('v3');
    calendar.calendarList.list({
            auth: oauth2Client,
            maxResults: 100
        },

        function (err, result) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }

            var string = "Calendários Disponíveis (máx " + max_calendars_shown + "):"
            result.data.items.forEach((element, i) => {
                string += "\n" + i + ". " + printCalendar(element);
            });

            message.reply(string);
        }
    );
  }

/**
 * Lists the next max_events_shown events on the user's calendar.
 * @returns string
 */
function listEvents(message, id) {
    const calendar = google.calendar('v3');

    if (id == undefined)
        id = predefined_id;

    calendar.events.list({
            auth: oauth2Client,
            calendarId: id,
            timeMin: (new Date()).toISOString(),
            maxResults: max_events_shown,
            singleEvents: true,
            orderBy: 'startTime',
        },
    
        function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }

            var events = response.data.items;
            message.reply(printListEvents(events));
        });
}

function printCalendar(calendar) {
    return `${calendar.summary} - ${calendar.id}`;
}

function printEvent(event) {
    const start = event.start.dateTime || event.start.date;
    return `${start} - ${event.summary}`;
}

function printListEvents(events) {
    var string;

    if (events.length) {
        string = "Upcoming " + events.length + " events:";
        events.map((event, i) => {
            string += "\n" + printEvent(event);
        });
    } else {
        string = "No upcoming events found.";
    }

    return string;
}

module.exports = {
    listCalendars,
    listEvents
}