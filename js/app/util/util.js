

// ------------------------------------
// *** DHIS AppStore Deploy Version ***
// -- App Manifest Json (Get this via Synch, so that it is defined ahead)
var _appManifest = $.parseJSON( RESTUtil.getSynchData( 'manifest.webapp' ) );
// -- URLs
var _appURL = _appManifest.activities.dhis.href.replace( '*', '' ) + '/';
// ------------------------------------

var _queryURL_api = _appURL + 'api/';


// ------------------------------------------------------------------------------------
// Global variables/objects
// ------------------------------------------------------------------------------------

function Util() {};

var PARAM_ORGUNIT_ID = "@PARAM_ORGUNIT_ID";
var _queryURL_CurrentUser = _queryURL_api + "me";
var _queryURL_Data_Value = _queryURL_api + "analytics.json?paging=false&aggregationType=SUM&";

var DEFAULT_CATEGORY_OPTION_COMBO = "X66r2y4EuwS";

// ------------------------------------------------------------------------------------
// Ajax Utils
// ------------------------------------------------------------------------------------

function getUrlParameter( url, sParam )
{
	var results = new RegExp('[\?&]' + sParam + '=([^&#]*)').exec(url);
    if (results == null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function getURLParameterByVariables( url, name )
{
	var result = [];
	var idx = 0;
	var pairs = url.split("&");
	for( var i=0; i< pairs.length; i++ ){
		var pair = pairs[i].split("=");
		if( pair[0] == name ){
			result[idx] = pair[1];
			idx++;
		}
	}
	return result;
}

// ------------------------------------------------------------------------------------
// Util methods
// ------------------------------------------------------------------------------------

function getDataValueUrlWithParam( deId, ouId, period )
{
	return _queryURL_Data_Value + 'dimension=dx:' + deId + '&dimension=pe:' + period + '&filter=ou:' + ouId;
}

Util.getLastYear = function( year )
{
	return eval(year) - 1;
}

 Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

Util.clearTable = function( table )
{
	table.html("");
};

Util.clearList = function( list ) {
	list.children().remove();
};


Util.showElement = function( element )
{
	element.show( "1000" );
};

Util.hideElement = function( element )
{
	element.hide( "500" );
};

Util.setInnerHTML = function( element, value )
{
	element.html( value );
};

Util.getInnerHTML = function( element )
{
	return element.html();
};

Util.disable = function( tag, disable )
{
	if( disable ) {
		tag.attr("disabled", true);
		tag.css('background-color', 'lightGray')
			.css('border-color', 'Gray')
			.css('cursor', 'auto');
	}
	else
	{
		tag.removeAttr( "disabled" );
		tag.css( 'background-color', '' )
			.css( 'border-color', '' ).css( 'cursor', '' );
	}
};

Util.getValue = function( element )
{
	return element.val();
}

Util.setValue = function( element, value )
{
	element.val(value);
};


Util.disableContainer = function( container )
{
	container.find("input,select,textarea, button").attr("disabled", true );
}

Util.enableContainer = function( container )
{
	container.find("input,select,textarea, button").removeAttr( "disabled" );
}

// ------------------------------------------------------------------------------------
// Check Variable Related

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
};

Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
};

Util.formatNumber = function( number, separatorSign ){
	return number.replace(/\B(?=(\d{3})+(?!\d))/g, "" + separatorSign);
};

//
// ------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------------
// Others
// ------------------------------------------------------------------------------------

function getFieldValue( fieldId )
{
	return jQuery( '#' + fieldId ).val();
}

function setFieldValue( fieldId, value )
{
	return jQuery( '#' + fieldId ).val(value);
};

function byId( elementId )
{
	return jQuery( "#" + elementId );
}