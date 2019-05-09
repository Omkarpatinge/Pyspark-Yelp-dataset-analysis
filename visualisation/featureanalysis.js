var files = ["file:///C:/Users/patin/Desktop/bdad/projects/output/2gramfeatures/4JNXUYY8wbaaDmk3BPzlWw_features/2gram.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/2gramfeatures/twogramfeatures_RESDUcs7fIiihp38-d6_6g/2gram.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/2gramfeatures/twogramfeatures_cYwJA2A6I12KNkm2rtXd5g/2gram.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/2gramfeatures/twogramfeatures_f4x1YBxkLrZg652xt2KR5g/2gram.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/2gramfeatures/twogramfeatures_K7lWdNUhCbcnEvI0NhGewg/2gram.csv"]
var map = ["4JNXUYY8wbaaDmk3BPzlWw","RESDUcs7fIiihp38-d6_6g","cYwJA2A6I12KNkm2rtXd5g","f4x1YBxkLrZg652xt2KR5g","K7lWdNUhCbcnEvI0NhGewg"]
window.visualize = {}

function populatedrodown(){
    var option = "";
    var keys = Object.keys(window.visualize);
    for (var i=0;i<keys.length;i++){
        option += '<option value="'+ keys[i] + '">' + keys[i] + '</option>';
        
    }
    $('#items').append(option);
    plot();
}

$(document).ready(function() {
      if (localStorage.getItem("data")) {
        window.visualize = JSON.parse(localStorage.getItem("data"));
        console.log("get");
        populatedrodown();
      }
      else{
        console.log("setiing")
        getFiles(0);
      }

      $('#items').on('change', function() {
        plot();
      });
});

function plotcchart(bid) {
	var temp = {
		animationEnabled: true,
		theme: "light2", // "light1", "light2", "dark1", "dark2"
		title:{
			text: "Factors"
		},
		axisY: {
			title: "Effectiveness"
		},
		axisX:{
			labelFontSize:15,
			interval: 1
		}
	}
	
	
	temp.data=[]
	for (var i = 0; i < window.visualize[bid].length; i++) {
		if (i==0) {
			temp.data.push({type: "column",  
			color:"red",
			dataPoints: [{x: i+1, y: window.visualize[bid][i].y, label: window.visualize[bid][i].label }]})
		}
		else if (i>0 && i<window.visualize[bid].length/2) {
			temp.data[0].dataPoints.push({
				x: i+1, y: window.visualize[bid][i].y, label: window.visualize[bid][i].label
			})
		}
		else if (i==window.visualize[bid].length/2) {
			temp.data.push({type: "column",  
			color:"blue",
			dataPoints: [{x: i+1, y: window.visualize[bid][i].y, label: window.visualize[bid][i].label }]})
		}
		else{
			temp.data[1].dataPoints.push({
				x: i+1, y: window.visualize[bid][i].y, label: window.visualize[bid][i].label
			})
		}
	}	
	
	var chart = new CanvasJS.Chart("chartContainer", temp );
	chart.render();

}

function plot() {
	/*if($('#items').val()){*/
		bid = $('#items').val();
	/*}
	else{
		bid = map[0];	
	}*/
	plotcchart(bid);
	drawWordCloud(wcdata("pos",bid),"#wchart1",bid);
	drawWordCloud(wcdata("neg",bid),"#wchart2",bid);
}
function wcdata(type,bid) {
	var returnobj = {}
	if (type === "neg") {
		for (var i = 0; i < window.visualize[bid].length/2; i++) {
			returnobj[window.visualize[bid][i].label] = -100*Number(window.visualize[bid][i].y)
		}
	}
	else{
		for (var i = window.visualize[bid].length/2; i < window.visualize[bid].length; i++) {
			returnobj[window.visualize[bid][i].label] = 100*Number(window.visualize[bid][i].y)
		}	
	}
	return returnobj;
}

function drawWordCloud(data,id){
  $(id).html('');
  word_count=data;
  var svg_location = id;
  var width = 800;
  var height = 600;

  var fill = d3.scale.category20();

  var word_entries = d3.entries(word_count);

  var xScale = d3.scale.linear()
     .domain([0, d3.max(word_entries, function(d) {
        return d.value;
      })
     ])
     .range([10,100]);

  d3.layout.cloud().size([width, height])
    .timeInterval(20)
    .words(word_entries) 
    .fontSize(function(d) { return xScale(+d.value); })
    .text(function(d) { return d.key; })
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .on("end", draw)
    .start();

  function draw(words) {
    d3.select(svg_location).append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return xScale(d.value) + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.key; });
  }

  d3.layout.cloud().stop();
}



function getFiles(i) {
  if (i>5) {
    return;
  }
  $.ajax({
          type: "GET",
          url: files[i],
          dataType: "text",
          crossDomain: true,
          success: function(data) {processData(data,i);},
    });
}

function processData(data,i) {
  var allTextLines = data.split("\n");
  window.visualize[map[i]] = [];
  for(var j=0;j<allTextLines.length;j++){
    var line = allTextLines[j].split(",");
    if (line[0].split(" ")[0].length<20 && line[0].split(" ")[1] && line[0].split(" ")[1].length<20) {
	    window.visualize[map[i]].push({
	    	y: Number(line[1])*100,
	    	label: line[0]
	    })
    }
  }
  window.visualize[map[i]].sort((a, b) => (a.y > b.y) ? 1 : -1)
  var temp = window.visualize[map[i]].slice(0,20);
  var temp2 = window.visualize[map[i]].slice(window.visualize[map[i]].length-21,window.visualize[map[i]].length-1);
  window.visualize[map[i]] = temp.concat(temp2);
  i++;
  if (i<5) {
    getFiles(i);
  }
  if (i==5) {
    localStorage.setItem("data",JSON.stringify(window.visualize));
    populatedrodown()
  }
}