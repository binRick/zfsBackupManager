var spawn = require('child_process').spawn,
    c = require('chalk'),
    _ = require('underscore'),
    config = require('./config'),
    CronJob = require('cron').CronJob,
    ZFS = require('./node-zfs'),
    fs = require('fs'),
    pb = require('pretty-bytes'),
    NRP = require('node-redis-pubsub'),
    nrp = new NRP(),
    async = require('async');




nrp.on('Nodes', function(myNodes) {
    console.log('got nodes', myNodes.length);
    async.mapSeries(myNodes, function(Node, _cb) {

    }, function(errs, results) {

    });
});

var zfsList = function() {
    var listSpawn = spawn('zfs', ['list', '-pHoname']);
    var o = '';
    listSpawn.on('exit', function(code) {
        if (code != 0) throw code;
        var lines = o.split('\n').filter(function(l) {
            return l;
        });
        var nodes = lines.filter(config.zfsListFilters.nodes).map(config.zfsListMaps.nodes);
        nrp.emit('Nodes', nodes);
        nrp.emit('Filesystems', lines);
    }).stdout.on('data', function(s) {
        o += s.toString();
    });
    listSpawn.stderr.on('data', function(s) {
        throw s;
    });
};
var zfsListSnapshots = function(){
    var listSpawn = spawn('zfs', ['list', '-pHoname','-tsnap']);
    var o = '';
    listSpawn.on('exit', function(code) {
        if (code != 0) throw code;
        var lines = o.split('\n').filter(function(l) {
            return l;
        });
        nrp.emit('Snapshots', lines);
    }).stdout.on('data', function(s) {
        o += s.toString();
    });
    listSpawn.stderr.on('data', function(s) {
        throw s;
    });
};

var zfsListSnapshotsJob = new CronJob({
    cronTime: '0 */15 * * * *',
    onTick: zfsListSnapshots,
    start: true,
    runOnInit: true,
});
var zfsListJob = new CronJob({
    cronTime: '0 */1 * * * *',
    onTick: zfsList,
    start: true,
    runOnInit: true,
});
