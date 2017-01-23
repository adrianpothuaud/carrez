/**
* Imports and requirements
**/
var http = require('http'); // http server
var fs = require('fs'); // file system module
var formidable = require("formidable"); // tool module for forms
var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile')
var leboncoin = require('./leboncoin');

var url;

/**
* Main method
**/
var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processForm(req, res);
    }
});

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processForm(req, res) {
  //Store the data from the fields in your data store.
  //The data store could be a file or database or any other store based
  //on your application.
  var fields = [];
  var form = new formidable.IncomingForm();

  form.on('field', function (field, value) {
      fields[field] = value;
  });

  form.on('end', function () {
      url = fields.url;
      console.log("received from form: " + url);
      leboncoin.request(url);

  });
  form.parse(req);
}

server.listen(8080);
console.log("server listening on 8080");
