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

/*
// Post /boat
// Response example
{
    "name": "Big Bertha",
    "type": "Motorboat",
    "length": 40,
    "loads": [
        {
            "id": 5643,
            "self": "http:/localhost.com/loads/5643"
        },
        {
            "id": 1234,
            "self": "http:/localhost.com/loads/1234"
        }
    ],
    "self": "https://appspot.com/boats/15256"
}

// Post /boat
// error response
{"Error": "The request object is missing at least one of the required attributes"}

// View a boat
{
    "id": 1243
    "name": "Big Bertha",
    "type": "Motorboat",
    "length": 40,
    "loads": [
        {
            "id": 5643,
            "self": "http:/localhost.com/loads/5643"
        },
        {
            "id": 1234,
            "self": "http:/localhost.com/loads/1234"
        }
    ],
    "self": "https://appspot.com/boats/15256"
}


// View all boats (pagination)
{
    "boats": [
        {
            "id": "12345",
            "name": "Big Bertha",
            "type": "Motorboat",
            "length": 40,
            "loads": [],
            "self": "https://appspot.com/boats/15256"
        },
        { ... },
        { ... }
    ],
    "next": "http://localhost.com/boats/..."
}

{
    "id": 1234,
    "volume": 40,
    "item": "legos",
    "creation_date": "9-14/2022",
    "carrier": null,
    "self": "http://localhost:8080/load/1234"
}


{
    "loads": [
        {
            "id": 1234,
            "volume": 40,
            "item": "legos",
            "creation_date": "9-14/2022",
            "carrier": null,
            "self": "http://localhost:8080/load/1234"
        },
        {
            "id": 1234,
            "volume": 40,
            "item": "legos",
            "creation_date": "9-14/2022",
            "carrier": {
                "id": 123, 
                "name": "Big Bertha", 
                "self": "http://localhost:8080/boat/1234"
            },
            "self": "http://localhost:8080/load/1234"
        },
        { ... }
    ]
}

*/