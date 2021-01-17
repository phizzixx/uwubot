const Discord = require('discord.js');
const uwufy = require('uwufy');

const client = new Discord.Client();

client.on('ready', () => {

    console.log('I am ready!');

});

const prefix = '%';

client.once('ready', () =>{
    console.log('Bot is online!')
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'ping'){
        message.channel.send('pong!');
    } else if (command == 'uwu') {
        if(message.reference != null){
            message.channel.messages.fetch(message.reference.messageID)
                .then(message => message.channel.send(uwufy(message.content)))
                .catch(console.error);
        }
    }
})

client.login(process.env.BOT_TOKEN);