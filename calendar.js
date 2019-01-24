const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');

const {credential_google, token_google_calendar} = require('./config.json');

let calendar_ids = [];
const max_calendars_shown = 100;
const max_events_shown = 15;
const predefined_id = 'u77bbtdl86hevdfc2iau7v98uo@group.calendar.google.com';

const googleSecrets = JSON.parse(fs.readFileSync(credential_google)).installed;
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

const token = fs.readFileSync(token_google_calendar);
oauth2Client.setCredentials(JSON.parse(token));

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * Update calendar id list and possibly print this information
 * @param callback used to output information
 * @param print bool
 */
function updateCalendarsList(callback, print) {
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
            calendar_ids = [];
            result.data.items.forEach((element, i) => {
                calendar_ids.push(element.id);
                string += "\n" + i + ". " + printCalendar(element);
            });

            if (print)
                callback.reply(string);
        }
    );
}

/**
 * Lists all user's calendar.
 * @param callback used to output information
 */
function listCalendars(callback) {
    updateCalendarsList(callback, true);
}

/**
 * Lists the next max_events_shown events on the user's calendar.
 * @param callback used to output information
 * @param id id of the calendar to be shown
 */
async function listEvents(callback, index) {
    const calendar = google.calendar('v3');

    if (index == undefined) {
        id = predefined_id;
    } else {
        updateCalendarsList(callback, false);
        // TODO: Not the best way to await for end of updateCalendarsList (research Promises async/await)
        await sleep(500);
        id = calendar_ids[index];
    }

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
            callback.reply(printListEvents(events));
        });
}

/**
 * Prints the information about a calendar
 * @param calendar calendar to be printed
 * @return string
 */
function printCalendar(calendar) {
    return `${calendar.summary} - ${calendar.id}`;
}

/**
 * Prints the information about an event
 * @param event event to be printed
 * @return string
 */
function printEvent(event) {
    const start = event.start.dateTime || event.start.date;
    return `${start} - ${event.summary}`;
}

/**
 * Prints the information about a list of events
 * @param events list of events to be printed
 * @return string
 */
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