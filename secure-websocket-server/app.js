(function () {
    'use strict';

    var http = require('http'),
        https = require('https');

    var express = require('express'),
        io = require('socket.io'),
        letsencrypt = require('letsencrypt-express'),
        redirectHttps = require('redirect-https');

    var isSecureConnection = true,
        port = 80,
        securePort = 443,
        choices = ['r', 'p', 's'];

    if (isSecureConnection) {
        var lex = letsencrypt.create({
            debug: true,
            server: 'staging',
            // Only change to production server once you have done testing
            //server: 'https://acme-v01.api.letsencrypt.org/directory',
            email: 'email@email.com',
            agreeTos: true,
            approveDomains: ['www.domain.com']
        }),
            app = express(),
            server = https.createServer(lex.httpsOptions, lex.middleware(app)),
            socket = io(server);

        http.createServer(lex.middleware(redirectHttps())).listen(port, function () {
            printLog('Listening on', this.address(), 'and redirecting to secure connection');
        });

        server.listen(securePort, function () {
            printLog('Listening securely on', this.address());
        });
    } else {
        var app = express(),
            server = http.createServer(app),
            socket = io(server);

        server.listen(port, function () {
            printLog('Listening on', this.address());
        });
    }

    app.use('/', function (req, res) {
        res.end('Work in progress');
    });

    socket.on('connection', function (connection) {
        printLog('Client connected:', connection.id);

        connection.on('client', function (response) {
            var choice = choices[getRandomIntInclusive(0, 2)];

            printLog('client', connection.id, '->', response, ', server ->', choice);
            connection.emit('server', {
                client: response,
                server: choice
            });
        });
    });

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function printLog() {
        var date = new Date(),
            args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));

        args.unshift(date.toJSON() + ' >');
        console.log.apply(this, args);
    }
})();