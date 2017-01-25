var fs = require('fs');

exports.request = function(tolerance) {
  console.log('computing deal');
  var ma_json = require('./ma_data.json');
  console.log('read leboncoin + meilleursagents data from json: ' + JSON.stringify(ma_json));

  var offerSmp = ma_json.offer.smp;
  console.log("offerSmp: " + offerSmp.toString());
  var offerType = ma_json.offer.type;
  console.log("offerType: " + offerType.toString());
  var maSmp = (offerType==='Appartement')?ma_json.avSmpFloor:ma_json.avSmpHouse;
  console.log("maSmp: " + maSmp);

  var percentage = tolerance;
  var diffSmp = offerSmp - maSmp;
  console.log('Price per squared meters difference = ' + diffSmp.toString());

  console.log("Tolerance = " + percentage*100 + "% of regional price(" + maSmp + ") = " + percentage*maSmp);

  var goodOrNot = (diffSmp<=(percentage*maSmp));
  console.log('Good or Not boolean: ' + goodOrNot);

  var endString = (goodOrNot)?"\nThis offer is a GOOD DEAL":"\nThis offer is a BAD DEAL"
  var retString = "Price by square meter: " + offerSmp + "\nRegional average: " + maSmp + endString + " for you!!!";
  console.log('computation ok');

  return retString;
};
