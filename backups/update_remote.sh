#!/usr/bin/env bash

# For the GunBase project this script creates a JSON duplicate of the local
# Mongo DB collection being used and updates the remote MLab DB collection so it
# is in sync with the local database.

local_host='localhost:8080'
local_file='db_test_backup.json'
remote_host='ds133162.mlab.com'
remote_port=33162
db='firearms'
collection='guns'

user='deepbsd'
pass='2D33p4m3!'

# export from localdatabase first
mongoexport --db $db --collection $collection -o $local_file

# import into mlab database
mongoimport -h $remote_host:$remote_port -d $db -c $collection -u $user -p $pass --drop --file $local_file


