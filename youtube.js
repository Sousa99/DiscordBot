const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');

const {credential_google, token_google_youtube} = require('./config.json');

const max_video_title = 50;
const max_subscriptions_shown = 50;
const max_videos_shown = 10;

const googleSecrets = JSON.parse(fs.readFileSync(credential_google)).installed;
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

const token = fs.readFileSync(token_google_youtube);
oauth2Client.setCredentials(JSON.parse(token));

/**
 * Lists up to 50 of the channels subscribed to
 * @param message Message to wich is going to be answered
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
                var string = "The user is not subscribed to any channel.";
            } else {
                var string = "Channels that the user is subscribed to:"
                channels.forEach((element, i) => {
                    string += "\n" + (i + 1) + ". " + printChannel(element);
                });
            }

            message.reply(string);
        });
}

/**
 * Lists up to 50 of the channels subscribed to you
 * @param message Message to wich is going to be answered
 */
function subscribersList(message) {
    var service = google.youtube('v3');
    service.subscriptions.list({
            auth: oauth2Client,
            part: 'id,snippet,contentDetails',
            maxResults: max_subscriptions_shown ,
            order: 'relevance',
            mySubscribers: true
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            var channels = response.data.items;
            if (channels.length == 0) {
                var string = "There are no users subscribed to the user.";
            } else {
                var string = "Channels/Users that are subscribed to the user: " + channels.length;
                channels.forEach((element, i) => {
                    string += "\n" + (i + 1) + ". " + printChannel(element);
                });
            }

            message.reply(string);
        });
}

/**
 * Lists up to 10 videos that the user liked or disliked
 * @param message Message to wich is going to be answered
 * @param rating "like" or "dislike"
 */
function videosByRatingList(message, rating) {
    if (rating != "like" && rating != "dislike") {
        message.reply("\"" + rating + "\" is not a valid rating. Use \"like\" or \"dislike\"");
        return;
    }

    var service = google.youtube('v3');
    service.videos.list({
            auth: oauth2Client,
            part: 'id,snippet,statistics',
            maxResults: max_videos_shown ,
            myRating: rating
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            var channels = response.data.items;
            if (channels.length == 0) {
                var string = "The user didn't \"" + rating + "\" any video.";
            } else {
                var string = "Videos that the user recently \"" + rating + "d\": (Titles might be truncated)";
                channels.forEach((element, i) => {
                    string += "\n" + (i + 1) + ". " + printVideo(element);
                });
            }

            message.reply(string);
        });
}

/**
 * Prints the information about a channel
 * @param channel channel to be printed
 * @return string
 */
function printChannel(channel) {
    return `${channel.snippet.title} - ${channel.contentDetails.totalItemCount} videos`;
}

/**
 * Prints the information about a video
 * @param video video to be printed
 * @return string
 */
function printVideo(video) {
    // TODO: Problem with rating
    var interactions = video.statistics.likeCount + video.statistics.dislikeCount;
    console.log("Rating: " + (video.statistics.likeCount / interactions));
    var rating = Math.round(video.statistics.likeCount / (video.statistics.likeCount + video.statistics.dislikeCount) * 100);
    return `${video.snippet.channelTitle} - ${video.snippet.title.substring(0,max_video_title)} - ${video.statistics.viewCount} views:
        Link: <https://www.youtube.com/watch?v=${video.id}> - ${rating}% like ratio`;
}

module.exports = {
    subscriptionsList,
    subscribersList,
    videosByRatingList
}