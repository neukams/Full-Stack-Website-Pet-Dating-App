//const { default: axios } = require('axios');
//const axios = require('axios');
//import axios from 'axios';

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

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    var response = await fetch(url, {
        method: 'POST',
        headers: headers,
        mode: 'no-cors',
        body: {"request_type": "oauth"}
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

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    var response = await fetch(url, {
        method: 'POST',
        headers: headers,
        mode: 'no-cors',
        body: {"request_type": "create-account"}
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

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    var response = await fetch(url, {
        method: 'POST',
        headers: headers,
        mode: 'no-cors',
        body: {"request_type": "login"}
    });
    var res_json = await response.json();
    
    console.log(res_json);
    setTimeout(() => {}, 5000);
    window.location = res_json['url'];
}