if (localStorage.getItem("avgreviews")) {
	window.visualize = JSON.parse(localStorage.getItem("avgreviews"));
    var keys =Object.keys(window.visualize);
    populatedrodown();
}
else{
	$(document).ready(function() {
    	$.ajax({
            type: "GET",
        	url: "file:///C:/Users/patin/Desktop/bdad/projects/output/AverageReviews/part-00000-6ac33c6b-db6e-4e3a-819d-d6919fecd3f3-c000.csv",
        	dataType: "text",
        	crossDomain: true,
        	success: function(data) {processData(data);},
 		});
	});

    function processData(data) {
        var allTextLines = data.split("\n");
        var lines = {};
        var options = [];
        var output = {};
        for(var i=0;i<allTextLines.length;i++){
            line = allTextLines[i].split(",");
            if (lines.hasOwnProperty(line[0])) {
                if (Number(line[1])>2010) {
                    lines[line[0]].push({
                        "date": line[1]+"-"+line[2],
                        "close": Number(line[3]),
                        "count": Number(line[4])
                    })
                }
            }
            else{
                if (Number(line[1])>2010) {
                    lines[line[0]] = [{
                        "date": line[1]+"-"+line[2],
                        "close": Number(line[3]),
                        "count": Number(line[4])
                    }]
                }
            }   
        }
        var keys = Object.keys(lines);
        var j=0;
        for(var i=0;i<keys.length;i++){
            if (j<10 && lines[keys[i]].length>=95) {
                output[keys[i]] = lines[keys[i]];
                j++; 
            }
        }
        localStorage.setItem("avgreviews",JSON.stringify(output));
        window.visualize = output;
        console.log(output);
        populatedrodown();
    }
}



function drawgraph(data) {
    
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = $(document).width()/1.5 - margin.left - margin.right,
    height = $(document).height()/1.5 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y-%m").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });
    
// Adds the svg canvas
var svg = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.close = +d.close;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.close; })]);

    // Add the valueline path.
    svg.append("path")      // Add the valueline path.
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")         // Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")         // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);

}



function populatedrodown(){
    var option = "";
    var keys = Object.keys(window.visualize);
    for (var i=0;i<keys.length;i++){
        option += '<option value="'+ keys[i] + '">' + keys[i] + '</option>';
        
    }
    $('#items').append(option);
    getData();
}
$('#items').on('change', function() {
      getData();
});

function getData(){
    $('#chart').html('');
    var data = JSON.parse(JSON.stringify(window.visualize[$('#items').val()]))
    drawgraph(data);
}


function showremi(){
    var bid = $('#items').val();
    var arr = window.visualize[bid];
    arr.sort((a, b) => (a.close > b.close) ? 1 : -1);

    modalbody = "<h5>Rating Analysis</h5><p>When you did well: "+arr[arr.length-1].date+" ,"+arr[arr.length-2].date+", "+arr[arr.length-3].date+"</p><p> When you had scope for improvement: "+arr[0].date+" ,"+arr[1].date+", "+arr[2].date+"</p>"
    $('.modal-body').html('');
    $('.modal-body').append(modalbody);

}