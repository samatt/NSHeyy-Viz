Pouch = function(){


	var syncDom = document.getElementById('sync-wrapper');
	// var dbName = 'Nodes'

  var db;
	var remoteCouch;

	function pouch(dbName, remoteServer){
		db = new PouchDB(dbName);
		remoteCouch = remoteServer;
		db.info(function(err, info) {
			db.changes({
				since: info.update_seq,
				live: true
			}).on('change', changeEvent);
		});

		if (remoteCouch) {
			sync();
			init();
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
	}

	// done to carry a query. Can pass a new Map function if needed
	pouch.queryDB = function (){


		db.query({map: queryByTime}, {reduce: false}, function(err, response) {

			if(err){ console.error(err); }
			else{ console.log(response); }
		});
	}

	var queryByTime = function(doc,emit) {
		if (doc.kind == "Router") {
			emit(doc.last, doc.bssid);
		}
	}
	// Sync the localDB to the remoteDB
	function sync() {

    var opts = {live: true};
    db.replicate.to(remoteCouch, opts, syncError);
    db.replicate.from(remoteCouch, opts, syncError);
  }

  // There was some form or error syncing
  function syncError() {
    console.log("ERROR");
    // syncDom.setAttribute('data-sync-state', 'error');
  }

	return pouch;

}
