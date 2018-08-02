/**
 * Created by Tran on 9/26/2015.
 */

function DataManagement()
{
    var me = this;
    me._queryURL_OrgUnit_Level = _queryURL_api + "organisationUnitLevels.json?paging=false&fields=id,displayName,level&translate=true";


    me.getSettingData = function( execFunc, actionDone, errorFunc )
    {
        RESTUtil.getAsyncData( me.queryURL_SystemSettings + me.dbSettingName
        , function( json_Data )
        {
            execFunc( json_Data );
        }
        , function()
        {
            if ( actionDone !== undefined ) actionDone();
        }, function()
        {
            if ( errorFunc !== undefined ) errorFunc();
        });
    };

    me.getAllLevel = function( execFunc, doneFunc )
    {
        RESTUtil.getAsyncData( me._queryURL_OrgUnit_Level
            ,function(json)
            {
                execFunc( execFunc );
            }
            ,function(){
                if( doneFunc!==undefined ) doneFunc();
            }
        );
    };

}
