const selectFrom = document.querySelector('#fromCurrency');
const selectTo = document.querySelector('#toCurrency');
//fromCurrency = document.getElementById('fromCurrency');

//document.getElementById("monthlyPayment").innerHTML = monthlyPayment.toFixed(2);
const url = 'https://free.currencyconverterapi.com/api/v5/currencies';

fetch(url)
.then(response => {
    if(response.status !== 200){
        console.warn('Looks like there was a problem. Status Code:' + response.status);
        return;
    }


    response.json().then(results => {
        for(const result in results) {
            for( const id in results[result]){
                const option1 = document.createElement('option');
                 const option2 = document.createElement('option');
                option1.value = results[result][id]['id'];
                option2.value = results[result][id]['id'];
                option1.appendChild(document.createTextNode(results[result][id]['currencyName']));
                option2.appendChild(document.createTextNode(results[result][id]['currencyName']));
                selectFrom.appendChild(option1);
                selectTo.appendChild(option2);

            }

        }
console.log('results',results);
    });
}).catch(function (err){
    console.error('Fetch Error -', err);
});

function convertCurrency(amount, fromCurrency, toCurrency, cb) {


  fromCurrency = encodeURIComponent(fromCurrency);
  toCurrency = encodeURIComponent(toCurrency);
  let query = `fromCurrency_toCurrency`;
  let backQuery = fromCurrency;
  let url = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + query + '&compact=ultra';

    fetch(url).then(response => {
    if(response.status !== 200){
        console.warn('Looks like there was a problem. Status Code:' + response.status);
        return;
    }
        response.json().then(res => {

            let val = res[query];
            if(val){
                let total = val * amount;
                cb(null, Math.round(total * 100) / 100);
                console.log(total);

            } else {
                console.log('Value not found for ', query);
                console.log(err);
                cb(err);
            }

            });
        }).catch(function (err){
    console.error('Fetch Error -', err);
});


}

document.getElementById('calcBtn').addEventListener('click', function () {
    let fromCurrency = document.getElementById("fromCurrency").value;
    let toCurrency = document.getElementById("toCurrency").value;
    let amount = document.getElementById("amount").value;
    convertCurrency(amount, fromCurrency, toCurrency, function(err, amount){
        document.getElementById("equiv").innerHTML = amount;
    });

});

// Service worker registration
const registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('./cc-sw.js').then( reg => {

    console.log('Service worker is registered');
/*
     if (reg.waiting) {
      updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener('updatefound', function() {
      trackInstalling(reg.installing);
    });
*/

  // Ensure refresh is only called once.
  // This works around a bug in "force update on reload".
  let refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });

}).catch( err => {
    console.log('Error registering service worker', err);
});
}

//idb
/*const createDB = () =>{
if (!navigator.serviceWorker) {
    return Promise.resolve();
  }*/

  let dbPromise = idb.open('curencyConverterDB', 1, function(upgradeDb){
    let exchangeStore = upgradeDb.createObjectStore('currencyX', {
      keyPath: 'id'
    });
    exchangeStore.createIndex('curId', 'id');
  });

/*function createDB(fromCurrency, toCurrency) {
  idbPromise = idb.open('cc-db', 1, function(upgradeDB) {
    let currencyStore = upgradeDB.createObjectStore('currencies', {
      keyPath: 'id'
    });
    currencyStore.put({id: [id], from: 'NGN',  to: 'PHP', rate: 1.999781});

    let convertionStore = upgradeDB.createObjectStore('convertions', {
      keyPath: 'id'
    });
  });
/*
  class MyDB{
    constructor(fromCurrency, toCurrency, currencyList, dbName, keyP, storeName, theId, theRate){
      this.fromCurrency = fromCurrency;
      this.toCurrency = toCurrency;
      this.currencyList = currencyList;
      this.dbName = dbName;
      this.storeName = storeName;
      this.keyP = keyP;
      this.theId = theId

    }
    createDB(){
      idb.open(this.dbName, 1, function(upgradeDB) {
        let storeObj = upgradeDB.createObjectStore(this.storeName, {
          keyPath: this.keyP
        });
    }
  }
    addExToStore(){
      createDB.storeObj.put({id: this.theId, from: this.fromCurrency,  to: this.toCurrency, rate: this.theRate});
    }*/
//}
