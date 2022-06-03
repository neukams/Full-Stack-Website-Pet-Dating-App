const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
const client_creds = require('./client_secret_hw7_oauth_openid_connec_params.json');
require('dotenv').config();
const d = require('./db');
const utils = require('./utils');

const oauth_supp = require('./oauth_support.cjs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(express.static('./'));

//var { expressjwt: jwt, expressjwt } = require("express-jwt");

const route = require('./route_handlers');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

const redirect = client_creds.web.auth_uri;
const q = '?';
const response_type = 'response_type=code';
const ap = '&';
const client_id = 'client_id=' + client_creds.web.client_id;

var redirect_uri_location;
if (!process.env.LOCAL_SPENCER) {
    redirect_uri_location = client_creds.web.redirect_uris[1];
} else  {
    redirect_uri_location = process.env.LOCAL_SPENCER;
}

const redirect_uri = 'redirect_uri=' + redirect_uri_location;
const scope = 'scope=profile';

const google_oauth = redirect + q + response_type + ap + client_id + ap + redirect_uri + ap + scope;
//var state_list = ['example_state_string'];


//console.log('google_oauth=' + google_oauth);
console.log('redirect_uri = ' + redirect_uri_location);

/******************************
 * Utils
 ******************************/

function randStateGenerator() {
    return getRandString() + getRandString();
}

function getRandString() {
    return (Math.random() + 1).toString(36).substring(2);
}

async function validState(received_state) {
    var state = await d.getState(received_state);
    if (!utils.isEmpty(state)) {
        console.log('valid state');
        return true;
    }
    console.log('invalid state');
    return false;
}

/******************************
 * OAuth & OpenID Route Handlers
 ******************************/

router.get('/', async function(req, res) {
    console.log('GET /');
    res.render('./public/html/index.html', {redirect_uri_var: redirect_uri_location});
});

router.post('/redirect_to_google_oauth', async function(req, res) {
    console.log('GET /redirect_to_google_oauth');
    const state = randStateGenerator();
    const location = google_oauth + ap + 'state=' + state;

    var result = await d.createState(state);
    console.log('result of db createState()');
    console.log(result);


    console.log('sending back redirect url:');
    console.log(location);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send({"url": location});
});

router.get('/oauth', async function(req, res) {
    console.log('GET /oauth')
    console.log('Received response from Google server');
    

    // if State matches what we generated for the user from GET /redirect_to_google_oauth
    // Google Server responds with the information we requested.
    if (await validState(req.query.state)) {
        
        // Exchange the token given to us by Google redirecting our user for an Access Token (this is the server to server exchange, where we exchange code for the Auth 2.0 token). The OpenID JWT token is also given to use as a result of this exchange.
        var response = await oauth_supp.post_to_google(client_creds, req.query.code, redirect_uri_location);
        //console.log(response);
        console.log('/-------------/n\n\n\n\nOAuth Response\n\n\n');
        console.log(response);
        //console.log(response.data.token_type);
        //console.log(response.data.access_token);
        console.log('JWT Token');
        console.log(response.data.id_token);

        // TODO HERE: Validate the JWT token (response.data.id_token)
        // If valid, display to user on the HTML response page
        // If not, ... check requirements.        

        var user_data = await oauth_supp.get_data(response.data);
        console.log('received user data?');
        console.log(user_data.data.names);

        //var response = '<pre>Hello TA Tester person.<br/><br/><br/>Display Name:     ' + user_data.data.names[0].displayName + '<br><br>Family Name:      ' + user_data.data.names[0].familyName + '<br><br>givenName:        ' + user_data.data.names[0].givenName + '<br><br>state:            ' + req.query.state + '</pre>';
        d.deleteResource('State', req.query.state);
        res.render('./public/html/user_info.html', {
            dname: user_data.data.names[0].displayName,
            lname: user_data.data.names[0].familyName,
            fname: user_data.data.names[0].givenName,
            jwt: response.data.id_token
        });
    }
});

/******************************
 * Boat REST API
 ******************************/

router.post('/boats', async function(req, res) {
    console.log('\nPOST /boats');
    route.post_boats(req, res);
});

router.get('/owners/:owner_id/boats', async function(req, res) {
    console.log('GET /owners/:owner_id/boats');
    route.get_public_boats(req, res);
});

router.get('/boats', async function(req, res) {
    console.log('GET /boats');
    route.get_boats(req, res);
});

router.delete('/boats/:boat_id', async function(req, res) {
    console.log('DELETE /boats/:boat_id');
    route.delete_boat(req, res);
})


app.use(router);

// Listening on port ...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;
