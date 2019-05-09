var files = ["file:///C:/Users/patin/Desktop/bdad/projects/output/wordcloud/wordcloud_4JNXUYY8wbaaDmk3BPzlWw/cloud.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/wordcloud/wordcloud_cYwJA2A6I12KNkm2rtXd5g/cloud.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/wordcloud/wordcloud_f4x1YBxkLrZg652xt2KR5g/cloud.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/wordcloud/wordcloud_K7lWdNUhCbcnEvI0NhGewg/cloud.csv","file:///C:/Users/patin/Desktop/bdad/projects/output/wordcloud/wordcloud_RESDUcs7fIiihp38-d6_6g/cloud.csv"]
var map = ["4JNXUYY8wbaaDmk3BPzlWw","cYwJA2A6I12KNkm2rtXd5g","f4x1YBxkLrZg652xt2KR5g","K7lWdNUhCbcnEvI0NhGewg","RESDUcs7fIiihp38-d6_6g"]
window.visualize = {}
words = {"steak":1,"egg":1,"soup":1,"frites":1,"brunch":1,"salad":1,"crepe":1,"salmon":1,"filet":1,"chicken":1,"scallop":1,"benedict":1,"sandwich":1,"baguette":1,"beef":1,"coffee":1,"seafood":1,"burgers":1,"truffle":1,"bacon":1,"poppers":1,"meat":1,"duck":1,"bun":1,"waffle":1,"hash":1,"sage":1,"potatoes":1,"biscuit":1,"mash":1,"dessert":1,"chocolate":1,"sushi":1,"mac":1,"cheese":1,"shrimp":1,"strawberries":1,"pork":1,"crab":1,"rib":1,"oyster":1,"chinese":1,"asian":1,"mexican":1,"italian":1,"lamb":1,"pizza":1,"american":1,"pho":1}

function drawWordCloud(data){
  $('#chart').html('');
  word_count=data;
  var svg_location = "#chart";
  var width = $(document).width()/2;
  var height = $(document).height()/1.5;

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




function populateselect() {
  var option = "";
  for (var i=0;i<map.length;i++){
        option += '<option value="'+ map[i] + '">' + map[i] + '</option>';
  }
  $('#items').append(option);
}

$(document).ready(function() {
      populateselect();
      if (localStorage.getItem("data")) {
        window.visualize = JSON.parse(localStorage.getItem("data"));
        console.log("get");
        plotWordCloud();
      }
      else{
        console.log("setiing")
        getFiles(0);
      }

      $('#items').on('change', function() {
        plotWordCloud();
      });
});

function plotWordCloud() {
  var bid = $( "#items" ).val();
  drawWordCloud(window.visualize[bid]);
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
  window.visualize[map[i]] = {};
  for(var j=0;j<allTextLines.length;j++){
    var line = allTextLines[j].split(",");
    window.visualize[map[i]][line[0]] = Number(line[1]);
  }
  i++;
  if (i<5) {
    getFiles(i);
  }
  if (i==5) {
    localStorage.setItem("data",JSON.stringify(window.visualize));
    plotWordCloud()
  }
}



function showremi() {
  var bid = $('#items').val();
  $('.modal-body').html('');
  var text = "<h5><u>Things to try!!!</u></h5>"
  var keys = Object.keys(window.visualize[bid]);
  for (var i = 0; i < keys.length; i++) {
    if(words.hasOwnProperty(keys[i])){
      text += "<p>"+keys[i]+"</p>"
    }
  }
  $('.modal-body').append(text);
}