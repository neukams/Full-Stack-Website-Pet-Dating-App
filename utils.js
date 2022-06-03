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

module.exports = {
    isEmpty,
    logErr
};