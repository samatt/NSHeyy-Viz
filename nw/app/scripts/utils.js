module.exports.config = {};
module.exports.config.dbName = "pouchtest4";
module.exports.config.remoteServer  = 'http://127.0.0.1:5984/pouchtest4';
module.exports.config.layouts = [ 'Network','Distance','Connections'];

// var node = null;
// var link = null;

module.exports.setDuration =function (numHours, numMinutes, numSeconds){
	var ts = new Date();
	var minutes = (ts.getMinutes()-numMinutes) >0 ? (ts.getMinutes()-numMinutes) : 0;
	var seconds = (ts.getSeconds()-numSeconds) >0 ? (ts.getSeconds()-numSeconds) : 0;
	var hours 	= (ts.getHours()-numHours) >0 ? (ts.getHours()-numHours) : 0;
	var timestamp = ts.getFullYear()+"-"+(ts.getMonth()-1)+"-"+(ts.getDate()+4)+" "+(hours)+":"+ minutes	+":"+seconds;

	return timestamp;
};

module.exports.setUTCDuration = function(numHours, numMinutes, numSeconds){

	var ts = new Date();
	var minutes = (ts.getUTCMinutes()-numMinutes) >0 ? (ts.getUTCMinutes()-numMinutes) : 0;
	var seconds = (ts.getUTCSeconds()-numSeconds) >0 ? (ts.getUTCSeconds()-numSeconds) : 0;
	var hours 	= (ts.getUTCHours()-numHours) >0 ? (ts.getUTCHours()-numHours) : 0;
	var timestamp = ts.getFullYear()+"-"+(ts.getUTCMonth()+1)+"-"+(ts.getUTCDate())+" 0"+(hours)+":"+ minutes	+":"+seconds+"";
	// console.log(":"+timestamp+":");
	return timestamp;
};

module.exports.getTimeStamp = function(numHours, numMinutes, numSeconds){
	var millis = (60*60*numHours + 60*numMinutes + numSeconds) * 1000;
	return parseInt((Date.now() - millis)/1000);
};
