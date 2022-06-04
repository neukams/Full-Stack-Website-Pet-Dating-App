//const { default: axios } = require('axios');
//const axios = require('axios');
//import axios from 'axios';
//const { default: axios } = require("axios");

console.log('am I getting the new file? v8');

document.getElementById('oauth-form').addEventListener('click', function(event){
    event.preventDefault()
    oauth('oauth');
});

document.getElementById('create-account').addEventListener('click', function(event){
    event.preventDefault()
    oauth('create-account');
});

document.getElementById('login').addEventListener('click', function(event){
    event.preventDefault()
    oauth('login');
});

async function oauth(request_type) {
    console.log('oauth()');
    console.log('request type=' + request_type);
    var url = location.href +  'redirect_to_google_oauth'
    console.log(url);

    var response = await fetch(url, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        mode: 'no-cors',
        body: new URLSearchParams({
            'request_type': request_type
          })
    });
    var res_json = await response.json();
    
    console.log(res_json);
    setTimeout(() => {}, 5000);
    window.location = res_json['url'];
}