#!/bin/sh
export L=10
#remove snapshots that do not have backuplog property
for snap in `zfs list -t snap -o name| grep ^tank/Backups/[a-z]*./[0-9]*.@zfs-auto-snap_backup-| head -n $L`; do
	echo "Checking Snapshot $snap" | style -C red -B black
	export FS=$(echo $snap | cut -d'@' -f1)
	export SNAP=$(echo $snap | cut -d'@' -f2)
	export backupLog=$(zfs get backuplog:${SNAP} $FS -pHo value)
	export backupLogValid=1
	if [ "$backupLog" == "-" ]; then 
		export backupLogValid=0
	else
		stat $backupLog >/dev/null 2>&1 || export backupLogValid=0
	fi
	echo -n "     " && echo "FS=$FS Snapshot=$SNAP backupLog=$backupLog backupLogValid=$backupLogValid"
	if [ "$backupLogValid" == "0" ]; then
		echo -n "     " && echo "Removing Snapshot $snap" && \
			time zfs destroy $snap
	fi
done
