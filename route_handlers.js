/**
 * This file handles the requests and responses on behalf of server.js, for each route
 */

const axios = require('axios');
const {OAuth2Client} = require('google-auth-library');
const client_creds = require('./oauth20-client-id.json');
const db = require('./db');
const utils = require('./utils');

/**
 * 
 * @param {*} req The request object contains the JWT as a Bearer token in the Authorization header: {Authorization: 'Bearer some-jwt-token'}
 * @returns 
 */
function get_jwt(req) {
    console.log('get_jwt()');

    try {
        if (req.headers.authorization.length <= String('Bearer ').length) {
            console.log('no jwt found in auth req header');
            return '';
        }
    } catch {
        return '';
    }

    return req.headers.authorization.slice(req.headers.authorization.search(' ')+1);
}

async function validateJWT(token) {
    console.log('validateJWT()');
    try {
        const gauth = new OAuth2Client(client_creds.web.client_id);
        const ticket = await gauth.verifyIdToken({
            idToken: token,
            audience: client_creds.web.client_id
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        return userid;
    } catch (err) {
        console.log('Error occured in validateJWT()');
        console.log(err);
    }
    return '';
}

/**
 * 
 * Handler for POST /boats
 * 
 * @param {*} req Request object
 * @param {*} res Response object
 */
async function post_boats(req, res) {
    console.log('post_boats()');

    var json_web_token = await get_jwt(req);
    var userid = await validateJWT(json_web_token);
    console.log('' == true);
    console.log('' == false);
    console.log('userid = ' + userid);

    if (userid) {
        var boat = await db.createBoat({
            'name': req.body.name,
            'type': req.body.type,
            'length': Number(req.body.length),
            'public': Boolean(req.body.public),
            'owner': userid
        });
        if (!utils.isEmpty(boat)) {
            res.status(201).send(boat);
            return;
        }
    } else {
        console.log('invalid JWT. not creating the boat');
        res.status(401).send({'Error': 'Invalid or missing JWT.'});
        return;
    }
    res.status(500).send('Internal Error');
}

/**
 * 
 * @param {*} id - owner id
 */
async function get_public_boats(req, res) {
    console.log('get_public_boats()');
    var boats = await db.get_public_boats_by_owner(req.params.owner_id)
    res.status(200).send(boats);
}

/**
 * 
 * Returns all boats for ...
 *  - If the JWT in the Authorization header is valid, returns all boats for that user
 *  - If the JWT in the Authorization header is invalid/not provided, all public boats are returned
 * 
 * @param {*} req  Request object
 * @param {*} res  Response object
 */
async function get_boats(req, res) {
    var boats = [];
    var jwt = get_jwt(req);
    var owner = await validateJWT(jwt);

    // get boats for owner
    if (owner) {
        boats = await db.getBoatsByAttribute('owner', '=', owner);
    // get all public boats
    } else {
        boats = await db.getBoatsByAttribute('public', '=', true);
    }

    res.status(200).send(boats);
}

async function delete_boat(req, res) {
    console.log('delete_boat()');

    var jwt = await get_jwt(req);
    var owner_id = await validateJWT(jwt);

    // JWT is valid
    if (owner_id) {
        var boat = await db.getBoat(req.params.boat_id);
        console.log('retrieved boat:');
        console.log(boat);

        // boat found
        if (!utils.isEmpty(boat)) {
            console.log('boat owner = ' + boat.owner);
            console.log('owner_id = ' + owner_id);

            // boat owned by owner, delete it
            if (boat.owner == owner_id) {
                console.log('boat deleted? ' + await db.deleteBoat(boat.id));
                res.status(204).send();
                return;

            // boat owned by someone else
            } else {
                res.status(403).send();
                return;
            }

        // boat not found
        } else {
            res.status(403).send();
            return;
        }

    // missing or invalid JWT
    } else {
        res.status(401).send();
        return;
    }
}

module.exports = {
    post_boats,
    get_public_boats,
    get_boats,
    delete_boat
}
