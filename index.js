const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = 'NTI4Mjk5NjQ3MzcwNzg4ODY0.DwgRtw.WYHcOOPR2OkL3chatBJ8fJoO6BI'

// Client ID: 528299647370788864
// https://discordapp.com/api/oauth2/authorize?client_id=528299647370788864&scope=bot&permissions=1

console.log("Hello World");
console.log("... I mean Discord World");

bot.on('message', function(message) {
    if(message.content == "Hello") {
        message.reply("Suck my dick!")
    }
});

bot.on('ready', function() {
    console.log("Ready");
});

bot.login(TOKEN);