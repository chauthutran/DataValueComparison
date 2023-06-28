
function Header()
{
    var me = this;

    me.headerTextTag = $("#headerText");


    me.init = function()
    {
        me.loadSettingTitle();
        // me.loadSettingStyle();
    };


    me.loadSettingTitle = function()
    {
       var url = _queryURL_api  + "systemSettings.json";
       RESTUtil.getTextData( url, function( settingData ){
            me.headerTextTag.html( settingData.applicationTitle );
       })
    }

    me.loadSettingStyle= function()
    {
       var url = _queryURL_api  + "userSettings/keyStyle";
       RESTUtil.getTextData( url, function( text ){
            me.headerTextTag.html( text );

            // https://dev-data.ippfwhr.org/dhis-web-commons/css/themes/light_blue/light_blue.css
           $("#styleLink").attr("href", "/dhis-web-commons/css/themes/" + text);

       })
    };

    // ----------------------------------------------------------------------------------------
    me.init();
}
