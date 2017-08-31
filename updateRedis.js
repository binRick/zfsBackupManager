var spawn = require('child_process').spawn,
    c = require('chalk'),
    os = require('os'),
    _ = require('underscore'),
    config = require('./config'),
    CronJob = require('cron').CronJob,
    ZFS = require('./node-zfs'),
    fs = require('fs'),
    pb = require('pretty-bytes'),
    NRP = require('node-redis-pubsub'),
    nrp = new NRP(),
    async = require('async');



nrp.on('webserverStarted', function() {
});

var zfsList = function() {
    async.mapSeries(config.backupNodes, function(node, _cb) {
        if (os.hostname() == node) {
            var s1 = 'zfs';
            var s2 = ['list', '-pHoname'];
        } else {
            var s1 = 'ssh';
            var s2 = [node, 'zfs', 'list', '-pHoname'];
        }
        var listSpawn = spawn(s1, s2);
        var o = '';
        listSpawn.on('exit', function(code) {
            if (code != 0) throw code;
            var lines = o.split('\n').filter(function(l) {
                return l;
            });
            var Filesystems = lines;
            var Nodes = lines.filter(config.zfsListFilters.nodes).map(config.zfsListMaps.nodes);
            var S = {
                Node: node,
                Nodes: Nodes,
                Filesystems: Filesystems,
            };
            nrp.emit('Filesystems', S);
            _cb(null, S);
        }).stdout.on('data', function(s) {
            o += s.toString();
        });
        listSpawn.stderr.on('data', function(s) {});
    }, function(errs, results) {
        if (errs) throw errs;
        console.log(c.green('Completed querying Snapshots...'));
    });
};
var zfsListSnapshots = function() {
    async.mapSeries(config.backupNodes, function(node, _cb) {
        if (os.hostname() == node) {
            var s1 = 'zfs';
            var s2 = ['list', '-pHoname', '-tsnap'];
        } else {
            var s1 = 'ssh';
            var s2 = [node, 'zfs', 'list', '-pHoname', '-tsnap'];
        }
        var listSpawn = spawn(s1, s2);
        var o = '';
        listSpawn.on('exit', function(code) {
            if (code != 0) throw code;
            var Snapshots = o.split('\n').filter(function(l) {
                return l;
            });
            var S = {
                Node: node,
                Snapshots: Snapshots,
            };
            nrp.emit('Snapshots', S);
            _cb(null, S);
        }).stdout.on('data', function(s) {
            o += s.toString();
        });
        listSpawn.stderr.on('data', function(s) {});
    }, function(errs, results) {
        if (errs) throw errs;
        console.log(c.green('Completed querying Snapshots...'));
    });
};

var zfsListJob = new CronJob({
    cronTime: '0 */5 * * * *',
    onTick: zfsList,
    start: true,
    runOnInit: true,
});
var zfsListSnapshotsJob = new CronJob({
    cronTime: '0 */15 * * * *',
    onTick: zfsListSnapshots,
    start: true,
    runOnInit: true,
});
