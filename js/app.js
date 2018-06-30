(function() {
    'use strict';
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, err => {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
        });
    }

    const apiURL = `https://free.currencyconverterapi.com/api/v5/currencies`;   
    let countriesCurrencies;
    const dbPromise = idb.open('countries-currencies', 1, upgradeDB => {
        // Note: we don't use 'break' in this switch statement,
        // the fall-through behaviour is what we want.
        switch (upgradeDB.oldVersion) {
            case 0:
            upgradeDB.createObjectStore('objs', {keyPath: 'id'});
        }
    });
    const insertCurrencies = (data) => {
        const fromCountry = document.getElementById('fromCountry');
        const toCountry = document.getElementById('toCountry');
        for (let value in data) {
            let countryAnchor = document.createElement('option');
            countryAnchor.innerHTML = data[value].id;
            fromCountry.appendChild(countryAnchor);
            toCountry.appendChild(countryAnchor.cloneNode(true));
            //console.log(allObjs[value]);

        }
    }
    fetch(apiURL)
    .then( response => {
        return response.json();
    })
    .then( currencies => {
        dbPromise.then(db => {
            if(!db) return;
            countriesCurrencies = [currencies.results];
            const tx = db.transaction('objs', 'readwrite');
            const store = tx.objectStore('objs');
            countriesCurrencies.forEach(currency => {
                for (let value in currency) {
                    store.put(currency[value]);
                }
            });
            return tx.objectStore('objs').getAll();
        }).then(stored =>{
            insertCurrencies(stored);
        });
    });

    dbPromise.then(db => {
        if(!db) return;
        return db.transaction('objs')
        .objectStore('objs').getAll();
    }).then(allObjs => {
        insertCurrencies(allObjs);
    });

})();