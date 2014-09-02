MAVG Website
================
This is the repo for MAVG's website. More here later.

Setup instructions
================
This is an ordinary Node.js app. [Download Node](http://nodejs.org/download/) if you haven't already, then run `npm install` in the repo directory to download the required packages. Run `node server.js` to start the server on port 80, or `node server.js --port [port]` to start the server on a different port.

The /forever/start.sh and /forever/stop.sh bash files will start and stop the server using Forever, respectively. Running `chmod +x` on both of them and using sudo to run the start script will probably be necessary.