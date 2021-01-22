const Discord = require('discord.js');
const uwufy = require('uwufy');
const cheerio = require('cheerio');
const request = require('request');

const client = new Discord.Client();

const prefix = '%';
barrels = getRandomInt(6);
escaping = false;
ans = null;
attempts = null;
escaperID = null;

client.once('ready', () =>{
    console.log('Bot is online!')
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    let splitCommand = command.split(" ");
    let mainCommand = splitCommand[0];

    if ((mainCommand == 'override')){
        if(message.member.roles.cache.find(r => r.name === "Sheriff")){
            escaping = false;
            message.channel.send('All escape attempts have been eliminated.');
        } else {
            message.reply("You can't do that! You're not a sheriff!")
        }
    } else if(escaping && (message.member.roles.cache.find(r => r.name === "Roulette"))) {
        if(escaperID == message.author.id) {
            attempts--;
            input = Number(mainCommand);
            if(input == ans){
                escaping = false;
                myRole = message.guild.roles.cache.find(role => role.name === "Roulette");
                myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
                message.member.roles.remove(myRole);
                message.member.roles.remove(myRole2);
                message.reply('Correct! You are free!');
            } else if (attempts == 0){
                escaping = false;
                message.reply('You have used up all of your attempts! Try escaping again.');
            } else{
                message.reply('Incorrect! Try again! You have ' + attempts + ' attempts remaining!');
            }
        } else {
            message.reply('Please wait for the other person to escape first.');
        }
    } else if(mainCommand === 'ping'){
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
        if(message.mentions.users.first() != undefined) {
            uid = message.mentions.users.first().id;
            myRole = message.guild.roles.cache.find(role => role.name === "Horny");
            myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
            mentioned = message.guild.members.cache.get(uid)
            if(!mentioned.roles.cache.find(r => r.name === "Sheriff")){
                if(!mentioned.roles.cache.find(r => r.name === "Horny")) {
                    mentioned.roles.add(myRole)
                    mentioned.roles.add(myRole2)
                    message.channel.send('<@' + uid + '> has been jailed!');
                } else {
                    message.channel.send('<@' + uid + '> is already jailed!');
                }
            } else {
                message.reply('You can\'t do that! They\'re a sheriff!');
            }
        }
    } else if ((mainCommand == 'free') && (message.member.roles.cache.find(r => r.name === "Sheriff"))){
        if(message.mentions.users.first() != undefined) {
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
        }
    } else if (mainCommand == 'roulette'){
        if(!(message.member.roles.cache.find(r => r.name === "Roulette")) && !(message.member.roles.cache.find(r => r.name === "Horny"))){
            barrels--;
            if (barrels == 0){
                myRole = message.guild.roles.cache.find(role => role.name === "Roulette");
                myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
                message.member.roles.add(myRole);
                message.member.roles.add(myRole2);
                message.reply('You have been shot and put in jail!');
                message.channel.send('*reloading and spinning the revolver* <a:loading:802093362005803049>');
                barrels = getRandomInt(6);
            } else {
                message.channel.send('Phew, the barrel chamber was empty!');
            }
        } else {
            message.reply("You're already in jail!");
        }
    } else if (mainCommand == 'escape'){
        if((message.member.roles.cache.find(r => r.name === "Roulette"))){
            num1 = getRandomInt(200);
            num2 = getRandomInt(200);
            ans = num1 + num2;
            message.reply('What is ' + num1 + ' + ' + num2 + ' = ?');
            escaping = true;
            attempts = 3;
            escaperID = message.author.id;
        } else if ((message.member.roles.cache.find(r => r.name === "Horny"))) {
            message.reply("You can't escape! You were manually put in jail!")
        } else {
            message.reply("You're already free!")
        }
    } else if (mainCommand == 'pet') {
        let arr = ['*happy robot sounds*', '*excited beeping*', '*energetic static sound*', '*calculating my love for you*', '*robotic humming*', '*blue screen of happiness*', '*spins in place*', '*pulls you in for robot hug*', '*systems overloaded from happiness*', '*robotic barking*', '*meow*', '*01101001 01101100 01111001*']
        message.channel.send(arr[getRandomInt(12)-1] + ' >w< <:peepoShy:782174763115610124>');
    } else if (mainCommand == 'help') {
        message.reply('\n**%uwu** - uwu-fys messages that you reply to\n**%monke** - monke\n**%jail [user]** - mutes a user and puts them in jail\n**%free [user]** - frees a user from jail\n**%roulette** - shoots from a revolver with 1 bullet in the 6 chamber barrel\n**%escape** - answer the question to free yourself after being shot\n**%override** - remove a current escape attempt\n**%pet** - pet the bot');
    }
})

function getRandomInt(max) {
    return (Math.floor(Math.random() * Math.floor(max)) + 1);
}

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
