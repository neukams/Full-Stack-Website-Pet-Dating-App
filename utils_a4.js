// Utility functions

// builds a url
function url(req, urlAdditions) {
    var base_url = req.protocol + "://" + req.get('host');
    var ext_url = urlAdditions.join('');
    return base_url + ext_url;
}

// builds a 'self' boat url from an array of boat objects
function selfUrlResourceId(req, urlAdditions, boats) {
    var base_url = req.protocol + "://" + req.get('host');
    var ext_url = urlAdditions.join('');
    for (i=0; i<boats.length; i++) {
        boats[i].self = base_url + ext_url + boats[i].id;
    }
}

function makeBoatFromBody(reqBody) {
    return {"name": reqBody.name, "type": reqBody.type, "length": reqBody.length, "loads": []};
}

function makeLoadFromBody(reqBody) {
    return {"volume": reqBody.volume, "item": reqBody.item, "creation_date": reqBody.creation_date, "carrier": null};
}

function popLoadFromBoat(boat, load) {

    if (isEmpty(boat.loads)) {
        return false;
    }

    for (const [index, element] of boat.loads.entries()) {
        if (element.id === load.id) {
            boat.loads.splice(index, 1);
            return true;
        }
    }
    return false;
}

function logErr(err) {
    console.log('Error in function: ' + logErr.caller);
    console.log(err);
}

function isEmpty(obj) {

    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;

    if (obj == undefined) {
        return true;
    }

    if (obj == null) {
        return true;
    }

    if (obj === {}) {
        return true;
    }

    if (obj === []) {
        return true;
    }

    if (obj.constructor === arrayConstructor) {
        return obj.length == 0;
    }

    if (obj.constructor === objectConstructor) {
        return Object.keys(obj).length === 0;
    }

    logErr("I don't know what type of object this is");
    return true;
}

function printMany(print, numberOfTimes) {
    for (i=0; i<numberOfTimes; i++) {
        console.log(print);
    }
}

/*
// returns a new Json object given someJson and an array of keys (and their values) to be extracted
function buildJson(someJson, keys) {
    newJson = {};
    for (i=0; i<properties.length; i++) {
        newJson[keys[i]] = someJson[key[i]]
    }
    return newJson;
}*/

function remove_sub(users) {
    
    var i = 0;
    try {
        for (i=0; i<users.users.length; i++) {
            if (Object.keys(users.users[i]).includes("sub")) {
                delete users.users[i]['sub']
            }
        }
    } catch {
        console.log('nothing to delete?');
    }

    console.log('deleted some user sub values!');
}

module.exports = {
    url, 
    makeBoatFromBody, 
    logErr,
    isEmpty,
    selfUrlResourceId,
    makeLoadFromBody,
    popLoadFromBoat,
    printMany,
    remove_sub
};