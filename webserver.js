#!/usr/bin/env node

var app = require('express')(),
    ZFS = require('./node-zfs'),
    c = require('chalk'),
    _ = require('underscore'),
    config = require('./config'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    spawn = require('child_process').spawn;

var zfsList = function(_cb) {
    var listSpawn = spawn('zfs', ['list', '-pHoname']);
    var o = '';
    listSpawn.on('exit', function(code) {
        if (code != 0) throw code;
        var lines = o.split('\n').filter(function(l) {
            return l;
        }).filter(config.zfsListFilters.nodes).map(config.zfsListMaps.nodes);
        _cb(lines);
    }).stdout.on('data', function(s) {
        o += s.toString();
    });
    listSpawn.stderr.on('data', function(s) {
        throw s;
    });
};

app.get('/', function(req, res) {
    res.send('hello');
});
app.get('/api/nodes', function(req, res) {
    zfsList(function(list) {
        res.json(list);
    });
});
app.get('/api/node/:node', function(req, res) {
var fs = 'tank/Backups/'+req.params.node;
    ZFS.zfs.get(fs, ['used','logicalused'], true, function(err, properties) {
	if(err)throw err;
	res.json(properties[fs]);
    });
});

server.listen(config.webserver.port, config.webserver.host, function() {
    console.log('Webserver listening on port', config.webserver.port);
});
