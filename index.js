#!/usr/bin/env node

var config = require('./config'),
    c = require('chalk'),
    pj = require('prettyjson'),
    child = require('child_process'),
    fs = require('fs'),
    program = require('commander');


program
    .version('0.1.0')
    .option('-n, --node [node]', 'Node')
    .option('-c, --ctid [ctid]', 'CTID')
    .parse(process.argv);


console.log('  - %s node', program.node);
console.log('  - %s ctid', program.ctid);
