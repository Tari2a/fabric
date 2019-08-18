docker kill $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images | awk '($1 ~ /dev-peer.*.fabcar.*/) {print $1}')
rm javascript/wallet -r