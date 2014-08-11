var utils = require('./utils');
var $ = require('jQuery');
var _ = require('underscore');
var PouchDB = require('PouchDB');
var spawn = nodeRequire('child_process').spawn;

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
	//TODO: replace hardcoded logFile with dynamic file
	var tail  = spawn('tail', ['-f','/Users/surya/Code/TBD/common/sniffer/Release/packets.log']);
	tail.stdout.on('data', function (data) {parser.parseLine(data);});
	tail.stderr.on('data', function (data) {console.log('tail stderr: ' + data);});
	tail.on('close', function (code) {if (code !== 0) {console.log('tail process exited with code ' + code);}});

	var nodeRevMap = {};
	var nodeIDs = [];
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
		db.replicate.to('http://127.0.0.1:5984/pouchtest', opts, function(err){console.log(err);});
		db.replicate.from('http://127.0.0.1:5984/pouchtest', opts, function(err){console.log(err);});
	};

	function getPostsBefore(when) {
		return db.query('by_timestamp', {startkey: when,include_docs: true});
	}
	function getPostsBetween(startTime, endTime) {
		return db.query('by_timestamp', {startkey: startTime, endkey: endTime,include_docs: true});
	}

	var db;
	var pouch = {};
	pouch.init = function(onComplete){
		db = new PouchDB("pouchtest",'http://127.0.0.1:5984/pouchtest');
		db.info(function(err, info) {
			if(info){ console.log(info);  }
			if(err){ console.error(err); }
		});

		sync();
		pouch.initDDocs();
		db.allDocs( function(err, doc) {
			if(err){console.log(err);}
				for(var i=0; i<doc.rows.length;i++){ nodeIDs.push(doc.rows[i].id); }
				console.log("All complete!");
		});
	};

	pouch.initDDocs = function(){
		var ddoc = createDesignDoc('by_timestamp', function (doc) {
			emit(doc.timestamp, doc._id);
		});

		db.put(ddoc)
		.then(function(){
			// kick off an initial build, return immediately
			console.log("Query added");
			return db.query('by_timestamp', {stale: 'update_after'});
		})
		.catch(function (err) {
			if (err.name === 'conflict'){
					console.log("Design document already exists");
			}
		});
	};

	pouch.getPostsSince = function(when) {
		return db.query('by_timestamp', {endkey: when, descending: true,include_docs: true});
	};
	pouch.getPostsBefore = function(when) {
		return db.query('by_timestamp', {startkey: when,include_docs: true});
	};
	pouch.getPostsBetween = function(startTime, endTime) {
		return db.query('by_timestamp', {startkey: startTime, endkey: endTime,include_docs: true});
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
						// console.log("Router exists at "+ rIdx);
						updateRouter(data);
					}
					else{
						nodeIDs.push($.trim(data[t.beaconBssid]));
						addRouter(data);
					}
				}
				else if(data[t.packetType] === "Probe"){
					if(_.contains( nodeIDs,data[t.probeBssid])){
							var pIdx = _.indexOf(nodeIDs, data[t.probeBssid]) ;
							// console.log("Probe exists at "+ pIdx);
						updateClientProbe(data);
					}
					else{
						nodeIDs.push($.trim(data[t.probeBssid]));
							addClientProbe(data);
					}
				}
				else{
					if(_.contains( nodeIDs,data[t.dataClientBssid])){
							var dIdx = _.indexOf(nodeIDs, data[t.probeBssid]) ;

							// console.log("Probe exists at "+ dIdx);
						updateClientData(data);
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
		console.log('adding client : '+ client.bssid);
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
		db.put(client, client.bssid, function(err, response) { if(err){console.log(err); if(response){console.log(response);}}});
	};

	updateRouter = function(p){
		var updatedRouter ={
			kind :"Router",
			bssid :p[t.beaconBssid],
			essid :p[t.beaconEssid],
			// created_at :Date.now(),
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
				essid :r.essid,
				created_at :r.created_at,
				power: r.power,
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
			bssid :p[t.dataClientBssid],
			essid :"NA",
			ap_essid :p[t.dataAPBssid],
			power :p[t.signalStrength],
			timestamp :p[t.timestamp],
			probes :p[t.probeProbedEssid]
		};

		db.get(updatedClient.bssid).then(function(c) {
			console.log(c.probes);
			// console.log(updatedClient.probes);
			c.probes.push(updatedClient.probes);
			c.probes = _.uniq(c.probes);
			console.log(c.probes);

			return db.put({
				_id: client.bssid,
				_rev: c._rev,
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

	};


	return{
		parser: parser,
		pouch:pouch,
		tail: tail
	};
};
