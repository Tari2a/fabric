docker kill $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker ps -a | awk '($2 ~ /dev-peer.*.fabcar.*/) {print $1}')
rm javascript/wallet -r