const Discord = require('discord.js');
const uwufy = require('uwufy');
const cheerio = require('cheerio');
const request = require('request');
const ud = require('urban-dictionary')
const fs = require('fs');
const {
    performance
} = require('perf_hooks');

//AWS
const AWS = require('aws-sdk');
AWS.config.update(
    {
      accessKeyId: process.env.accessKey,
      secretAccessKey: process.env.secretKey,
      region: 'ca-central-1'
    }
  );

var s3 = new AWS.S3();
const uploadFile = (filePath, bucketName, key) => {
  fs.readFile(filePath, (err, data) => {
    if (err) console.error(err);
    var base64data = new Buffer(data, 'binary');
    var params = {
      Bucket: bucketName,
      Key: key,
      Body: base64data
    };
    s3.upload(params, (err, data) => {
      if (err) console.error(`Upload Error ${err}`);
    });
  });
};

const client = new Discord.Client();

const prefix = '%';

barrels = getRandomInt(6);
escaping = false;
ans = null;
attempts = null;
escaperID = null;

jackboxList = [];
oldList = [];

startUp = false;
timer = null;
t0 = null;
t1 = null;
duckRespawnTime = null;
duckAlive = null;
duckType = null;
scoreDict = new Map();
shortTimeDict = new Map();
longTimeDict = new Map();

coinFlip = null;
trialMsg = null;
underTrial = null;
trialTimer = null;

challenger = null;
challenged = null;
duelTime = null;
jailDuel = false;
askConfirmation = false;
confirmed = false;
duelSpawn = false;
duelDict = new Map();

client.once('ready', () =>{
    console.log('Bot is online!')
    duckHunt();
    setInterval(spawnDuck, 1000);

    params = {Bucket: 'duckhuntgame', Key: 'duckhunt/longestTimes.json'};
    s3.getObject(params, function(err, json_data)
    {
        if (!err) {
            jsonText = (json_data.Body).toString("utf8");
            longTimeDict = new Map(JSON.parse(jsonText));
        }
    });
    params = {Bucket: 'duckhuntgame', Key: 'duckhunt/shortestTimes.json'};
    s3.getObject(params, function(err, json_data)
    {
        if (!err) {
            jsonText = (json_data.Body).toString("utf8");
            shortTimeDict = new Map(JSON.parse(jsonText));
        }
    });
    params = {Bucket: 'duckhuntgame', Key: 'duckhunt/scores.json'};
    s3.getObject(params, function(err, json_data)
    {
        if (!err) {
            jsonText = (json_data.Body).toString("utf8");
            scoreDict = new Map(JSON.parse(jsonText));
        }
    });
    params = {Bucket: 'duckhuntgame', Key: 'duckhunt/duelScores.json'};
    s3.getObject(params, function(err, json_data)
    {
        if (!err) {
            jsonText = (json_data.Body).toString("utf8");
            duelDict = new Map(JSON.parse(jsonText));
        }
    });
});

client.on('message', message =>{
    if(!startUp){
        i = null;
        let keys = Array.from(scoreDict.keys());
        for (var i = 0; i < keys.length; i++) {
            client.users.fetch(keys[i], true);
        }
        startUp = true;
    }
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.substring(1);
    const command = args.toLowerCase();

    let mainCommand = null;
    let splitCommand = null;
    if(command.indexOf(' ') == -1){
        mainCommand = command.substr(command.indexOf(' ') + 1);
    } else {
        mainCommand = command.substr(0, command.indexOf(' '));
        splitCommand = command.substr(command.indexOf(' ') + 1);
    }

    switch (mainCommand) {
        case 'override':
            if(message.member.roles.cache.find(r => r.name === "Sheriff")){
                escaping = false;
                message.channel.send('All escape attempts have been eliminated.');
            } else {
                message.reply("You can't do that! You're not a sheriff!")
            }
            break;
        case 'ping':
            message.channel.send('pong!');
            break;
        case 'uwu':
            if(message.reference != null){
                message.channel.messages.fetch(message.reference.messageID)
                    .then(message => message.channel.send(uwufy(message.content)))
                    .catch(console.error);
            }
            break;
        case 'monke':
            image(message);
            break;
        case 'jail':
            if((message.member.roles.cache.find(r => r.name === "Sheriff"))){
                if(message.mentions.users.first() != undefined) {
                    jail(message);
                }
            } else {
                message.reply("You have to be a sheriff!");
            }
            break;
        case 'free':
            if((message.member.roles.cache.find(r => r.name === "Sheriff"))){
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
            } else {
                message.reply("You have to be a sheriff!");
            }
            break;
        case 'roulette':
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
            break;
        case 'escape':
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
            break;
        case 'finalroulette':
            if((message.member.roles.cache.find(r => r.name === "Roulette")) && !(message.member.roles.cache.find(r => r.name === "Horny"))){
                barrels--;
                if (barrels == 0){
                    message.reply('You have been shot and killed. See ya later!');
                    message.member.kick();
                    message.channel.send('*reloading and spinning the revolver* <a:loading:802093362005803049>');
                    barrels = getRandomInt(6);
                } else {
                    message.channel.send('Phew, the barrel chamber was empty!');
                }
            } else {
                message.reply("You have to lose to %roulette first!");
            }
            break;
        case 'ud':
            urbDict(splitCommand, message, "def");
            break;
        case 'example':
            urbDict(splitCommand, message, "example");
            break;
        case 'random':
            ud.random((error, results) => {
                if (error) {
                  console.error(`random (callback) error - ${error.message}`)
                  return
                }
                message.channel.send("**" + results[0].word + "**:\n" + results[0].definition);
            })
            break;
        case 'bangoptions':
            message.reply("shoot, bang, kill, choke, kachow, attack, blam, cook, drown, belt, redshell, tenderize, <:redshell:794111737493979167>");
            break;
        case 'shoot':
        case 'kill':
        case 'choke':
        case 'kachow':
        case 'attack':
        case 'blam':
        case 'cook':
        case 'drown':
        case 'belt':
        case 'tenderize':
        case '<:redshell:794111737493979167>':
        case 'redshell':
        case 'bang':
            shoot(message);
            break;
        case 'score':
            if(message.mentions.users.first() != undefined) {
                uid = message.mentions.users.first().id;
                uNick = client.users.cache.get(uid).username;
                if(uNick[uNick.length-1] === 's'){
                    uNick = uNick + "\'";
                } else {
                    uNick = uNick + "\'s";
                }
                if(scoreDict.has(uid)){
                    message.channel.send("**" + uNick + " Score**: " + scoreDict.get(uid));
                } else {
                    message.channel.send("**" + uNick + " Score**: " + 0);
                }
            } else {
                uid = message.author.id;
                uNick = client.users.cache.get(uid).username;
                if(uNick[uNick.length-1] === 's'){
                    uNick = uNick + "\'";
                } else {
                    uNick = uNick + "\'s";
                }
                if(scoreDict.has(uid)){
                    message.channel.send("**" + uNick + " Score**: " + scoreDict.get(uid));
                } else {
                    message.channel.send("**" + uNick + " Score**: " + 0);
                }
            }
            break;
        case 'leaderboard':
        case 'scoreboard':
            scoreDict = new Map([...scoreDict.entries()].sort((a, b) => b[1] - a[1]));
            keys = Array.from(scoreDict.keys());
            values = Array.from(scoreDict.values());
            msg = "**__Leaderboard__:**\n"
            for (var i = 0; i < 10; i++) {
                if (keys.length < i+1){
                    break;
                }
                key = keys[i];
                value = values[i]
                uNick = client.users.cache.get(key).username;
                msg += ("**" + (i+1) + ". " + uNick + "**: " + value + "\n");
            }
            message.channel.send(msg);
            break;
        case 'times':
            if(message.mentions.users.first() != undefined) {
                uid = message.mentions.users.first().id;
                uNick = client.users.cache.get(uid).username;
                if(uNick[uNick.length-1] === 's'){
                    uNick = uNick + "\'";
                } else {
                    uNick = uNick + "\'s";
                }
                if(scoreDict.has(uid) && (shortTimeDict.get(uid) !== 12345.6789)){
                    message.channel.send("**" + uNick + " Fastest Time**: " + shortTimeDict.get(uid) + "s\n**" + uNick + " Longest Time**: " + longTimeDict.get(uid) + "s");
                } else {
                    if(shortTimeDict.get(uid) === 12345.6789) {
                        message.channel.send("They haven't shot a duck yet!");
                    } else {
                        message.channel.send("They haven't played duck hunt yet!");
                    }
                }
            } else {
                uid = message.author.id;
                uNick = client.users.cache.get(uid).username;
                if(uNick[uNick.length-1] === 's'){
                    uNick = uNick + "\'";
                } else {
                    uNick = uNick + "\'s";
                }
                if(scoreDict.has(uid) && (shortTimeDict.get(uid) !== 12345.6789)){
                    message.channel.send("**" + uNick + " Fastest Time**: " + shortTimeDict.get(uid) + "s\n**" + uNick + " Longest Time**: " + longTimeDict.get(uid) + "s");
                } else {
                    if(shortTimeDict.get(uid) === 12345.6789) {
                        message.channel.send("You haven't shot a duck yet!");
                    } else {
                        message.channel.send("You haven't played duck hunt yet!");
                    }
                }
            }
            break;
        case 'timeboard':
            shortTimeDict = new Map([...shortTimeDict.entries()].sort((a, b) => a[1] - b[1]));
            keys = Array.from(shortTimeDict.keys());
            values = Array.from(shortTimeDict.values());
            msg = "**__Fastest Times__:**\n"
            removeAllElements(values, keys, 12345.6789);
            for (var i = 0; i < 5; i++) {
                if (keys.length < i+1){
                    break;
                }
                key = keys[i];
                value = values[i]
                uNick = client.users.cache.get(key).username;
                msg += ("**" + (i+1) + ". " + uNick + "**: " + value + "s\n");
            }
            message.channel.send(msg);

            longTimeDict = new Map([...longTimeDict.entries()].sort((a, b) => b[1] - a[1]));
            keys = Array.from(longTimeDict.keys());
            values = Array.from(longTimeDict.values());
            msg = "**__Longest Times__:**\n"
            removeAllElements(values, keys, 12345.6789);
            for (var i = 0; i < 5; i++) {
                if (keys.length < i+1){
                    break;
                }
                key = keys[i];
                value = values[i]
                uNick = client.users.cache.get(key).username;
                msg += ("**" + (i+1) + ". " + uNick + "**: " + value + "s\n");
            } 
            message.channel.send(msg);
            break;
        case 'resetscore':
            if(message.mentions.users.first() != undefined) {
                if(message.member.roles.cache.find(r => r.name === "Sheriff")){
                    if(scoreDict.get(message.author.id) >= 0){
                        scoreDict.set(message.mentions.users.first().id, 0);
                        message.reply("The user's score has been succesfully reset!");
                    } else {
                        message.reply("Your duck hunt score is too low to use the reset command!");
                    }
                } else {
                    message.reply("You can't do that! You're not a sheriff!");
                }
            } else {
                message.reply("You need to mention a user!");
            }
            break;
        case 'addqueue':
            if(message.mentions.users.first() != undefined) {
                if (!jackboxList.includes(message.mentions.users.first().id)){
                    jackboxList.push(message.mentions.users.first().id);
                    message.reply("User has been added!");
                } else {
                    message.reply("That user is already in the queue!");
                }
            } else {
                message.reply("You need to mention a user!");
            }
            break;
        case 'removequeue':
            if(message.mentions.users.first() != undefined) {
                if (jackboxList.includes(message.mentions.users.first().id)){
                    removeAllElements(jackboxList, null, message.mentions.users.first().id);
                    message.reply("User has been removed!");
                } else {
                    message.reply("That user isn't in the queue!");
                }
            } else {
                message.reply("You need to mention a user!");
            }
            break;
        case 'rotate':
            jackbox(message, mainCommand);
            break;
        case 'list':
            jackbox(message, mainCommand);
            break;
        case 'queue':
            jackbox(message, mainCommand);
            break;
        case 'randomize':
            if(message.member.roles.cache.find(r => r.name === "Sheriff")){
                shuffle(jackboxList);
                message.reply("List has been randomized!");
            } else {
                message.reply("You can't do that! You're not a sheriff!");
            }
            break;
        case 'trial':
            if(message.member.roles.cache.find(r => r.name === "Sheriff")){
                if(message.mentions.users.first() != undefined) {
                    coinFlip = getRandomInt(2)
                    if(underTrial == null){
                        underTrial = message.mentions.users.first().id;
                        if(!message.guild.members.cache.get(underTrial).roles.cache.find(r => r.name === "Horny")){
                            trialMsg = message;
                            message.channel.send('<@' + underTrial + '>, You are under trial! Quick, you only have 60 seconds! Choose either **heads** or **tails**!');
                            trialTimer = true;
                            setTimeout(function() {
                                if(trialTimer){
                                    jail(trialMsg);
                                    underTrial = null;
                                    underTrial = null;
                                    trialMsg = null;
                                }
                            }, 60000);
                        } else {
                            message.reply("That user is already jailed!");
                            underTrial = null;
                        }
                    } else {
                        message.reply("Someone else is already under trial!");
                    } 
                } else {
                    message.reply("You have to mention a user!");
                }
            } else {
                message.reply("You have to be a sheriff!");
            }
            break;
        case 'duel':
            duelTrigger(message, mainCommand);
            break;
        case 'jailduel':
            duelTrigger(message, mainCommand);
            break;
        case 'yes':
            if(askConfirmation && message.author.id == challenged){
                confirmed = true;
                askConfirmation = false;
                message.channel.send('A duel between <@' + challenged + '> and <@' + challenger + '> is about to begin. Type **%fire** when you hear the signal!');
                duel(message);
            }
            break;
        case 'fire':
            if(message.author.id == challenger || message.author.id == challenged){
                myRole = message.guild.roles.cache.find(role => role.name === "Roulette");
                myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
                if(duelSpawn){
                    if(message.author.id == challenger){
                        winner = challenger;
                        loser = challenged;
                    } else {
                        winner = challenged;
                        loser = challenger;
                    }
                    if(jailDuel){
                        message.channel.send('Congratulations <@' + winner + '>! You have won! <@' + loser + '> has been put into jail!');
                        jailedUser = message.guild.members.cache.get(loser);
                        jailedUser.roles.add(myRole);
                        jailedUser.roles.add(myRole2);
                    } else {
                        message.channel.send('Congratulations <@' + winner + '>! You have won!');
                    }

                    if(duelDict.has(winner)){
                        list = duelDict.get(winner).split(' ');
                        string = ((parseInt(list[0])+1) + ' ' + (parseInt(list[1])));
                        duelDict.set(winner, string);
                    } else {
                        string = (1 + ' ' + 0);
                        duelDict.set(winner, string);
                    }
                    if(duelDict.has(loser)){
                        list = duelDict.get(loser).split(' ');
                        string = (parseInt(list[0]) + ' ' + (parseInt(list[1])+1));
                        duelDict.set(loser, string);
                    } else {
                        string = (0 + ' ' + 1);
                        duelDict.set(loser, string);
                    }
                } else {
                    if(message.author.id == challenger){
                        winner = challenged;
                        loser = challenger;
                    } else {
                        winner = challenger;
                        loser = challenged;
                    }
                    
                    if(jailDuel){
                        message.reply("You shot too early! You lose and have been put in jail.")
                        jailedUser = message.guild.members.cache.get(loser);
                        jailedUser.roles.add(myRole);
                        jailedUser.roles.add(myRole2);
                    } else {
                        message.reply("You shot too early! You lose!");
                    }
                    
                    if(duelDict.has(message.author.id)){
                        list = duelDict.get(loser).split(' ');
                        string = (parseInt(list[0]) + ' ' + (parseInt(list[1])+1));
                        duelDict.set(loser, string)

                        list = duelDict.get(winner).split(' ');
                        string = ((parseInt(list[0])+1) + ' ' + (parseInt(list[1])));
                        duelDict.set(winner, string);
                    } else {
                        string = (1 + ' ' + 0);
                        duelDict.set(winner, string);
                        
                        string = (0 + ' ' + 1);
                        duelDict.set(loser, string);
                    }
                }
    
                fs.writeFile('./duelScores.json', JSON.stringify(Array.from(duelDict.entries())), function(err) {
                    if(err) console.log(err)
                })
                uploadFile('./duelScores.json', 'duckhuntgame', 'duckhunt/duelScores.json');
    
                challenger = null;
                challenged = null;
                duelTime = null;
                jailDuel = false;
                askConfirmation = false;
                confirmed = false;
                duelSpawn = false;
            }
            break;
        case 'duelscore':
            if(message.mentions.users.first() != undefined) {
                uid = message.mentions.users.first().id;
                uNick = client.users.cache.get(uid).username;
                if(uNick[uNick.length-1] === 's'){
                    uNick = uNick + "\'";
                } else {
                    uNick = uNick + "\'s";
                }
                if(duelDict.has(uid)){
                    list = duelDict.get(uid).split(' ');
                    message.channel.send("**" + uNick + " Wins**: " + list[0] + "\n**" + uNick + " Losses**: " + list[1]);
                } else {
                    message.channel.send("They haven't been in a duel yet!");
                }
            } else {
                uid = message.author.id;
                uNick = client.users.cache.get(uid).username;
                if(uNick[uNick.length-1] === 's'){
                    uNick = uNick + "\'";
                } else {
                    uNick = uNick + "\'s";
                }
                if(duelDict.has(uid)){
                    list = duelDict.get(uid).split (' ');
                    message.channel.send("**" + uNick + " Wins**: " + list[0] + "\n**" + uNick + " Losses**: " + list[1]);
                } else {
                    message.channel.send("You haven't been in a duel yet!");
                }
            }
            break;
        case 'duelboard':
            keys = Array.from(duelDict.keys());
            wins = [];
            losses = [];
            for(var i = 0; i < keys.length; i++){
                uid = keys[i];
                list = duelDict.get(uid).split(' ');
                wins[i] = list[0];
                losses[i] = list[1];
            }

            list = [];
            for (var i = 0; i < keys.length; i++) {
                list.push({'id': keys[i], 'wins': wins[i]});
            }
            list.sort(function(a, b) {
                return b.wins - a.wins;
            });
            values = []
            for (var i = 0; i < list.length; i++) {
                keys[i] = list[i].id;
                values[i] = list[i].wins;
            }

            msg = "**__Most Wins__:**\n"
            for (var i = 0; i < 5; i++) {
                if (keys.length < i+1){
                    break;
                }
                key = keys[i];
                value = values[i];
                uNick = client.users.cache.get(key).username;
                msg += ("**" + (i+1) + ". " + uNick + "**: " + value + "\n");
            }

            keys = Array.from(duelDict.keys());
            list = [];
            for (var i = 0; i < keys.length; i++) {
                list.push({'id': keys[i], 'losses': losses[i]});
            }
            list.sort(function(a, b) {
                return b.losses - a.losses;
            });
            values = []
            for (var i = 0; i < list.length; i++) {
                keys[i] = list[i].id;
                values[i] = list[i].losses;
            }

            msg += "**__Most Losses__:**\n"
            for (var i = 0; i < 5; i++) {
                if (keys.length < i+1){
                    break;
                }
                key = keys[i];
                value = values[i]
                uNick = client.users.cache.get(key).username;
                msg += ("**" + (i+1) + ". " + uNick + "**: " + value + "\n");
            }
            message.channel.send(msg);
            break;
        case 'sadge':
            message.channel.send("<:Sadgemo:810235730403524618>");
            break;
        case 'mattmoment':
            let user = client.users.fetch('755091426928230401');
            if(user !== undefined){
                if(message.member.roles.cache.find(r => r.name === "Sheriff")){
                    let arr = ["BANNED", "Beta", "Forest", "Insomniacs", "Phizz Simp", "Froge", "Minecwaft", "Epic Gamers", "Switch"];
                    user.then(function(userOb) {
                        arr.forEach(el => {
                            userOb.roles.add(message.guild.roles.cache.find(role => role.name === el));
                        });
                    }
                    message.reply("Roles have been added!");
                } else {
                    message.reply("You're not a sheriff!");
                }
            } else {
                message.reply("User isn't in the server!");
            }
            break;
        case 'pet':
            let arr = ['*happy robot sounds*', '*excited beeping*', '*energetic static sound*', '*calculating my love for you*', '*robotic humming*', '*blue screen of happiness*', '*spins in place*', '*pulls you in for robot hug*', '*systems overloaded from happiness*', '*robotic barking*', '*meow*', '*01101001 01101100 01111001*', '*woof*', '*jumps up and down*', '*spills oil*', '*beep boop*']
            petNum = getRandomInt(16)-1;
            if(petNum === 14){
                message.channel.send(arr[petNum] + ' 😳');
            } else {
                message.channel.send(arr[petNum] + ' >w< <:peepoShy:782174763115610124>');
            }
            break;
        case 'help':
            helpString = "\n**%uwu** - uwu-fys messages that you reply to\n**%monke** - monke\n**%jail [user]** - mutes a user and puts them in jail\n**%free [user]** - frees a user from jail";
            helpString += "\n**%roulette** - shoots from a revolver with 1 bullet in the 6 chamber barrel\n**%escape** - answer the question to free yourself after being shot\n**%override** - remove a current escape attempt";
            helpString += "\n**%pet** - pet the bot\n**%finalroulette** - proceed with caution. if you lose to this, you will be kicked\n**%ud [word]** - retrieves a definition from urban dictionary";
            helpString += "\n**%example [word]** - retrieves an example sentence from urban dictionary\n**%random** - returns a random definition from urban dictionary'\n**%shoot/bang** - shoots the duck (if there is one)";
            helpString += "\n**%score *[user]*** - shows the score of the user or a mentioned user\n**%scoreboard** - shows the top 10 duck hunt scores\n**%times *[user]*** - shows the fastest and slowest duck hunt times of the user or a mentioned user"
            helpString += "\n**%timeboard** - shows the top 5 fastest and longest duck hunt times\n**%resetscore [user]** - resets the duck hunt score of the mentioned user\n**%bangoptions** - shows the shooting commands available for duckhunt\n**%addqueue [user]** - adds a user to the jackbox queue";
            helpString += "\n**%removequeue [user]** - removes a user from the jackbox queue\n**%rotate** - rotates the jackbox queue\n**%list/queue** - lists the jackbox queue\n**%randomize** - randomizes the jackbox list";
            helpString += "\n**%trial [user]** - place a user on trial\n**%duel [user]** - engage in a duel with another user\n**%jailduel [user]** - engage in a duel, but be sent to jail if you lose";
            helpString += "\n**%duelscore *[user]*** - shows the duel wins and losses of the user or mentioned user\n**%duelboard *** - shows the the top 5 duel winners and losers";
            message.reply(helpString);
            break;
        default:
            if(escaping && (message.member.roles.cache.find(r => r.name === "Roulette"))) {
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
            } else if((underTrial != null) && (message.author.id == underTrial)){
                input = null;
                if (mainCommand == 'heads'){
                    input = 1;
                } else if(mainCommand == 'tails') {
                    input = 2;
                }
                if(input != null){
                    if(input == coinFlip){
                        underTrial = null;
                        trialMsg = null;
                        trialTimer = false;
                        message.reply('Correct! You have been found innocent! You are free to go!');
                    } else {
                        message.reply('Incorrect! You have been found guilty!');
                        underTrial = null;
                        trialTimer = false;
                        jail(trialMsg);
                        trialMsg = null;
                    }
                }
            }
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
        if(!urls.length){
            return;
        }
        message.channel.send(urls[Math.floor(Math.random() * urls.length)]);
    });
}

function jail(message){
    timedOut = false;
    uid = message.mentions.users.first().id;
    msg = '<@' + uid + '>';
    if(uid == underTrial && trialTimer){
        msg += (', You ran out of time! You have been jailed!');
        message.channel.send(msg);
        trialTimer = false;
        timedOut = true;
    }
    myRole = message.guild.roles.cache.find(role => role.name === "Horny");
    myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
    mentioned = message.guild.members.cache.get(uid)
    if(!(mentioned.roles.cache.find(r => r.name === "Roulette"))){
        if(!mentioned.roles.cache.find(r => r.name === "Sheriff")){
            if(!mentioned.roles.cache.find(r => r.name === "Horny")) {
                mentioned.roles.add(myRole)
                mentioned.roles.add(myRole2)
                if(!timedOut){
                    msg += (' has been jailed!');
                    message.channel.send(msg);
                }
            } else {
                if(!timedOut){
                    msg += (' is already jailed!');
                    message.channel.send(msg);
                }
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

function duckHunt(){
    duckRespawnTime = getRandomInt(80) + 40;
    duckAlive = false;
    duckType = null;
    timer = 0;
}

function spawnDuck(){
    if(!duckAlive){
        if(timer === duckRespawnTime){
            duckAlive = true;
            chance = getRandomInt(10000)
            if(chance <= 1000){
                duckType = 'silver';
            } else if (chance > 1000 && chance <= 1400) {
                duckType = 'golden';
            } else if (chance > 1400 && chance <= 1440) {
                duckType = 'diamond';
            } else if (chance > 1440 && chance <= 1450) {
                duckType = 'emerald';
            } else if (chance == 1451) {
                duckType = 'dark';
            }
            client.channels.cache.find(ch => ch.name === 'duck-hunt').send("\\\\_o< quack!");
            t0 = performance.now();
        }
        timer++;
    }
}

function shoot(message){
    if(message.channel === client.channels.cache.find(ch => ch.name === 'duck-hunt')){
        t1 = performance.now();
        totalTime = ((t1 - t0)/1000).toFixed(3);
        if(duckAlive){
            missedNum = getRandomInt(100);
            gainedPts = 1;
            if(missedNum > 7){
                if(duckType == 'silver'){
                    message.reply("You shot a **silver** duck! \\\\_x< | +5 points (" + totalTime + " seconds)");
                    gainedPts = 5;
                } else if (duckType == 'golden'){
                    message.reply("You shot a **golden** duck! \\\\_x< | +10 points (" + totalTime + " seconds)");
                    gainedPts = 10;
                } else if (duckType == 'diamond'){
                    message.reply("You shot a **diamond** duck! \\\\_x< | +100 points (" + totalTime + " seconds)");
                    gainedPts = 100;
                } else if (duckType == 'emerald'){
                    message.reply("You shot a **emerald** duck! \\\\_x< | +250 points (" + totalTime + " seconds)");
                    gainedPts = 250;
                } else if (duckType == 'dark'){
                    message.reply("You shot a **dark matter** duck! \\\\_x< | You lost **all** your points! (" + totalTime + " seconds)");
                    gainedPts = 0;
                } else {
                    message.reply("You shot the duck! \\\\_x< | +1 point (" + totalTime + " seconds)");
                }

                if(scoreDict.has(message.author.id)){
                    if(gainedPts == 0){
                        scoreDict.set(message.author.id, 0);
                    } else {
                        scoreDict.set(message.author.id, scoreDict.get(message.author.id)+gainedPts);
                    }
                    if((parseFloat(shortTimeDict.get(message.author.id)) > totalTime) || parseFloat(shortTimeDict.get(message.author.id)) === 12345.6789){
                        shortTimeDict.set(message.author.id, totalTime);
                    }
                    if((parseFloat(longTimeDict.get(message.author.id)) < totalTime) || parseFloat(longTimeDict.get(message.author.id)) === 12345.6789){
                        longTimeDict.set(message.author.id, totalTime);
                    }
                } else {
                    scoreDict.set(message.author.id, gainedPts);
                    shortTimeDict.set(message.author.id, totalTime);
                    longTimeDict.set(message.author.id, totalTime);
                }
                duckHunt();
            } else {
                message.reply("You **missed** the duck! Try again! -1 point (" + totalTime + " seconds)");
                if(scoreDict.has(message.author.id)){
                    scoreDict.set(message.author.id, scoreDict.get(message.author.id)-1);
                } else {
                    scoreDict.set(message.author.id, -1);
                    shortTimeDict.set(message.author.id, 12345.6789);
                    longTimeDict.set(message.author.id, 12345.6789);
                }
            }
        } else {
            message.reply("There was no duck! -1 point (" + totalTime + " seconds)");
            if(scoreDict.has(message.author.id)){
                scoreDict.set(message.author.id, scoreDict.get(message.author.id)-1);
                if(parseFloat(scoreDict.get(message.author.id)) < parseFloat(-7)){
                    message.reply("You have been placed in jail for repeatedly missing! You can escape with %escape")
                    myRole = message.guild.roles.cache.find(role => role.name === "Roulette");
                    myRole2 = message.guild.roles.cache.find(role => role.name === "Muted");
                    message.member.roles.add(myRole);
                    message.member.roles.add(myRole2);
                }
            } else {
                scoreDict.set(message.author.id, -1);
                shortTimeDict.set(message.author.id, 12345.6789);
                longTimeDict.set(message.author.id, 12345.6789);
            }
        }
        fs.writeFile('./duckhunt/scores.json', JSON.stringify(Array.from(scoreDict.entries())), function(err) {
            if(err) console.log(err)
        })
        fs.writeFile('./duckhunt/shortestTimes.json', JSON.stringify(Array.from(shortTimeDict.entries())), function(err) {
            if(err) console.log(err)
        })
        fs.writeFile('./duckhunt/longestTimes.json', JSON.stringify(Array.from(longTimeDict.entries())), function(err) {
            if(err) console.log(err)
        })
        uploadFile('./duckhunt/scores.json', 'duckhuntgame', 'duckhunt/scores.json');
        uploadFile('./duckhunt/shortestTimes.json', 'duckhuntgame', 'duckhunt/shortestTimes.json');
        uploadFile('./duckhunt/longestTimes.json', 'duckhuntgame', 'duckhunt/longestTimes.json');
    }
}

function urbDict(text, message, type){
    ud.define(text, (error, results) => {
        if (error) {
            ud.autocomplete(text, (error, results) => {
                if (error) {
                    console.error(`autocomplete (callback) error - ${error.message}`)
                    return
                }  
                text = (results[0]);
                ud.define(text, (error, results) => {
                    if (error) {
                      console.error(`define (callback) error - ${error.message}`)
                      return
                    }
                    if(type == "def"){
                        message.channel.send("**" + results[0].word + "**:\n" + results[0].definition);
                    } else {
                        message.channel.send("**" + results[0].word + "**:\n" + results[0].example);
                    }
                  })
            })
            return
        }
        if(type == "def"){
            message.channel.send("**" + results[0].word + "**:\n" + results[0].definition);
        } else {
            message.channel.send("**" + results[0].word + "**:\n" + results[0].example);
        }
    })
}

function jackbox(message, mainCommand){
    oldList = jackboxList;
    if(mainCommand == 'rotate'){
        x = jackboxList.length - 8;
        if (x>0){
            for(var i = 0; i < x; i++){
                jackboxList.push(jackboxList.shift());
            }
        }
    }
    msg = "**__Playing__:**\n"
    for (var i = 0; i < jackboxList.length; i++) {
        uNick = client.users.cache.get(jackboxList[i]).username;
        if(i<8){
            msg += "**" + (i+1) + "**. " + uNick + "\n";
        } else if(i == 8){
            msg += msg = "**__Queue__:**\n"
            msg += uNick + "\n";
        } else {
            msg += uNick + "\n";
        }
    }
    message.channel.send(msg);
}

function duelTrigger(message, mainCommand){
    if(message.mentions.users.first() != undefined) {
        if(!confirmed && !askConfirmation){
            t3 = performance.now();
            askConfirmation = true;
            challenger = message.author.id;
            challenged = message.mentions.users.first().id;
            if(mainCommand == 'jailduel'){
                message.channel.send('<@' + challenged + '>, You have been challenged to a **jail** duel! If you lose, you will be sent to jail <:monkaS:782169582051786772> You have 60 seconds to respond. To accept, type **%yes**');
                jailDuel = true;
            } else {
                message.channel.send('<@' + challenged + '>, You have been challenged to a duel! You have 60 seconds to respond. To accept, type **%yes**');
            }
            setTimeout(function() {
                t4 = performance.now();
                if(askConfirmation && !(parseFloat((t4-t3)/1000)<60)){
                    message.reply("The user did not accept your challenge.");
                    challenger = null;
                    challenged = null;
                    jailDuel = false;
                    askConfirmation = false;
                    confirmed = false;
                    duelSpawn = false;
                }
            }, 61000);
        } else {
            message.reply("There is currently a duel!");
        }
    } else {
        message.reply("You have to mention a user!");
    }
}

function duel(message){
    duelTime = getRandomInt(40) + 20;
    setTimeout(function() {
        if(confirmed){
            message.channel.send("**__Fire Now!__**");
            duelSpawn = true;
        }
    }, (duelTime*1000));
}

function getRandomInt(max) {
    return (Math.floor(Math.random() * Math.floor(max)) + 1);
}

function removeAllElements(array, array2, elem) {
    var index = array.indexOf(elem);
    while (index > -1) {
        array.splice(index, 1);
        if(array2 != null){
            array2.splice(index, 1);
        }
        index = array.indexOf(elem);
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

client.login(process.env.BOT_TOKEN);
