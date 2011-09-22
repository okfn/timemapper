SimileAjax.History.enabled = false;
var datasets = [
  {
      id: "artists",
      title: "Artists",
      theme: "orange",
      // note that the lines below are now the preferred syntax
      type: "basic",
      options: {
          items: [
              {
                "start" : "1449",
                "end" : "1494-01-11",
                "point" : {
                    "lat" : 43.7717,
                    "lon" : 11.2536
                 },
                "title" : "Domenico Ghirlandaio",
                "options" : {
                  // set the full HTML for the info window
                  "infoHtml": "<div class='custominfostyle'><b>Domenico Ghirlandaio</b> was a visual artist of some sort.</div>"
                }
              },
              {
                "start" : "1452",
                "end" : "1519",
                "point" : {
                    "lat" : 43.8166666667,
                    "lon" : 10.7666666667
                 },
                "title" : "Leonardo da Vinci",
                "options" : {
                  // load HTML from another file via AJAX
                  // Note that this may break in IE if you're running it with
                  // a local file, due to cross-site scripting restrictions
                  "infoUrl": "ajax_content.html",
                  "theme": "red"
                }
              },
              {
                "start" : "1475",
                "end" : "1564",
                "point" : {
                    "lat" : 43.6433,
                    "lon" : 11.9875
                 },
                "title" : "Michelangelo",
                "options" : {
                  // use the default title/description info window
                  "description": "Renaissance Man",
                  "theme": "yellow"
                }
              }
          ]
      }
  }
];

$(function() {
var tm;

try {
  tm = TimeMap.init({
    mapId: "map",               // Id of map div element (required)
    timelineId: "timeline",     // Id of timeline div element (required)
    datasets: datasets,
    options: {
      eventIconPath: "../images/"
    },
    bandIntervals: [
        Timeline.DateTime.DECADE, 
        Timeline.DateTime.CENTURY
    ]
  });
} catch (e) {
  // console.log(e);
}
});

