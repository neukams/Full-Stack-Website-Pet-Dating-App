//const { default: axios } = require('axios');
//const axios = require('axios');
//import axios from 'axios';
//const { default: axios } = require("axios");

console.log('am I getting the new file? v8');

document.getElementById('oauth-form').addEventListener('click', function(event){
    event.preventDefault()
    initiate_oauth();
});

document.getElementById('create-account').addEventListener('click', function(event){
    event.preventDefault()
    create_account();
});

document.getElementById('login').addEventListener('click', function(event){
    event.preventDefault()
    login();
});

async function initiate_oauth() {
    console.log('initiate_oauth()');
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
            'request_type': 'oauth'
          })
    });
    var res_json = await response.json();
    
    console.log(res_json);
    setTimeout(() => {}, 5000);
    window.location = res_json['url'];
}

async function create_account() {
    console.log('create_account()');
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
            'request_type': 'create-account'
          })
    });
    var res_json = await response.json();
    
    console.log(res_json);
    setTimeout(() => {}, 5000);
    window.location = res_json['url'];
}

async function login() {
    console.log('login()');
    var url = location.href +  'redirect_to_google_oauth'
    console.log(url);
    console.log('function ending intentionally');
    return;

    var response = await fetch(url, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        mode: 'no-cors',
        body: new URLSearchParams({
            'request_type': 'login'
          })
    });
    var res_json = await response.json();
    
    console.log(res_json);
    setTimeout(() => {}, 5000);
    window.location = res_json['url'];
}