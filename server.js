// Requirements
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
*   display form from form.html
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
  do leboncoin scrapping
  then meilleursagents scrapping
  then redirect to /scrapped and sends results
**/
app.post('/', function (req, res) {
  console.log("POST on main page");
  lbc_scrap.request(req.body.lbc_url, req.body.tolerance, res);
  // refresh
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
            +"<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js\"></script>"
            +"<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\"></script>"
            +"<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>"
            +"</head>"
            +"<body>"
            +"<div class=\"jumbotron\">"
            +"<div class=\"container\">"
            +"<nav>"
            +"<ul class=\"nav nav-pills\">"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/\">Home</a></li>"
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/listRentals/\">Saved Ads</a></li>"
            +"<li role=\"presentation\" class=\"active\"><a href=\"#\">Scrap summary</a></li>"
            +"</ul>"
            +"</nav>");

  res.write("<div class=\"container\">"
            +"<br/><br/>"
            +"</div>");

  var offerSmp = req.query.smp;
  var offerType = req.query.type;
  var maSmp = (offerType==='Appartement')?req.query.avSmpFloor:req.query.avSmpHouse;

  var percentage = req.query.tolerance;
  var diffSmp = offerSmp - maSmp;

  var goodOrNot = (diffSmp<=(percentage*maSmp));

  res.write("<div class=\"container\">"
          +"<div class=\"row\">");

  res.write("<div class=\"col\">");

  res.write("<div class=\"media\"><a href=\""+req.query.url+"\"><img src=\"" + req.query.img + "\" class=\"img-responsive img-thumbnail\" width=\"30%\" height=\"30%\"></a></div>");

  res.write("</div>");

  res.write("<div class=\"col\">");

  res.write("<h1>Deal evaluation</h1>");

  if(goodOrNot) {
    res.write("<p><i>This ad seems to be a good deal for you !</i></p>");
    res.write("<form method=\"post\" action=\"http://localhost:3000/save\">"
              +"<input type=\"text\" required class=\"form-control\" name=\"rname\" placeholder=\"Give this ad a nickname\" id=\"rname\">"
              +"<input type=\"hidden\" name=\"type\" value=\""+req.query.type+"\">"
              +"<input type=\"hidden\" name=\"city\" value=\""+req.query.city+"\">"
              +"<input type=\"hidden\" name=\"zip\" value=\""+req.query.zip+"\">"
              +"<input type=\"hidden\" name=\"surface\" value=\""+req.query.surface+"\">"
              +"<input type=\"hidden\" name=\"price\" value=\""+req.query.price+"\">"
              +"<input type=\"hidden\" name=\"url\" value=\""+req.query.url+"\">"
              +"<input type=\"hidden\" name=\"img\" value=\""+req.query.img+"\"><br/>"
              +"<button type=\"submit\" class=\"btn btn-success btn-lg\" aria-label=\"Left Align\">"
      +"<span class=\"glyphicon glyphicon-thumbs-up\" aria-hidden=\"true\"></span>"
      +"&nbsp;&nbsp;Save"
      +"</button></form>");
    res.write("<br/><br/>");
  }

  else {
    res.write("<button type=\"button\" class=\"btn btn-danger btn-lg\" aria-label=\"Left Align\">"
      +"<span class=\"glyphicon glyphicon-thumbs-down\" aria-hidden=\"true\"></span>&nbsp;Bad deal"
      +"</button><br/><br/>");
  }

  res.write("</div>");

  res.write("</div>");

  res.write("</div>");

  res.write("<div class=\"container\">"
              +"<div class=\"panel-group\">"
                +"<div class=\"panel panel-default\">"
                  +"<div class=\"panel-heading\">"
                    +"<h4 class=\"panel-title\">"
                      +"<h2><span class=\"label label-primary\"><a data-toggle=\"collapse\" href=\"#collapse1\" class=\"label\">Toggle Details</a></span></h2>"
                    +"</h4>"
                  +"</div>"
                  +"<div id=\"collapse1\" class=\"panel-collapse collapse\">"
                    +"<ul class=\"list-group\">"
                      +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">City</span>"+req.query.city+", "+req.query.zip+"</li>"
                      +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Surface</span>"+req.query.surface+"m<sup>2</sup></li>"
                      +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Price</span>"+req.query.price+"&euro;</li>"
                      +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">&euro;.m<sup>-2</sup></span>"+parseInt(req.query.smp)+"&euro;.m<sup>-2</sup></li>"
                      +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Average price house</span>"+req.query.avSmpHouse+"&euro;.m<sup>-2</sup></li>"
                      +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Average price appartment</span>&nbsp;"+req.query.avSmpFloor+"&euro;.m<sup>-2</sup></li>"
                    +"</ul>"
                  +"<div class=\"panel-footer\">"
                    +"<p><i>Those informations are obtained from <a href=\"https://www.leboncoin.fr/\">leboncoin</a> and <a href=\"https://www.meilleursagents.com/\">meilleursagents<a>.</i></p>"
                  +"</div>"
                +"</div>"
              +"</div>"
            +"</div>"
          +"</div>");

  res.write("</div></div>");

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
  res.write("<p><i>All your good deals are saved here !</i></p>");

    var json = JSON.parse(fs.readFileSync('./rentals.json').toString())
    var rentals = Object.values(json);
    if(rentals.length===0) {
      res.write("<p>You have no ads saved yet...</p>")
    }
    else{
      res.write("<ul class=\"list-group\">");
      rentals.forEach(function(element) {
      res.write("<li class=\"list-group-item\">"
                +"<b><a href=\"http://localhost:3000/"+element.name+"\">"+element.name+"</a></b> "
                +"&nbsp;&nbsp;&nbsp;&nbsp;"
                +element.city+" "
                +element.zip
                +"<span class=\"badge\">"+element.price+"&euro;</span>"
                +"</li>");
      });
      res.write("</ul>");
    }
  
    res.end("</div>"
          +"</div>"
          +"</body>"
          +"</html>");
})

/*
  View rental details
*/
app.get('/:rname', function (req, res) {
  console.log("REQUEST on " + req.params.rname + " details page");
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
            +"<li role=\"presentation\"><a href=\"http://localhost:3000/listRentals/\">Saved Ads</a></li>"
            +"<li role=\"presentation\" class=\"active\"><a href=\"#\">Ad details</a></li>"
            +"</ul>"
            +"</nav>");

    // First read existing rentals.
    var json = JSON.parse(fs.readFileSync('./rentals.json').toString())
    var rentals = Object.values(json);
    rentals.forEach(function(element){
      if(element.name===req.params.rname) {
        res.write("<h1>" + element.name + " details</h1>");
        res.write("<a href=\"" + element.url + "\"><img src=\""+element.img+"\"class=\"img-responsive img-thumbnail\" width=\"30%\" height=\"30%\"></a><br/><br/>");
        res.write("<ul class=\"list-group\">"
                  +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Type</span>"+element.type+"</li>"
                  +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">City</span>"+element.city+", "+element.zip+"</li>"
                  +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Surface</span>"+element.surface+"m<sup>2</sup></li>"
                  +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Price</span>"+element.price+"&euro;</li>"
                  +"<li class=\"list-group-item\"><span class=\"label label-default pull-right\">Link</span><a href=\""+element.url+"\">ad on leboncoin</a></li>"
                +"</ul>");
      }
    });

    res.write("<br/><br/>");

    res.write("<form method=\"post\" action=\"http://localhost:3000/delete\">"
              +"<input type=\"hidden\" name=\"rname\" value=\""+req.params.rname+"\">"
              +"<button type=\"submit\" class=\"btn btn-danger\">Delete ad</button></form>")

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
  if(i===0){
    rentals.splice(0,1);
  }
  else{
    rentals.splice(i,i);
  }
  fs.writeFileSync("./rentals.json", JSON.stringify(rentals));
  res.redirect('/listRentals/');

})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
