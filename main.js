const Discord = require('discord.js');
const uwufy = require('uwufy');
const cheerio = require('cheerio');
const request = require('request');

const client = new Discord.Client();

const prefix = '%';

client.once('ready', () =>{
    console.log('Bot is online!')
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    let splitCommand = command.split(" ");
    let mainCommand = splitCommand[0];

    if(mainCommand === 'ping'){
        message.channel.send('pong!');
    } else if (mainCommand == 'uwu') {
        if(message.reference != null){
            message.channel.messages.fetch(message.reference.messageID)
                .then(message => message.channel.send(uwufy(message.content)))
                .catch(console.error);
        }
    } else if (mainCommand == 'monke') {
        image(message);
    } else if ((mainCommand == 'jail') && (message.member.roles.cache.find(r => r.name === "Sheriff"))){
        uid = message.mentions.users.first().id;
        myRole = message.guild.roles.cache.find(role => role.name === "Horny");
        myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
        mentioned = message.guild.members.cache.get(uid)
        if(!(mentioned.roles.cache.find(r => r.name === "Sheriff"){
            if(!mentioned.roles.cache.find(r => r.name === "Horny")) {
                mentioned.roles.add(myRole)
                mentioned.roles.add(myRole2)
                message.channel.send('<@' + uid + '> has been jailed!');
            } else {
                message.channel.send('<@' + uid + '> is already jailed!');
            }
        } else {
            message.reply('You can\'t do that! They\'re a sheriff!")
        }
    } else if ((mainCommand == 'free') && (message.member.roles.cache.find(r => r.name === "Sheriff"))){
        uid = message.mentions.users.first().id;
        myRole = message.guild.roles.cache.find(role => role.name === "Horny");
        myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
        mentioned = message.guild.members.cache.get(uid)
        if(mentioned.roles.cache.find(r => r.name === "Horny")){
            mentioned.roles.remove(myRole)
            mentioned.roles.remove(myRole2)
            message.channel.send('<@' + uid + '> has been freed!');
        } else {
            message.channel.send('<@' + uid + '> is already free!');
        }
    } else if (mainCommand == 'help') {
        message.reply('\n**%uwu** - uwu-fys messages that you reply to\n**%monke** - monke\n**%jail [user]** - mutes a user and puts them in jail\n**%free [user]** - frees a user from jail');
    }
})

function image(message){
    var options = {
        url : "http://results.dogpile.com/serp?qc=images&q=" + "monkey",
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };

    request(options, function(error, response, responseBody){
        if (error) {
            return;
        }

        $ = cheerio.load(responseBody);

        var links = $(".image a.link");

        var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

        console.log(urls);
        if(!urls.length){
            return;
        }

        message.channel.send(urls[Math.floor(Math.random() * urls.length)]);
    });
}

client.login(process.env.BOT_TOKEN);
