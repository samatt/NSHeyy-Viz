Pouch = function(){


	var syncDom = document.getElementById('sync-wrapper');
	// var dbName = 'Nodes'

  var db;
	var remoteCouch;

	function pouch(dbName, remoteServer){
		db = new PouchDB(dbName);
		remoteCouch = remoteServer;
		db.info(function(err, info) {
			// db.changes({
			// 	since: info.update_seq,
			// 	live: true
			// }).on('change', changeEvent);
		});

		if (remoteCouch) {
			sync();
			// init();
		}
	}




	function init(){
		// db.allDocs({include_docs: true, descending: true}, function(err, doc) {
		// 	// console.log(doc.rows);
		// });
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
	}

	// done to carry a query. Can pass a new Map function if needed
	pouch.queryByTime = function (network){

		// var map = function(doc) {
		// 		emit(doc.last, doc);
		// }

		var opts = {
			startkey: "2014-07-19 22:00:50",
			// descending: true,
			// endkey : "2014-07-21 03:30:09",
			reduce: false};

		db.query("lastTimeSeen", opts, function(err, response) {

			if(err){ console.error(err); }
			else{
					var postData = new Array();
					for (var row in response.rows){
					// console.log(response.rows[row].key + " : " + response.rows[row].value);
					postData.push(response.rows[row].value);

				}
				console.log(postData);
				network('#vis',postData);
			}
		});
	}

	pouch.queryByPower = function (network){

		var map = function(doc,emit) {
			if (doc.power > 0) {
				emit(doc.power, doc);
			}
		}

		var opts = {reduce: false,descending: true};

		db.query({map: map}, opts, function(err, response) {

			if(err){ console.error(err); }
			else{
					var postData = new Array();
					for (var row in response.rows){
					console.log(response.rows[row].key + " : " + response.rows[row].value);
					postData.push(response.rows[row].value);

				}

				network('#vis',postData);
			}
		});
	}


	// Sync the localDB to the remoteDB
	function sync() {

    var opts = {live: true};
    // db.replicate.to(remoteCouch, opts, syncError);
		//dont think i need the replicate to
    db.replicate.from(remoteCouch, opts, syncError);
  }

  // There was some form or error syncing
  function syncError() {
    console.log("ERROR");
    // syncDom.setAttribute('data-sync-state', 'error');
  }

	return pouch;

}
