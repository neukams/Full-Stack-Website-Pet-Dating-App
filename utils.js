/*

Utility functions

*/

function logErr(err) {
    console.log('Error in function: ' + logErr.caller);
    console.log(err);
}

function isEmpty(obj) {

    console.log(obj);

    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;

    if (obj == undefined ||
        obj == null      ||
        obj === {}       ||
        obj === []          ) {
        return true;
    }

    if (obj.constructor === arrayConstructor) {
        return obj.length == 0;
    }

    if (obj.constructor === objectConstructor) {
        return Object.keys(obj).length === 0;
    }

    console.log('isEmpty -> false');
    return false;
}

/*

Utility functions

*/

function validBoatDataProvided(boat) {
    if (boat.name) {
        if (!validName(boat)) {
            return false
        }
    }

    if (boat.type) {
        if (!validType(boat)) {
            return false
        }
    }

    if (boat.length) {
        if (!validLength(boat)) {
            return false
        }
    }

    return true;
}

function validBoatData(boat) {
    console.log('validBoatData()');
    
    console.log(isNaN(Number(boat.name)));
        console.log(boat.name.length <= 40);
        console.log(typeof boat.name == 'string');
        console.log(isNaN(Number(boat.type)));
        console.log(boat.type.length <= 50);
        console.log(typeof boat.type == 'string');
        console.log(typeof boat.length == 'number');
        console.log(isPositiveInteger(String(boat.length)));
        console.log(boat.length <= 1500);


    if (validName(boat) && validType(boat) && validLength(boat)) {
        return true;
    }
    return false;
}

function validName(boat) {
    if (isNaN(Number(boat.name)) &&
    boat.name.length <= 40 &&
    typeof boat.name == 'string') {
        return true;
    }
    return false;
}

function validType(boat) {
    if (isNaN(Number(boat.type)) &&
    boat.type.length <= 50 &&
    typeof boat.type == 'string') {
        return true;
    }
    return false;
}

function validLength(boat) {
    if (typeof boat.length == 'number' &&
    isPositiveInteger(String(boat.length)) &&
    boat.length <= 1500) {
        return true;
    }
    return false;
}

/**
 * SOURCES CITED: https://bobbyhadz.com/blog/javascript-check-if-string-is-positive-integer
 * 
 * This function was provide as an example to determine if a string is a positive integer.
 */
function isPositiveInteger(str) {
    if (typeof str !== 'string') {
      return false;
    }
  
    const num = Number(str);
  
    if (Number.isInteger(num) && num > 0) {
      return true;
    }
  
    return false;
  }

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

function newJsonObject(someJSON, keys) {
    var newJSON = {}
    for (let key of keys) {
        if (someJSON.hasOwnProperty(key)) {
            newJSON[key] = someJSON[key];
        }
    }
    return newJSON;
}

function logErr(err) {
    console.log('Error in function: ' + logErr.caller);
    console.log(err);
}

function isEmpty(obj) {

    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;

    if (obj == undefined ||
        obj == null      ||
        obj === {}       ||
        obj === []          ) {
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

// return true if the JSON object contains all keys, false otherwise
function contains_keys(someJson, keys) {
    for (let key of keys) {
        if (!someJson.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function value_in_array(value, someArray) {
    for (i=0; i<someArray.length; i++) {
        if (value === someArray[i]) {
            return true;
        }
    }
    return false;
}

module.exports = {
    url,
    logErr,
    isEmpty,
    selfUrlResourceId,
    printMany,
    contains_keys,
    newJsonObject,
    value_in_array,
    validBoatData,
    validName,
    validType,
    validLength,
    validBoatDataProvided
};
