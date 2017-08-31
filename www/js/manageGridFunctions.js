var loadNodes = function(Nodes){
};
var loadBackupNodes = function(Nodes){
	var byteCols = ['size','allocated','free'];
	console.log('Loading ' + Nodes.length + ' Backup Nodes');
	_.each(Nodes, function(node, key){
		var Rec = {recid: key, name: node.name};
		_.each(w2ui.backupNodesGrid.columns.slice(1, w2ui.backupNodesGrid.columns.length), function(c){
			if(_.contains(_.keys(node.tankPool), c.field))
				Rec[c.field] = node.tankPool[c.field];
			if(_.contains(byteCols, c.field))
				Rec[c.field] = filesize(Rec[c.field]);
		});
		var tid = w2ui['backupNodesGrid'].find({'name': node.name});
		if(tid.length==0){
			w2ui.backupNodesGrid.add(Rec);
		}else if(tid.length==1){
			w2ui.backupNodesGrid.set(tid[0], Rec);
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
