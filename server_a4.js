const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const utils = require('./utils_a4');
const db = require('./db_a4');
const { Datastore } = require('@google-cloud/datastore');
const res = require('express/lib/response');
const router = express.Router();
const client_creds = require('./oauth20-client-id.json');
require('dotenv').config();

app.enable('trust proxy');
app.use(bodyParser.json());

app.use(express.static('./'));
const oauth_supp = require('./oauth_support.cjs');

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
    var state = await db.getState(received_state);
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
    const request_type = req.body.request_type;
    const location = google_oauth + ap + 'state=' + request_type + state;
    console.log('request_type=' + request_type);
    console.log('state=' + state);

    var result = await db.createState(state);
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
        db.deleteResourceWithState('State', req.query.state);
        res.render('./public/html/user_info.html', {
            dname: user_data.data.names[0].displayName,
            lname: user_data.data.names[0].familyName,
            fname: user_data.data.names[0].givenName,
            jwt: response.data.id_token
        });
    }
});

/*******************************
    BOATS
*******************************/

router.post('/boats', async function(req, res) {
    console.log('\n\nPOST /boats');
    var boat = await db.createBoat(req.body);
    if (utils.isEmpty(boat)) {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
    } else {
        boat.self = utils.url(req, ["/boats/", boat.id]);
        res.status(201).send(boat);
    }
});

router.get('/boats/:id', async function(req, res) {
    console.log('\n\nGET /boats/:id');
    var boat = await db.getBoat(req.params.id);
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this boat_id exists"});
    } else {
        boat.self = utils.url(req, ['/boats/', boat.id]);
        res.status(200).send(boat);
    }
});

router.get('/boats', async function(req, res) {
    console.log('\n\nGET /boats');
    var cursor = undefined;
    var boats = {};

    if (Object.keys(req.query).includes("cursor")) {
        cursor = req.query.cursor;
    }

    try {
        var results = await db.getBoats(cursor);
    } catch (err) {
        utils.logErr(err);
        res.status(500).send();
        return;
    }

    utils.selfUrlResourceId(req, ['/boats/'], results[0]);
    boats.boats = results[0];

    if (results[1].moreResults !== Datastore.NO_MORE_RESULTS) {
        console.log('no more results');
        boats.next = utils.url(req, ['/boats/?cursor=', results[1].endCursor]);
    }

    res.status(200).send(boats);
});

router.get('/boats/:boat_id/loads', async function(req, res) {
    console.log('\n\nGET /boats/:boat_id/loads');
    
    var boat = await db.getBoat(req.params.boat_id);
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this boat_id exists"});
        return;
    }

    var loads = await db.getLoadsFromBoat(boat, req);
    res.status(200).send({"loads": loads});
});

router.delete('/boats/:id', async function(req, res) {
    console.log('\n\nDELETE /boats/:id');
    
    // does boat resource exist?
    var boat = await db.getBoat(req.params.id);
    console.log('Boat to be deleted is');
    console.log(boat);
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this boat_id exists"});
        return;
    }

    // update all loads on boat
    var loads = await db.getLoadsFromBoat(boat, req);
    for (i=0; i<loads.length; i++) {
        loads[i].carrier = null;
        let success = await db.updateLoad(JSON.parse(JSON.stringify(loads[i])));
        console.log('load updated: ' + success);
    }

    // delete boat resource
    var deleted = await db.deleteResource(db.BOAT, boat);
    if (!deleted) {
        console.log('ERROR: Boat was not deleted');
        res.status(500).send({"Error": "Internal database error"});
        return;
    }

    res.status(204).send();
});


/*******************************
    LOADS
*******************************/

router.post('/loads', async function(req, res) {
    console.log('\n\nPOST /loads');
    var load = await db.createLoad(req.body);
    if (utils.isEmpty(load)) {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
    } else {
        load.self = utils.url(req, ["/loads/", load.id]);
        res.status(201).send(load);
    }
});

router.get('/loads/:id', async function(req, res) {
    console.log('\n\nGET /loads/:id');
    var load = await db.getLoad(req.params.id);
    if (utils.isEmpty(load)) {
        res.status(404).send({"Error": "No load with this load_id exists"});
    } else {
        load.self = utils.url(req, ['/loads/', load.id]);
        res.status(200).send(load);
    }
});

router.get('/loads', async function(req, res) {
    console.log('\n\nGET /loads');
    var cursor = undefined;
    var loads = {};

    if (Object.keys(req.query).includes("cursor")) {
        cursor = req.query.cursor;
    }

    try {
        var results = await db.getLoads(cursor);
    } catch (err) {
        utils.logErr(err);
        res.status(500).send();
        return;
    }
    
    utils.selfUrlResourceId(req, ['/loads/'], results[0]);
    loads.loads = results[0];

    if (results[1].moreResults !== Datastore.NO_MORE_RESULTS) {
        console.log('no more results');
        loads.next = utils.url(req, ['/loads/?cursor=', results[1].endCursor]);
    }

    res.status(200).send(loads);
});

router.delete('/loads/:id', async function(req, res) {
    console.log('\n\nDELETE /loads/:id');
    
    // does load resource exist?
    var load = await db.getLoad(req.params.id);
    if (utils.isEmpty(load)) {
        res.status(404).send({"Error": "No load with this load_id exists"});
        return;
    }

    // remove load from boat
    if (load.carrier !== null) {
        var boat = await db.getBoat(load.carrier.id);
        console.log('boat');
        console.log(boat);
        utils.popLoadFromBoat(boat, load);
        var updated = await db.updateBoat(boat);  // probably don't need to await here, but not trying to do pristine arch right now.
        if (!updated) {
            console.log('ERROR: boat was not updated');
            res.status(500).send({"Error": "Internal database error"});
            return;
        }
    }

    // delete load resource
    var deleted = await db.deleteResource(db.LOAD, load);
    if (!deleted) {
        console.log('ERROR: Load was not deleted');
        res.status(500).send({"Error": "Internal database error"});
        return;
    }

    res.status(204).send();
});


/*******************************
    ASSIGNMENTS: BOATS <-> LOADS
*******************************/

// assign a load to a boat
router.put('/boats/:boat_id/loads/:load_id', async function(req, res) {
    console.log('\n\nPUT /boats/:boat_id/loads');
    
    // get boat and load, ensure the IDs are valid and these resources exist
    var boat = await db.getBoat(req.params.boat_id);
    var load = await db.getLoad(req.params.load_id);
    if (utils.isEmpty(boat) || utils.isEmpty(load)) {
        res.status(404).send({"Error": "The specified boat and/or load does not exist"});
        return;
    }

    // check if load already assigned to a boat (even if it's the same boat)
    if (load.carrier !== null && Object.keys(load.carrier).includes('id')) {    // JS evaluates the first expression, and if it returns true the second expression is not evaluated.
        console.log('load.carrier=' + load.carrier);
        console.log('if carrier is null and no error was thrown, this logic checks out.');
        res.status(403).send({"Error": "The load is already loaded on another boat"});
        return;
    }

    // assign load to boat
    var carrier = {"id": boat.id, "name": boat.name, "self": utils.url(req, ['/boats/', boat.id])};
    var load_mini = {"id": load.id, "self": utils.url(req, ['/loads/', load.id])};
    var assigned = await db.assignLoadToBoat(boat, load, carrier, load_mini);
    if (!assigned) {
        res.status(500).send({"Error": "Connection error with the database"});
        return;
    }

    res.status(204).send();
});

// remove load from boat
// assign a load to a boat
router.delete('/boats/:boat_id/loads/:load_id', async function(req, res) {
    console.log('\n\nDELETE /boats/:boat_id/loads/:load_id');
    
    // get boat and load, ensure the IDs are valid and these resources exist
    var boat = await db.getBoat(req.params.boat_id);
    var load = await db.getLoad(req.params.load_id);
    if (utils.isEmpty(boat) || utils.isEmpty(load)) {
        res.status(404).send({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
        return;
    } else if (!utils.popLoadFromBoat(boat, load)) {
        res.status(404).send({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
        return;
    }

    load.carrier = null;
    
    // remove load from boat
    var boat_updated = await db.updateBoat(boat);
    var load_updated = await db.updateLoad(load);

    if (!(boat_updated && load_updated)) {
        res.status(500).send({"Error": "Connection error with the database"});
        return;
    }

    res.status(204).send();
});



app.use(router);

// Listening on port ...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;
