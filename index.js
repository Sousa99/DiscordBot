const Discord = require('discord.js');

const { credential_discord, credential_script } = require('./config.json');
const { admins } = require('./config.json');
const { prefix, main_channel, help_basic } = require('./config.json')

const { token, ClientID } = require(credential_discord);

const create_credentials = false;
if (create_credentials) {
    credentials = require('./credentials/create.js');
    return;
}

class Output {
    constructor(method) { this.method = method; }
    reply(text) { this.method(text); }
}

const calendar = require('./calendar.js')
const youtube = require('./youtube.js')
const people = require('./people.js')

const bot = new Discord.Client();
let basic_output = new Output(console.log);

console.log("Hello World");
console.log("... I mean Discord World");

function choose_answer(array) {
    size = array.length;
    random = Math.floor(Math.random() * size);

    return array[random];
}

bot.on('ready', function() {
    console.log("I'm ready master!");
    bot.channels.get(main_channel).send("I'm ready to serve you master!");
});

bot.on('message', function(message) {
    if(!message.content.startsWith(prefix) || message.author.bot) return 
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    const output = message;

    switch (command) {

        case ("ping"):
            if (args.length != 0)
                break;
            
            output.reply("pong");
            break;
        
        case ("beep"):
            if (args.length != 0)
                break;

            // TODO: Say only "beep"
            output.reply("beep", {
                tts: true 
            });
            break;

        case ("recommend"):
            const fs = require('fs');
            const {recommendations_path, recommendations_break} = require('./config.json');
            var recommendation = message.content.substr(message.content.indexOf(" ") + 1);

            var string = '\n' + recommendations_break + '\n';
            string += "Server: " + message.guild.name + " (" + message.channel.name + ")\n";
            string += "User: " + message.author.username + " (" + message.author.id + ")\n";
            string += "Recomendation: " + recommendation;

            // TODO: Solve problem, promise not handled properly
            fs.appendFile(recommendations_path, string, (err) => {
                if (err) console.error(err);
                output.reply("Recommendation sent to administrator, thanks!");
                });

            break;
        
        case ("calendar"):
            if (args.length == 1 && args[0] == "listCalendars") {
                calendar.listCalendars(output);
            } else if ((args.length == 1 || args.length == 2) && args[0] == "events") {
                calendar.listEvents(output, args[1]);
            } else {
                const {help_calendar} = require('./config.json');
                output.reply(printHelp(message.author.id, help_calendar));
            }

            break;

        case ("youtube"):
            if (args.length == 1 && args[0] == "showSubscriptions") {
                youtube.subscriptionsList(output);
            } else if (args.length == 1 && args[0] == "showSubscribers") {
                youtube.subscribersList(output);
            } else if (args.length == 2 && args[0] == "videosByRatingList") {
                youtube.videosByRatingList(output, args[1]);
            } else if ((args.length == 1) && args[0] == "showPlaylists") {
                youtube.relatedPlaylistsList(output);
                youtube.createdPlaylistsList(output);
            } else if ((args.length >= 2 || args.length <= 4) && args[0] == "recommend") {
                youtube.addRecomendation(output, args[1], args[2], args[3]);
            }

            else {
                const {help_youtube} = require('./config.json');
                output.reply(printHelp(message.author.id, help_youtube));
            }

            break;

        case ("people"):
            if (args.length == 1 && args[0] == "getMain") {
                output.getMyContact(output);
            }

            else {
                const {help_people} = require('./config.json');
                output.reply(printHelp(message.author.id, help_people));
            }

            break;
            
        
        default:
        const {help_geral} = require('./config.json');
        output.reply(printHelp(message.author.id, help_geral));
    }
});


/* TODO: Improve this one!
var typing = false;
var user_typing;
bot.on('typingStart', function(channel, user) {
    if (user == user_typing) return;

    typing = true;
    user_typing = user;
    var message = "<@" + user.id + "> is currently typping, mess with him/her!\nWE RESPECT WAMEN ON THIS SERVER";
    bot.channels.get(channel.id).send(message);
});
*/

/**
 * Print help given an help type structure
 * @param id id of the user whop sent the request
 * @param help structure
 */
function printHelp(id, help) {
    if (isAdmin(id)) {
        string = help_basic.basic + " " + help_basic.admin;
        help.admin.forEach(function(line) {
            string += "\n" + help_basic.admin + " " + line; 
        });

    } else
        string = help_basic.basic;

    help.basic.forEach(function(line) {
        string += "\n" + line;
    });

    return string;
}

/**
 * Verifies if user who sent request is admin
 * @param id of who sent the message
 * @return boolean
 */
function isAdmin(id) {
    return admins.includes(id);
}

bot.login(token);