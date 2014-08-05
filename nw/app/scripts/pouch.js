var PouchDB = require('PouchDB');
var utils = require('./utils');
// var Promise = require('es6-promise').Promise;
module.exports = function(){
	// var syncDom = document.getElementById('sync-wrapper');
	// var dbName = 'Nodes'

  var db;
	var remoteCouch;

	function pouch(){

		db = new PouchDB(utils.config.dbName);
		remoteCouch = utils.config.remoteServer;

		console.log(utils.config.remoteServer);
		db.info(function(err, info) {
			// db.changes({
			// 	since: info.update_seq,
			// 	live: true
			// }).on('change', changeEvent);
			if(err){
				console.log(err)
			};

		});

		if (remoteCouch) {
			sync();
			// init();
		}
	}

	function init(){
		db.allDocs({include_docs: true, descending: true}, function(err, doc) {
			console.log(doc.rows);
		});
	}

  // Show the current list of todos by reading them from the database
  function changeEvent() {
		db.allDocs({include_docs: true, descending: true}, function(err, doc) {
			console.log(doc.rows);
		});
  }


	// done to get individual nodes
	pouch.getDB = function (){
		// db.get(docId, [options], [callback])
	};

	// done to carry a query. Can pass a new Map function if needed
	pouch.queryByTime = function(network,time, firstTime){
		// console.log(time);
		console.log(time +" : "+ setUTCDuration(0,0,0));
		var opts = {//startkey:time,
								endkey:time,
								reduce: false,
								descending: false};

		db.query("lastTimeSeen", opts, function(err, response) {

			if(err){ console.log(err); }
			else{
					var postData = [];
					for (var row in response.rows){
						// console.log(response.rows[row]);
						postData.push(response.rows[row].value);

					}
				if(firstTime){

					network('#vis',postData);
					network.updateData(postData);
				}else{
					// console.log("Other Time ");
					network.updateData(postData);
				}
				// console.log(postData.length);
			}
		});
	};

	// done to carry a query. Can pass a new Map function if needed
	pouch.queryByTimestamp = function(network,time, firstTime){
		// console.log(time);
		// console.log(time +" : "+ Date.now());
		var opts = {startkey:time,
								endkey:parseInt(Date.now()/1000),
								reduce: false,
								descending: false};
		// console.log(db);
		db.query("timestamp", opts, function(err, response) {

			if(err){ console.log(err); }
			else{
					var postData = [];
					for (var row in response.rows){
						// console.log(response.rows[row]);
						postData.push(response.rows[row].value);

					}
				if(firstTime){
					// console.log(	postData);
					network('#vis',postData);

					network.updateData(postData);
				}else{
          console.log(	postData);
					// conssole.log("Other Time ");
					network.updateData(postData);
				}
				console.log(postData.length);
			}
		});
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
    //
		//dont think i need the replicate to
		// db.replicate.to(remoteCouch, opts, syncError);
		console.log(remoteCouch);
    db.replicate.from(remoteCouch, opts, syncError);
  }

  // There was some form or error syncing
  function syncError(err) {
    console.log(err);
    // syncDom.setAttribute('data-sync-state', 'error');
  }

	return pouch;

};
