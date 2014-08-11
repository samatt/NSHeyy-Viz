var colorbrewer = require('./colorBrewer');
var dat = require('dat-gui');
var utils = require('./utils');
var Pouch = require('./pouch');
var sysInterface = require('./sysInterface');
var Network = require('./graph');

module.exports = function App(){


  this.params = new Params();
  // this.wrapper =  Pouch();
  // this.wrapper();

  this.sysInterface = sysInterface();
  this.sysInterface.pouch.init();


  var gui1 = new dat.GUI();
  var realTime = gui1.add(this.params,'realTime', false);
  var utilsGui = gui1.addFolder("Utils");

  var f1 =  utilsGui.addFolder("Server");
  f1.add(this.params, 'dbName');
  f1.add(this.params, 'remoteServer');

  var f3 =  utilsGui.addFolder("Time");

  f3.add(this.params, 'hours', 0, 100).step(1);
  f3.add(this.params, 'minutes', 0, 59).step(1);
  f3.add(this.params, 'seconds', 0, 59).step(1);


  var graphGUI = new dat.GUI();
  var graphFolder =  graphGUI.addFolder("Graph");
  var layouts = graphFolder.add(this.params, 'layout', utils.config.layouts);
  var refreshRate =  graphFolder.add(this.params, 'refreshRate', 1, 10).step(1);

  var f4 = graphFolder.addFolder(utils.config.layouts[0]);
  var currentLayout = utils.config.layouts[0];
  if(currentLayout !== ""){graphFolder.removeFolder(currentLayout);}

  updateGui(currentLayout);


  // console.log(this.wrapper;
  this.myNetwork = Network();

  this.myNetwork.loadParams(this.params.layoutParams);
  time = utils.getTimeStamp(this.params.hours,this.params.minutes,this.params.seconds);
  this.sysInterface.pouch.getPostsSince(time).then(function(result){
    var postData = [];
  	for (var i =0; i<result.rows.length; i++){
  		postData.push(result.rows[i].doc);
  	}
  		myNetwork('#vis',postData);
  		myNetwork.updateData(postData);
  });
  // this.sysInterface.pouch.queryByTimestamp(this.myNetwork,time,true);

  // params.intervalId = setInterval(myInterval,this.params.refreshRate * 1000);
  // console.log("Interval ID set to : " +  params.intervalId + " with refresh rate: " + (params.refreshRate * 1000) );
  layouts.onChange(function(value) {

    //TODO: Make sure the handkers are being removed from the folders too
    if(currentLayout !== ""){graphFolder.removeFolder(currentLayout);}
    updateGui(value);
    currentLayout = value;
    myNetwork.toggleLayout(value);

  });

  realTime.onFinishChange(function(value){
    if(value){
      //TODO: Fix Potential conflict with refreshRate clearInterval
      // clearInterval(params.intervalId);
      params.intervalId = setInterval(myInterval,params.refreshRate * 1000);
      console.log("Interval ID set to : " +  params.intervalId + " with refresh rate: " + (params.refreshRate * 1000) );
    }
    else{
      clearInterval(params.intervalId);
    }
  });

  refreshRate.onFinishChange(function(value){
    // console.log("clearing interval ID:" + params.intervalId);
    clearInterval(params.intervalId);
    params.intervalId = setInterval(myInterval,params.refreshRate * 1000);
    // console.log("Interval ID set to : " +  params.intervalId + " with refresh rate: " + (params.refreshRate * 1000) );
    // console.log("setting interval ID:" + params.intervalId);
  });



  var myInterval = function(){
    // console.log("In interval");
    // console.log(params.hours+" : "+params.minutes+" : "+params.seconds);
    time = utils.getTimeStamp(params.hours,params.minutes,params.seconds);
    wrapper.queryByTimestamp(myNetwork,time,false);
  };
  function updateGui(value){

    if(value == "Network"){

      f4 =graphFolder.addFolder("Network");

      var p = f4.add(params.layoutParams,"linkRadiusMinNetwork",1,400).step(1);
      p.onFinishChange(function(value){myNetwork.updateParams("true:linkRadiusMinNetwork:" + value);});

      p = f4.add(params.layoutParams,"linkRadiusMaxNetwork",1,400).step(1);
      p.onFinishChange(function(value){myNetwork.updateParams("true:linkRadiusMaxNetwork:"+value);});

      p = f4.add(params.layoutParams,"strokeWidth",1,20).step(1);
      p.onFinishChange(function(value){myNetwork.updateParams("true:strokeWidth:"+value);});

      p = f4.add(params.layoutParams,"routerRadius",1,20).step(1);
      p.onFinishChange(function(value){myNetwork.updateParams("true:routerRadius:"+value);});

      p =f4.add(params.layoutParams,"clientRadius",1,20).step(1);
      p.onFinishChange(function(value){myNetwork.updateParams("true:clientRadius:" + value);});

      p = f4.add(params.layoutParams,"friction",0,1);
      p.onChange(function(value){myNetwork.updateParams("none:friction:"+value);});

      p = f4.add(params.layoutParams,"charge",-700,500).step(1);
      p.onChange(function(value){myNetwork.updateParams("none:charge:"+value);});

      p = f4.addColor(params.layoutParams,"routerColor");
      p.onChange(function(value){myNetwork.updateParams("false:routerColor:"+ value);});

      p = f4.addColor(params.layoutParams,"clientColor");
      p.onChange(function(value){myNetwork.updateParams("false:clientColor:" + value);});

      p = f4.addColor(params.layoutParams,"linkColor");
      p.onChange(function(value){myNetwork.updateParams("false:linkColor:"+value);});
    }
    else if(value == "Connections"){

      f4 =graphFolder.addFolder("Connections");

      var r = f4.add(params.layoutParams,"minConnections",2,10).step(1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:minConnections:" + value);});

      r = f4.add(params.layoutParams,"linkRadiusMinConnections",1,400).step(1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:linkRadiusMinConnections:"+value);});

      r = f4.add(params.layoutParams,"linkRadiusMaxConnections",1,500).step(1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:linkRadiusMaxConnections:"+value);});

      r = f4.add(params.layoutParams,"strokeWidth",1,20).step(1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:strokeWidth:"+value);});

      r = f4.add(params.layoutParams,"linkStrength",0.1,1).step(0.1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:linkStrength:"+value);});

      r = f4.add(params.layoutParams,"circMin",1,20).step(1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:circMin:"+value);});

      r =f4.add(params.layoutParams,"circMax",1,20).step(1);
      r.onFinishChange(function(value){myNetwork.updateParams("true:circMax:" + value);});

      r = f4.add(params.layoutParams,"friction",0,1);
      r.onChange(function(value){myNetwork.updateParams("none:friction:"+value);});

      r = f4.add(params.layoutParams,"charge",-700,500).step(1);
      r.onChange(function(value){myNetwork.updateParams("none:charge:"+value);});

      r = f4.addColor(params.layoutParams,"maxColor");
      r.onChange(function(value){myNetwork.updateParams("false:maxColor:"+ value);});

      r = f4.addColor(params.layoutParams,"minColor");
      r.onChange(function(value){myNetwork.updateParams("false:minColor:" + value);});

      r = f4.addColor(params.layoutParams,"linkColor");
      r.onChange(function(value){myNetwork.updateParams("false:linkColor:"+value);});
    }
    else if(value == "Distance"){

      f4 = graphFolder.addFolder("Distance");

      var p1 = f4.add(params.layoutParams,"circleRadius",1,20).step(1);
      p1.onFinishChange(function(value){myNetwork.updateParams("true:circleRadius:" + value);});

      p1 = f4.add(params.layoutParams,"linkRadiusMin",1,400).step(1);
      p1.onFinishChange(function(value){ myNetwork.updateParams("true:linkRadiusMin:" + value);});

      p1 = f4.add(params.layoutParams,"linkRadiusMax",1,1000).step(1);
      p1.onFinishChange(function(value){myNetwork.updateParams("true:linkRadiusMax:" + value);});

      p1 = f4.add(params.layoutParams,"friction",0,1);
      p1.onChange(function(value){myNetwork.updateParams("none:friction:"+value);});

      p1 = f4.add(params.layoutParams,"charge",-700,500).step(1);
      p1.onChange(function(value){myNetwork.updateParams("none:charge:"+value);});

      p1 = f4.addColor(params.layoutParams,"routerColor");
      p1.onChange(function(value){myNetwork.updateParams("false:routerColor:"+ value);});

      p1 = f4.addColor(params.layoutParams,"clientColor");
      p1.onChange(function(value){myNetwork.updateParams("false:clientColor:" + value);});

      p1 = f4.addColor(params.layoutParams,"linkColor");
      p1.onChange(function(value){myNetwork.updateParams("false:linkColor:"+value);});
    }
    else{
      value = "";
    }

  }

  function Params() {
    this.realTime = false;
    this.dbName = "tests2";
    this.remoteServer  = 'http://127.0.0.1:5984/test2';
    this.layout = [];
    this.refreshRate = 7;
    this.hours = 100;
    this.minutes = 10;
    this.seconds = 0;
    //Random value
    this.intervalId = 0;
    this.test = " s";
    this.layoutParams = {
      routerColor: colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)) )],//Set3[12][1],
      clientColor: colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)) )],//Set3[12][3],
      linkColor: colorbrewer.Spectral[11][Math.ceil((Math.random() * (colorbrewer.Spectral[11].length-2)) )],//Blues[9][3],
      circleRadius: 6,
      listenerRadius: 8,
      linkRadiusMin: 10,
      linkRadiusMax: 300,
      linkRadiusMinConnections: 135,
      linkRadiusMaxConnections: 320,
      linkRadiusMinNetwork: 10,
      linkRadiusMaxNetwork: 20,
      linkStrength: 0.5 ,
      routerRadius: 4,
      clientRadius: 4,
      friction: 0.5,
      charge: -150,
      minColor: colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)))],//.Reds[9][2],
      maxColor: colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)))],//.Set3[12][3],
      minConnections: 3,
      circMin : 1,
      circMax: 11,
      strokeWidth:3
    };
  }

};
