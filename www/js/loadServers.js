$(function() {
    $.get('/api/nodes', function(serverNames) {
        var servers = [];
        _.each(serverNames, function(serverName, key) {
            servers.push({
                recid: key,
                serverName: serverName
            });
        });
        w2ui.grid1.add(servers);
        _.each(serverNames, function(serverName, key) {
            $.get('/api/node/' + serverName, function(serverProperties) {
                serverProperties.serverName = serverName;
                //console.log(serverProperties);
                w2ui.grid1.set(key, serverProperties);
            });
        });
    });
});
