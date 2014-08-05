## PBJ (Working Title) 

Right now there are 4 components to this app. Im working on bringing this down.

###Sniffer
Puts NIC into monitor mode with a PCAP filter of `type mgt or type data`.
The parsed data is stored to a log file called `packets.log`
To compile this youll need to download and install [libtins](https://github.com/mfontanini/libtins)

###CouchDB
The log file data from sniffer is stored in [CouchDB](http://couchdb.apache.org/).
Currently the parser writes to CouchDB and that is where the data is stored.

I'm going to simplify this in the future its a legacy thing. You won't need CouchDB because the nw app uses pouchdb which can write locally too. If you dont want to write to a remote or local server just comment out `sync()` and `db.info` from `pouch.js` and [pouchdb](http://pouchdb.com/) will keep the data local but the parser isnt setup to work like that right now.

### Node Webkit App

####Required
1. Node.js


#### Setup


2. Enter the `nw` directory and install the development modules: `npm
   install`
3. Install gulp.js globally: `npm install gulp -g`
4. From the root nw run gulp: `gulp`
5. Start up the app: `npm run app`

The public folder contains the `package.json` for the application window, as well as the base `index.html` file for the application.


###Parser
Currently need to run the `libtinsParser.py` script to get the data from the log file to the CouchDB