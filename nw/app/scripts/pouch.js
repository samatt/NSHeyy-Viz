var PouchDB = require('PouchDB');
var utils = require('./utils');

module.exports = function(){

  var db;
	var remoteCouch;

	function pouch(){

		db = new PouchDB(utils.config.dbName);
		remoteCouch = utils.config.remoteServer;

		// console.log(utils.config.remoteServer);
		db.info(function(err, info) {
			// db.changes({
			// 	since: info.update_seq,
			// 	live: true
			// }).on('change', changeEvent);
      if(info){ console.log(info); }
			if(err){ console.error(err); }

		});

		if (remoteCouch) {
			   sync();
		}
	}

  // Show the current list of todos by reading them from the database
  function changeEvent() {
		db.allDocs({include_docs: true, descending: true}, function(err, doc) {
			console.log(doc.rows);
		});
  }

	pouch.queryByTimestamp = function(network,time, firstTime){

  var endTime = parseInt(Date.now()/1000);
  time = String(time);
  endTime = String(endTime);
  console.log(typeof time === 'string');
  console.log(typeof endTime === 'string');
		var opts = {startkey:time,
								endkey : endTime,
  								reduce: false,
  								descending: false};
    console.log(opts.startkey + " : "+opts.endkey);
		db.query("by_timestamp", opts, function(err, response) {

			if(err){ console.log(err); }
			else{
					var postData = [];
					for (var row in response.rows){
						// console.log(response.rows[row]);
						postData.push(response.rows[row].value);

					}
          // if(postData.length<=0){
          //   return;
          // }
				if(firstTime){
					console.log(	postData);
					network('#vis',postData);

					network.updateData(postData);
				}else{
					network.updateData(postData);
				}

			}
		});
	};

  pouch.addNode = function(params){
    db.put(params, params.bssid);
  };

	pouch.queryByPower = function (network){

		var opts = {reduce: false,descending: true};
		db.query("power", opts, function(err, response) {

			if(err){ console.error(err); }
			else{
					var postData =[];
					for (var row in response.rows){
						// console.log(response.rows[row].key + " : " + response.rows[row].value);
						postData.push(response.rows[row].value);
					}
				network('#vis',postData);
			}
		});
	};

	pouch.addQuery = function(network, map, opts, firstTime){

		opts.reduce = opts.reduce ||  "false";
		db.query({map:map},opts,function(err,response){
			var postData = [];
			for (var row in response.rows){
				console.log(response.rows[row].key + " : " + response.rows[row].value);
				postData.push(response.rows[row].value);
			}

			if(firstTime){
				network('#vis',postData);
			}else{
				console.log("Other Time ");
				network.updateData(postData);
			}

		});
	};


	// Sync the localDB to the remoteDB
	sync = function() {
    var opts = {live: true};
		console.log(remoteCouch);
    db.replicate.from(remoteCouch, opts, syncError);
    db.replicate.to(remoteCouch, opts, syncError);
  };

  // There was some form or error syncing
  function syncError(err) {
    console.log(err);
    // syncDom.setAttribute('data-sync-state', 'error');
  }

	return pouch;

};
