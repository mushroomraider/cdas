let table = null;
let headings = null;
let paidCodes = ["PUP", "PUX46", "DEX02", "DEX04"];
let outputHolder = null;

let routes;

function setup() {
  let c = createCanvas(150, 150);
  background(200);
  textAlign(CENTER);
  textSize(20);
  text('drop file', width / 2, height / 2);
  c.drop(gotFile);
}

function gotFile(file) {
  background(200);
  text('received file:', width / 2, height / 2);
  textSize(8);
  text(file.name, width / 2, height / 2 + 50);
  makeTable(file.data)
}
function makeTable(data){
  lines = data.split("\n");
  table = [];
  for (let i in lines){
    if (lines[i].length < 3) continue;
    let line = lines[i].split('","');
    for (let j in line){
      line[j] = line[j].replaceAll('"', '');
    } 
    if (i == 0){
      headings = line;
      continue;
    }
    let lineDict = {};
    for (let j = 0; j < headings.length; j++){
      lineDict[headings[j]] = line[j];
    }
    table.push(lineDict);
  }
  processInfo();
}

function processInfo(){
  routes = {};
  for (let line of table){
    print(line);
    let route = line["Route"];
    // print("route:" + route);
    if (!routes.hasOwnProperty(route)) routes[route] = {pd:0, pc:0, nd:0, nc:0, usedStopIds:[], errors:[]};
  }
  for (let line of table){
    let routeKey = line["Route"];
    let stopId = line["Stop ID"];
    route = routes[routeKey];
    if (route.usedStopIds.includes(stopId)) continue;
    route.usedStopIds.push(stopId);
    if (line["Stop Type"] === "Delivery" && line["Payable Stop"] === "Y") route.pd++;
    else if (line["Stop Type"] === "Delivery" && line["Payable Stop"] === "N") route.nd++;
    else if (line["Stop Type"] === "PickUp" && line["Payable Stop"] === "Y") route.pc++;
    else if (line["Stop Type"] === "PickUp" && line["Payable Stop"] === "N") route.nc++;
    else route.error(stopId + " invalid");
  }
  drawInfo(table[1]["Stop Date"]);
}

function drawInfo(stopDate){
  print("drawInfo");
  print(routes);
  if (outputHolder != null) outputHolder.remove();
  outputHolder = createDiv();
  outputHolder.parent("holder");
  let t = "";
  t += "<p>Routes: &nbsp;";
  for (let routeKey in routes){
    t+= routeKey + " &nbsp;&nbsp;&nbsp;";
  }
  t += "</p><p></p>";
  let headers = ["Date", "Route", "Payable Deliveries", "Payable Collections", "All Nos"];
  t += "<table><tr>";
  for (let h of headers){
    t+= "<th>" + h + "</th>";
  }
  t += "</tr>";

  let pdTotal = 0;
  let pcTotal = 0;
  let ndTotal = 0;
  let ncTotal = 0;

  for (let routeKey in routes){
    route = routes[routeKey];
    pdTotal += route.pd;
    pcTotal += route.pc;
    ndTotal += route.nd;
    ncTotal += route.nc;
    t+= "<tr>";
    t+= "<td>" + stopDate + "</td>";
    t+= "<td>" + routeKey + "</td>";
    t+= "<td>" + route.pd + "</td>";
    t+= "<td>" + route.pc + "</td>";
    t+= "<td>" + str(route.nd + route.nc) + "</td>";
    // t+= "<td>" + route.nd + "</td>";
    // t+= "<td>" + route.nc + "</td>";

    t+= "</tr>";
  }  
  t+= "<tr>";
  t+= "<td>Totals</td>";
  t+= "<td></td>";
  t+= "<td>" + pdTotal + "</td>";
  t+= "<td>" + pcTotal + "</td>";
  t+= "<td>" + str(ndTotal + ncTotal) + "</td>";
  // t+= "<td>" + ndTotal + "</td>";
  // t+= "<td>" + ncTotal + "</td>";  
  t+= "</tr>";  



  t += "</table>";
  t += "</p>";
  let count = 0;


  let errors = "";
  for (let route in routes){
    for (let e of routes[route].errors){
      errors += e + "<br>";
      count++;
    }
  }
  if (count < 1) t+="No Errors Found";
  else t+= "<p>Errors found:<br>" + errors + "</p>";


  let inner = createDiv(t);
  inner.parent(outputHolder);
  inner.class("output");
  
  
}
