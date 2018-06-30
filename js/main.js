/*
collect currencies
convert currecies
save conversion parameters to idb
convert currencies offline
*/
const selectFrom = document.querySelector('#fromCurrency');
const selectTo = document.querySelector('#toCurrency');
//fromCurrency = document.getElementById('fromCurrency');

//document.getElementById("monthlyPayment").innerHTML = monthlyPayment.toFixed(2);
const url = `https://free.currencyconverterapi.com/api/v5/currencies`;

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

/*const url = 'https://free.currencyconverterapi.com/api/v5/countries';

   fetch(url)
       .then(res => res.json())
       .then(data => {
           let currencyNames = data.results;
           for (let currency in currencyNames) {
               const option = document.createElement('option');
               option.innerHTML = currencyNames[currency].currencyId;
               document.getElementById("currency-names").appendChild(option);
           }
       })
    .catch(function(error) {
        console.log (error);
    });*/

function convertCurrency() {

  let fromCurrency = document.getElementById("fromCurrency").value;
  let toCurrency = document.getElementById("toCurrency").value;
  let amount = document.getElementById("amount").value;
  let query = `${fromCurrency}_${toCurrency}`;
  //inverse exchange
  let backQuery = `${toCurrency}_${fromCurrency}`;


  let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

    fetch(url).then(response => {

        response.json().then(res => {

            let val = res[query];

            if(val){
              //get inverse exchange rate
              let backVal = 1 / val;
              dbPromise.then(db => {
                let tx = db.transaction('currencyX', 'readwrite');
                let theStore = tx.objectStore('currencyX');
              theStore.put({id: query, rate: val});
              theStore.put({id: backQuery, rate: backVal});
            }).then(db => {
              console.log('Exchange rates entered');
            });
              console.log(val);
                let total = val * amount;

                console.log(total);
                document.getElementById("equiv").innerHTML = total.toFixed(2);
                /*let rate = `${Object.values(res)}`;
                let m = Number(k.toString());
                console.log(input_amount * m);
                document.getElementById('forex_value').value = input_amount * m;*/

            } else {
                console.log('Value not found for ', query);
              //  console.log(err);
              //  cb(err);
            }

            });
        }).catch(function (err){
          dbPromise.then(db => {
            return db.transaction('currencyX')
              .objectStore('currencyX').get(query);
          }).then(obj => {
            console.log('from idb',obj);
            let total = obj.rate * amount;

            console.log(total);
            document.getElementById("equiv").innerHTML = total.toFixed(2);
          console.log('Successfully calculated from idb');
        });
    console.error('Fetch Error -', err);
});


}

// Service worker registration
const registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('cc-sw.js').then( reg => {

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
