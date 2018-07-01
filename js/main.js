class Main{
  constructor(){
    this.dbPromise = this.createDB();

  }

  createDB(){
    if (!navigator.serviceWorker) {
        return Promise.resolve();
      }
      return idb.open('curencyConverterDB', 1, upgradeDB => {

      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('currencyX', {keyPath: 'id'}).createIndex('curId', 'id');
      }

    });

    }


  convertOffline(from, to, amount){
        this.dbPromise.then(db => {
        let query = `${from}_${to}`;
        let trans = db.transaction('currencyX', 'readwrite');
        let store = trans.objectStore('currencyX').get(query).then(obj =>{
        console.log('from idb',obj);
        let total = obj.rate * amount;
        console.log('ofline total', total);
        document.getElementById("equiv").innerHTML = total.toFixed(2);
        document.getElementById("rate").innerHTML = rate.toFixed(2);
      }).catch(err =>{
        console.log('Error converting offline', err);
      });
    });

  }


 registerServiceWorker(){
   if (!navigator.serviceWorker) return;
   navigator.serviceWorker.register('/cc-sw.js').then( reg => {
     console.log('Service worker is registered');

      if (reg.waiting) {
       this.skipWaiting();
       return;
     }

   // Ensure refresh is only called once.
   // This works around a bug in "force update on reload".
   let refreshing;
   navigator.serviceWorker.addEventListener('controllerchange', () => {
     if (refreshing) return;
     window.location.reload();
     refreshing = true;
   });

 }).catch( err => {
     console.log('Error registering service worker', err);
 });
 }


getCurrencies(){
  const selectFrom = document.querySelector('#fromCurrency');
  const selectTo = document.querySelector('#toCurrency');

  const url = `https://free.currencyconverterapi.com/api/v5/currencies`;

  return fetch(url).then(response => {
              return response.json();
          }).then(res => {

      // sort results from API
let sortedResults = Object.values(res.results);//.sort((a, b) =>{a.res.results.currencyName- b.res.results.currencyName});
          for(const result of Object.values(sortedResults)) {

                  const option1 = document.createElement('option');
                  const option2 = document.createElement('option');
                  option1.value = result.id;
                  option2.value = result.id;
                  option1.appendChild(document.createTextNode(result.currencyName));
                  option2.appendChild(document.createTextNode(result.currencyName));
                  selectFrom.appendChild(option1);
                  selectTo.appendChild(option2);

console.log('result', result);
          }

        }).catch(err =>{
      console.log('Error fetching currencies', err);
    });
}


convertCurrency(from, to, amount){
  let query = `${from}_${to}`;
  let backQuery = `${to}_${from}`;//inverse exchange for offline use

  let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
    return fetch(url)
    .then(response => {
        response.json().then(result => {
            let rate = result[query];
              let reverseRate = 1 / rate;//get inverse exchange rate
              this.dbPromise.then(db => {
                let trans = db.transaction('currencyX', 'readwrite');
                let theStore = trans.objectStore('currencyX');

                //Save conversion parameters for offline use
              theStore.put({id: query, rate: rate});
              theStore.put({id: backQuery, rate: reverseRate});
              //convert currencies
                let total = rate * amount;

              document.getElementById("equiv").innerHTML = total.toFixed(2);
              document.getElementById("rate").innerHTML = rate.toFixed(2);
            }).then(db => {
              console.log('Yay! Exchange rates entered');
            }).catch(err =>{
              console.log('Oops! Entry and conversion failed', err);
            });
          });
        }).catch(err =>{
          console.log('Oops! Could not fetch exchange rate from network');
        });
    }

}//end class Main
