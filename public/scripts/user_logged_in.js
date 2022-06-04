/* 

    Pairs with the user_created.html file

*/

// event listener for the 'go-home' button
document.getElementById('go-home').addEventListener('click', function(event){
    event.preventDefault()
    navigate_home();
});

// navigates the user back to the base domain
async function navigate_home() {
    console.log('navigate_home()');
    
    var getUrl = window.location;
    var baseUrl = getUrl .protocol + "//" + getUrl.host //+ "/" + getUrl.pathname.split('/')[1];

    console.log(baseUrl);
    window.location = baseUrl;
}