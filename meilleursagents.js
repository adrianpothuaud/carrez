var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var fs = require('fs');

/**
* Array cleaner utility
* overwriting array by adding a clean method
* delete all elements containing the given delete value
* ex: myArray.clean(undefined).clean('');
**/
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

exports.request = function() {
  console.log('going to meilleurs agents');

  var lbc_json = require('./lbc_data.json');

  console.log("lbc_json:");
  console.log(lbc_json);

  var urlSuf = lbc_json.city.toLowerCase() + "-" + lbc_json.zip.toString();
  console.log("url suffix:");
  console.log(urlSuf);

  request("https://www.meilleursagents.com/prix-immobilier/" + urlSuf + "/", function(error, response, html){

      console.log('new request');

      // First we'll check to make sure no errors occurred when making the request

      if(!error){
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
          console.log("No err, parsing the html page");

          var $ = cheerio.load(html);

          // Finally, we'll define the variables we're going to capture

          var moyPriceList = [];

          $('.row.baseline--half .prices-summary__cell--median').each(function() {
            var item = $(this).text().split(' ').clean(undefined).clean('').clean('\n').clean('&euro;\n')[0];
            console.log('1 row read');
            console.log(item);
            moyPriceList.push(item);
          });

          json2 = new Object();
          json2.offer = new Object();
          json2.offer.price = lbc_json.price;
          json2.offer.surface = lbc_json.surface;
          json2.offer.type = lbc_json.type;
          json2.offer.smp = json2.offer.price / json2.offer.surface;

          json2.avSmpHouse = moyPriceList[1];
          json2.avSmpFloor = moyPriceList[0];

          jsonfile.writeFile('./ma_data.json', json2, function (err) {
            if(err){
              console.error(err);
            }
          })
      }
  })
};