Network = function(){
  // variables we want to access
  // in multiple places of Network
  var  width = app.width;
  var  height = app.height;
  //  allData will store the unfiltered data
  var allData = []
  var allRawData = [];
  var  curLinksData = [];
  var  curNodesData = [];
  var  linkedByIndex = {};
  // these will hold the svg groups fora
  // accessing the nodes and links display
  var  nodesG = null;
  var  linksG = null;
  // these will point to the circles and lines
  // of the nodes and links
  var  node = "Type";
  var  link = "Distance";
  //ConnectionsRealTime
  //Connections
  var  layout = "Distance";
  var nodesMap = d3.map();
  var routersMap = d3.map();
  var clientsMap = d3.map();
  var ramp = d3.map();
  var numClientLinks = d3.map();

  // variables to refect the current settings
  // of the visualization
  var  nodeColor = null;

  var tooltip = Tooltip("vis-tooltip", 230)

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
    console.log("setting layout : "+ app.layout );
    setLayout(app.layout);

    // format data
    // allRawData = data;
    allData = setupData(data)

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
    else if(layout == "ConnectionsRealTime"){
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
      force
        .friction(.65)
        .charge([-200])
        .size([width, height]);
    }
    else if (layout == "ConnectionsRealTime"){
      force
        .friction(.6)
        .charge([-150])
        .size([width, height]);
    }
    else if (layout == "Connections"){
      force
        .friction(.8)
        .charge([-150])
        .size([width, height]);
    }


    force.start();
  }

  function updateNodes(){
    // node = nodesG.selectAll("circle.node")
      // .data(curNodesData, function(d) { return d.name ;});

    if(layout == "Distance"){
      updateNodesDistance()

    }
    else if (layout == "ConnectionsRealTime"){
      updateNodesConnections()

    }
    else if (layout == "Connections"){
      updateNodesConnectionsRealTime()

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
      .attr("r",function(d){return d.radius;});

    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .attr("r", function(d){ return d.radius})
      .style("fill",function(d){return d.color;})
      .call(force.drag);

    node.on("mouseover", showDetails)
      // .on("mouseout", hideDetails)

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


    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .attr("r", function(d){ return d.radius})
      .style("fill",function(d){return d.color})
      // .style("fill",(colorbrewer.Set3[12][Math.floor((Math.random() * 12) + 1)]))
      .call(force.drag);

    node.on("mouseover", showDetails);
      // .on("mouseout", hideDetails)
          // node.on("click", showDetails);

    node.exit().remove();

  }

  function updateNodesConnectionsRealTime(){

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
        .attr("r", function(d){ return d.radius})
        .style("fill",function(d){return d.color;})
        .call(force.drag);

      node.on("mouseover", showDetails)
        // .on("mouseout", hideDetails)

      node.exit().remove();

  }

  function updateLinks(){

    if(layout === "Distance"){
      updateLinksDistance();

    }
    else if(layout === "Connections"){
      updateLinksConnections();

    }
    else if(layout === "ConnectionsRealTime"){
      updateLinksConnectionsRealTime();

    }
  }

  function updateLinksDistance(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name) });

    link
      .attr("attr","update")
      .attr("class", "link");

    link.enter().append("line")
      .attr("class", "link")
      .style("stroke-width","0.3")
      .style("stroke",function(d){return (d.target.kind ==="Router"?"White":"Grey")})
      .attr("stroke-dasharray",function(d){return d.target.kind ==="Router"?"10":"35"})
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.y;});

    link.exit().remove();
  }

  function updateLinksConnections(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name) });

    link
      .attr("attr","update")
      .attr("class", "link");
    link.enter().append("line")
      .attr("class", "link")
      .style("stoke-width",function(d){return d.power *0.1})
      .style("stroke",function(d){return d.linkColor;})
      .style("opacity",function(d){return d.power *0.01 })

      // .attr("stroke-dasharray",function(d){return d.target.kind ==="Router"?"10":"35"})
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.y;});

    link.exit().remove();

  }

  function updateLinksConnectionsRealTime(){
    link = linksG.selectAll("line.link")
      .data(curLinksData, function(d){ return (d.source.name + " : "+d.target.name) });

    link
      .attr("attr","update")
      .attr("class", "link");

    link.enter().append("line")
      .attr("class", "link")
      .style("stroke-width","0.5")
      .style("stroke",function(d){return (d.target.kind ==="Router"?"White":"Grey")})
      .attr("stroke-dasharray",function(d){return d.target.kind ==="Router"?"10":"35"})
      .attr("x1", function(d){ return d.source.x;})
      .attr("y1", function(d){ return d.source.y;})
      .attr("x2", function(d){ return d.target.x;})
      .attr("y2", function(d){ return d.target.y;});

    link.exit().remove();

  }

  setNodeColor = function(newColor){
    nodeColor = newColor;
  }

  setLayout = function(newLayout){
    layout = newLayout;
  }

  network.isRealTime = function(){
    if(layout === "ConnectionsRealTime" || layout == "Distance" ){
      return true;
    }
    else{
      return false;
    }
  }

  network.toggleNodeColor = function(newColor){
    // # public function
    force.stop()
    setNodeColor(newColor);
    allData = setupData(allRawData);
    update();
  }

  network.toggleLayout = function(newLayout){
    force.stop()
    setLayout(newLayout);
    // console.log(allRawData);
    allData = setupData(allRawData);
    update();
  }

  network.updateData = function(newData){
      allRawData = newData;
      allData = setupData(newData);
      update()
  }

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


    data = new Object();
    data.links = new Array();
    data.nodes = new Array();
    console.log("setup data :" + layout);
    if(layout==="Distance"){
      data = setupDistanceLayout(_data);
    }
    else if(layout === "Connections"){
      data = setupConnectionsLayout(_data);

    }
    else if(layout === "ConnectionsRealTime"){

      data = setupConnectionsRealTimeLayout(_data);
    }
    // console.log(data);
    return refreshD3Data(data);
  }
  setupConnectionsLayout = function(_data){
    data = new Object();
    data.links = new Array();
    data.nodes = new Array();
    var networkNames = new Array();
    // var net = new Object();
    // net.name = "dummy";
    // net.ids = new Array();
    networkNames.push({'name' : "dummy", 'ids': []});
    nameArray = new Array();
    nameMapIndex = d3.map();
    clientWeightArray  = new Array();
    clientWeightArrayNames = new Array();
    clientWeightMap = d3.map();
    clientWeightLinks = new Array();


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
            var net = new Object();
            net.name = n.probedESSID[j];
            net.ids = new Array();
            net.ids.push(n.name);
            networkNames.push(net);
            nameArray.push(net.name);
            nameMapIndex.set(net.name,nameArray.length);
          }
        }
        data.nodes.push(n);
      }
    }

    for(var i=0; i< data.nodes.length; i++){
      for(var j=0; j< data.nodes.length; j++){

        if(data.nodes[i].name === data.nodes[j].name){
          continue;
        }

        if(_.intersection(data.nodes[i].probedESSID,data.nodes[j].probedESSID).length <3){
          continue;
        }
        else{
          // console.log(data.nodes[i].probedESSID);
          // console.log(data.nodes[j].probedESSID);
          // console.log(_.intersection(data.nodes[i].probedESSID,data.nodes[j].probedESSID));
        }



        var intLength = _.intersection(data.nodes[i].probedESSID,data.nodes[j].probedESSID).length;
        var key = data.nodes[i].name + "_" + data.nodes[j].name;
        var alt_key = data.nodes[j].name + "_" + data.nodes[i].name;

        // var index = $.inArray(n.pro  bedESSID[j] , nameArray);
        if($.inArray(key , clientWeightArrayNames) > -1){
          data.nodes[i].numLinks += 1;
          data.nodes[j].numLinks += 1;
          // console.log(clientWeightMap.get(key));
          // console.log(clientWeightArray);
          clientWeightArray[clientWeightMap.get(key)].weight += intLength;


        }
        else if($.inArray(alt_key , clientWeightArrayNames) > -1){
          data.nodes[i].numLinks += 1;
          data.nodes[j].numLinks += 1;
            continue;

        }
        else{
          link = new Object();
          data.nodes[i].numLinks = 1;
          data.nodes[j].numLinks = 1;
          link.source = data.nodes[i].name;
          link.target = data.nodes[j].name;
          link.weight = intLength;
          var newKey = data.nodes[i].name + "_" + data.nodes[j].name;
          link.key = newKey;
          clientWeightArray.push(link);
          clientWeightArrayNames.push(newKey);
          clientWeightMap.set(newKey,(clientWeightArray.length -1));
          // console.log("New Key :" +newKey +" : "+clientWeightArray.length);

        }

      }
    }

    for (var q = 0; q <clientWeightArray.length; q++){

        var n = clientWeightArray[q];
       var l = {'source' : n.source, 'target': n.target, 'power':n.weight};
      //  console.log(l);
       data.links.push(l);
      }

    return data;
  }

  setupConnectionsRealTimeLayout = function(_data){
    data = new Object();
    data.links = new Array();
    data.nodes = new Array();
    // console.log("here");

    data.nodes.push({'name' : "Listener", 'power': -10, 'kind': "Listener"});
    for (var i = 0; i < _data.length; i++) {

      var node = JSON.parse(_data[i]);
      var n = {'name' : $.trim(node.BSSID), 'power': node.power, 'kind': node.kind};

      if(n.kind == "Client"){
        n.essid = node.AP;
        n.probedESSID = node.probedESSID;

        var AP = n.essid.split("|");
        var networkName = $.trim(AP[0]);

        if(networkName === "(not associated)" || networkName === ""){

        }
        else{
          // networkName ="AP: "+ nodesMap.get($.trim(AP[0])).essid
          var l = {'source' : networkName, 'target': $.trim(node.BSSID), 'power':node.power};

          data.links.push(l);

        }

      }
      else{

        n.essid =  node.ESSID;
      }
      data.nodes.push(n);
    }
    // console.log(data);
    return data;

  }

  setupDistanceLayout=function(_data){
    data = new Object();
    data.links = new Array();
    data.nodes = new Array();

    data.nodes.push({'name' : "Listener", 'power': -10, 'kind': "Listener"});

    for (var i = 0; i < _data.length; i++) {

      var node = JSON.parse(_data[i]);

      var n = {'name' : $.trim(node.BSSID), 'power': node.power, 'kind': node.kind};

      if(n.kind == "Client"){
        n.essid = node.AP;
        n.probedESSID = node.probedESSID;

        if(layout=="Distance"){
            var l = {'source' : data.nodes[0].name, 'target': $.trim(node.BSSID), 'power':node.power};
            data.links.push(l);
        }
      }
      else{

        var l = {'source' : data.nodes[0].name, 'target': $.trim(node.BSSID), 'power':node.power};
        data.links.push(l);
        n.essid =  node.ESSID;
      }
      // console.log(data);
      data.nodes.push(n);

    }

    return data;
  }

  refreshD3Data = function(data){
    // var color = colorbrewer.Set3[12][Math.floor((Math.random() * 12) + 1)];

    var routerColor = colorbrewer.Set3[12][4];
    var clientColor = colorbrewer.Set3[12][3];
    var linkColor = colorbrewer.Blues[9][3];
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
          n.color = _n.color;
      }
      else{
        n.x = randomnumber=Math.floor(Math.random()*width);
        n.y = randomnumber=Math.floor(Math.random()*height);


        if(layout =="ConnectionsRealTime"){
          ramp = function(d){
            if(d.kind === "Router"){ return routerColor;}
            else if(d.kind === "Listener"){ return "White";}
            else{return clientColor;}
          }

          n.color = ramp(n);

        }
        else if(layout =="Connections"){
          n.color = color;
        }
      }

      if(layout === "Distance"){

        linkRadius = d3.scale.pow().range([300, 30]).domain(countExtent);
        circleRadius = d3.scale.pow().range([ 5  ,10]).domain(countExtent);

        n.radius = circleRadius(n.power);
        n.linkPower = linkRadius(n.power);
        ramp = function(d){
          if(d.kind === "Router"){ return routerColor;}
          else if(d.kind === "Listener"){ return "White";}
          else{return clientColor;}
        }

        n.color = ramp(n);

      }
      else if(layout === "ConnectionsRealTime"){

        linkRadius = d3.scale.pow().range([10, 30]).domain(countExtent);
        circleRadius = function(d){
          if(d.kind === "Router"){ return 7;}
          else if(d.kind === "Listener"){ return 5;}
          else{return 3;}

        }
        // ramp = function(d){
        //   if(d.kind === "Router"){ return color;}
        //   else if(d.kind === "Listener"){ return "White";}
        //   else{return linkColor;}
        // }
        //
        // n.color = ramp(n);
        // n.linkPower = 10;
        n.linkPower = linkRadius(n.power);
        n.radius = circleRadius(n);
      }
      else if(layout === "Connections"){
          //range(["#8dbbd8","#acbc43"]);
          var minColor = colorbrewer.Reds[9][2];
          // var maxColor = colorbrewer.Reds[9][8];
          var maxColor = colorbrewer.Set3[12][3];
          // linkRadius = d3.scale.pow().range([10, 2]).domain(countExtent);
          var nodeColor = d3.scale.pow().domain(countExtentESSID).range([minColor,maxColor]);
          n.color = nodeColor(n.probedESSID.length);
          // console.log(n.color);

          // n.power = linkRadius(n.power);
          if(n.kind == "Client"){
              circRad = d3.scale.linear().range([ 5  ,10]).domain(countExtentESSID);//circleRadius(n);
              n.radius = circRad(n.probedESSID.length);

              // n.color = color;

          }
          else {
            // ramp = function(d){
            //   if(d.kind === "Router"){ return "#4c92c1";}
            //   else if(d.kind === "Listener"){ return "White";}
            //   else{return "#bb7646";}
            // }


          }
      }


    });

    // id's -> node objects
    mapNodes(data.nodes);
  // console.log(data.links);
    var linksExtent = d3.extent(data.links, function(d){ return d.power;});
    data.links.forEach( function(l){

      if(nodesMap.has(l.source) && nodesMap.has(l.target)){
        // console.log(l.source + " : "+l.target);
        if(layout === "Distance"){
          l.source = nodesMap.get(l.source);
          l.target = nodesMap.get(l.target);
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
        else if(layout === "ConnectionsRealTime"){
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
        nodesMap.set(n.name, n);
      }

    });
    return nodesMap;
  }

  showDetails = function (d,i){
    content = '<p class="main">' + d.kind.toUpperCase() + " : "+ d.name + '</span></p>';
    content += '<hr class="tooltip-hr">';
    if(d.kind == "Client"){
      // console.log(d);
      var AP = d.essid.split("|");
      //contains
      var networkName = $.trim(AP[0]);
      if(networkName === "(not associated)"){
        networkName =  "AP: "+"unassociated";
      }
      else{

      if( nodesMap.has($.trim(AP[0])) ){
        if(typeof(nodesMap.get($.trim(AP[0])).essid) !=="undefined"){

          networkName ="AP: "+ nodesMap.get($.trim(AP[0])).essid;
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
  }


  hideDetails = function(d,i){
    tooltip.hideTooltip();
  }

    return network
}
