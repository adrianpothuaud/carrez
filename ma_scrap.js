var request = require('request');
var cheerio = require('cheerio');
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

exports.request = function(tolerance, res) {
  console.log('going to meilleurs agents');

  var lbc_json = require('./lbc_data.json');
  lbc_json.price = parseFloat(lbc_json.price);
  lbc_json.surface = parseFloat(lbc_json.surface);

  var urlSuf = lbc_json.city.toLowerCase().replace(" ", "-").replace('é','e').replace('è','e').replace('à','a').replace('ç','c') + "-" + lbc_json.zip.toString();
  if(urlSuf.includes('paris')){
    var urlSuf2 = urlSuf.split('-');
    var arr = parseInt(urlSuf2[1])%75000;
    var adj;
    if(arr===1){
      adj="er";
    }
    else{
      adj="eme";
    }
    urlSuf = "paris-" + arr + adj + "-arrondissement-" + lbc_json.zip.toString();
  }
  console.log("URL suffix: " + urlSuf);

  request("https://www.meilleursagents.com/prix-immobilier/" + urlSuf + "/", function(error, response, html){

      // First we'll check to make sure no errors occurred when making the request

      if(!error){
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
          console.log("No err, parsing the html page");

          var $ = cheerio.load(html);

          // Finally, we'll define the variables we're going to capture

          var moyPriceList = [];

          $('.row.baseline--half .prices-summary__cell--median').each(function() {
            var item = $(this).text().split(' ').clean(undefined).clean('').clean('\n').clean('&euro;\n').clean('&nbsp;')[0];
            console.log('1 row read');
            console.log(item.replace(/\s/g, ""));
            moyPriceList.push(parseFloat(item.replace(/\s/g, "")));
          });

          var json2 = new Object();
          json2.offer = new Object();
          json2.offer.city = lbc_json.city;
          json2.offer.zip = lbc_json.zip;
          json2.offer.price = lbc_json.price;
          json2.offer.surface = lbc_json.surface;
          json2.offer.type = lbc_json.type;
          json2.offer.smp = lbc_json.price / lbc_json.surface;
          json2.offer.url = lbc_json.url;
          json2.offer.img = lbc_json.img;

          json2.avSmpHouse = moyPriceList[1];
          json2.avSmpFloor = moyPriceList[0];

          json2.ma_url = "https://www.meilleursagents.com/prix-immobilier/" + urlSuf + "/";

          json2.tolerance = tolerance;

          console.log('json2: ' + JSON.stringify(json2));

          fs.writeFileSync("./ma_data.json", JSON.stringify(json2));

          console.log('data saved into ma_data.json');

          res.redirect('./scrapped?city='+json2.offer.city
                          +'&zip='+json2.offer.zip
                          +'&type='+json2.offer.type
                          +'&price='+json2.offer.price
                          +'&surface='+json2.offer.surface
                          +'&smp='+json2.offer.smp
                          +'&avSmpHouse='+json2.avSmpHouse
                          +'&avSmpFloor='+json2.avSmpFloor
                          +'&tolerance='+json2.tolerance
                          +'&url='+json2.offer.url
                          +'&ma_url='+json2.ma_url
                          +'&img='+json2.offer.img);
      }

  })
};
