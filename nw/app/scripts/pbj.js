var colorbrewer = require('./colorBrewer');
var dat = require('dat-gui');
var utils = require('./utils');
var Pouch = require('./pouch');
var SysInterface = require('./sysInterface');
var Network = require('./graph');
var sniffer = nodeRequire('nshey');
var nw = nodeRequire('nw.gui');
var fs = nodeRequire('fs');
var win = gui.Window.get();
var App;


module.exports = function App(){

  win.on('closed',function(){
    //clean up
    console.log("Im closing");
    console.log(sysInterface);
    this.sysInterface.pouch.cleanUp();
    sniffer.stop();
    this.close(true);
  });

  var channels = [36,40,44,48,6,11,1];
  
  this.params = new Params();
  this.sysInterface = SysInterface();
  this.sysInterface.pouch();
  this.sysInterface.pouch.cleanUp();
  var timeoutID = null;
  var layoutTimeout = null;
  var currentLayoutIndex = 0;
  var firstTime = true;

  myNetwork = Network();
  myNetwork.loadParams(this.params.layoutParams);

  var options = options || {};
  options.filename = "./sniffer/packets.log";
  options.channels = [1,6,11,36,40,44,48];
  options.interval = 5000;
  options.cb = this.sysInterface.parser.parseLine;
  sniffer.start(options);

  function setupMenu() {
    var nativeMenuBar = new nw.Menu({ type: "menubar" });
    nativeMenuBar.createMacBuiltin("N.S.Heyyy Viz", {hideEdit: true, hideWindow: true});
    win.menu = nativeMenuBar;

    var snifferMenu = new nw.Menu();
    var interfaces = [];
    
    var addMenuItem = function(l,snifferMenu){
      snifferMenu.append(new nw.MenuItem({ label: l, click: function(){
        console.log("Clicked");
        sniffer.stop();
        sniffer.start()
      }}));
    }
    sniffer.getWiFiInterfaces(function(list){
      for(var i = 0; i< list.length; i++){

       var label = list[i];
       console.log(list[i]);
       addMenuItem(list[i] ,snifferMenu);
     }

   });
    win.menu.append(new nw.MenuItem({label: 'Sniffer', submenu: snifferMenu}));

  }

  function dataTimer(){

    var t = utils.getTimeStamp(params.hours,params.minutes,params.seconds);
    sysInterface.pouch.getPostsBetween(t,Date.now()/1000).then(function(result){
    // sysInterface.pouch.getPostsSince(t).then(function(result){
      var postData = [];
      for (var i =0; i<result.rows.length; i++){
        if(result.rows[i].doc.bssid){
          // console.log(resul  t.rows[i].doc);
          postData.push(result.rows[i].doc);
        }
        else{
          console.log("BOGUS");
          console.log(result.rows[i].doc);
        }
      }
      if(firstTime){
        // console.log("first");
        myNetwork('#vis',postData);
        myNetwork.updateData(postData);
        firstTime = false;
        updateOnTimer();
      }
      else{
        // console.log("othe");
        myNetwork.updateData(postData);
      }
    });
    timeoutID = setTimeout(dataTimer,params.refreshRate*1000);
  }
  setupMenu();
  dataTimer();


  var gui1 = new dat.GUI();

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
  graphFolder.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
  };

  var layouts = graphFolder.add(this.params, 'layout', utils.config.layouts);
  var refreshRate =  graphFolder.add(this.params, 'refreshRate', 1, 10).step(1);

  var f4 = graphFolder.addFolder(utils.config.layouts[0]);
  var currentLayout = utils.config.layouts[0];
  if(currentLayout !== ""){graphFolder.removeFolder(currentLayout);}

  updateGui(currentLayout);
  // myNetwork = Network();
  // myNetwork.loadParams(this.params.layoutParams);
  // var time = utils.getTimeStamp(this.params.hours,this.params.minutes,this.params.seconds);

  layouts.onChange(function(value) {

    //TODO: Make sure the handlers are being removed from the folders too
    if(currentLayout !== ""){graphFolder.removeFolder(currentLayout);}
    updateGui(value);
    currentLayout = value;
    myNetwork.toggleLayout(value);
  });



  refreshRate.onFinishChange(function(value){
    clearInterval(timeoutID);
    timeoutID = setTimeout(dataTimer,params.refreshRate*1000);
  });

  function updateOnTimer(){
    console.log("timer");
    if (currentLayoutIndex < (utils.config.layouts.length-1) ){
      currentLayoutIndex ++;
    }
    else{
      currentLayoutIndex = 0;
    }

    if(currentLayout !== ""){graphFolder.removeFolder(currentLayout);}
    console.log(utils.config.layouts[currentLayoutIndex]);
    updateGui(utils.config.layouts[currentLayoutIndex]);
    currentLayout = utils.config.layouts[currentLayoutIndex];
    

    params.layoutParams.routerColor =  colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)) )];
    params.layoutParams.clientColor  =  colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)) )];
    params.layoutParams.linkColor = colorbrewer.Spectral[11][Math.ceil((Math.random() * (colorbrewer.Spectral[11].length-2)) )];


      
    myNetwork.updateParams("false:routerColor:"+ colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)) )]);
    myNetwork.updateParams("false:clientColor:" + colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)) )]);
    myNetwork.updateParams("false:linkColor:"+ colorbrewer.Spectral[11][Math.ceil((Math.random() * (colorbrewer.Spectral[11].length-2)) )]);

    myNetwork.updateParams("false:minColor:"+ colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)))]);
    myNetwork.updateParams("false:maxColor:"+ colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)))]);
    
    
    myNetwork.toggleLayout(utils.config.layouts[currentLayoutIndex]);

    layoutTimeout =  setTimeout(updateOnTimer,10000);
  }
  




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
    this.dbName = utils.config.dbName;

    this.remoteServer  = ( utils.config.remoteServer)?utils.config.remoteServer:"no remote";
    this.layout = [];
    this.refreshRate = 7;
    this.hours = 0;
    this.minutes = 5;
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
      linkRadiusMin: 150,
      linkRadiusMax: 500,
      linkRadiusMinConnections: 135,
      linkRadiusMaxConnections: 320,
      linkRadiusMinNetwork: 10,
      linkRadiusMaxNetwork: 20,
      linkStrength: 0.5 ,
      routerRadius: 6,
      clientRadius: 4,
      friction: 0.53,
      charge: -150,
      minColor: colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)))],//.Reds[9][2],
      maxColor: colorbrewer.Set3[12][Math.ceil((Math.random() * (colorbrewer.Set3[12].length-2)))],//.Set3[12][3],
      minConnections: 3,
      circMin : 4,
      circMax: 11,
      strokeWidth:3
    };
  }
};
