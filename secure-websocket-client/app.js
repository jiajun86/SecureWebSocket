(function () {
    'use strict';

    var readline = require('readline');

    var io = require('socket.io-client');

    var server = 'https://www.domain.com/',
        socket = io(server, {
            transports: ['websocket']
        }),
        choices = ['r', 'p', 's'],
        results = {
            lose: ['rp', 'ps', 'sr'],
            tie: ['rr', 'pp', 'ss'],
            win: ['rs', 'pr', 'sp']
        };

    socket.on('connect', function () {
        printLog('Server connected');
        newGame();
    });

    //socket.on('error', printLog);
    socket.on('disconnect', function () {
        printLog('Server disconnected');
    });
    //socket.on('reconnect', printLog);
    //socket.on('reconnect_attempt', printLog);
    //socket.on('reconnecting', printLog);
    //socket.on('reconnect_error', printLog);
    //socket.on('reconnect_failed', printLog);
    socket.on('server', function (response) {
        getResult(response);
        startGame();
    });

    function newGame() {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Would you like to play rock–paper–scissors? (y/n) ', function (response) {
            response = response.toLowerCase();
            rl.close();

            if (response === 'y') {
                printLog('Your answer is yes.');
                startGame();
            } else if (response === 'n') {
                printLog('Your answer is no.');
                process.exit();
            } else {
                printLog('Your answer is unknown.');
                newGame();
            }
        });
    }

    function startGame() {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Rock, paper or scissors? (r/p/s/q to quit) ', function (response) {
            response = response.toLowerCase();
            rl.close();

            if (choices.indexOf(response) > -1) {
                printClientChoice(response);
                socket.emit('client', response);
            } else if (response === 'q') {
                process.exit();
            } else {
                printLog('Invalid choice. Please try again.');
                startGame();
            }
        });
    }

    function getChoiceName(choice) {
        if (choice === 'r') {
            return 'rock';
        } else if (choice === 'p') {
            return 'paper';
        } else if (choice === 's') {
            return 'scissors';
        } else {
            return 'unknown';
        }
    }

    function getResult(response) {
        var clientChoice = response.client,
            serverChoice = response.server,
            result = clientChoice + serverChoice;

        if (results.lose.indexOf(result) > -1) {
            printServerChoice(serverChoice);
            printLog('Sorry, you lose.');
        } else if (results.tie.indexOf(result) > -1) {
            printServerChoice(serverChoice);
            printLog('It\'s a tie.');
        } else if (results.win.indexOf(result) > -1) {
            printServerChoice(serverChoice);
            printLog('Congratulations, you win.');
        } else {
            printLog('Unable to determine winner due to unexpected error.')
        }
    }

    function printClientChoice(choice) {
        printChoice('You', choice);
    }

    function printServerChoice(choice) {
        printChoice('Server', choice);
    }

    function printChoice(player, choice) {
        printLog(player, 'chose', getChoiceName(choice))
    }

    function printLog() {
        var date = new Date(),
            args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));

        args.unshift(date.toJSON() + ' >');
        console.log.apply(this, args);
    }
})();