app = new Object();
app.dbName = "test";
app.remoteServer  = 'http://127.0.0.1:5984/test';
app.nodes = [];
app.links = [];
app.layouts = [ 'Distance', 'Network' , 'Connections' ];
app.interval = 5000;
app.intervalId;
app.hours = 0;
app.minutes = 3;
app.seconds = 0;

var node = null;
var link = null;

function setDuration (numHours, numMinutes, numSeconds){

	var ts = new Date();

	var minutes = (ts.getMinutes()-numMinutes) >0 ? (ts.getMinutes()-numMinutes) : 0
	var seconds = (ts.getSeconds()-numSeconds) >0 ? (ts.getSeconds()-numSeconds) : 0
	var hours 	= (ts.getHours()-numHours) >0 ? (ts.getHours()-numHours) : 0

	//FIXME: Get rid off the -1 from getDate and -2 from hours
	var timestamp = ts.getFullYear()+"-"+(ts.getMonth()-1)+"-"+(ts.getDate()+4)+" "+(hours)+":"+ minutes	+":"+seconds;
	// timestamp = ts.getFullYear()+"-"+(ts.getMonth()+1)+"-"+(ts.getDate()-1)+" "+(13)+":"+ minutes	+":"+seconds;

	console.log(timestamp);
	return timestamp

}

function setUTCDuration (numHours, numMinutes, numSeconds){

	var ts = new Date();

	var minutes = (ts.getUTCMinutes()-numMinutes) >0 ? (ts.getUTCMinutes()-numMinutes) : 0
	var seconds = (ts.getUTCSeconds()-numSeconds) >0 ? (ts.getUTCSeconds()-numSeconds) : 0
	var hours 	= (ts.getUTCHours()-numHours) >0 ? (ts.getUTCHours()-numHours) : 0

	//FIXME: Get rid off the -1 from getDate and -2 from hours
	var timestamp = ts.getFullYear()+"-"+(ts.getMonth()+1)+"-"+(ts.getDate())+"T"+(hours)+":"+ minutes	+":"+seconds+"Z";
	// timestamp = ts.getFullYear()+"-"+(ts.getMonth()+1)+"-"+(ts.getDate()-1)+" "+(13)+":"+ minutes	+":"+seconds;

	console.log(timestamp);
	return timestamp
}





var scale = d3.scale.pow()
	.domain([0,128])
	.range([10,3]);

var scale2 = d3.scale.linear()
	.domain([0,128])
	.range([1,0]);

var colors = d3.scale.category20();
var color = d3.scale.category10();
