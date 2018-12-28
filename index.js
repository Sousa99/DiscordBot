const Discord = require('discord.js');
const Constants = require('./constants.js');

const bot = new Discord.Client();
const TOKEN = 'NTI4Mjk5NjQ3MzcwNzg4ODY0.DwgRtw.WYHcOOPR2OkL3chatBJ8fJoO6BI'

const main_channel = "528302096529883158"

// Client ID: 528299647370788864
// https://discordapp.com/api/oauth2/authorize?client_id=528299647370788864&scope=bot&permissions=1

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
    if(message.content == "Hello") {
        message.reply(choose_answer(Constants.insults));
    }
});

bot.login(TOKEN);