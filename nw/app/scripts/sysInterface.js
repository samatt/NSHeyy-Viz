var $ = require('jQuery');
var _ = require('underscore');
var spawn = nodeRequire('child_process').spawn;


module.exports = function sysInterface(){
	var tail  = spawn('tail', ['-f','/Users/surya/Code/TBD/common/sniffer/Release/packets.log']);
	// var tail  = spawn('pwd');
	// var grep;
	var nodeRevMap = {};
	var nodeIDs = [];
	var pouch;
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

	function parser(_pouch){
		pouch = _pouch;
		// console.log(tail);
	}

	tail.stdout.on('data', function (data) {
	  // grep.stdin.write(data);
		// console.log('stdout : '+  data );
		parser.parseLine(data);
	});

	tail.stderr.on('data', function (data) {
	  console.log('tail stderr: ' + data);
	});

	tail.on('close', function (code) {
	  if (code !== 0) {
	    console.log('tail process exited with code ' + code);
	  }
	});

	parser.parseLine = function(lines){
			var l = $.trim(lines);
			var p =l.split("\n");
			// var lines = [];

			for(var i =0; i<p.length; i++){
				var data = p[i].split(",");
				if(data.length <6 ){
					console.error("Bogus values in data");
					return;
				}
				// console.log(data[t.packetType]);
				// console.log(data[t.signalStrength]);
				// console.log(data[t.frequency]);
				// console.log(data[t.channelType]);
				// console.log(data[t.packetType]);

				if(data[t.packetType] === "Beacn"){
					if(_.contains( nodeIDs,data[t.beaconBssid])){
							var rIdx = _.indexOf(nodeIDs, data[t.beaconBssid]) ;

							console.log("Router exists at "+ rIdx);
						// udpateRouter(p);
					}
					else{
						nodeIDs.push($.trim(data[t.beaconBssid]));
							// addRouter(p);
					}
				}
				else if(data[t.packetType] === "Probe"){
					if(_.contains( nodeIDs,data[t.probeBssid])){
							var pIdx = _.indexOf(nodeIDs, data[t.probeBssid]) ;

							console.log("Probe exists at "+ pIdx);
						// updateClientProbe(data);
					}
					else{
						nodeIDs.push($.trim(data[t.probeBssid]));
							// addClientProbe(line);
					}
				}
				else{
					if(_.contains( nodeIDs,data[t.dataClientBssid])){
							var pIdx = _.indexOf(nodeIDs, data[t.probeBssid]) ;

							console.log("Probe exists at "+ pIdx);
						// updateClientProbe(data);
					}
					else{
						nodeIDs.push($.trim(data[t.dataClientBssid]));
							// addClientProbe(line);
					}
				}
			}

	};

	parser.addRouter = function(p){
		var router ={
			kind :"Router",
			bssid :p[t.beaconBssid],
			essid :p[t.beaconEssid],
			created_at :Date.now(),
			power :p[t.signalStrength],
			timestamp :p[t.timestamp]
		};
		pouch.addNode(node);
	};

	parser.addClientProbe = function(p){
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

		pouch.addNode(client);
	};

	parser.addClientData = function(p){
		var client ={
			kind :"Client",
			bssid :p[t.dataClientBssid],
			essid :"NA",
			ap_essid :p[t.dataAPBssid],
			created_at :Date.now(),
			power :p[t.signalStrength],
			timestamp :p[t.timestamp],
			probes :[],
		};
		pouch.addNode(client);
	};

	parser.updateRouter = function(p){

	};

	parser.updateClientProbe = function(p){

	};

	parser.updateClientData = function(p){

	};

	return{
		parser: parser,
		tail: tail
	};
};
