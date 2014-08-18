var utils = require('./utils');
var $ = require('jQuery');
var _ = require('underscore');
var PouchDB = require('PouchDB');
var spawn = nodeRequire('child_process').spawn;
var execFile = nodeRequire('child_process').execFile;
var path = nodeRequire('path');
var fs = nodeRequire('fs');
var sudo = nodeRequire('sudo');


function createDesignDoc(name, mapFunction) {
	var ddoc = {
		_id: '_design/' + name,
		views: {
		}
	};
	ddoc.views[name] = { map: mapFunction.toString() };
	return ddoc;
}

module.exports = function sysInterface(){

	var minUpdateInterval = 5;
	var out = fs.openSync("./sniffer/packets.log", 'a');
	var err = fs.openSync("./sniffer/err.log", 'a');
	var child = execFile( './sniffer/tinsSniffer' );
	child.stdout.on('data', function (data) { fs.writeSync(out, data.toString());	});
	child.stderr.on('data', function (data) { fs.writeSync(err, data.toString());	});
	//TODO: Check that the closeSync is being called correctly
	child.on('close', function (code) {fs.closeSync(out);console.log('sniffer process exited with code ' + code);});

	var tail  = spawn('tail', ['-f','./sniffer/packets.log']);
	tail.stdout.on('data', function (data) {parser.parseLine(data);});
	tail.stderr.on('data', function (data) {console.log('tail stderr: ' + data);});
	tail.on('close', function (code) {if (code !== 0) {console.log('tail process exited with code ' + code);}});

	var nodeIDs = [];
	var nodeTimeMap = [];
	var t = {
		timestamp:0,
		radio:1,
		signalStrength:2,
		frequency:3,
		channelType:4,
		packetType:5,
		beaconBssid:6,
		beaconEssid:7,
		beaconChannel:8,
		probeBssid : 6,
		probeProbedEssid : 7,
		dataClientBssid: 6,
		dataAPBssid : 7
	};

	sync = function() {
		var opts = {live: true};
		console.log('syncing');
		db.replicate.to(utils.config.remoteServer, opts, function(err){if(err){console.log(err);}});
		db.replicate.from(	utils.config.remoteServer, opts, function(err){if(err){console.log(err);}});
	};

	var db;
	function pouch(){
		db = new PouchDB(	utils.config.dbName,	utils.config.remoteServer);
		db.info(function(err, info) {
			if(info){ console.log(info);  }
			if(err){ console.error(err); }
		});

		sync();
		pouch.initDDocs();
		db.allDocs( {include_docs: true},function(err, doc) {
			if(err){console.log(err);}
				for(var i=0; i<doc.rows.length;i++){

					if(doc.rows[i].id.length === 17 ||doc.rows[i].id ==="_design/by_timestamp" ){

					}
					else{
						console.log("FUNKY VALUE");
						console.log(doc.rows[i]);
						// db.remove(doc.rows[i]._id, doc.rows[i]._rev, function(err, response) {console.log(err);console.log(response); });
					}
					nodeIDs.push(doc.rows[i].id);
					var obj = {
						id:doc.rows[i].id,
						timestamp:doc.rows[i].doc.timestamp
					};
					nodeTimeMap.push(obj);
				}
				console.log("All complete!");
		});
	}

	pouch.initDDocs = function(){
		var ddoc = createDesignDoc('by_timestamp', function (doc) {
			emit(doc.timestamp, doc.bssid);
		});

		db.put(ddoc)
		.then(function(){
			// kick off an initial build, return immediately
			console.log("Original timestamp added");
			return db.query('by_timestamp', {stale: 'update_after'});
		})
		.catch(function (err) {
			if (err.name === 'conflict'){
					console.log("Design document already exists");
			}
		});
	};

	pouch.getPostsSince = function(when) {
		// console.log("END KEY : "+ when);
		return db.query('by_timestamp', {endkey: String(when), descending: true,include_docs: true});
	};
	pouch.getPostsBefore = function(when) {
		return db.query('by_timestamp', {startkey: when,include_docs: true});
	};
	pouch.getPostsBetween = function(startTime, endTime) {
		// console.log(" START KEY : "+ startTime + " END KEY : "+ endTime + " delta: " +(endTime - startTime));
		return db.query('by_timestamp', {startkey: String(startTime), endkey: String(endTime),
			reduce: false,descending: false,include_docs: true});
	};

	var parser ={};

	parser.parseLine = function(lines){
			var l = $.trim(lines);

			var p =l.split("\n");

			for(var i =0; i<p.length; i++){

				var data = p[i].split(",");
			 	if(data.length <6 ){
					return;
			 	}

				if(data[t.packetType] === "Beacn"){
					if(_.contains( nodeIDs,data[t.beaconBssid])){
						var rIdx = _.indexOf(nodeIDs, data[t.beaconBssid]) ;
						var diff = ( Date.now()/1000 - nodeTimeMap[rIdx] );
						if(diff >minUpdateInterval ){
							updateRouter(data);
							console.log("Last updated beacon " + diff  +"secs ago");
						}
						nodeTimeMap[rIdx] = data[t.timestamp];

					}
					else{
						nodeIDs.push($.trim(data[t.beaconBssid]));
						addRouter(data);
					}
				}
				else if(data[t.packetType] === "Probe"){
					if(_.contains( nodeIDs,data[t.probeBssid])){
						var pIdx = _.indexOf(nodeIDs, data[t.probeBssid]) ;
						var pdiff = ( Date.now()/1000 - nodeTimeMap[pIdx] );

						if(pdiff >minUpdateInterval ){
							updateClientProbe(data);
							console.log("Last updated probe: " + pdiff + "secs ago");
						}
						nodeTimeMap[pIdx] = data[t.timestamp];

					}
					else{
						nodeIDs.push($.trim(data[t.probeBssid]));
							addClientProbe(data);
					}
				}
				else{
					if(_.contains( nodeIDs,data[t.dataClientBssid])){
						var dIdx = _.indexOf(nodeIDs, data[t.probeBssid]) ;
						var ddiff = ( Date.now()/1000 - nodeTimeMap[dIdx] );
						if(ddiff >minUpdateInterval ){
							updateClientData(data);
							console.log("Last updated data: " + ddiff + "secs ago");
						}
						nodeTimeMap[dIdx] = data[t.timestamp];

					}
					else{
						nodeIDs.push($.trim(data[t.dataClientBssid]));
							addClientData(data);
					}
				}
			}

	};

	addRouter = function(p){
		var router ={
			kind :"Router",
			bssid :p[t.beaconBssid],
			essid :p[t.beaconEssid],
			created_at :Date.now(),
			power :p[t.signalStrength],
			timestamp :p[t.timestamp]
		};
		// console.log(router);
		console.log('adding router : '+ router.bssid);
		db.put(router, router.bssid, function(err, response) { if(err){console.log(err); if(response){console.log(response);}}});
	};

	addClientProbe = function(p){
		var client ={
			kind :"Client",
			bssid :p[t.probeBssid],
			essid :"NA",
			ap_essid :"",
			created_at :Date.now(),
			power :p[t.signalStrength],
			timestamp :p[t.timestamp],
			probes :[ p[t.probeProbedEssid] ]
		};
		// console.log(client);
		console.log('adding client probe : '+ client.bssid);
		db.put(client, client.bssid, function(err, response) { if(err){console.log(err); if(response){console.log(response);}}});

	};

	addClientData = function(p){
		var client ={
			kind :"Client",
			bssid :p[t.dataClientBssid],
			essid :"NA",
			ap_essid :p[t.dataAPBssid],
			created_at :Date.now(),
			power :p[t.signalStrength],
			timestamp :p[t.timestamp],
			probes :[]
		};
		// console.log(client);
		console.log('adding client data : '+ client.bssid);
		db.put(client, client.bssid, function(err, response) { if(err){console.log(err); if(response){console.log(response);}}});
	};

	updateRouter = function(p){
		var updatedRouter ={
			kind :"Router",
			bssid :p[t.beaconBssid],
			essid :p[t.beaconEssid],
			power :p[t.signalStrength],
			timestamp :p[t.timestamp]
		};
		// console.log('update Router : '+ router.bssid);
		db.get(updatedRouter.bssid).then(function(r) {
			return db.put({
				_id: r.bssid,
				_rev: r._rev,
				kind:"Router",
				bssid :r.bssid,
				essid :updatedRouters.essid,
				created_at :r.created_at,
				power: updatedRouter.power,
				timestamp: updatedRouter.timestamp,
			});
		},function(err, response) {
				if (err) {
					// on error
					console.log(err);
				} else {
					console.log(response);
					// on success
				}
			}
		);
	};

	updateClientProbe = function(p){
		var updatedClient ={
			kind :"Client",
			bssid :p[t.probeBssid],
			essid :"NA",
			ap_essid :"",
			power :p[t.signalStrength],
			timestamp :p[t.timestamp],
			probes :p[t.probeProbedEssid]
		};
		// console.log(updatedClient);
		db.get(updatedClient.bssid).then(function(c) {

			c.probes.push(updatedClient.probes);
			c.probes = _.uniq(c.probes);

			return db.put({
				_id: c.bssid,
				_rev: c._rev,
				kind:"Client",
				bssid :updatedClient.bssid,
				power: updatedClient.power,
				ap_essid: updatedClient.ap_essid,
				created_at: c.created_at,
				timestamp: updatedClient.timestamp,
				probes: c.probes
			});
		},function(err, response) {
				if (err) {console.log(err);}
				else { console.log(response);}
			}
		);

	};

	updateClientData = function(p){
		var updatedClient ={
			kind :"Client",
			bssid :p[t.dataClientBssid],
			essid :"NA",
			ap_essid :p[t.dataAPBssid],
			power :p[t.signalStrength],
			timestamp :p[t.timestamp],
		};

		// console.log(updatedClient);
		db.get(updatedClient.bssid).then(function(c) {

			return db.put({
				_id: c.bssid,
				_rev: c._rev,
				kind:"Client",
				bssid :updatedClient.bssid,
				power: updatedClient.power,
				ap_essid: updatedClient.ap_essid,
				created_at: c.created_at,
				timestamp: updatedClient.timestamp,
				probes: c.probes
			});
		},function(err, response) {
				if (err) {console.log(err);}
				else { console.log(response);}
			}
		);

	};

	return{
		parser: parser,
		pouch:pouch
	};
};

// var sniffer  = execFile('../public/sniffer/tinsSniffer');//,  function (error, stdout, stderr) {
	// console.log('stdout: ' + stdout);
	// console.log('stderr: ' + stderr);
	// if (error !== null) {
	//   console.log('exec error: ' + error);
	// }});
// sniffer.stdout.on('data', function (data) {console.log(data);});
// sniffer.stderr.on('data', function (data) {console.log('sniffer stderr: ' + data);});
// sniffer.on('close', function (code) {console.log('sniffer process exited with code ' + code);});
