var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var meilleursagents = require('./meilleursagents');

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

exports.request = function(url) {
  console.log('going to leboncoin');

  request(url, function(error, response, html){

      // First we'll check to make sure no errors occurred when making the request

      if(!error){
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
          console.log("No err, parsing the html page");

          var $ = cheerio.load(html);

          // Finally, we'll define the variables we're going to capture

          var city, zip, price, surface, type;
          var json = { city : "", zip : "", price : "", surface : "", type : ""};

          $('.properties .line .item_price').each(function() {
              console.log("Found price: " + $(this).attr("content"));
              price = $(this).attr("content");
          });

          $('.line_city .clearfix .value').each(function() {
              //console.log("Found address: " + $(this).text());
              var list = $(this).text().split(' ').clean(undefined).clean('');
              //console.log(list);
              var list_size = list.length;
              //console.log(list_size);
              city = list[0];
              for(var i = 1; i < list_size-1; i++){
                city += list[i];
              }
              zip = parseInt(list[list_size - 1]);
              console.log("City: " + city + ", ZIP: " + zip);
          });

          $('.line .clearfix .property').each(function() {
              //console.log($(this).parent());
              //console.log($(this).parent().text());
              if($(this).text() === 'Type de bien'){
                  //console.log('Found type de bien tag');
                  //console.log($(this).next().text());
                  type = $(this).next().text();
              }
          });

          $('.line .clearfix .value sup').each(function() {
              //console.log($(this).parent());
              //console.log($(this).parent().text());
              surface = parseInt($(this).parent().text().split(' ')[0]);
              console.log("Found surface-area: " + surface + " squared meters");
          });

          json.city = city;
          json.zip = zip;
          json.price = price;
          json.surface = surface;
          json.type = type;

          fs.writeFileSync("./lbc_data.json", JSON.stringify(json));

          console.log("Data stored in ./lbc_data.json");
      }

      meilleursagents.request();
  })
};
