const Discord = require('discord.js');
const { prefix, token, main_channel } = require('./config.json');


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
            message.reply("pong")
            break;
    }
});

bot.login(token);