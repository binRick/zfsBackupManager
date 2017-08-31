var loadNodes = function(Nodes){
};
var loadBackupNodes = function(Nodes){
	console.log('Loading ' + Nodes.length + ' Backup Nodes');
	_.each(Nodes, function(node, key){
console.log(node);
		var tid = w2ui['backupNodesGrid'].find({'name': node.name});
		if(tid.length==0){
			w2ui.backupNodesGrid.add({recid: key, name: node.name});
		}
		
	});
};
var loadFilesystems = function(Filesystems){
        console.log('Loading ' + Filesystems.Filesystems.length + ' Filesystems on Backup Node ' + Filesystems.Node);
};
var loadSnapshots = function(Snapshots){
        console.log('Loading ' + Snapshots.Snapshots.length + ' Snapshots on Backup Node ' + Snapshots.Node);
};

$(function() {

	/*
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
                w2ui.grid1.set(key, serverProperties);
            });
        });
    });*/
});
