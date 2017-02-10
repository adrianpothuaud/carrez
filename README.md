## Synopsis

This application is designed to create a link between leboncoin.fr and meilleursagents.com to be able to evaluate an ad. This is made by doing a comparison on the price by squared meter between the ad and the average regional statistics.

## Installation

```shell
npm install --save
```

This command will install all dependencies required for the server to be running.

## Tests

```shell
npm start
```

Go to http://localhost:3000/

Then fill the form with an url from Leboncoin ads.

If it is a good deal you can save it to your ads. Then from ads view you can delete those you don't want anymore.

If it is not a good deal you can't save it but you can still toggle scrapping and computations details.

## Persistent problems

utf-8 encoding

Exemple: when scrapping a city name like "Bouillé-Ménard" the results from meilleursagents are undefined, so the computations are KO

Bad zip in leboncoin ad

Exemple: if city zip given is 98500 whereas it should be 98000 for meilleursagents the computations are also KO
