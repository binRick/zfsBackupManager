#!/usr/bin/env node

var config = require('./config'),
cw = require('condense-whitespace'),
_ = require('underscore'),
    c = require('chalk'),
    pj = require('prettyjson'),
    child = require('child_process'),
    fs = require('fs'),
    p = require('commander');

p
    .version('0.1.0')
    .option('-n, --node [node]', 'Node')
    .option('-c, --ctid [ctid]', 'CTID')
    .option('-o, --output [output]', 'Output Type')
    .parse(process.argv);
var zfs = config.pool + '/Backups/' + p.node + '/' + p.ctid;

//var snapshots = child.execSync('zfs list -t snap -o name | grep "^' + zfs + '"').toString().split('\n').filter(function(s) {
var snapshots = child.execSync('zfs list -t snap -o name').toString().split('\n').filter(function(s) {
    return s && s.split('@').length == 2 && s.split('@')[0] == zfs;
}).map(function(s) {
    return s.split('@')[1];
}).map(function(s) {
    return {
        name: s,
        log: child.execSync('zfs get backuplog:' + s + ' ' + zfs + ' -pHo value').toString().split('\n')[0],
        seconds: child.execSync('zfs get backuptime:' + s + ' ' + zfs + ' -pHo value').toString().split('\n')[0],
    };
}).filter(function(s) {
    return fs.statSync(s.log);
}).map(function(s) {
    s.logData = fs.readFileSync(s.log).toString().split('\n').filter(function(l) {
        var lA = l.split(' ');
        return l && lA[0] != 'tput:' && lA[0] != 'Warning:';
    });
    return s;
}).map(function(s){
	_.each(s.logData, function(l){
		var lA = l.split(':');
		if(lA[0]=='Number of files')
			s.files=cw(l);
	});
	return s;
});
var Setup = {
    node: p.node,
    ctid: p.ctid,
    zfs: zfs,
    snapshots: snapshots,
};

if (p.output == 'json') {
    console.log(JSON.stringify(Setup));
}else{
    console.log(pj.render(Setup));
}
