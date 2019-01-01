const Discord = require('discord.js');
const calendar = require('./calendar.js')
const { prefix, token, main_channel, help_basic } = require('./config.json');

const bot = new Discord.Client();

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

    switch (command) {

        case ("ping"):
            message.reply("pong");
            break;
        
        case ("beep"):
            message.reply("beep", {
                tts: true 
            });
            break;
        
        case ("calendar"):
            if (args.length == 1 && args[0] == "listCalendars")
                calendar.listCalendars(message);
            else if ((args.length == 1 || args.length == 2) && args[0] == "events")
                calendar.listEvents(message, args[1]);
            else {
                const {help_calendar} = require('./config.json');
                message.reply(printHelp(help_calendar));
            }

            break;
        
        default:
        const {help_geral} = require('./config.json');
        message.reply(printHelp(help_geral));
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

function printHelp(help) {
    string = help_basic;
    help.forEach(function(line) {
        string += "\n" + line;
    });

    return string;
}

bot.login(token);