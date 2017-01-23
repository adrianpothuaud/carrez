var fs = require('fs');

exports.request = function() {
  console.log('computing deal');
  var ma_json = require('./ma_data.json');
  console.log('read leboncoin + meilleursagents data from json: ' + ma_json);
  var retString = "Price by square meter: " + ma_json.offer.smp + "\nRegional average: " + ((ma_json.type==='Appartement')?ma_json.avSmpFloor:ma_json.avSmpHouse);
  console.log('computation ok');
  return retString;
};
