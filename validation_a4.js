/*
    Validation functions for resources
        - Boat
        - Load
*/

function boat(boat) {
    if (boat.hasOwnProperty('name') && boat.hasOwnProperty('type') && boat.hasOwnProperty('length')) {
        console.log('valid boat');
        return true
    } else {
        console.log('invalid boat');
        return false;
    }
}

function load(slip) {
    if (slip.hasOwnProperty('volume') && slip.hasOwnProperty('item') && slip.hasOwnProperty('creation_date')) {
        console.log('valid slip');
        return true
    } else {
        console.log('invalid slip');
        return false;
    }
}

// return true if the JSON object contains all keys, false otherwise
function keys(someJson, keys) {
    for (let key of keys) {
        if (!someJson.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

module.exports = {boat, load, keys};