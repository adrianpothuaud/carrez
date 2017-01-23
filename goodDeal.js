exports.request = function() {
  var ma_json = require('./ma_data.json');
  var retString = "Price by square meter: " + ma_json.offer.smp.toString() + "\nRegional average: " + ((ma_json.type==='Appartement')?ma_json.avSmpFloor:ma_json.avSmpHouse);
  return retString; 
};
