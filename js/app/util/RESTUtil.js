/**
 * Created by Tran on 9/23/2015.
 */

function RESTUtil() {}

RESTUtil.getAsyncData = function( url, actionSuccess, actionDone, errorError )
{
    return $.ajax({
        type: "GET"
        ,dataType: "json"
        ,url: url
        ,async: true
        ,success: actionSuccess
        ,error: function() {
            if ( errorError !== undefined ) errorError();
        }
    }).done( function( data ) {
        if ( actionDone !== undefined ) actionDone();
    });;
}

RESTUtil.getSynchData = function( url ) {
	return $.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		async: false
	}).responseText;
}

RESTUtil.submitData_Text = function( url, jsonData, successFunc, failFunc )
{
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify( jsonData ),
        contentType: "text/plain; charset=utf-8",
        success: function( msg ) {
            successFunc();
        },
        error: function( msg ) {
            failFunc();
        }
    });
}

RESTUtil.getGetData = function( url, actionSuccess, actionError, actionDone )
{
    return $.ajax({
        type: "GET"
        ,url: url
        ,async: true
        ,dataType: "json"
        ,success: actionSuccess
        ,error: actionError
    }).done( function( data ) {
        if ( actionDone !== undefined ) actionDone();
    });;
}
