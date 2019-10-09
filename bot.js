//Dependencies
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

const testHTML = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
	<input type="text" id="fiptest">
</body>
</html>
`;

const { JSDOM } = require('jsdom');
const jsdom = new JSDOM(testHTML);

// Set window and document from jsdom
const { window } = jsdom;
const { document } = window;
// Also set global window and document before requiring jQuery
global.window = window;
global.document = document;

const $ = global.jQuery = require('jquery');
//Get the status

function getServerVersion() {
    $.getJSON('https://api.mcsrvstat.us/2/34.95.23.246', function (status) {
        //Show the version
        //console.log(status.version)
        
        serverOb = status;
        //Show a list of players
        /*
        $.each(status.players.list, function (index, player) {
            console.log(player);
        }); */
    });
}


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';
// Initialize Discord Bot

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !help
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Here are a list of commands you can use: \n \n' + 
                              '!help                produces this list \n' +
                              '!players             returns a list of online players \n' +
                              '!start               starts the server if not already up \n' +
                              '!status              returns server status \n' +
                              '!version             gets minecraft server version \n'
                });
                break;
            // !players
            case 'players':
                $.getJSON('https://api.mcsrvstat.us/2/34.95.23.246', function (status) {
                    if (!status.online) {
                        bot.sendMessage({
                            to: channelID,
                            message: 'Server is down!'
                        });
                    }
                    else if (status.players.online == 0) {
                        bot.sendMessage({
                            to: channelID,
                            message: 'No one is online.'
                        });
                    }
                    else {
                        bot.sendMessage({
                            to: channelID,
                            message: 'Current online players: '
                        });
                        $.each(status.players.list, function (index, player) {
                            bot.sendMessage({
                                to: channelID,
                                message: player
                            });
                        });
                    }
                });
                break;
            // !start
            case 'start':
                $.getJSON('https://api.mcsrvstat.us/2/34.95.23.246', function (status) {
                    if (status.online) {
                        bot.sendMessage({
                            to: channelID,
                            message: "Server is already up!"
                        });
                    }
                    else {
                        bot.sendMessage({
                            to: channelID,
                            message: "Starting server is a feature currently under development..."
                        });
                    }
                });
                break;
            // !status
            case 'status':
                $.getJSON('https://api.mcsrvstat.us/2/34.95.23.246', function (status) {
                    if (status.online) {
                        bot.sendMessage({
                            to: channelID,
                            message: "Server is up!"
                        });
                    }
                    else
                        bot.sendMessage({
                        to: channelID,
                        message: "Server is down!"
                    });
                });
                break;
            // !version
            case 'version':
                $.getJSON('https://api.mcsrvstat.us/2/34.95.23.246', function (status) {
                    bot.sendMessage({
                        to: channelID,
                        message: status.version
                    });
                });
                break;
            default:
                bot.sendMessage({
                    to: channelID,
                    message: 'Unknown command'
                });
         }
     }
});