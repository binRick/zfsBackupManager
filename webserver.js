#!/usr/bin/env node

var fs = require('fs'),
    pb = require('pretty-bytes'),
    md5 = require('md5'),
    NodeCache = require("node-cache"),
    myCache = new NodeCache({
        stdTTL: 100,
        checkperiod: 120
    }),
    express = require('express'),
    ZFS = require('./node-zfs'),
    c = require('chalk'),
    _ = require('underscore'),
    config = require('./config'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    spawn = require('child_process').spawn,
    NRP = require('node-redis-pubsub'),
    nrp = new NRP();

    var Filesystems = [],
    Snapshots = [];

nrp.on('Filesystems', function(myFilesystems) {
    console.log('Received ' + myFilesystems.Filesystems.length + ' Filesystems on node ' + myFilesystems.Node + ' among ' + myFilesystems.Nodes.length + ' nodes.');
	io.emit('Filesystems',myFilesystems);
	io.emit('Nodes', {Node: myFilesystems.Node, Nodes: myFilesystems.Nodes});
});
nrp.on('BackupNodes', function(BackupNodes) {
	io.emit('BackupNodes',BackupNodes);
});
nrp.on('nodeStat', function(nodeStat) {
	io.emit('nodeStat',nodeStat);
});
nrp.on('Snapshots', function(mySnapshots) {
    console.log('Received ' + mySnapshots.Snapshots.length + ' Snapshots on node ' + mySnapshots.Node);
	io.emit('Snapshots', mySnapshots);
});

io.on('connection', function(socket) {  
	nrp.emit('clientConnected',{});
    console.log('Client connected...');
    socket.on('join', function(data) {
        console.log(data);
    });
});



app.use(express.static('www'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/www/index.html');
});
app.get('/api/node/:node', function(req, res) {
    var properties = ['used', 'logicalused'];
    var pretties = ['used', 'logicalused'];
    var key = md5(JSON.stringify({
        node: req.params.node,
        properties: properties,
    }));
    myCache.get(key, function(err, value) {
        if (err) throw err;
        if (value == undefined) {
            var fs = 'tank/Backups/' + req.params.node;
            ZFS.zfs.get(fs, properties, true, function(err, properties) {
                if (err) throw err;
                var obj = properties[fs];
                _.each(pretties, function(pretty) {
                    obj[pretty + '_pb'] = pb(parseInt(obj[pretty]));
                });
                myCache.set(key, obj, function(err, success) {
                    if (err) throw err;
                    res.json(obj);
                });
            });
        } else {
            res.json(value);
        }
    });
});

server.listen(config.webserver.port, config.webserver.host, function() {
    console.log('Webserver listening on port', config.webserver.port);
	nrp.emit('webserverStarted',{});
});
