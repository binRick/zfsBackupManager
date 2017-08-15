#!/usr/bin/env node

var app = require('express')(),
    c = require('chalk'),
    _ = require('underscore'),
    config = require('./config'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    spawn = require('child_process').spawn;

app.get('/', function(req, res) {
    res.send('hello');
});

server.listen(config.webserver.port, config.webserver.host, function() {
    console.log('Webserver listening on port', config.webserver.port);
});
