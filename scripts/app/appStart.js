// initialize Everlive SDK
var el = new Everlive({
    apiKey: applicationSettings.apiKey
});

var mobileApp = new kendo.mobile.Application(document.body, {
    /*transition: 'slide',*/
    layout: 'mobile-tabstrip',
    skin: 'flat'
});