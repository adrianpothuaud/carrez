var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var lbc_scrap = require('./lbc_scrap');
var ma_scrap = require('./ma_scrap');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/**
*   GET method on main page
*   display form
**/
app.get('/', function (req, res) {
  console.log("REQUEST on main page");
  var contents = fs.readFileSync('./url_form.html').toString();
  res.writeHead(200, {
      'Content-Type': 'text/html',
          'Content-Length': contents.length
  });
  res.write(contents);
  res.end();
})

/**
Processing form on main page
**/
app.post('/', function (req, res) {
  console.log("POST on main page");
  var url = req.body.lbc_url;
  var tolerance = req.body.tolerance;
  var save = req.body.save;
  var lbc_json = new Object();
  lbc_scrap.request(url, tolerance, res);
  Object.keys(require.cache).forEach(function(key) { delete require.cache[key]; });
})

/*
Processing data from scrapping
*/
app.get('/scrapped', function(req, res) {
  console.log("REQUEST on scrapped page");
  res.writeHead(200, {
      'Content-Type': 'text/html'
  });

  res.write("<!DOCTYPE html>"
            +"<html>"
            +"<head>"
            +"<title>Deal Scrapped</title>"
            +"<meta charset=\"utf-8\"/>"
            +"<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">"
            +"<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">"
            +"<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>"
            +"<script>"
            +"function toggle(anId)"
            +"{"
            +"node = document.getElementById(anId);"
            +"if (node.style.visibility==\"hidden\")"
            +"{"
            +"node.style.visibility = \"visible\";"
            +"node.style.height = \"aut\";}"
            +"else{"
            +"node.style.visibility = \"hidden\";"
            +"node.style.height = \"0\";}}"
            +"</script>"
            +"</head>"
            +"<body>"
            +"<div class=\"jumbotron\">"
            +"<div class=\"container\">"
            +"<nav>"
            +"<ul class=\"nav nav-pills\">"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/\">Home</a></li>"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/listRentals/\">Saved Ads</a></li>"
            +"</ul>"
            +"</nav>");

  var offerSmp = req.query.smp;
  var offerType = req.query.type;
  var maSmp = (offerType==='Appartement')?req.query.avSmpFloor:req.query.avSmpHouse;

  var percentage = req.query.tolerance;
  var diffSmp = offerSmp - maSmp;

  var goodOrNot = (diffSmp<=(percentage*maSmp));

  res.write("<img src=\"" + req.query.img + "\" class=\"img-responsive img-thumbnail\">")

  res.write("<h1>Deal evaluation</h1>")

  if(goodOrNot) {
    res.write("<p>A good deal for you !</p>");
    res.write("<form method=\"post\" action=\"http://localhost:3000/save\">"
              +"<input type=\"text\" required name=\"rname\" placeholder=\"Rental name\" id=\"rname\">"
              +"<input type=\"hidden\" name=\"type\" value=\""+req.query.type+"\">"
              +"<input type=\"hidden\" name=\"city\" value=\""+req.query.city+"\">"
              +"<input type=\"hidden\" name=\"zip\" value=\""+req.query.zip+"\">"
              +"<input type=\"hidden\" name=\"surface\" value=\""+req.query.surface+"\">"
              +"<input type=\"hidden\" name=\"price\" value=\""+req.query.price+"\">"
              +"<input type=\"hidden\" name=\"url\" value=\""+req.query.url+"\">"
              +"<input type=\"hidden\" name=\"img\" value=\""+req.query.img+"\">"
              +"<button type=\"submit\">Save this rental</button></form>");
    res.write("<br/><br/>");
  }

  else {
    res.write("<p>Not a good deal for you !</p>");
  }

  res.write("<button onclick = \"toggle('foo')\">Toggle Details</button>");
  res.write("</div></div>");

  res.write('<div id=\'foo\'><h1>Results from Leboncoin</h1>'
            +'<a href=\''+req.query.url+'\'>Leboncoin url</a>'
            +'<ul><li>Type: '+req.query.type+'</li>'+
            '<li>City: '+req.query.city+'</li>'
            +'<li>Zip code: '+req.query.zip+'</li>'
            +'<li>Surface: '+req.query.surface+'m<sup>2</sup></li>'
            +'<li>Price: '+req.query.price+'&euro;</li>'
            +'<li>Tolerance: '+req.query.tolerance*100+'%</li>'
            +'<li>Price by squared meter: '+req.query.smp+'&euro;.m<sup>-2</sup></li></ul>');

  res.write('<h1>Results from MeilleursAgents</h1>'
            +'<a href=\''+req.query.ma_url+'\'>MeilleursAgents url</a>'
            +'<ul><li>Regional average for houses: '+req.query.avSmpHouse+'&euro;.m<sup>-2</sup></li>'
            +'<li>Regional average for appartments: '+req.query.avSmpFloor+'&euro;.m<sup>-2</sup></li></ul>'
            +'</div>');

  res.end("</body>"
          +"<script type=\"text/javascript\">"
          +"node = document.getElementById('foo');"
          +"node.style.visibility = \"hidden\";"
          +"node.style.height = \"0\";"
          +"</script>"
          +"</html>");
})

/**
Processing save rental
**/
app.post('/save', function (req, res) {
  console.log("POST on save page");
  var nouv = new Object();
  nouv.name = req.body.rname;
  nouv.type = req.body.type;
  nouv.city = req.body.city;
  nouv.zip = req.body.zip;
  nouv.surface = req.body.surface;
  nouv.price = req.body.price;
  nouv.url = req.body.url;
  nouv.img = req.body.img;
  var json = JSON.parse(fs.readFileSync('./rentals.json').toString())
  var rentals = Object.values(json);
  rentals.push(nouv);
  fs.writeFileSync("./rentals.json", JSON.stringify(rentals));
  res.redirect('/'+req.body.rname);
})

/*
  View a list of saved rentals
*/
app.get('/listRentals', function (req, res) {
  console.log("REQUEST on listRentals page");
      res.writeHead(200, {
      'Content-Type': 'text/html'
  });

  res.write("<!DOCTYPE html>"
            +"<html>"
            +"<head>"
            +"<title>Saved Ads</title>"
            +"<meta charset=\"utf-8\"/>"
            +"<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">"
            +"<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">"
            +"<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>"
            +"</head>"
            +"<body>"
            +"<div class=\"jumbotron\">"
            +"<div class=\"container\">"
            +"<nav>"
            +"<ul class=\"nav nav-pills\">"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/\">Home</a></li>"
            +"<li role=\"presentation\" class=\"active\"><a href=\"http://localhost:3000/listRentals/\">Saved Ads</a></li>"
            +"</ul>"
            +"</nav>");
  res.write("<h1>My Ads</h1>");

    var json = JSON.parse(fs.readFileSync('./rentals.json').toString())
    var rentals = Object.values(json);
    if(rentals.length===0) {
      res.write("<p>You have no ads saved yet...</p>")
    }
    rentals.forEach(function(element) {
      res.write("<p>"
                +"<b><a href=\"http://localhost:3000/"+element.name+"\">"+element.name+"</a></b> "
                +element.city+", "
                +element.zip+". "
                +element.surface+"m<sup>2</sup> "
                +element.price+"&euro;"
                +"</p>");
    });


    res.end("</div>"
          +"</div>"
          +"</body>"
          +"</html>");
})

/*
  View rental details
*/
app.get('/:rname', function (req, res) {
  console.log("REQUEST on " + req.params.rname + "details page");
    res.writeHead(200, {
      'Content-Type': 'text/html'
  });

  res.write("<!DOCTYPE html>"
            +"<html>"
            +"<head>"
            +"<title>Deal Scrapped</title>"
            +"<meta charset=\"utf-8\"/>"
            +"<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">"
            +"<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">"
            +"<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>"
            +"</head>"
            +"<body>"
            +"<div class=\"jumbotron\">"
            +"<div class=\"container\">"
            +"<nav>"
            +"<ul class=\"nav nav-pills\">"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/\">Home</a></li>"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/listRentals/\">Saved Rentals</a></li>"
            +"</ul>"
            +"</nav>");

    // First read existing rentals.
    var json = JSON.parse(fs.readFileSync('./rentals.json').toString())
    var rentals = Object.values(json);
    rentals.forEach(function(element){
      if(element.name===req.params.rname) {
        res.write("<h1>" + element.name + "</h1>"
                  +"<h3><i>" + element.type + "</i></h3>"
                  +"<h4>" + element.city + ", " + element.zip + "</h4>"
                  +"<h4>" + element.surface + " m<sup>2</sup> " + element.price + "&euro;</h4>");
        res.write("<a href=\"" + element.url + "\"><img src=\""+element.img+"\"class=\"img-responsive img-thumbnail\"></a>");
      }
    });

    res.write("<br/><br/>");

    res.write("<form method=\"post\" action=\"http://localhost:3000/delete\">"
              +"<input type=\"hidden\" name=\"rname\" value=\""+req.params.rname+"\">"
              +"<button type=\"submit\">Delete this rental</button></form>")

    res.end("</div>"
          +"</div>"
          +"</body>"
          +"</html>");
})

/*
  Delete a rental
*/
app.post('/delete', function (req, res) {

  console.log("POST on delete for " + req.body.rname);

  var json = JSON.parse(fs.readFileSync('./rentals.json').toString())
  var rentals = Object.values(json);
  var i;
  rentals.forEach(function(element){
      if(element.name===req.body.rname) {
        i = rentals.indexOf(element);
        console.log("Found element at position " + i);
      }
    });
  // if(i===0){
  //   rentals = rentals.splice(i,i);
  // }
  // else{
  //   rentals.splice(i,i);
  // }
  rentals.splice(i,i);
  fs.writeFileSync("./rentals.json", JSON.stringify(rentals));
  res.redirect('/listRentals/');
   
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
