(function() {
    'use strict';
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, err => {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
    }

    const apiURL = `https://free.currencyconverterapi.com/api/v5/currencies`;   
    let countriesCurrencies;
    const dbPromise = idb.open('countries-currencies', 1, upgradeDB => {
        switch (upgradeDB.oldVersion) {
            case 0:
            upgradeDB.createObjectStore('objs', {keyPath: 'id'});
        }
    });
    const insertCurrencies = (data) => {
        const fromCountry = document.getElementById('fromCountry');
        const toCountry = document.getElementById('toCountry');
        const initCurrency = document.getElementById('initCurrency');
        for (let value in data) {
            let countryAnchor = document.createElement('option');
            countryAnchor.innerHTML = data[value].id;
            countryAnchor.value = data[value].id;
            fromCountry.appendChild(countryAnchor);
            toCountry.appendChild(countryAnchor.cloneNode(true));
            initCurrency.innerHTML = 'AED';
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

    const convertCurrency = () => {
        const fromCountry = document.getElementById('fromCountry').value;
        const toCountry = document.getElementById('toCountry').value;
        const fromInput = document.getElementById('fromValue').value;
        const toInput = document.getElementById('toValue');
        const conversionCalc = document.getElementById('conversion');
        const initCurrency = document.getElementById('initCurrency');
        if(fromInput > 0 || toInput > 0)
        fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${fromCountry}_${toCountry}&compact=ultra`).then(response => {
            return response.json();
            }).then(rates => {
               for(let rate in rates){
                 let calc = rates[rate]; 
                 let total = (calc * fromInput).toFixed(2); 
                 localStorage.setItem(`${fromCountry}_${toCountry}`, calc);
                 if(total)
                 initCurrency.innerHTML = fromCountry;
                 toInput.innerHTML = total + ' ' + toCountry;
                 conversionCalc.innerHTML = '1 ' + fromCountry + ' = ' + calc + ' ' + toCountry;
               }
        }).catch( nosucces => {
            const storedConversion = localStorage.getItem(`${fromCountry}_${toCountry}`);
            if(storedConversion){
                let total = (storedConversion * fromInput).toFixed(2);
                if(total)
                initCurrency.innerHTML = fromCountry;
                toInput.innerHTML = total + ' ' + toCountry;
                conversionCalc.innerHTML = '1 ' + fromCountry + ' = ' + calc + ' ' + toCountry;
            }
            else{
                toInput.innerHTML = 'Oops, something went wrong. Please try again later.';
                conversionCalc.innerHTML = '';
            }
        });
    }
    document.querySelector('#convert').addEventListener('click', convertCurrency);
})();