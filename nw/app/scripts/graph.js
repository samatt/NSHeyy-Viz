var utils = require('./utils');
var colorbrewer = require('./colorBrewer');
var Tooltip = require('./Tooltip');
var $ = require('jQuery');
var utils = require('./utils');
var  _ = require('underscore');
var d3 = require('d3');

module.exports = function(){

  var  width = $(window).width();
  var  height = $(window).height();
  var allData = [];
  var allRawData = [];
  var  curLinksData = [];
  var  curNodesData = [];
  var  linkedByIndex = {};
  var  nodesG = null;
  var  linksG = null;
  var  node = "Type";
  var  link = "Distance";
  var  layout = "Distance";
  var nodesMap = d3.map();
  var routersMap = d3.map();
  var clientsMap = d3.map();
  var ramp = d3.map();
  var numClientLinks = d3.map();

  // variables to refect the current settings
  // of the visualization
  var  nodeColor = null;
  var layoutParams = {
    routerColor: colorbrewer.Set3[12][4],
    clientColor: colorbrewer.Set3[12][3],
    linkColor: colorbrewer.Blues[9][3],
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
    minColor: colorbrewer.Reds[9][2],
    maxColor: colorbrewer.Set3[12][3],
    minConnections: 3,
    circMin : 10,
    circMax: 11,
    strokeWidth:3
  };

  network.loadParams =function(p){

    layoutParams.routerColor = p.routerColor;
    layoutParams.clientColor = p.clientColor;
    layoutParams.linkColor = p.linkColor;
    layoutParams.circleRadius = p.circleRadius;
    layoutParams.listenerRadius = layoutParams.listenerRadius;
    layoutParams.linkRadiusMin = p.linkRadiusMin;
    layoutParams.linkRadiusMax = p.linkRadiusMax;
    layoutParams.linkRadiusMinConnections = p.linkRadiusMinConnections;
    layoutParams.linkRadiusMaxConnections = p.linkRadiusMaxConnections;
    layoutParams.linkRadiusMinNetwork = p.linkRadiusMinNetwork;
    layoutParams.linkRadiusMaxNetwork = p.linkRadiusMaxNetwork;
    layoutParams.linkStrength = p.linkStrength;
    layoutParams.routerRadius = p.routerRadius;
    layoutParams.clientRadius = p.clientRadius;
    layoutParams.friction = p.friction;
    layoutParams.charge = p.charge;
    layoutParams.minColor = p.minColor;
    layoutParams.maxColor = p.maxColor;
    layoutParams.minConnections = p.minConnections;
    layoutParams.circMin  = p.circMin;
    layoutParams.circMax = p.circMax;
    layoutParams.strokeWidth = p.strokeWidth;
  };

  // console.log(Tooltip);
  var tooltip = Tooltip("vis-tooltip", 250);

  var  force = d3.layout.force()
      .friction(layoutParams.friction)
      .charge([layoutParams.charge])
      .size([width, height]);

      force.on("tick", forceTick);
      force.on("end",function(){console.log("Over");});

// color function used to color nodes
  var nodeColors = d3.scale.category20();

  function network(selection, data){
    setNodeColor("Type");
    console.log("setting layout : "+ utils.config.layouts[0] );
    setLayout(utils.config.layouts[0]);

    // format data
    // allRawData = data;
    allData = setupData(data);
    console.log(selection);
    // create svg and groups
    vis = d3.select(selection).append("svg")
      .attr("width", width)
      .attr("height", height);
    vis.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "black");
    // console.log(vis);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    force.size([width, height]);

    // perform rendering and start force layout
    update();
  }

  function update(){
    //  filter data to show based on current filter settings.
    curNodesData = allData.nodes;
    curLinksData = allData.links;
    // reset nodes and links in force layout
    if(layout == "Distance"){
      force.nodes(curNodesData)
        .links(curLinksData)
        .linkStrength([0.8])
        .linkDistance(function(d){ return d.target.linkPower; });
    }
    else if(layout == "Network"){
      force.nodes(curNodesData)
        .links(curLinksData)
        .linkStrength([0.8])
        .linkDistance(function(d){ return d.target.linkPower; });

    }
    else if(layout == "Connections"){
      force.nodes(curNodesData)
        .links(curLinksData)
        .linkStrength(layoutParams.linkStrength)
        .linkDistance(function(d){return d.power; });
        // .linkStrength(function(d){ return d.power*0.1; });
    }

    // enter / exit for nodes
    updateNodes();
    updateLinks();

    if(layout == "Distance"){
      force
        .friction(layoutParams.friction)
        .charge([layoutParams.charge])
        .size([width, height]);
    }
    else if (layout == "Network"){
      force
        .friction(layoutParams.friction)
        .charge([layoutParams.charge])
        .size([width, height]);
    }
    else if (layout == "Connections"){
      force
        .friction(layoutParams.friction)
        .charge([layoutParams.charge])
        .size([width, height]);
    }
    force.start();
  }

  function updateNodes(){

    if(layout == "Distance"){
      updateNodesDistance();
    }
    else if (layout == "Network"){
      updateNodesNetwork();
    }
    else if (layout == "Connections"){
      updateNodesConnections();
    }

  }

  function updateNodesDistance(){
    node = nodesG.selectAll("circle.node")
      .data(curNodesData, function(d) { return d.name ;});

    node
      .attr("attr","update")
      .transition()
      .duration(1000)
      .attr("class","node")
      .style("fill",function(d){return d.color;})
      // .attr("r", function(d){ return d.radius});
      .attr("r",function(d){return d.radius;});

    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d){ return d.x;})
      .attr("cy", function(d){ return d.y;})
      .attr("r", function(d){ return d.radius;})
      .style("fill",function(d){return d.color;})
      .call(force.drag);

    node.on("mouseover", showDetails)
      .on("mouseout", hideDetails);

    node.exit().remove();

  }

  function updateNodesConnections(){
    node = nodesG.selectAll("circle.node")
      .data(curNodesData, function(d) { return d.name ;});
    node
      .attr("attr","update")
      .transition()
      .duration(1000)
      .attr("class","node")
      .style("fill",function(d){return d.color;})
      .attr("r",function(d){return d.radius;});

    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d){ return d.x;})
      .attr("cy", function(d){ return d.y;})
      .attr("r", function(d){ return d.radius; })
      .style("fill",function(d){return d.color; })
      .call(force.drag);

    node
      .on("mouseover", showDetails)
      .on("mouseout", hideDetails);


    node.exit().remove();

  }

  function updateNodesNetwork(){

      node = nodesG.selectAll("circle.node")
        .data(curNodesData, function(d) { return d.name ;});

      node
        .attr("attr","update")
        .transition()
        .duration(1000)
        .attr("class","node")
        .style("fill",function(d){return d.color;})
        .attr("r",function(d){return d.radius;});

      node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("r", function(d){ return d.radius;})
        .style("fill",function(d){return d.color;})
        .call(force.drag);

      node.on("mouseover", showDetails)
        .on("mouseout", hideDetails);

      node.exit().remove();

  }

  function updateLinks(){

    if(layout === "Distance"){
      updateLinksDistance();
    }
    else if(layout === "Connections"){
      updateLinksConnections();
    }
    else if(layout === "Network"){
      updateLinksNetwork();
    }
  }

  function updateLinksDistance(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name); });

    link
      .attr("attr","update")
      .transition()
      .duration(5000)
      .style("stroke",function(d){return d.linkColor;})
      .attr("class", "link");

    link.enter().append("line")
      .attr("class", "link")
      .style("stroke-width","0.3")
      .style("stroke",function(d){return d.linkColor;})
      .attr("stroke-dasharray",function(d){return d.target.kind ==="Router"?"10":"35";})
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.x;})
      .call(force.drag);

    link.exit().remove();
  }

  function updateLinksConnections(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name); });

    link
      .attr("attr","update")
      .transition()
      .duration(1000)
      .attr("class", "link")
      .style("stroke-width", function(d){return d.width; })
      .style("stroke-opacity",function(d){return d.opacity; })
      .style("stroke",function(d){return d.linkColor;});

    link.enter().append("line")
      .attr("class", "link")
      // .style("stoke-width",function(d){return d.power;})
      .style("stroke",function(d){return d.linkColor;})
      .style("stroke-opacity",function(d){return d.opacity; })
      .style("stroke-width", function(d){return d.width; })
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.x;})
      .call(force.drag);

    link.on("mouseover", showLinkDetails)
      .on("mouseout", hideDetails);
    link.exit().remove();


  }

  function updateLinksNetwork(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name); });

    link
      .attr("attr","update")
      .transition()
      .duration(1000)
      .style("stroke",function(d){return d.linkColor;})
      .attr("class", "link");

    link.enter().append("line")
      .attr("class", "link")
      .style("stroke",function(d){return d.linkColor;})
      // .attr("stroke-width",)
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.x;});

    link.exit().remove();

  }

  setNodeColor = function(newColor){
    nodeColor = newColor;
  };

  setLayout = function(newLayout){
    layout = newLayout;
  };

  network.updateParams = function(newParams){
    var p =newParams.split(":");
    // bool type = parseBoolean(p[0]);
    var value;
    var isInt = p[0];
    key = p[1];
    if(isInt === "true"){
      value = parseInt(p[2]);
    }
    else if(isInt === "none")
      value = parseFloat(p[2]);
    else{
      value = p[2];
    }

    // console.log("update params in network : " +  newParams+" "+ layoutParams[key]);
    layoutParams[key] = value;
    // console.log("updated to to "+layoutParams[key]);
    allData = setupData(allRawData);
    update();
  };

  network.isRealTime = function(){
    if(layout === "Network" || layout == "Distance" ){
      return true;
    }
    else{
      return false;
    }
  };

  network.toggleNodeColor = function(newColor){
    // # public function
    force.stop();
    setNodeColor(newColor);
    allData = setupData(allRawData);
    update();
  };

  network.toggleLayout = function(newLayout){
    force.stop();
    setLayout(newLayout);
    // console.log(allRawData);
    allData = setupData(allRawData);
    update();
  };

  network.updateData = function(newData){
    allRawData = newData;
    allData = setupData(newData);
    update();
  };

  // tick function for force directed layout
  function forceTick(e){
    node
      .attr("cx", function(d){ return d.x;})
      .attr("cy", function(d){ return d.y;});

    link
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.y;});
  }

  // called once to clean up raw data and switch links to
  // point to node instances
  // Returns modified data
  setupData = function(_data){

    data = {};
    data.links = [];
    data.nodes = [];
    // console.log("setup data :" + layout);
    if(layout==="Distance"){
      data = setupDistanceLayout(_data);
    }
    else if(layout === "Connections"){
      data = setupConnectionsLayout(_data);
    }
    else if(layout === "Network"){
      data = setupNetworkLayout(_data);
    }
    // console.log(data);
    // console.log(layoutParams);
    return refreshD3Data(data);
  };
  setupConnectionsLayout = function(_data){
    data = {};
    data.links = [];
    data.nodes = [];
    data.linkProbes = [];
    var networkNames = [];
    networkNames.push({'name' : "dummy", 'ids': []});
    nameArray = [];
    nameMapIndex = d3.map();
    clientWeightArray  = [];
    clientWeightArrayNames = [];
    clientWeightMap = d3.map();
    clientWeightLinks = [];


    for(var i in _data){

      var node = _data[i];
      var n = {'name' : $.trim(node.bssid), 'power': node.power, 'kind': node.kind};

      if(n.kind == "Client"){

        n.essid = node.AP;
        n.probes = _.unique(node.probes);

        for (var j = 0; j <n.probes.length; j++){

          n.probes[j] = $.trim(n.probes[j]);

          var result = $.inArray(n.probes[j] , nameArray);
          if( result> -1){
            var index = result;
            networkNames[nameMapIndex.get(n.probes[j])].ids.push(n.name);
          }
          else{
            var net = {};
            net.name = n.probes[j];
            net.ids = [];
            net.ids.push(n.name);
            networkNames.push(net);
            nameArray.push(net.name);
            nameMapIndex.set(net.name,nameArray.length);
          }
        }
        data.nodes.push(n);
      }
    }

    for(var k=0; k< data.nodes.length; k++){
      for(var l=0; l< data.nodes.length; l++){
        // console.log("START");
        if(data.nodes[k].name === data.nodes[l].name){
          continue;
        }

        if(_.intersection(data.nodes[k].probes,data.nodes[l].probes).length <layoutParams.minConnections){
          continue;
        }
        else{
          // console.log(data.nodes[k].probes);
          // console.log(data.nodes[l].probes);
          // console.log(_.intersection(data.nodes[k].probes,data.nodes[l].probes));
        }

        var intersections =  _.intersection(data.nodes[k].probes,data.nodes[l].probes);

        var intLength = intersections.length;
        var key = data.nodes[k].name + "_" + data.nodes[l].name;
        var alt_key = data.nodes[l].name + "_" + data.nodes[k].name;

      if( ($.inArray( key, clientWeightArrayNames) <= 0) && ($.inArray(alt_key,clientWeightArrayNames)) > -1 ){
        // console.log(key);
        var _p = {'source' : data.nodes[k].name, 'target': data.nodes[l].name, 'probes':intersections};
        data.linkProbes.push(_p);
        //console.log(intersections);
      }
        // var index = $.inArray(n.pro  bedESSID[l] , nameArray);
        if($.inArray(key , clientWeightArrayNames) > -1){
          data.nodes[k].numLinks += 1;
          data.nodes[l].numLinks += 1;
          // console.log(clientWeightMap.get(key));
          // console.log(clientWeightArray);

          console.log("Updating weight on links");
          clientWeightArray[clientWeightMap.get(key)].weight += intLength;


        }
        else if($.inArray(alt_key , clientWeightArrayNames) > -1){
          // data.nodes[k].numLinks += 1;
          // data.nodes[l].numLinks += 1;
          // console.log(key);
          console.log("Alt _ Updating weight on links");
            continue;

        }
        else{
          link = {};
          data.nodes[k].numLinks = 1;
          data.nodes[l].numLinks = 1;
          link.source = data.nodes[k].name;
          link.target = data.nodes[l].name;
          link.weight = intLength;
          var newKey = data.nodes[k].name + "_" + data.nodes[l].name;
          link.key = newKey;
          clientWeightArray.push(link);
          clientWeightArrayNames.push(newKey);
          clientWeightMap.set(newKey,(clientWeightArray.length -1));
          console.log("New Key :" +newKey +" : "+clientWeightArray.length);
        }
      }
    }

    for (var q = 0; q <clientWeightArray.length; q++){

        var _n = clientWeightArray[q];
       var _l = {'source' : _n.source, 'target': _n.target, 'power':_n.weight};
       data.links.push(_l);
      }
      data.linkProbes = _.uniq(data.linkProbes);
    return data;

  };

  setupNetworkLayout = function(_data){
    data = {};
    data.links = [];
    data.nodes = [];

    data.nodes.push({'name' : "Listener",  'kind': "Listener"});
    for(var index in _data){

      // var node = JSON.parse(_data[i]);
      var n = {'name' : $.trim(_data[index].bssid), 'power': _data[index].power, 'kind': _data[index].kind};

      if(n.kind == "Client"){
        n.essid = _data[index].ap_essid;
        // console.log(n.essid);
        n.probes = _data[index].probes;
        if(n.essid === "(not associated)" || n.essid === ""){

        }
        else{
          var _l = {'source' : n.essid, 'target': $.trim(_data[index].bssid), 'power':_data[index].power};
          // console.log(_l);
          data.links.push(_l);
        }
      }
      else{
        n.essid =  _data[index].essid;
      }

      data.nodes.push(n);
    }
    //console.log(data);
    return data;

  };

  setupDistanceLayout=function(_data){
    data = {};
    data.links = [];
    data.nodes = [];

    data.nodes.push({'name' : "Listener", 'power': -10, 'kind': "Listener"});
    // console.log(_data);
    for(var node in _data){

      var n = {'name' : $.trim(_data[node].bssid), 'power': _data[node].power, 'kind': _data[node].kind,'last':_data[node].last};

      if(n.kind == "Client"){
        n.essid = _data[node].ap_essid;
        n.probes = _data[node].probes;
        var l = {'source' : data.nodes[0].name, 'target': $.trim(_data[node].bssid), 'power':_data[node].power};
        data.links.push(l);
      }
      else{

        var _l = {'source' : data.nodes[0].name, 'target': $.trim(_data[node].bssid), 'power':_data[node].power};
        data.links.push(_l);
        n.essid =  _data[node].essid;
      }
      data.nodes.push(n);
    }
    return data;
  };

  refreshD3Data = function(data){
    //Globals of sorts
    var countExtent = d3.extent(data.nodes, function(d){ return d.power;});
    var countExtentESSID = d3.extent(data.nodes,function(d){ return (d.kind==="Client")?((d.probes.length>0)?d.probes.length:1):1;});
    var connectionsLinksExtent = d3.extent(data.links, function(d){return d.power;});

    var linkColor = layoutParams.linkColor;
    var nConnectionsColor = d3.scale.linear().range([layoutParams.minColor,layoutParams.maxColor]).domain(countExtentESSID);
    var nColor = function(d){if(d.kind === "Listener"){return "White";} return (d.kind ==="Client")?layoutParams.clientColor:layoutParams.routerColor;};

    var nCircleRadius = d3.scale.pow().range([ 1  ,layoutParams.circleRadius]).domain(countExtent);
    var nConnectionsRadius = d3.scale.linear().range([ layoutParams.circMin, layoutParams.circMax]).domain(countExtentESSID);
    var nNetworkLinkRadius = d3.scale.linear().range([layoutParams.linkRadiusMinNetwork, layoutParams.linkRadiusMaxNetwork ]).domain(countExtent);
    var nDistanceLinkRadius = d3.scale.pow().range([layoutParams.linkRadiusMin, layoutParams.linkRadiusMax]).domain(countExtent);

    var lConnectionsPower = d3.scale.linear().range([layoutParams.linkRadiusMinConnections,layoutParams.linkRadiusMaxConnections]).domain(connectionsLinksExtent);
    var lConnectionsOpacity = d3.scale.linear().range([0.4,0.6]).domain(connectionsLinksExtent);

    data.nodes.forEach( function(n){
      if(nodesMap.has(n.name)){
        //update existing nodes

          _n = nodesMap.get(n.name);
          // if(_n.x)
          n.x =_n.x;
          n.y = _n.y;
          n.px = _n.px;
          n.py = _n.py;

          if(n.kind === "Listener"){
            n.radius = layoutParams.listenerRadius;
          }

          if(layout === "Network"){
            n.color = nColor(n);
            n.radius = (n.kind === "Router")?layoutParams.routerRadius:layoutParams.clientRadius;
          }
          else{
            n.radius = layoutParams.circleRadius;
          }
      }
      else{
        //add new node
        n.x = Math.floor(Math.random()*width);
        n.y = Math.floor(Math.random()*height);

        if(layout =="Network"){
          n.color = nColor(n);
        }
        else if(layout =="Connections"){
          n.color = nConnectionsColor(n.probes.length);
        }
      }

      if(layout === "Distance"){
        n.radius = nCircleRadius(n.power);
        if(n.kind === "Listener"){n.radius = layoutParams.listenerRadius;}
        n.linkPower = nDistanceLinkRadius(n.power);
        // console.log(n.power);
        n.color = nColor(n);
      }
      else if(layout === "Network"){
        n.linkPower = nNetworkLinkRadius(n.power);
        n.radius = n.radius = (n.kind === "Router")?layoutParams.routerRadius:layoutParams.clientRadius;
      }
      else if(layout === "Connections"){

          n.color =  nConnectionsColor(n.probes.length);
          if(n.kind == "Client"){
              n.radius = nConnectionsRadius(n.probes.length);
          }
      }
      // console.log(n);
    });

    mapNodes(data.nodes);

    data.links.forEach( function(l){

      if(nodesMap.has(l.source) && nodesMap.has(l.target)){

        if(layout === "Distance"){

          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
          l.linkColor = linkColor;
          linkedByIndex[l.source.name + " : " +l.target.name] = 1;
          //console.log(l);
        }
        else if(layout === "Connections"){

          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
          l.common = [];
          for( var i in data.linkProbes){
            // console.log(data.linkProbes[i]);
            // console.log(l.sourv);
            if(data.linkProbes[i].source == l.source.name && data.linkProbes[i].target == l.target.name){
              l.common.push(data.linkProbes[i].probes);
            }
            else if(data.linkProbes[i].source == l.target.name && data.linkProbes[i].target == l.source.name){
              l.common.push(data.linkProbes[i].probes);
            }
          }
          l.power = lConnectionsPower(l.power);
          l.opacity = lConnectionsOpacity(l.power);
          l.width = layoutParams.strokeWidth;
          // l.linkStrength =

          linkedByIndex[l.source.name + " : " +l.target.name] = 1;
          l.linkColor = linkColor;
          // console.log(l.opacity);
        }
        else if(layout === "Network"){
          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
          linkedByIndex[l.source.name + " : " +l.target.name] = 1;
          l.linkColor = linkColor;
        }

      }
      else{
        delete data.links[l];
        // console.log("here");
      }
    });
    return data;
  };

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  mapNodes = function(nodes){
    nodesMap = d3.map();
    nodes.forEach (function(n,i){

      if(typeof(nodesMap.get(n.name)) !=="undefined"){
      }
      else{
        if(n.kind ==="Listener"){
          // console.log("HERE" + n.radius);
        }
        nodesMap.set(n.name, n);
      }

    });
    return nodesMap;
  };

  showDetails = function (d,i){
    content = '<p class="main">' + d.kind.toUpperCase() + " : "+ d.name + '</span></p>';
    content += '<hr class="tooltip-hr">';
    if(d.kind == "Client"){
      // console.log(d);
      var AP = d.essid;
      //contains
      var networkName = $.trim(AP);
      if(networkName === "(not associated)"){
        networkName =  "AP: "+"unassociated";
      }
      else{

      if( nodesMap.has($.trim(AP)) ){
        // console.log(nodesMap.get($.trim(AP)));
        if(typeof(nodesMap.get($.trim(AP)).essid) !=="undefined" || nodesMap.get($.trim(AP)).essid !== ""){
          networkName ="AP: "+ nodesMap.get($.trim(AP)).essid;
        }
        else{
          networkName ="AP: "+ "Error";
        }
      }

      }
      content += '<p class="main">' + networkName    + '</span></p>';
      content += '<hr class="tooltip-hr">';
      content += '<p class="main">' +"RSSI: " + d.power  + '</span></p>';
      // console.log(d);
      if(d.probes.length > 0){
        content += '<hr class="tooltip-hr">';
        content += '<p class="main">' + "PROBED NETWORKS:"  + '</span></p>';
        d.probes.forEach(function(n){

          content += '<p class="main">' + n  + '</span></p>';
        });
      }
    }
    else{
      content += '<p class="main">' + "NAME:" + d.essid  + '</span></p>';
      content += '<hr class="tooltip-hr">';
      content += '<p class="main">' +"RSSI: " + d.power  + '</span></p>';
    }

    tooltip.showTooltip(content,d3.event);
  };

  showLinkDetails = function (d,i){
    // console.log(d);
    content = '<p class="main">' + d.source.name + " : "+ d.source.kind + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main">' + d.target.name + " : "+ d.target.kind + '</span></p>';
    if(d.common.length > 0){
      console.log(d.common);
      content += '<hr class="tooltip-hr">';
      content += '<p class="main">' + "PROBED NETWORKS:"  + '</span></p>';
      d.common.forEach(function(n){

        content += '<p class="main">' + n  + '</span></p>';
      });
    }
    else{

    }

    tooltip.showTooltip(content,d3.event);
  };


  hideDetails = function(d,i){
    tooltip.hideTooltip();
  };

    return network;
};
