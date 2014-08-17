module.exports.config = {};
module.exports.config.dbName = "pouchtest3";
module.exports.config.remoteServer  = 'http://127.0.0.1:5984/pouchtest3';
module.exports.config.layouts = [ 'Connections','Distance','Network'];

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

	var ts = new Date();
	var minutes = (ts.getMinutes()-numMinutes) >0 ? (ts.getMinutes()-numMinutes) : 0;
	var seconds = (ts.getSeconds()-numSeconds) >0 ? (ts.getSeconds()-numSeconds) : 0;
	var hours 	= (ts.getHours()-numHours) >0 ? (ts.getHours()-numHours) : 0;

var timestamp =days[ts.getDay()]+" "+ts.getFullYear()+" "+months[ts.getMonth()]+" "+(ts.getDate())+" "+(hours)+":"+ minutes	+":"+seconds;
	console.log(timestamp);

	var uxtimestamp = Date.parse(timestamp);
	console.log(uxtimestamp/1000);
	var millis = (60*60*numHours + 60*numMinutes + numSeconds) * 1000;
	// console.log("Current Hours "  +	ts.getHours());
	// console.log(hours+ " : "+minutes+ " : "+ seconds);
	// console.log(parseInt((Date.now() - millis)/1000));
	return parseInt((uxtimestamp)/1000);
};

var days = {
	1:"Mon",
	2:"Tue",
	3:"Wed",
	4:"Thurs",
	5:"Fri",
	6:"Sat",
	7:"Sun",
}
var months = {
	0:"Jan",
	1:"Feb",
	2:"Mar",
	3:"Apr",
	4:"May",
	4:"Jun",
	6:"Jul",
	7:"Aug",
	8:"Sep",
	9:"Oct",
	10:"Nov",
	11:"Dec"
}