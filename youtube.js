const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');

const {credential_google, token_google_youtube} = require('./config.json');

const max_video_title = 50;
const max_subscriptions_shown = 50;
const max_videos_shown = 10;
const max_playlists_shown = 10;
// TODO: Others
const related_playlists_index = ["uploads"]; // "likes", "favorites", "watchHistory", "watchLater"
const recommendation_playlist = 'PLKxTXHAz5hR8t6eZdJcFqKE-OlXlQny6S';

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
 * @param callback used to output information
 */
function subscriptionsList(callback) {
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
                var string = "Channels that the user is subscribed to: ( max 50 :( )"
                channels.forEach((element, i) => {
                    string += "\n" + (i + 1) + ". " + printChannel(element);
                });
            }

            callback.reply(string);
        });
}

/**
 * Lists up to 50 of the channels subscribed to you
 * @param callback used to output information
 */
function subscribersList(callback) {
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
                // TODO: Exchange ":(" for emoji in discord
                var string = "Channels/Users that are subscribed to the user: ( max 50 :( ) ";
                channels.forEach((element, i) => {
                    string += "\n" + (i + 1) + ". " + printChannel(element);
                });
            }

            callback.reply(string);
        });
}

/**
 * Lists up to 10 videos that the user liked or disliked
 * @param callback used to output information
 * @param rating "like" or "dislike"
 */
function videosByRatingList(callback, rating) {
    if (rating != "like" && rating != "dislike") {
        callback.reply("\"" + rating + "\" is not a valid rating. Use \"like\" or \"dislike\"");
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

            callback.reply(string);
        });
}

/**
 * Lists up to 10 playslits created by user
 * @param callback used to output information
 * @param index index of playlist shown
 */
function relatedPlaylistsList(callback, index) {
    var service = google.youtube('v3');
    service.channels.list({
            auth: oauth2Client,
            part: 'id,snippet,contentDetails',
            mine: true,
            maxResults: 1
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            var my_channel = response.data.items[0];
            var related_playlists = my_channel.contentDetails.relatedPlaylists;

            if (index == undefined) {
                var string = "Playlists related to the user:";
                related_playlists_index.forEach((element, i) => {
                    playlist_id = related_playlists[element];
                    
                    service.playlists.list({
                        auth: oauth2Client,
                        part: 'id,snippet,status',
                        id: playlist_id,
                        maxResults: 1
                    },
                    
                    function(err, response) {
                        if (err) {
                            console.log("The API returned an error: " + err);
                            return;
                        }
            
                        var playlist = response.data.items[0];
                        string += "\n" + i + ". " + printPlaylist(playlist);

                        callback.reply(string);
                    });

                });
            }
        });
}

/**
 * Lists up to 10 playslits created by user
 * @param callback used to output information
 * @param index index of playlist shown
 */
function createdPlaylistsList(callback, index) {
    var service = google.youtube('v3');
    service.playlists.list({
            auth: oauth2Client,
            part: 'id,snippet,status',
            mine: true,
            maxResults: max_playlists_shown
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            var playlists = response.data.items;
            if (playlists.length == 0) {
                var string = "The user has not created any playlists.";
            } else if (index == undefined) {
                var string = "Playlists created by the user:";
                playlists.forEach((element, i) => {
                    string += "\n" + i + ". " + printPlaylist(element);
                });
            }

            callback.reply(string);
        });
}

/**
 * Adds User Recommendation to Youtube Playlist
 * @param callback used to output information
 * @param link link to the added video
 */
function addRecomendation(callback, link, startTime, endTime) {
    // TODO: StartTime, EndTime; how it works emphasis on youtube side, not coding side
    var details = {
        videoId: getVideoId(link),
        kind: 'youtube#video'
    }

    if (startTime != undefined)
        details['startAt'] = startTime;
    if (endTime != undefined)
        details['endAt'] = endTime;

    var service = google.youtube('v3');
    service.playlistItems.insert({
            auth: oauth2Client,
            part: 'snippet',
            resource: {
                snippet : {
                    playlistId : recommendation_playlist,
                    resourceId : details
                }
            }
        },
        
        function(err, response) {
            if (err) {
                console.log("The API returned an error: " + err);
                return;
            }

            callback.reply("Video added to Recomendations for User!");
        })
}

/**
 * Returns video id given link to youtube video
 * @param link link to the added video
 * @return id (String)
 */
function getVideoId(link) {
    const link_trash = "https://www.youtube.com/watch?v=";
    const time_trash = "&t=";

    var video_id = link.replace(link_trash, "");
    if ((pos = video_id.search(time_trash)) != -1) {
        var time = video_id.slice(pos);
        video_id = video_id.replace(time, "");
    }

    return video_id;
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

/**
 * Prints the information about a video
 * @param playlist playlist to be printed
 * @return string
 */
function printPlaylist(playlist) {
    return `${playlist.snippet.title} - ${playlist.snippet.description} - Status: ${playlist.status.privacyStatus} => <https://www.youtube.com/playlist?list=${playlist.id}>`;
}

module.exports = {
    subscriptionsList,
    subscribersList,
    videosByRatingList,
    relatedPlaylistsList,
    createdPlaylistsList,
    addRecomendation
}