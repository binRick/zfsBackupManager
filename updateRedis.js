var spawn = require('child_process').spawn,
    condenseWhitespace = require('condense-whitespace'),
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

if (config.nodeStat) {
    console.log(c.yellow('Starting nodestat collectors on Backup Nodes...'));
    async.each(config.backupNodes, function(node, _cb) {
        console.log(c.yellow('\t' + node + ' starting..'));
        if (os.hostname() == node) {
            var s1 = 'nodestat';
            var s2 = ['-f', 'json', '-i', config.nodeStatInterval];
        } else {
            var s1 = 'ssh';
            var s2 = [node, 'nodestat', '-f', 'json', '-i', config.nodeStatInterval];
        }
        var nsProcess = spawn(s1, s2);
        nsProcess.stdout.on('data', function(dat) {
            var nsJ = JSON.parse(dat.toString());
            nsJ.Node = node;
            nrp.emit('nodeStat', nsJ);
        });
        nsProcess.stderr.on('data', function(dat) {

        });
        nsProcess.on('exit', function(code) {
            throw 'nodestat process on node ' + node + ' exited with code ' + code;
        });

    }, function(err) {
        if (err) throw err;
    });

};

nrp.on('clientConnected', function() {
    zfsList();
    zfsListSnapshots();
    backupNodes();
});

var backupNodes = function() {
    async.map(config.backupNodes, function(node, _cb) {
        var cmd = ['zpool', 'get', 'all', 'tank', '-p'];
        var N = {
            name: node,
        };
        if (os.hostname() != node) {
            cmd.unshift(node);
            cmd.unshift('ssh');
        }
        var zpoolSpawn = spawn(cmd[0], cmd.slice(1, cmd.length));
        var o = '';
        zpoolSpawn.on('exit', function(code) {
            if (code != 0) throw code;
            o = o.split('\n').map(function(l) {
                return condenseWhitespace(l);
            }).filter(function(l) {
                return l && l.split(' ')[0] == 'tank';
            }).map(function(l) {
                return l.split(' ').slice(1, 3).join(' ');
            }).map(function(l) {
                return {
                    property: l.split(' ')[0],
                    value: l.split(' ')[1],
                };
            });
            N.tankPool = {};
            _.each(o, function(O) {
                N.tankPool[O.property] = O.value;
            });
            _cb(null, N);
        }).stdout.on('data', function(s) {
            o += s.toString();
        });
        zpoolSpawn.stderr.on('data', function(s) {});
    }, function(errs, buNodes) {
        nrp.emit('BackupNodes', buNodes);
    });
};
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
        console.log(c.green('Completed querying Filesystems...'));
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
var backupNodesJob = new CronJob({
    cronTime: '0 */5 * * * *',
    onTick: backupNodes,
    start: true,
    runOnInit: true,
});
