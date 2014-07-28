Network = function(){

  var  width = config.width;
  var  height = config.height;
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
    linkRadiusMin: 2,
    linkRadiusMax: 300,
    routerRadius: 4,
    clientRadius: 4,
    friction: 0.5,
    charge: -150
  };

  var tooltip = Tooltip("vis-tooltip", 230);

  var  force = d3.layout.force()
      .friction(.65)
      .charge([-200])
      .size([width, height]);

      force.on("tick", forceTick);
      force.on("end",function(){console.log("Over");});

// color function used to color nodes
  var nodeColors = d3.scale.category20();

  function network(selection, data){
    setNodeColor("Type");
    console.log("setting layout : "+ config.layouts[0] );
    setLayout(config.layouts[0]);

    // format data
    // allRawData = data;
    allData = setupData(data);

    // create svg and groups
    vis = d3.select(selection).append("svg")
      .attr("width", width)
      .attr("height", height);
    vis.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "black");

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
        .linkDistance(function(d){ return d.target.linkPower; });
    }
    else if(layout == "Network"){
      force.nodes(curNodesData)
        .links(curLinksData)
        .linkDistance(function(d){ return d.target.linkPower; });

    }
    else if(layout == "Connections"){
      force.nodes(curNodesData)
        .links(curLinksData)
        .linkDistance(function(d){return d.power; });
        // .linkStrength(function(d){ return d.power*0.1; });
    }

    // enter / exit for nodes
    updateNodes();
    updateLinks();

    if(layout == "Distance"){
      // console.log(layoutParams.friction);
      // console.log(layoutParams.charge);
      force
        // .friction(0.6)
        // .charge([-150])
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
      updateNodesConnections();
    }
    else if (layout == "Connections"){
      updateNodesNetwork();
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
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .attr("r", function(d){ return d.radius})
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
      // .style("fill",function(d){return d.color;})
      .attr("r",function(d){return d.radius;});

//       // .style("fill",(colorbrewer.Set3[12][Math.floor((Math.random() * 12) + 1)]))
    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
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
      .duration(500)
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
      .attr("y2", function(d){ return d.target.y;});

    link.exit().remove();
  }

  function updateLinksConnections(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name); });

    link
      .attr("attr","update")
      .transition()
      .duration(1000)
      .attr("class", "link");

    link.enter().append("line")
      .attr("class", "link")
      .style("stoke-width",function(d){return d.power *0.1;})
      .style("stroke",function(d){return d.linkColor;})
      .style("opacity",function(d){return d.power *0.01; })

      // .attr("stroke-dasharray",function(d){return d.target.kind ==="Router"?"10":"35"})
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.y;});

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
      .style("stroke-width","0.5")
      .style("stroke",function(d){return d.linkColor;})
      // .attr("stroke-dasharray",function(d){return d.target.kind ==="Router"?"10":"35"})
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.y;});

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

    console.log("update params in network : " +  newParams+" "+ layoutParams[key]);
    layoutParams[key] = value;
    console.log("updated to to "+layoutParams[key]);
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
    var networkNames = [];
    // var net = {};
    // net.name = "dummy";
    // net.ids = new Array();
    networkNames.push({'name' : "dummy", 'ids': []});
    nameArray = [];
    nameMapIndex = d3.map();
    clientWeightArray  = [];
    clientWeightArrayNames = [];
    clientWeightMap = d3.map();
    clientWeightLinks = [];


    for (var i = 0; i < _data.length; i++) {

      var node = JSON.parse(_data[i]);
      var n = {'name' : $.trim(node.BSSID), 'power': node.power, 'kind': node.kind};

      if(n.kind == "Client"){

        n.essid = node.AP;
        n.probedESSID = _.unique(node.probedESSID);

        for (var j = 0; j <n.probedESSID.length; j++){

          n.probedESSID[j] = $.trim(n.probedESSID[j]);

          var result = $.inArray(n.probedESSID[j] , nameArray);
          if( result> -1){
            var index = result;
            networkNames[nameMapIndex.get(n.probedESSID[j])].ids.push(n.name);
          }
          else{
            var net = {};
            net.name = n.probedESSID[j];
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

        if(data.nodes[k].name === data.nodes[l].name){
          continue;
        }

        if(_.intersection(data.nodes[k].probedESSID,data.nodes[l].probedESSID).length <3){
          continue;
        }
        else{
          // console.log(data.nodes[k].probedESSID);
          // console.log(data.nodes[l].probedESSID);
          // console.log(_.intersection(data.nodes[k].probedESSID,data.nodes[l].probedESSID));
        }

        var intLength = _.intersection(data.nodes[k].probedESSID,data.nodes[l].probedESSID).length;
        var key = data.nodes[k].name + "_" + data.nodes[l].name;
        var alt_key = data.nodes[l].name + "_" + data.nodes[k].name;

        // var index = $.inArray(n.pro  bedESSID[l] , nameArray);
        if($.inArray(key , clientWeightArrayNames) > -1){
          data.nodes[k].numLinks += 1;
          data.nodes[l].numLinks += 1;
          // console.log(clientWeightMap.get(key));
          // console.log(clientWeightArray);
          clientWeightArray[clientWeightMap.get(key)].weight += intLength;


        }
        else if($.inArray(alt_key , clientWeightArrayNames) > -1){
          data.nodes[k].numLinks += 1;
          data.nodes[l].numLinks += 1;
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
          // console.log("New Key :" +newKey +" : "+clientWeightArray.length);
        }
      }
    }

    for (var q = 0; q <clientWeightArray.length; q++){

        var _n = clientWeightArray[q];
       var _l = {'source' : _n.source, 'target': _n.target, 'power':_n.weight};
      //  console.log(l);
       data.links.push(_l);
      }

    return data;
  };

  setupNetworkLayout = function(_data){
    data = {};
    data.links = {};
    data.nodes = [];
    // console.log("here");

    data.nodes.push({'name' : "Listener",  'kind': "Listener"});
    for(var index in _data){

      // var node = JSON.parse(_data[i]);
      var n = {'name' : $.trim(_data[index].bssid), 'power': _data[index].power, 'kind': _data[index].kind};

      if(n.kind == "Client"){
        n.essid = _data[index].ap_essid;
        // console.log(n.essid);
        n.probedESSID = _data[index].probes;
        if(n.essid === "(not associated)" || n.essid === ""){

        }
        else{
          var l = {'source' : n.essid, 'target': $.trim(_data[index].bssid), 'power':_data[index].power};
          data.links.push(l);
        }
      }
      else{
        n.essid =  _data[index].essid;
      }
      data.nodes.push(n);
    }
    // console.log(data);
    return data;

  }

  setupDistanceLayout=function(_data){
    data = {};
    data.links = new Array();
    data.nodes = new Array();

    data.nodes.push({'name' : "Listener", 'power': -10, 'kind': "Listener"});
    // console.log(_data);
    for(var node in _data){

      var n = {'name' : $.trim(_data[node].bssid), 'power': _data[node].power, 'kind': _data[node].kind,'last':_data[node].last};

      if(n.kind == "Client"){
        n.essid = _data[node].ap_essid;
        n.probedESSID = _data[node].probes;
        var l = {'source' : data.nodes[0].name, 'target': $.trim(_data[node].bssid), 'power':_data[node].power};
        data.links.push(l);

      }
      else{

        var l = {'source' : data.nodes[0].name, 'target': $.trim(_data[node].bssid), 'power':_data[node].power};
        data.links.push(l);
        n.essid =  _data[node].essid;
      }
      data.nodes.push(n);
    }
    return data;
  }

  refreshD3Data = function(data){
    // var color = colorbrewer.Set3[12][Math.floor((Math.random() * 12) + 1)];

    //FOR GUI: routerColor
    //FOR GUI: clientColor
    //FOR GUI: linkColor
    //FOR GUI:Color min, max
    //FOR GUI:circleRadius max
    //FOR GUI:linkRadius min, max
    //FOR GUI:circle Radius router,client
    //FOR GUI:linkRadius Min,Max
    //FOR GUI:circleRadius Max

    var routerColor = layoutParams['routerColor'];//colorbrewer.Set3[12][4];
    var clientColor = layoutParams['clientColor'];//colorbrewer.Set3[12][3];
    var linkColor = layoutParams.linkColor;//colorbrewer.Blues[9][3];
    // var linkColor = colorbrewer.Set3[12][Math.floor((Math.random() * 12) + 1)];
    countExtent = d3.extent(data.nodes, function(d){ return d.power;});
    countExtentESSID = d3.extent(data.nodes,function(d){
                                            if(d.kind == "Router" || d.kind == "Listener" ){
                                              return 1;
                                            }
                                            else{
                                              return (d.probedESSID.length>0)?d.probedESSID.length:1;
                                            }
                                          });

    data.nodes.forEach( function(n){

      if(nodesMap.has(n.name)){
          _n = nodesMap.get(n.name);
          n.x = _n.x;
          n.y = _n.y;
          n.px = _n.px;
          n.py = _n.py;
          // n.color = _n.color;

          if(layout === "Network"){

            ramp = function(d){
              if(d.kind === "Router"){ return routerColor;}
              else if(d.kind === "Listener"){ return "White";}
              else{ return clientColor;}

            }
            n.color = ramp(n);
            if(n.kind === "Router"){
                n.radius = layoutParams['routerRadius']
            }
            else{
                n.radius = layoutParams['clientRadius']
            }

          }
          else{
            n.radius = layoutParams['circleRadius']
          }
          // console.log(layoutParams);
          if(n.kind === "Listener"){
            // console.log("HERE "+layoutParams['listenerRadius']);
            n.radius = layoutParams['listenerRadius'];
          }
      }
      else{

        n.x = randomnumber=Math.floor(Math.random()*width);
        n.y = randomnumber=Math.floor(Math.random()*height);



        if(layout =="Network"){
          ramp = function(d){
            if(d.kind === "Router"){ return routerColor;}
            else if(d.kind === "Listener"){ return "White";}
            else{return clientColor;}
          };
          n.color = ramp(n);
        }
        else if(layout =="Connections"){
          n.color = color;
        }
      }

      if(layout === "Distance"){
        //FOR GUI:Color min, max
        //FOR GUI:circleRadius max
        //FOR GUI:linkRadius min, max
        //FOR GUI:circle Radius router,client
        //FOR GUI:linkRadius Min,Max
        //FOR GUI:circleRadius Max

                                        //[300, 30]
        linkRadius = d3.scale.linear().range([layoutParams.linkRadiusMin, layoutParams.linkRadiusMax ]).domain(countExtent);
        circleRadius = d3.scale.pow().range([ 1  ,layoutParams.circleRadius]).domain(countExtent);

        n.radius = circleRadius(n.power);
        if(n.kind === "Listener"){n.radius = layoutParams.listenerRadius;}
        n.linkPower = linkRadius(n.power);
        ramp = function(d){
          if(d.kind === "Router"){ return routerColor;}
          else if(d.kind === "Listener"){ return "White";}
          else{return clientColor;}
        };

        n.color = ramp(n);

      }
      else if(layout === "Network"){
        //FOR GUI:Color min, max
        //FOR GUI:circleRadius max
        //FOR GUI:linkRadius min, max
        //FOR GUI:circle Radius router,client
        linkRadius = d3.scale.pow().range([layoutParams.linkRadiusMin, layoutParams.linkRadiusMax]).domain(countExtent);
        circleRadius = function(d){
          if(d.kind === "Router"){ return layoutParams.routerRadius;}
          else if(d.kind === "Listener"){ return layoutParams.listenerRadius;}
          else{return layoutParams.clientRadius;}

        };
        n.linkPower = linkRadius(n.power);
        n.radius = circleRadius(n);

      }
      else if(layout === "Connections"){

          //FOR GUI:Color min, max
          //FOR GUI:circleRadius max
          //FOR GUI:range(["#8dbbd8","#acbc43"]);
          var minColor = colorbrewer.Reds[9][2];
          // var maxColor = colorbrewer.Reds[9][8];
          var maxColor = colorbrewer.Set3[12][3];
          var nodeColor = d3.scale.pow().domain(countExtentESSID).range([minColor,maxColor]);
          n.color = nodeColor(n.probedESSID.length);

          // n.power = linkRadius(n.power);
          if(n.kind == "Client"){
              circRad = d3.scale.linear().range([ 5  ,10]).domain(countExtentESSID);//circleRadius(n);
              n.radius = circRad(n.probedESSID.length);
          }
      }


    });

    // id's -> node objects
    mapNodes(data.nodes);
    // console.log(data.links);
    var linksExtent = d3.extent(data.links, function(d){ return d.power;});
    data.links.forEach( function(l){
      // console.log(l);
      if(nodesMap.has(l.source) && nodesMap.has(l.target)){
        // console.log(l.source + " : "+l.target);
        if(layout === "Distance"){
          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
          l.linkColor = linkColor;
          linkedByIndex[l.source.name + " : " +l.target.name] = 1;
        }
        else if(layout === "Connections"){
          linkRadius = d3.scale.linear().range([60,100]).domain(linksExtent);
          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
          // l.linkDist =
          l.power = linkRadius(l.power);

          linkedByIndex[l.source.name + " : " +l.target.name] = 1;
          l.linkColor = linkColor;
        }
        else if(layout === "Network"){
          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);

          // console.log(l);
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
  }

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
        if(typeof(nodesMap.get($.trim(AP)).essid) !=="undefined"){

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
      console.log(d);
      if(d.probedESSID.length > 0){
        content += '<hr class="tooltip-hr">';
        content += '<p class="main">' + "PROBED NETWORKS:"  + '</span></p>';
        d.probedESSID.forEach(function(n){

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


  hideDetails = function(d,i){
    tooltip.hideTooltip();
  };

    return network;
};
