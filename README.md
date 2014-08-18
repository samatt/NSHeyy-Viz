# PBJ (Working Title) 

Right now there are 3 components to this app.

##Sniffer
Puts NIC into monitor mode with a PCAP filter of `type mgt or type data`.
The parsed data is stored to a log file called `packets.log`
To compile this youll need to download and install [libtins](https://github.com/mfontanini/libtins)
The repo comes with the binary so if you have libtins installed it should 'just work'.

###Setup
Everything is now called from the NW app. You will need to first install libtins. Im working on simplifying this process.
At the moment the c++ sniffer is looking for the libtins dylib in `/usr/local/lib` on macs which is where it is installed by default.



<!--If you look in build/Releases you will find the Hello World app that sniffs on your WiFi card. Dont move it from there the paths are currently hard coded.-->

##CouchDB
The log file data from sniffer is stored in PouchDB. PouchDB is a JS implementation of  [CouchDB](http://couchdb.apache.org/) and allows you to use whatever the available underlying DB is (IndexedDB, webSQL etc). You can see the instructions of how to install on their site.

In the current set up it is not required to install couchdb. You can avoid using it by removing all calls to the config.remoteServer variable.Its  helpful to use couchs futon app to see the raw data coming in from the sniffer and you can use the Temporary view in futon to run some MapReduce queries on it.
<!--Currently the parser writes to CouchDB and that is where the data is stored. Its  helpful to use couchs futon app to see the raw data coming in from the sniffer and you can use the Temporary view in futon to run some MapReduce queries on it.-->

<!--I'm going to simplify this in the future its a legacy thing. You won't need CouchDB because the nw app uses pouchdb which can write locally too. If you dont want to write to a remote or local server just comment out `sync()` and `db.info` from `pouch.js` and [pouchdb](http://pouchdb.com/) will keep the data local but the parser isnt setup to work like that right now.-->

## Node Webkit App

###Required
1. Node.js


### Setup


2. Enter the `nw` directory and install the development modules: `npm
   install`
3. Install gulp.js globally: `npm install gulp -g`
4. From nw run gulp: `gulp`
5. Start up the app: `npm run app`

The public folder contains the `package.json` for the application window, as well as the base `index.html` file for the application.


<!--##Parser-->
<!--Parses data from sniffer to nw. Im working to get this out.-->
<!--###Setup-->
<!--Currently need to run the `libtinsParser.py` script to get the data from the log file to the CouchDB. You can change the db name in this script. But then you will also have to change it in app under `utils.config`-->
