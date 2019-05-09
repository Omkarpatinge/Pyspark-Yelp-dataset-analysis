window.visualize;
var map = {
	0:"Sunday",
	1:"Monday",
	2:"Tuesday",
	3:"Wednesday",
	4:"Thursday",
	5:"Friday",
	6:"Saturday"
}

var idmap = {
	"O3lQvyOADBs7f2W8A5D0Yg":"24 Hour Fitness - Las Vegas Tropicana",
	"DYAorbxOyubUB_wtQRCdug":"MadHouse Coffee",
	"ZjSzUWHtnpCfjsa7CksSOg":"The Signature at MGM Grand",
	"IWKtGvVg4hqc9rWHjW8KoA":"M Resort Spa Casino",
	"O6-BlCviQBIEcGW4ll6ZsQ":"The Quad Las Vegas Resort & Casino",
	"El4FC8jcawUVgw_0EIcbaQ":"MGM Grand Hotel",
	"jKmAswXvFVRHN4VP-88zOA":"Waldorf Astoria Las Vegas",
	"YBLVD61RFdP5H-RGLSIPUw":"Las Vegas Athletic Club",
	"6Q7-wkCPc1KF75jZLOTcMw":"Circus Circus Las Vegas Hotel and Casino",
	"NY80DkkCfEl198JmwtO4pA":"Harrah's Las Vegas"
	}

if (localStorage.getItem("lastname")) {
	window.visualize = JSON.parse(localStorage.getItem("lastname"));
	console.log("get");	
	populatedrodown();
}
else{
	$(document).ready(function() {
    	$.ajax({
        	type: "GET",
        	url: "file:///C:/Users/patin/Desktop/bdad/projects/output/checkinCounts/checkin.csv",
        	dataType: "text",
        	crossDomain: true,
        	success: function(data) {processData(data);},
 		});
	});

	function processData(allText) {
		var allTextLines = allText.split("\n");
		var lines = {};
		var options = [];
		var output = {};
		for(var i=0;i<allTextLines.length;i++){
			line = allTextLines[i].split(",");
			if(!lines.hasOwnProperty(line[0])){
				lines[line[0]] = {}
				var temp = Array(24).fill(0);
				temp[Number(line[2])] = Number(line[3]);
				lines[line[0]][line[1]] = temp;
				options.push(line[0])
				lines[line[0]].count = 1;
			}
			else{
				if (lines[line[0]].hasOwnProperty(line[1])) {
					lines[line[0]][line[1]][Number(line[2])] = Number(lines[line[0]][line[1]][Number(line[2])]) + Number(line[3])
				}
				else{
					var temp = Array(24).fill(0);
					temp[Number(line[2])] = Number(line[3]);
					lines[line[0]][line[1]] = temp;
				}
				lines[line[0]].count++;
			}
		}
		var j=0;
		for(var i=0;i<options.length;i++){
			if (j<10 && lines[options[i]].count>167 ) {
				output[options[i]] = JSON.parse(JSON.stringify(lines[options[i]]));
				j++;
			}
		}
		localStorage.setItem("lastname", JSON.stringify(output));
		window.visualize = output;
		populatedrodown();
		console.log("set");
	}

}

function populatedrodown(){
	var option = "";
	var keys = Object.keys(window.visualize);
	for (var i=0;i<keys.length;i++){
		if (idmap.hasOwnProperty(keys[i])) {
	   		option += '<option value="'+ keys[i] + '">' + idmap[keys[i]] + '</option>';
		}
		else{
	   		option += '<option value="'+ keys[i] + '">' + keys[i] + '</option>';
		}
	}
	$('#items').append(option);
	getData();
}
$('#items').on('change', function() {
  getData();
});

function getData(){
	setDom();
	var bid = $( "#items" ).val();
	if (!bid) {
		bid = Object.keys(window.visualize)[0];
	}
	var data = window.visualize[bid];
	for(var i = 0; i<7; i++){
		data[map[i]];
		var temp = []
		for(var j=0;j<data[map[i]].length;j++){
			temp.push({
				"hour": j,
				"quantity": data[map[i]][j]    
			})
		}
		plotgraphs(temp,map[i]);
	}

	


}


function setDom(){
	$('.slider-container').html('');
	var oltemp ='<ol class="carousel-indicators">';
	for (var i = 0; i<7; i++) {
		if (i==0) {
			oltemp += '<li data-target="#carouselExampleIndicators" data-slide-to="'+i+'" class="active"></li>'	
		}
		else{
			oltemp += '<li data-target="#carouselExampleIndicators" data-slide-to="'+i+'" ></li>'	
		}
	}
	oltemp += '</ol>';


	var coruselinner = '<div class="carousel-inner">';

	for (var i = 0; i<7; i++){
		if (i==0) {
			coruselinner += '<div class="carousel-item active test"><div style="background-color:#b0bec5;min-height: 550px;text-align: center;"><h4>'+map[i]+'</h4><div id="chartID-'+map[i]+'"></div></div></div>'
		}
		else{
			coruselinner += '<div class="carousel-item test"><div style="background-color:#b0bec5;min-height: 550px;text-align: center;"><h4>'+map[i]+'</h4><div id="chartID-'+map[i]+'"></div></div></div>'
		}
	}
	var corusel = '<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">' + oltemp + coruselinner + '</div><a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a></div>';
	$('.slider-container').append(corusel);
}

function plotgraphs(data,id){
	var margin = {top:10, right:10, bottom:90, left:10};

	var width = 660 - margin.left - margin.right;

	var height = 400 - margin.top - margin.bottom;

	var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .03)

	var yScale = d3.scale.linear()
	      .range([height, 0]);


	var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");
	      
	      
	var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left");

	var svgContainer = d3.select("#chartID-"+id).append("svg")
			.attr("width", width+margin.left + margin.right)
			.attr("height",height+margin.top + margin.bottom)
			.append("g").attr("class", "container")
			.attr("transform", "translate("+ margin.left +","+ margin.top +")");

	xScale.domain(data.map(function(d) { return d.hour; }));
	yScale.domain([0, d3.max(data, function(d) { return d.quantity; })]);


	//xAxis. To put on the top, swap "(height)" with "-5" in the translate() statement. Then you'll have to change the margins above and the x,y attributes in the svgContainer.select('.x.axis') statement inside resize() below.
	var xAxis_g = svgContainer.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (height) + ")")
			.call(xAxis)
			.selectAll("#chartID-"+id+" text");
				
	


		svgContainer.selectAll("#chartID-"+id+" .bar")
	  		.data(data)
	  		.enter()
	  		.append("rect")
	  		.attr("class", "bar")
	  		.attr("x", function(d) { return xScale(d.hour); })
	  		.attr("width", xScale.rangeBand())
	  		.attr("y", function(d) { return yScale(d.quantity); })
	  		.attr("height", function(d) { return height - yScale(d.quantity); });


	  	svgContainer.selectAll("#chartID-"+id+" .text")  		
		  .data(data)
		  .enter()
		  .append("text")
		  .attr("class","label")
		  .attr("x", (function(d) { return xScale(d.hour) + xScale.rangeBand() / 2 ; }  ))
		  .attr("y", function(d) { return yScale(d.quantity) + 1; })
		  .attr("dy", ".75em")
		  .text(function(d) { return d.quantity; }); 

}


function showremi(){
	var bid = $('#items').val();
	temp = {}
	var keys = Object.keys(window.visualize[bid]);
	modalbody = "";
	for (var i = 0; i < keys.length; i++) {
		if (keys[i] !== "count") {
			
			var arr = window.visualize[bid][keys[i]];
			max1 = arr[0];
			max1index = 0;
			min1 = arr[0];
			min1index = 0;

			for (var j = 1; j < window.visualize[bid][keys[i]].length; j++) {
			 	if(window.visualize[bid][keys[i]][j]> max1){
			 		max1 = window.visualize[bid][keys[i]][j];
			 		max1index = j;
			 	}

			 	if (window.visualize[bid][keys[i]][j] < min1) {
			 		min1 = window.visualize[bid][keys[i]][j];
			 		min1index = j;	
			 	}
			}
			modalbody += "<p>Day: "+ keys[i] + " <br> Best time to visit: " + (Number(min1index)) + ":00-"+(Number(min1index)+1)+":00 <br> Time to avoid: " + (Number(max1index) ) + ":00-"+(Number(max1index)+1)  +":00 </p>";   
		}
	}
	$('.modal-body').html('');
	$('.modal-body').append(modalbody);	
}
