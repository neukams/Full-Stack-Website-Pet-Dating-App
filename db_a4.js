/*
    This file handles all db interactions
*/

const projectId = 'assignment-9-portfolio';
const {Datastore} = require('@google-cloud/datastore');
const { entity } = require('@google-cloud/datastore/build/src/entity');
const datastore = new Datastore({projectId:projectId});
const BOAT = 'Boats';
const LOAD = 'Loads';
const NEWBOATPROPERTIES = ["name", "type", "length"];
const NEWLOADPROPERTIES = ["volume", "item", "creation_date"];

const validate = require('./validation_a4');
const utils = require('./utils_a4');
const STATE = 'State';

/*******************************
    DATASTORE STUFF
*******************************/

function fromDatastore(item) {
    item.id = Number(item[Datastore.KEY].id);
    delete item[Datastore.KEY];
    return item;
}

function fromDatastoreArr(arr) {
    return arr.map((i) => fromDatastore(i));
}

/*******************************
    STATE
*******************************/

async function createState(state_string) {
    console.log('db.js -> createState()');

    const key = datastore.key(STATE);
    var state = {state: state_string};

    try {
        await datastore.save({"key": key, "data": state});
        state.id = Number(key.id);
    } catch (err) {
        utils.logErr(err);
        return {};
    }

    console.log(key);
    console.log(state);
    
    return state;
}

async function getState(state_string) {
    console.log('getState()');
    var state;
    const query = datastore.createQuery(STATE);
    query.filter('state', state_string);
    state = await datastore.runQuery(query);
    state = state[0];

    if (utils.isEmpty(state)) {
        return {};
    }
    
    return fromDatastore(state[0]);
}

/*******************************
    BOATS
*******************************/

async function createBoat(reqBody) {
    console.log('createBoat()');
    if (!validate.keys(reqBody, NEWBOATPROPERTIES)) {
        return {};
    }

    var boat = utils.makeBoatFromBody(reqBody);
    const key = datastore.key(BOAT);

    try {
        await datastore.save({"key": key, "data": boat});
    } catch (err) {
        utils.logErr(err);
        return {};
    }
    
    boat.id = Number(key.id);
    return boat;
}

async function getBoat(id) {
    console.log('getBoat(id)');
    console.log('id='+id);
    var boat;
    const key = datastore.key([BOAT, Number(id)]);
    const query = datastore.createQuery(BOAT);
    query.filter('__key__', key);
    boat = await datastore.runQuery(query);
    boat = boat[0];

    if (utils.isEmpty(boat)) {
        return {};
    }
    
    return fromDatastore(boat[0]);
}

async function getBoats(cursor) {
    console.log('getBoats()');
    var boats;
    const query = datastore.createQuery(BOAT).limit(5);
    if (cursor) {
        console.log('cursor found');
        query.start(cursor);
    }
    boats = await datastore.runQuery(query);
    console.log('get boats with cursor');
    console.log(boats);
    fromDatastoreArr(boats[0])
    return boats;
}

// updates a Boat
// removes id or self properties if found
// assumes the resource is valid otherwise
async function updateBoat(boat) {
    console.log('updateBoat(boat)');
    console.log('boat');
    console.log(boat);

    const transaction = datastore.transaction();
    const key = datastore.key([BOAT, Number(boat.id)]);

    try {
        delete boat.id;
        delete boat.self;
    } catch {
        // do nothing, boat.self attribute does not exist, which is what we want
    }
    
    try {
        await transaction.run();
        await transaction.save({"key": key, "data": boat}); // a save should ..
        await transaction.commit();
        console.log('saved');
    } catch (err) {
        await transaction.rollback();
        utils.logErr(err);
        console.log('not saved');
        return false;
    }

    return true;
}

/*******************************
    LOADS
*******************************/

async function createLoad(reqBody) {
    console.log('createLoad(reqBody)');
    if (!validate.keys(reqBody, NEWLOADPROPERTIES)) {
        return {};
    }

    var load = utils.makeLoadFromBody(reqBody);
    const key = datastore.key(LOAD);

    try {
        await datastore.save({"key": key, "data": load});
    } catch (err) {
        utils.logErr(err);
        return {};
    }
    
    load.id = Number(key.id);
    return load;
}

async function getLoad(id) {
    console.log('getLoad(id)');
    console.log('id=' + id);
    var load;
    const key = datastore.key([LOAD, Number(id)]);
    console.log('load key = ');
    console.log(key);
    const query = datastore.createQuery(LOAD);
    query.filter('__key__', key);
    load = await datastore.runQuery(query);
    load = load[0];

    if (utils.isEmpty(load)) {
        return {};
    }
    
    return fromDatastore(load[0]);
}

async function getLoads(cursor) {
    console.log('getLoads(cursor)');
    var loads;
    const query = datastore.createQuery(LOAD).limit(5);
    if (cursor) {
        console.log('cursor found');
        query.start(cursor);
    }
    loads = await datastore.runQuery(query);
    console.log('get loads with cursor');
    console.log(loads);
    fromDatastoreArr(loads[0])
    return loads;
}

// assumes both boat and load exist
async function assignLoadToBoat(boat, load, carrier, load_mini) {
    console.log('assignLoadToBoat(boat, load)');

    const transaction = datastore.transaction();
    const load_key = datastore.key([LOAD, Number(load.id)]);
    const boat_key = datastore.key([BOAT, Number(boat.id)]);

    load.carrier = carrier;
    boat.loads.push(load_mini);
    delete boat.id;
    delete load.id;

    console.log('Assigned load to boat (not yet saved)');
    console.log('Boat');
    console.log(boat);
    console.log('Carrier');
    console.log(carrier);
    console.log('Load');
    console.log(load);
    console.log('Load Mini');
    console.log(load_mini);

    try {
        await transaction.run();
        await transaction.save({"key": load_key, "data": load}); // a save should update this load since it already exists.
        await transaction.save({"key": boat_key, "data": boat}); // a save should ..
        await transaction.commit();
        console.log('saved');
    } catch (err) {
        await transaction.rollback();
        utils.logErr(err);
        return false;
    }

    return true;
}

// updates a Load
// removes id or self properties if found
// assumes the resource is valid otherwise
async function updateLoad(load) {
    console.log('updateLoad(load)');

    const transaction = datastore.transaction();
    const key = datastore.key([LOAD, Number(load.id)]);

    try {
        delete load.id;
        delete load.self;
    } catch {
        // do nothing, load.self attribute does not exist, which is what we want
    }
    

    console.log('Updating Load (not yet saved)');
    console.log('Load');
    console.log(load);
    
    try {
        await transaction.run();
        await transaction.save({"key": key, "data": load}); // a save should ..
        await transaction.commit();
        console.log('saved');
    } catch (err) {
        await transaction.rollback();
        utils.logErr(err);
        console.log('not saved');
        return false;
    }

    return true;
}

// return an array of all Loads in a given Boat
async function getLoadsFromBoat(boat, req) {
    console.log('db.getLoadsFromBoat(boat, req)');
    console.log('boat');
    console.log(boat);

    var loads = [];

    console.log(boat.loads);
    for (i=0; i<boat.loads.length; i++) {

        console.log('load_mini = ' + JSON.stringify(boat.loads[i]));
        let load = await getLoad(boat.loads[i].id);
        load.self = utils.url(req, ['/loads/', boat.loads[i].id]);
        loads.push(JSON.parse(JSON.stringify(load)));
        console.log('pushed load');
        console.log(load);
    }

    console.log('loads array should contain all loads on boat ' + boat.id);
    console.log(loads);

    return loads;
}

/*******************************
    USERS COLLECTION
*******************************/

/**
 * 
 * Given a JSON document for a user, create or update that user in the database
 * 
 * Stores their User ID ('sub' from the JSON Web Token) and name from their google account.
 * 
 * @param {*} user -> User document (JSON) to create or update in the database
 */
 async function upsertUser(user) {
    console.log('upsertUser()');

    console.log('user json before upsert:');
    console.log(user);

    const query = datastore.createQuery('User');
    query.filter('sub', user.sub);
    var result = await datastore.runQuery(query);
    console.log('attempted to find user based on existing sub');

    // found matching user in db, returning this user.
    try {
        result = fromDatastore(result[0][0]);
        return 'user already exists';

    // user needs to be created
    } catch {
        console.log('user not found in db, creating new user');
        const key = datastore.key('User');
        if (utils.isEmpty(user)) {
            console.log('error, user passed into function is empty. Expected user JSON object');
            return {};
        }

        try {
            await datastore.save({"key": key, "data": user});
        } catch (err) {
            utils.logErr(err);
            return {};
        }

        console.log('user json after upsert:');
        console.log(user);
        
        user.id = Number(key.id);
        return 'user created';
    }
}

/**
 * Given a user's sub from a JWT, return true if the user exists in the database, false otherwise
 * 
 * @param {} sub -> the sub field from the JSON Web Token from Google's servers
 */
async function userExists(sub) {
    console.log('userExists()');

    const query = datastore.createQuery('User');
    query.filter('sub', sub);
    var result = await datastore.runQuery(query);

    try {
        result = fromDatastore(result[0][0]);
        return true;
    } catch {
        return false;
    }
}

/*******************************
    RESOURCE AGNOSTIC
*******************************/

async function deleteResource(collection, resource) {
    console.log('deleteResource(collection, resource)');
    console.log('collection=' + collection);
    console.log('resource');
    console.log(resource);
    
    const key = datastore.key([collection, Number(resource.id)]);
    const transaction = datastore.transaction();

    try {
        await transaction.run();
        await transaction.delete(key);
        await transaction.commit();
    } catch (err) {
        utils.logErr(err);
        return false;
    }
    return true;
}

async function deleteResourceWithState(collection, state_string) {
    console.log('deleteResource()');
    console.log('collection=' + collection);
    console.log('state_string=' + state_string);

    var resource = await getState(state_string);
    
    const key = datastore.key([collection, resource.id]);
    const transaction = datastore.transaction();

    try {
        await transaction.run();
        await transaction.delete(key);
        await transaction.commit();
    } catch (err) {
        utils.logErr(err);
        return false;
    }
    return true;
}




module.exports = {
    createBoat,
    getBoat,
    getBoats,
    createLoad,
    getLoad,
    getLoads,
    assignLoadToBoat,
    updateBoat,
    updateLoad,
    getLoadsFromBoat,
    deleteResource,
    BOAT,
    LOAD,
    createState,
    getState,
    deleteResourceWithState,
    upsertUser,
    userExists
};