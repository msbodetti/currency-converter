(function() {
    'use strict';
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
        });
    }

    const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;   
    let countriesCurrencies;
    const dbPromise = idb.open('countries-currencies', 1, upgradeDB => {
        // Note: we don't use 'break' in this switch statement,
        // the fall-through behaviour is what we want.
        switch (upgradeDB.oldVersion) {
            case 0:
            upgradeDB.createObjectStore('objs', {keyPath: 'id'});
        }
    });
    fetch(apiURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(currencies) {
        dbPromise.then(db => {
            if(!db) return;
            countriesCurrencies = [currencies.results];
            const tx = db.transaction('objs', 'readwrite');
            const store = tx.objectStore('objs');
            countriesCurrencies.forEach(function(currency) {
                for (let value in currency) {
                    store.put(currency[value]);
                }
            });
            return tx.complete;
        });
    });

})();