function Gui(){
  this.params = new Params();
  var gui = new dat.GUI();

  var f1 =  gui.addFolder("Server")
  f1.add(this.params, 'dbName');
  f1.add(this.params, 'remoteServer');

  var f2 =  gui.addFolder("Graph")
  var layouts = f2.add(this.params, 'layout', [ 'Network', 'Distance' , 'Connections' ]);
  var refreshRate =  f2.add(this.params, 'refreshRate', 0, 10);

  var f3 =  gui.addFolder("Time")
  f3.add(this.params, 'hours', 0, 59);
  f3.add(this.params, 'minutes', 0, 59);
  f3.add(this.params, 'seconds', 0, 59);

  this.wrapper = Pouch();
  this.wrapper(app.dbName, app.remoteServer);
  // time = setUTCDuration(1,0,0);
  this.myNetwork = Network();
  time = setUTCDuration(this.params.hours,this.params.minutes,this.params.seconds);
  this.wrapper.queryByTime(this.myNetwork,time,true);
  app.intervalId = setInterval(myInterval,params.refreshRate * 1000);
  console.log("new interval ID:" + app.intervalId);


  layouts.onChange(function(value) {
    // Fires on every change, drag, keypress, etc.
    console.log(value);
  });

  refreshRate.onChange(function(value){
    console.log("clearing interval ID:" + app.intervalId);
    clearInterval(app.intervalId);
    app.intervalId = setInterval(myInterval,params.refreshRate * 1000);
    console.log("setting interval ID:" + app.intervalId);
  })

}

function Params() {

  this.dbName = "test";
  this.remoteServer  = 'http://127.0.0.1:5984/test';
  this.layout = []; //= [ 'ConnectionsRealTimes', 'Distance' , 'Connections' ];
  this.refreshRate = 10;
  this.hours = 0;
  this.minutes = 3;
  this.seconds = 0;

};

var myInterval = function(){
  time = setUTCDuration(1,0,0);
  console.log("in interval");
  wrapper.queryByTime(myNetwork,time,false);
}
