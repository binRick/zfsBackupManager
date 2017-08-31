module.exports = {
    backupNodes: ['beo','gordo','iraq'],
    pool: 'tank',
    webserver: {
        port: 1488,
        host: '0.0.0.0',
    },
    zfsListMaps: {
        nodes: function(l) {
            var ls = l.split('/');
            return ls[2];
        },
    },
    zfsListFilters: {
        nodes: function(l) {
            var ls = l.split('/');
            return ls.length == 3 && ls[0] == 'tank' && ls[1] == 'Backups';
        },
    },
};
