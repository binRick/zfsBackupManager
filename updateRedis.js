var spawn = require('child_process').spawn,
    c = require('chalk'),
    _ = require('underscore'),
    config = require('./config'),
    CronJob = require('cron').CronJob,
    ZFS = require('./node-zfs'),
    fs = require('fs'),
    pb = require('pretty-bytes'),
    redis = require('redis'),
    client = redis.createClient(),
    NRP = require('node-redis-pubsub'),
    nrp = new NRP();



client.on("error", function(err) {
    console.log("Redis Error: " + err);
});


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

var updateRedis = function() {
    zfsList(function(Nodes) {
        nrp.emit('Nodes', Nodes);
    });
};

var zfsListJob = new CronJob({
    cronTime: '0 */1 * * * *',
    onTick: updateRedis,
    start: true,
    runOnInit: true,
});
