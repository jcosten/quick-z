#!/bin/bash

#sudo iptables -t nat -A PREROUTING -i eth0 -p tcp -dport 80 -j REDIRECT --to-port 3000
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
ScriptPath = DIR +'/zwaver'; 
echo "copying daemon"
cp ScriptPath /etc/init.d/
chmod +x /etc/init.d/zwaver
update-rc.d zwaver defaults