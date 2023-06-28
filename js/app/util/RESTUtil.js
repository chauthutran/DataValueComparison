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

RESTUtil.submitData_Text = function( url, requestType, jsonData, successFunc, failFunc )
{
    $.ajax({
        type: requestType,
        url: url,
        dataType: "json",
        data: JSON.stringify( jsonData ),
        contentType: "application/json;charset=UTF-8",
        success: function( msg ) {
            successFunc();
        },
        error: function( msg ) {
            if( failFunc != undefined ) failFunc();
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

RESTUtil.getTextData = function( url, exeFunc ) {
	return $.ajax({
		type: "GET",
		url: url,
		async: true,
		success: exeFunc 
	}).responseText;
};
