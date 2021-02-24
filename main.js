const Discord = require('discord.js');
const uwufy = require('uwufy');
const cheerio = require('cheerio');
const request = require('request');
const ud = require('urban-dictionary')

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

    const args = message.content.substring(1);
    const command = args.toLowerCase();

    let splitCommand = command.split(" ");
    let mainCommand = splitCommand[0];

    if ((mainCommand == 'override')){
        if(message.member.roles.cache.find(r => r.name === "Sheriff")){
            escaping = false;
            message.channel.send('All escape attempts have been eliminated.');
        } else {
            message.reply("You can't do that! You're not a sheriff!")
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
            if(!(mentioned.roles.cache.find(r => r.name === "Roulette"))){
                if(!mentioned.roles.cache.find(r => r.name === "Sheriff")){
                    if(!mentioned.roles.cache.find(r => r.name === "Horny")) {
                        mentioned.roles.add(myRole)
                        mentioned.roles.add(myRole2)
                        message.channel.send('<@' + uid + '> has been jailed!');
                    } else {
                        message.channel.send('<@' + uid + '> is already jailed!');
                    }
                } else {
                    message.reply("You can't do that! They're a sheriff!");
                }
            } else {
                    myRole3 = message.guild.roles.cache.find(role => role.name === "Roulette");
                    mentioned.roles.remove(myRole3)
                    mentioned.roles.add(myRole)
                    if(uid === escaperID) {
                        escaping = false;
                    }
                    message.reply("Roulette status has been removed, and <@" + uid + "> has been jailed.");
            }
        }
    } else if ((mainCommand == 'free') && (message.member.roles.cache.find(r => r.name === "Sheriff"))){
        if(message.mentions.users.first() != undefined) {
            uid = message.mentions.users.first().id;
            myRole = message.guild.roles.cache.find(role => role.name === "Horny");
            myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
            mentioned = message.guild.members.cache.get(uid)
            if(!(mentioned.roles.cache.find(r => r.name === "Roulette"))){
                if(mentioned.roles.cache.find(r => r.name === "Horny")){
                    mentioned.roles.remove(myRole)
                    mentioned.roles.remove(myRole2)
                    message.channel.send('<@' + uid + '> has been freed!');
                } else {
                    message.channel.send('<@' + uid + '> is already free!');
                }
            } else {
                message.reply("That user was put in jail due to roulette! They must use %escape to free themselves.");
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
        if(!escaping) {
            if((message.member.roles.cache.find(r => r.name === "Roulette"))){
                num1 = getRandomInt(2000);
                num2 = getRandomInt(2000);
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
        } else {
            message.reply('Please wait for the other person to escape first.');
        }
    } else if (mainCommand == 'finalroulette'){
        if((message.member.roles.cache.find(r => r.name === "Roulette")) && !(message.member.roles.cache.find(r => r.name === "Horny"))){
            barrels--;
            if (barrels == 0){
                message.reply('You have been shot and killed. See ya later!');
                message.member.kick(myRole);
                message.channel.send('*reloading and spinning the revolver* <a:loading:802093362005803049>');
                barrels = getRandomInt(6);
            } else {
                message.channel.send('Phew, the barrel chamber was empty!');
            }
        } else {
            message.reply("You have to lose to %roulette first!");
        }
    } else if (mainCommand == 'ud'){
        urbDict(splitCommand[1], message, "def");
    } else if (mainCommand == 'example'){
        urbDict(splitCommand[1], message, "example");
    } else if (mainCommand == 'pet') {
        let arr = ['*happy robot sounds*', '*excited beeping*', '*energetic static sound*', '*calculating my love for you*', '*robotic humming*', '*blue screen of happiness*', '*spins in place*', '*pulls you in for robot hug*', '*systems overloaded from happiness*', '*robotic barking*', '*meow*', '*01101001 01101100 01111001*', '*woof*', '*jumps up and down*', '*spills oil*', '*beep boop*']
        petNum = getRandomInt(16)-1;
        if(petNum === 14){
            message.channel.send(arr[petNum] + ' 😳');
        } else {
            message.channel.send(arr[petNum] + ' >w< <:peepoShy:782174763115610124>');
        }
    } else if (mainCommand == 'help') {
        message.reply('\n**%uwu** - uwu-fys messages that you reply to\n**%monke** - monke\n**%jail [user]** - mutes a user and puts them in jail\n**%free [user]** - frees a user from jail\n**%roulette** - shoots from a revolver with 1 bullet in the 6 chamber barrel\n**%escape** - answer the question to free yourself after being shot\n**%override** - remove a current escape attempt\n**%pet** - pet the bot\n**%finalroulette** - proceed with caution. if you lose to this, you will be kicked\n**%ud [word]** - retrieves a definition from urban dictionary\n**%example [word]** - retrieves an example sentence from urban dictionary');
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
    }
})

function urbDict(text, message, type){
    // Callback
    ud.define(text, (error, results) => {
        if (error) {
        console.error(`define (callback) error - ${error.message}`)
        return
        }
        if(type == "def"){
            message.channel.send("**" + text + "**:\n" + results[0].definition);
        } else {
            message.channel.send("**" + text + "**:\n" + results[0].example);
        }
    })
}

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
