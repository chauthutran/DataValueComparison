
var SUPER_USER_ROLE = "M7829GUPC5B"; // _CORE - Superuser

// -----------------------------------------------------------------------------
// -- Form Events
// ---------

jQuery( document ).ready( function() {

	// Preload some processes and start FormAction class ( the main class )
	var preloadProcessorManager = new PreloadProcessManager( function( settingManagement_DM, orgUnit_DM, deGroup_DM )
	{
		var app = new FormAction( settingManagement_DM, orgUnit_DM, deGroup_DM );
		app.initialSetup();
	});

});

// ---------
// -- Form events
// -----------------------------------------------------------------------------


function FormAction( settingManagement_DM, orgunit_DM, deGroup_DM )
{
	var me = this;
	me.settingManagement_DM = settingManagement_DM;
	me.orgunit_DM = orgunit_DM;
	me.deGroup_DM = deGroup_DM;

	me.settingManagement_UI = new SettingManagement_UI( me );
	me.orgunit_UI = new OrganisationUnit_UI( me, me.orgunit_DM );
	me.analysis = new Analysis( me );

	me.analyticsSetTag = byId( 'analyticsSet' );
	me.loaderDivTag = byId( 'loaderDiv' );
	me.periodIdTag = byId( 'periodId' );
	me.orgunitIdTag = byId( 'orgunitId' );
	me.deGroupIdTag = byId( 'deGroupId' );
	me.variationTag = byId( 'variation' );
	me.analyticsBtnTag = byId( 'analyticsBtn' );
	me.comparisonTbTag = byId( 'comparisonTb' );
	me.resultTag = byId( 'result' );
	me.progressDivTag = byId( 'progressDiv' );
	me.hideEmptyRowChkTag = byId( 'hideEmptyRowChk' );
	me.showOutliersChkTag = byId( 'showOutliersChk' );
	me.orgunitLevelDivTag = byId( 'orgunitLevelDiv' );
	me.changeLevelBtnTag = byId( 'changeLevelBtn' );
	me.levelTag = byId( 'level' );


	me.initialSetup = function(){

		me.setup_Events();

		me.generatePeriods();
		me.orgunit_UI.initialSetup();
		me.settingManagement_UI.initialSetup();
	};


	me.setup_Events = function()
	{
		me.orgunitIdTag.change( me.paramOnchange );
		me.deGroupIdTag.change( me.paramOnchange );
		me.periodIdTag.change( me.paramOnchange );
		me.variationTag.change( me.paramOnchange );
		me.variationTag.keypress( me.variationOnKeypress );
		me.showOutliersChkTag.change( me.rowsFilter );
		me.hideEmptyRowChkTag.change( me.rowsFilter );

		me.analyticsBtnTag.click( me.run );
		me.changeLevelBtnTag.click( me.showLevelForm );
	};

	me.generatePeriods = function()
	{
		var curDate = new Date();
		var curYear = curDate.getFullYear();

		var period = me.periodIdTag;
		for( var i = curYear; i>= 2000; i -- )
		{
			period.append("<option value='" + i + "'>" + i + "</option>");
		}
	};

	// ---------------------------------------------------------------------------------------------------------------------
	// Validation and Run Analytics
	// ---------

	me.validate = function()
	{
		return me.validParamField( me.orgunitIdTag ) && me.validParamField( me.deGroupIdTag ) && me.validParamField( me.variationTag );
	};

	me.run = function()
	{
		if( me.validate() ) 
		{
			deCount = 0;
			deTotal = 0;

			Util.clearTable( me.comparisonTbTag );
			Util.setInnerHTML( me.progressDivTag, 'Loading data elements ... ' );
			me.hideEmptyRowChkTag.prop( "checked", true );
			me.loaderDivTag.show();
			Util.showElement( me.resultTag );

			var curPeriod = Util.getValue( me.periodIdTag );
			var lastPeriod = Util.getLastYear( curPeriod );
			var variation = Util.getValue( me.variationTag );

			var analysis = new Analysis( me );
			analysis.run();
		}
	};

	me.validParamField = function( element )
	{
		var valid = true;
		var value = element.val();

		if ( value == "" ) {

			element.css('border-color', '#EF1414' );
			element.attr('placeholder','Please enter a number' );
			element.focus();

			valid = false;
		}
		else
		{
			element.css('border-color', '' );
		}
		return valid;
	};

	// ---------
	// Validation and Run Analytics
	// ---------------------------------------------------------------------------------------------------------------------

	me.variationOnKeypress = function()
	{
		var key = event.keyCode || event.charCode || event.which;
		return !!(key >= 48 && key <= 57);
	};


	me.paramOnchange = function()
	{
		Util.hideElement( me.resultTag );
	};

	// ---------------------------------------------------------------------------------------------------------------------
	// -- Events
	// ---------

	me.rowsFilter = function()
	{
		var table = me.comparisonTbTag;
		var hideEmptyRow = me.hideEmptyRowChkTag.is(":checked");
		var showOutliersChk =  me.showOutliersChkTag.is(":checked");

		if( showOutliersChk )
		{
			table.find('tbody tr.dataRow').hide();
			table.find('tbody td.orangeRow').closest('tr').show();
		}
		else if(hideEmptyRow) {
			table.find('tbody tr.dataRow').show();
			table.find('tbody tr.empty').hide();
		}
		else
		{
			table.find('tbody tr').show();
		}

	};

	me.showLevelForm = function(){
		me.orgunitLevelDivTag.dialog({
			title: 'Change Organisation Unit Level',
			maximize: true,
			closable: true,
			modal: true,
			width: 350,
			height: 120,
			buttons: {
				"Change": function () {
					me.orgunit_UI.currentLevel = me.levelTag.val();
					me.orgunit_UI.setLevel();
					$(this).dialog("close");
				},
				"Close": function () {
					me.levelTag.val( me.orgunit_UI.currentLevel );
					$(this).dialog("close");
				}
			}
		}).show('fast' );
	};

	// ---------
	// -- Events
	// ---------------------------------------------------------------------------------------------------------------------

}

// -----------------------------------------------------------------------------
// -- Organisation Unit objects
// ---------

function OrganisationUnit_UI( formAction, actionDone )
{
	var me = this;
	me.formAction = formAction;
	me.orgunit_DM = me.formAction.orgunit_DM;
	me.settingManagement_UI = me.formAction.settingManagement_UI;

	me.DEFAULT_LEVEL = 5;
	me.currentLevel = me.DEFAULT_LEVEL;

	me.dataCaptureOrgUnits = [];
	me.dataOutputOrgUnits = [];

	me.orgunitIdTag = $("#orgunitId");
	me.levelTag =$("#level");
	me.orgunitLevelDivTag = $("#orgunitLevelDiv");
	me.resultTag = $("#result");

	me.initialSetup = function()
	{
		me.getAllLevel();
		me.getUserOrgunits();
	};
	
	me.getAllLevel = function()
	{
		Util.clearList( me.levelTag );
		me.orgunit_DM.levels.forEach(function (level) {
			me.levelTag.append("<option value='" + level.level + "'>" + level.displayName + "</option>");
		});

		me.levelTag.val( me.DEFAULT_LEVEL );
	};

	// Load Orgunits by selected level

	me.loadOrgunitsBySetting = function()
	{
		if( me.settingManagement_UI.showUserDataCaptureOUSetting() ){
			for( var i=0; i<me.dataCaptureOrgUnits.length; i++ ){
				var orgunit = me.dataCaptureOrgUnits[i];
				var level =  me.getOrgunitLevel( orgunit );
				if( level >= 0 ) {
					me.getOrgunitsByLevel( level, orgunit.id );
				}
			}
		}
		else if( me.settingManagement_UI.showUserDataOutputOUSetting() ){
			for( var i=0; i<me.dataOutputOrgUnits.length; i++ ){
				var orgunit = me.dataOutputOrgUnits[i];
				var level = me.getOrgunitLevel( orgunit );
				if( level >= 0 ) {
					me.getOrgunitsByLevel( level, orgunit.id );
				}
			}
		}
		else{
			me.getOrgunitsByLevel( me.levelTag.val() );
		}
	};

	me.getOrgunitLevel = function( orgunit )
	{
		var level = eval( me.levelTag.val() );
		level = (level - eval( orgunit.level ));
		return level;
	};

	me.getOrgunitsByLevel = function( level, ouId )
	{
		Util.clearList( me.orgunitIdTag );
		Util.disable( me.orgunitIdTag, true );
		me.orgunitIdTag.append( "<option style='font-style:italic'>Loading ... </option>" );
		
		me.orgunit_DM.getOrgunitsByLevel( level, ouId
			, function( orgunits )
			{
				Util.clearList( me.orgunitIdTag );
				
				orgunits.forEach(function (ou) {
					me.orgunitIdTag.append("<option value='" + ou.id + "'>" + ou.displayName + "</option>");
				});
				
				Util.disable( me.orgunitIdTag, false );
			}
		);
	};

	// ---------------------------------------------------------------------------------------------------------------------
	// -- User Data Capture Orgunits & Data Output Orgunits
	// ---------

	me.getUserOrgunits = function()
	{
		me.orgunit_DM.getUserOrgunits( function( json ){
			me.dataCaptureOrgUnits = json.organisationUnits;
			me.dataOutputOrgUnits = json.dataViewOrganisationUnits;
		}, function(){
			me.loadOrgunitsBySetting();
		});
	};

	me.getSelected = function()
	{
		var id = Util.getValue( me.orgunitIdTag );
		var name = me.orgunitIdTag.find('option:selected').text();
		return {id: id, name: name };
	};

	me.setLevel = function()
	{
		Util.hideElement( me.resultTag );

		me.loadOrgunitsBySetting();
	};

}

function OrganisationUnit_DM()
{
	var me = this;

	me.levels = [];
	me._queryURL_OrgUnit_Level = _queryURL_api + "organisationUnitLevels.json?paging=false&fields=id,displayName,level&translate=true";
	me._queryURL_ALL_OrgUnit = _queryURL_api + "organisationUnits.json?paging=false&fields=displayName,id&translate=true&level=";
	me._queryURL_OrgUnit = _queryURL_api + "organisationUnits/" + PARAM_ORGUNIT_ID + ".json?paging=false&fields=displayName,id&level=";
	me._queryURL_User_OrgUnit = _queryURL_api + "me.json?fields=organisationUnits[id,name,level],dataViewOrganisationUnits[id,name,level]";

	me.PARAM_ORGUNIT_ID = "@PARAM_ORGUNIT_ID";

	me.performSetup = function( execFunc, doneFunc)
	{
		RESTUtil.getAsyncData( me._queryURL_OrgUnit_Level
			,function(json)
			{
				me.levels = Util.sortByKey( json.organisationUnitLevels, "level" );

				execFunc();
			}
			,function(){
				if( doneFunc!==undefined ) doneFunc();
			}
		);
	};

	me.getOrgunitsByLevel = function( level, ouId, runFunc, doneFunc )
	{
		var url = "";
		if (ouId === undefined) {
			url = me._queryURL_ALL_OrgUnit + level;
		}
		else {
			url = me._queryURL_OrgUnit + level;
			url = url.replace( me.PARAM_ORGUNIT_ID, ouId );
		}
		
		
		RESTUtil.getAsyncData( url
			,function(json)
			{
				var orgunits = Util.sortByKey( json.organisationUnits, "displayName" );
				runFunc( orgunits );
			}
			,function( data ){
				if( doneFunc !== undefined ) doneFunc();
			}
		);
	};

	me.getUserOrgunits = function( runFunc, actionFunc )
	{
		RESTUtil.getAsyncData( me._queryURL_User_OrgUnit
			,function(json)
			{
				runFunc( json )
			}
			,function(){
				if( actionFunc!== undefined ) actionFunc();
			}
		);
	};
}

// ---------
// -- Organisation Unit objects
// -----------------------------------------------------------------------------

function SettingManagement_UI( formAction, actionDone )
{
	var me = this;

	me.formAction = formAction;
	me.settingManagement_DM = me.formAction.settingManagement_DM;

	me.settingPopupFormOpenBtnTag = $( '#settingPopupFormOpenBtn' );
	me.settingDialogFormTag = $( '#settingDialogForm' );

	me.width = 400;
	me.height = 260;

	me.analyticsBtnTag = $("#analyticsBtn");
	me.resultTag = $("#result");
	me.decimalDataSettingsTag = $("#decimalDataSettings");
	me.decimalPercentChangeSettingsTag = $("#decimalPercentChangeSettings");


	me.SETTING_SHOW_ORGUNIT_KEY = "showOrgunitSettings";
	me.SETTING_SHOW_ALL_ORGUNIT = "all";
	me.SETTING_SHOW_USER_DATA_CAPTURE_ORGUNIT = "userDataCapture";
	me.SETTING_SHOW_USER_DATA_OUTPUT_ORGUNIT = "userDataOutput";

	me.SETTING_NAME_TO_USE = "nameToUseSettings";
	me.SETTING_NAME_TO_USE_FULL_NAME = "name";
	me.SETTING_NAME_TO_USE_SHORT_NAME = "shortName";
	me.SETTING_NAME_TO_USE_FORM_NAME = "formName";

	me.SETTING_THOUSAND_SEPARATOR = "thousandSeparatorSettings";
	me.SETTING_THOUSAND_SEPARATOR_SPACE = "space";
	me.SETTING_THOUSAND_SEPARATOR_COMMA = "comma";
	me.SETTING_THOUSAND_SEPARATOR_DOT = "dot";
	me.SETTING_THOUSAND_SEPARATOR_APOSTROPHE = "apostrophe";

	me.SETTING_DECIMAL_DATA = "decimalDataSettings";
	me.SETTING_DECIMAL_PERCENT_CHANGE = "decimalPercentChangeSettings";

	// Initial Setup Call
	me.initialSetup = function()
	{
		me.FormPopupSetup();

		// Set up Event Handlers
		me.setup_Events();

		// Retrieve and Populate Data to HTML
		me.retrieveAndPopulate();
	};

	me.retrieveAndPopulate = function()
	{
		var settingData = me.settingManagement_DM.settingData;
		for( var i=0; i<settingData.length; i++ )
		{
			var id = settingData[i].key;
			var value = settingData[i].name;
			var tag = $("#" + id);
			Util.setValue( tag, value );
		}
	};

	me.setup_Events = function()
	{
		me.settingPopupFormOpenBtnTag.click( function()
		{
			me.openDialogForm();
		});

		me.settingDialogFormTag.find("input,select").change(function(){
			var item = $(this);
			var json_Data = me.getJson_Data();
			me.settingManagement_DM.saveSettingData( json_Data, function(){
				item.css('background-color',"#B9FFB9");
			});
		});

		me.decimalDataSettingsTag.keypress( function( e ){
			return me.setUp_NumberKeypress_Events( this.value, e );
		});
		
		me.decimalPercentChangeSettingsTag.keypress( function( e ){
			return me.setUp_NumberKeypress_Events( this.value, e );
		});

	};

	me.setUp_NumberKeypress_Events = function( value, e )
	{
		if( e.keyCode >= 48  && e.keyCode <= 57 )
		{
			var oldValue = value;
			var newValue = oldValue + ( e.keyCode - 48 );
			return ( newValue >= 0 && newValue <= 10 );
		}
		
		return false;
	};
	
	me.FormPopupSetup = function()
	{
		// -- Set up the form -------------------
		me.settingDialogFormTag.dialog( {
			autoOpen: false
			,width: me.width
			,height: me.height
			,modal: true
			,title: "Settings"
			,close: function( event, ui )
			{
				$( this ).dialog( "close" );
			},
			buttons: {
				"Close": function () {
					Util.hideElement( me.resultTag );
					$(this).dialog("close");
				}
			}
		});
	};

	me.openDialogForm = function()
	{
		me.settingDialogFormTag.show();
		me.settingDialogFormTag.dialog( "open" );
	};

	me.getJson_Data = function()
	{
		var json_Data = [];

		me.settingDialogFormTag.find("input,select").each(function(){
			var item = $(this);
			var setting = {
				key:item.attr("id"),
				name:item.val()
			};
			json_Data.push( setting );
		});

		return json_Data;
	};

	me.saveSettingData = function( successFunc )
	{
		var json_Data = me.getJson_Data();
		me.settingManagement_DM.saveSettingData( json_Data, function(){
			me.settingManagement_DM.settingData = json_Data;
		});
	};

	me.getSettingDataByKey = function( key, defaultValue )
	{
		return me.settingManagement_DM.getSettingDataByKey( key, defaultValue );
	};

	me.showDataElementSetting = function()
	{
		var settingVal = me.getSettingDataByKey( me.SETTING_NAME_TO_USE );
		settingVal = ( settingVal == "" ) ? me.SETTING_NAME_TO_USE_FULL_NAME : settingVal;
		settingVal = ( settingVal == me.SETTING_NAME_TO_USE_FULL_NAME ) ? "displayName" : settingVal;
		return settingVal;
	};

	me.showUserDataCaptureOUSetting = function() {
		var settingVal = me.getSettingDataByKey( me.SETTING_SHOW_ORGUNIT_KEY );
		return ( settingVal == me.SETTING_SHOW_USER_DATA_CAPTURE_ORGUNIT );
	};

	me.showUserDataOutputOUSetting = function() {
		var settingVal = me.getSettingDataByKey( me.SETTING_SHOW_ORGUNIT_KEY );
		return ( settingVal == me.SETTING_SHOW_USER_DATA_OUTPUT_ORGUNIT );
	};

}

function SettingManagement_DM()
{
	var me = this;
	me.settingData = [];

	me.dbSettingName = "Comparision_Settings";
	me.queryURL_SystemSettings = _queryURL_api + 'systemSettings/';

	me.saveSettingData = function( json_Data, successFunc )
	{
		RESTUtil.submitData_Text( me.queryURL_SystemSettings + me.dbSettingName, json_Data
			, function()
			{
				me.settingData = json_Data;
				if( successFunc !== undefined ) successFunc();
			}
		);
	};

	me.performSetup = function( execFunc )
	{
		if ( me.settingData.length != 0 )
		{
			execFunc();
		}
		else
		{
			RESTUtil.getAsyncData( me.queryURL_SystemSettings + me.dbSettingName
				, function( json_Data )
				{
					me.settingData = json_Data;
					me.updateVersion();
					execFunc();
				}, function( xhr ){ }
				, function( ){
					me.updateVersion();
					// IN case the system setting of data-comparision doesn't exist
					execFunc();
				});
		}
		
	};

	me.getSettingDataByKey = function( key, defaultValue )
	{
		var settingData = me.settingData;
		if( settingData.length > 0 ){
			for( var i=0; i<settingData.length; i++ )
			{
				if( settingData[i].key == key ) return settingData[i].name;
			}
		}

		if( defaultValue !== undefined ) return defaultValue;
		return "";
	};
	
	me.updateVersion = function()
	{
		var numberOfDecimalSettings = me.getSettingDataByKey( "numberOfDecimalSettings" );
		
		if( numberOfDecimalSettings == '' )
		{
			for( var i=0; i<me.settingData.length; i++ )
			{
				if( me.settingData[i].key == "numberOfDecimalSettings" ) 
				{
					me.settingData[i].key = "decimalDataSettings";
				}
			}
		
			me.saveSettingData( me.settingData );
		}
		
	}
}

// ---------------------------------------------------------------------------------------------------------------------
// -- Data element Object
// ---------


function DataElementGroup() {

	var me = this;

	me._queryURL_DataElement_Group = _queryURL_api + "dataElementGroups.json?paging=false&fields=displayName,id&translate=true";
	me._queryURL_DataElement_Group_Set = _queryURL_api + "dataElementGroupSets.json?paging=false&fields=displayName,id&translate=true";
	
	me.deOptionsTag = $( "#deOptions" );
	
	me.deGroupIdTag = $("#deGroupId");

	me.initialSetup = function()
	{
		me.setup_Events();
	};
	
	me.performSetup = function( exeFunc ) 
	{
		me.getDeGroups( exeFunc );
	};
	
	me.setup_Events = function()
	{
		me.deOptionsTag.change( function(){
			var option = $( this ).val();
			if( option == 'deGroup' )
			{
				me.getDeGroups();
			}
			else if( option == 'deGroupSet' )
			{
				me.getDeGroupSets();
			}
		});
	};
	
	me.getSelected = function()
	{
		var id = Util.getValue( me.deGroupIdTag );
		var name = me.deGroupIdTag.find('option:selected').text();
		return {id: id, name: name };
	};
	
	me.getDeGroupSets = function( exeFunc )
	{
		Util.clearList( me.deGroupIdTag );
		Util.disable( me.deGroupIdTag, true );
		me.deGroupIdTag.append( "<option style='font-style:italic'>Loading ... </option>" );
		
		RESTUtil.getAsyncData( me._queryURL_DataElement_Group_Set
			,function( json )
			{
				Util.clearList( me.deGroupIdTag );
				
				var groupSets = json.dataElementGroupSets;
				for( var i=0; i<groupSets.length; i++ )
				{
					me.deGroupIdTag.append( "<option value='" + groupSets[i].id + "'>" + groupSets[i].displayName + "</option>" );
				}
				
				Util.disable( me.deGroupIdTag, false );
				if( exeFunc !== undefined ) exeFunc();
			}
		);
	};
	
	me.getDeGroups = function( exeFunc )
	{
		Util.clearList( me.deGroupIdTag );
		Util.disable( me.deGroupIdTag, true );
		me.deGroupIdTag.append( "<option style='font-style:italic'>Loading ... </option>" );
		
		RESTUtil.getAsyncData( me._queryURL_DataElement_Group
			,function( json )
			{
				Util.clearList( me.deGroupIdTag );
				
				var groups = json.dataElementGroups;
				for( var i=0; i<groups.length; i++ )
				{
					me.deGroupIdTag.append( "<option value='" + groups[i].id + "'>" + groups[i].displayName + "</option>" );
				}
				
				Util.disable( me.deGroupIdTag, false );
				if( exeFunc !== undefined ) exeFunc();
			}
		);
	};
}


// ---------
// -- Data element Object
// ---------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------
// -- Data Calculation
// ---------


function DataCalculation( formAction, deId ) 
{
	var me = this;
	me.formAction = formAction;
	me.orgunit_UI = me.formAction.orgunit_UI;
	me.analysisData = me.formAction.analysis.getAnalysisData();
	me.settingManagement_UI = me.formAction.settingManagement_UI;

	me.progressDivTag = $( "#progressDiv" );
	me.loaderDivTag = $( "#loaderDiv" );

	me.setData = function()
	{
		me.retrieveDataValue( me.analysisData.curPeriod );
		me.retrieveDataValue( me.analysisData.lastPeriod );
	};

	me.retrieveDataValue = function( period )
	{
		var url = getDataValueUrlWithParam( deId, me.orgunit_UI.getSelected().id, period );
		RESTUtil.getGetData( url
			,function(json)
			{
				json.rows.forEach(function (dataValue) {
					var de = dataValue[0];
					var pe = dataValue[1];
					var value = dataValue[2];
					value = ( value == "" ) ? "0" : value;

					var decimalNo = me.settingManagement_UI.getSettingDataByKey( me.settingManagement_UI.SETTING_DECIMAL_DATA, 0 );
					me.analysisData.table.find( "#" + de ).find( '[period="' + pe + '"]' ).attr( "realval", value ).attr( "title", value ).html( me.formatValue( value, decimalNo ) );
				});
			}
			,function( data )
			{
				var json = $.parseJSON( data.responseText );
				var de = me.getDeIdFromURL( this.url );
				var pe = me.getPeriodIdFromURL( this.url );
				var value = json.message;

				me.analysisData.table.find( "tbody" ).find( 'tr' ).remove();
				var row = $( "<tr></tr>" );
				row.append( "<td colspan='4'>" + json.message + "</td>" );
				me.analysisData.table.find( "tbody" ).append( row );

				me.progress();
			}
			,function()
			{
				me.progress();
			}
		);
	};

	me.getPeriodIdFromURL = function(url)
	{
		var urlValues = getURLParameterByVariables( url, "dimension" );
		for( var i=0; i<urlValues.length; i++ ){
			if( urlValues[i].indexOf("pe:") == 0 ){
				return urlValues[i].replace("pe:", "");
			}
		}

		return "";
	};

	me.getDeIdFromURL = function(url)
	{
		var urlValues = getURLParameterByVariables( url, "dimension" );
		for( var i=0; i<urlValues.length; i++ ){
			if( urlValues[i].indexOf( "dx:" ) == 0 ){
				return urlValues[i].replace( "dx:", "" );
			}
		}

		return "";
	};

	me.progress = function()
	{
		deCount ++;
		var progressing = Math.ceil( deCount / 2 );
		Util.setInnerHTML( me.progressDivTag, 'Retrieving data values ' + progressing + "/" + deTotal );

		if( deCount == ( deTotal * 2 ) )
		{
			Util.hideElement( me.loaderDivTag );
			$( '.grayRow' ).removeClass( 'grayRow' );
			me.gainCalculate();
		}
	};

	me.gainCalculate = function()
	{
		var lastPeriodTotal = 0;
		var curPeriodTotal = 0;
		
		var decimalData = me.settingManagement_UI.getSettingDataByKey( me.settingManagement_UI.SETTING_DECIMAL_DATA );		
		
		me.analysisData.table.find( 'tbody tr.dataRow' ).each( function()
		{
			var curData = me.getPeriodVal( this, me.analysisData.curPeriod );
			var lastData = me.getPeriodVal( this, me.analysisData.lastPeriod );
						
			// Set emty row
			
			if ( lastData == 0 && curData == 0 ) 
			{
				$( this ).addClass( "empty" );
				$( this ).hide();
			}
			
			// Calculate 'gain' value
			
			me.setGainVal( $( this ), lastData, curData );
			
			// Calculate the number total of period
			
			lastPeriodTotal += lastData;
			curPeriodTotal += curData;
			
		});
		
		// Set total values
		
			
		var totalRowTag = me.analysisData.table.find( 'tbody tr.totalRow' );
		me.setGainVal( totalRowTag, lastPeriodTotal, curPeriodTotal );
		
		totalRowTag.find( 'td.lastPeriod').attr( 'realVal', lastPeriodTotal ).attr( 'title', lastPeriodTotal ).html( me.formatValue( lastPeriodTotal, decimalData ) );
		totalRowTag.find( 'td.curPeriod').attr( 'realVal', curPeriodTotal ).attr( 'title', curPeriodTotal ).html( me.formatValue( curPeriodTotal, decimalData ) );
	};
	
	me.roundValue = function( value, decimalNo )
	{
		decimalNo = ( decimalNo == "") ? 0 : decimalNo;
		return eval(value).toFixed( decimalNo );
	};

	me.formatValue = function( value, decimalNo )
	{
		value = me.roundValue( value, decimalNo );

		var thousandSeparatorSetting = me.settingManagement_UI.getSettingDataByKey( me.settingManagement_UI.SETTING_THOUSAND_SEPARATOR );
		var thousandSeparatorSign = "";
		if( thousandSeparatorSetting == me.settingManagement_UI.SETTING_THOUSAND_SEPARATOR_SPACE ){
			thousandSeparatorSign = " ";
		}
		else if( thousandSeparatorSetting == me.settingManagement_UI.SETTING_THOUSAND_SEPARATOR_COMMA ){
			thousandSeparatorSign = ",";
		}
		else if( thousandSeparatorSetting == me.settingManagement_UI.SETTING_THOUSAND_SEPARATOR_DOT ){
			thousandSeparatorSign = ".";
		}
		else if( thousandSeparatorSetting == me.settingManagement_UI.SETTING_THOUSAND_SEPARATOR_APOSTROPHE ){
			thousandSeparatorSign = "'";
		}

		var partValues = value.split(".");
		var part1 = Util.formatNumber( partValues[0], thousandSeparatorSign );

		if( partValues.length == 2 )
		{
			value = part1 + "." + partValues[1];
		}
		else{
			value = part1;
		}
		return value;
	};

	me.getPeriodVal = function( row, period )
	{
		var realValue = $( row ).find( '[period="' + period +'"]' ).attr( 'realval' );
		return ( realValue == undefined ) ? 0 : eval( realValue );
	}

	me.setGainVal = function( rowTag, lastData, curData )
	{	
		var realValue = 0;
		if( lastData == 0 && curData == 0 )
		{
			realValue = 0;
		}
		else if( lastData == 0 && curData != 0 )
		{
			realValue = 100;
		}
		else if( lastData != 0 && curData == 0 )
		{
			realValue = -100;
		}
		else
		{
			realValue = ( ( curData - lastData ) / lastData ) * 100;
		}
		
		var decimalPercentChange = me.settingManagement_UI.getSettingDataByKey( me.settingManagement_UI.SETTING_DECIMAL_PERCENT_CHANGE , 1 );
		var displayValue = me.formatValue( realValue, decimalPercentChange );
		
		$( rowTag ).find( '.gain' ).attr( 'realVal', realValue ).attr( "title", realValue ).html( displayValue + "%" );
		
		if ( !$( rowTag ).hasClass( 'totalRow' ) 
			&& ( displayValue >= me.analysisData.variation || displayValue <= -1 * me.analysisData.variation ) )
		{
			rowTag.find( 'td:last' ).addClass( 'orangeRow' );
		}
		
		rowTag.css('background-color','' );
		
	}
	
}


// ---------
// -- Data Calculation
// ---------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------
// -- Analysis Object
// ---------

var deTotal = 0;
var deCount = 0;

function Analysis( formAction )
{
	var me = this;

	me._queryURL_DataElements_Prefix = _queryURL_api + "dataElements.json?fields=id,displayName,formName,shortName&translate=true&paging=false&filter=";
	me._queryURL_DataElements_Group = me._queryURL_DataElements_Prefix + "dataElementGroups.id:eq:";
	me._queryURL_DataElements_Group_Set = me._queryURL_DataElements_Prefix + "dataElementGroups.dataElementGroupSet.id:eq:";

	me.formAction = formAction;
	me.orgunit_UI = me.formAction.orgunit_UI;

	me.settingManagement_UI = me.formAction.settingManagement_UI;

	me.periodIdTag = $( "#periodId" );
	me.variationTag = $( "#variation" );
	me.comparisonTbTag = $( "#comparisonTb" );
	me.deOptionsTag = $( "#deOptions" );
	me.deGroupTag = $( "#deGroupId" );
	me.loaderDivTag = $( "#loaderDiv" );
	me.progressDivTag = $( "#progressDiv" );
	
	me.SETTING_SHOW_ALL_ORGUNIT = "showOrgunitSettings";
	me.SETTING_SHOW_USER_DATA_CAPTURE_ORGUNIT = "userDataCapture";
	me.SETTING_SHOW_USER_DATA_OUTPUT_ORGUNIT = "userDataOutput";

	me.getAnalysisData = function() {
		return {
			table: me.comparisonTbTag,
			ouId: me.orgunit_UI.getSelected.id,
			curPeriod: me.periodIdTag.val(),
			lastPeriod: Util.getLastYear( me.periodIdTag.val() ),
			variation: eval( me.variationTag.val() )
		};
	};

	me.run = function()
	{
		Util.clearTable( me.comparisonTbTag );
		me.generateTableHeader( me.getAnalysisData().curPeriod, me.getAnalysisData().lastPeriod );

		Util.showElement( me.loaderDivTag );
		Util.setInnerHTML( me.progressDivTag, 'Retrieving data elements ... ' );
		
		var url = "";
		if( me.deOptionsTag.val() == 'deGroup' )
		{
			url = me._queryURL_DataElements_Group;
		}
		else if( me.deOptionsTag.val() == 'deGroupSet' )
		{
			url = me._queryURL_DataElements_Group_Set;
		}
		
		RESTUtil.getAsyncData( url + me.deGroupTag.val()
			,function( json )
			{
				deTotal = json.dataElements.length;
				if( deTotal > 0 )
				{
					var deList = Util.sortByKey( json.dataElements, "displayName" );

					for( var i = 0; i < deTotal; i++ ) {
						var de = deList[i];
						me.generateTableRow( de );
					}
					
					me.generateTotalRow();
				}
				else
				{
					Util.hideElement( me.loaderDivTag );
				}
			}
		);
	};


	me.generateTableHeader = function()
	{
		var header = '<thead>';
		header += '<tr>';
		header += '<th>' + me.deGroupTag.find("option:selected").text() + '</th>';
		header += '<th>' + me.getAnalysisData().lastPeriod + '</th>';
		header += '<th>' + me.getAnalysisData().curPeriod + '</th>';
		header += '<th>Percent Change</th>';
		header += '</tr></thead>';

		me.getAnalysisData().table.append(header);
		me.getAnalysisData().table.append('<tbody></tbody>' );
	};

	me.generateTableRow = function( de )
	{
		var deNameSetting = me.settingManagement_UI.showDataElementSetting();
		var deName = de[deNameSetting];

		var row = '<tr id="' + de.id + '" class="grayRow dataRow" style="background-color: silver;"><td>' + deName + '</td>';
		row += '<td style="align:right;" period="' + me.getAnalysisData().lastPeriod + '" align="right" realval="0" title="0" >0</td>';
		row += '<td style="align:right;" period="' + me.getAnalysisData().curPeriod + '" align="right" realval="0" title="0" >0</td>';
		row += '<td style="align:right;" class="gain" align="right"></td>';
		row += '</tr>';

		me.getAnalysisData().table.find( 'tbody' ).append( row );

		var calculate = new DataCalculation( me.formAction, de.id );
		calculate.setData();
	};
	
	me.generateTotalRow = function()
	{
		var row = '<tr id="total" class="totalRow orangeRow" style="background-color:silver; font-weight:bold;"><td>Total</td>';
		row += '<td style="align:right;" class="lastPeriod" align="right" ></td>';
		row += '<td style="align:right;" class="curPeriod" align="right" ></td>';
		row += '<td style="align:right;" class="gain" align="right"></td>';
		row += '</tr>';
		
		me.getAnalysisData().table.find( 'tbody' ).append( row );
	}

}


// ---------
// -- Analysis
// ---------------------------------------------------------------------------------------------------------------------


function Translation()
{
	var me = this;

	me._queryURL_User_Language = _queryURL_api + "me/user-account";
	me.dataFormTag = $( "#dataForm" );

	me.performSetup = function( returnFunc ) {

		RESTUtil.getAsyncData( me._queryURL_User_Language
			,function( json )
			{
				// Get ui-locale which is selected from current user
				var userUiLocale = json.settings.keyUiLocale;
				if( userUiLocale === undefined )
				{
					userUiLocale = "en";
				}

				// Do UI translation
				me.translate( userUiLocale );

				returnFunc();
			}
		);
	};

	me.keywords =
	{
		// Spanish
		"es": {
			"entity": "Entidad"
			, "year": "Año"
			, "deSelector": "Grupo de elementos de datos"
			, "variation": "Variación"
			, "showOutliersOnly": "Sólo mostrar valores atipicos"
			, "hideEmptyRow": "Ocultar filas vacias"
		}
		, "en": {
			"entity": "Entity"
			, "year": "Year"
			, "deSelector": "DE Group"
			, "variation": "Variation"
			, "showOutliersOnly": "Show outliers only"
			, "hideEmptyRow": "Hide empty row"
		}
	};

	me.translate = function( uiLocale ){

		me.dataFormTag.find( "span.label" ).each( function()
		{
			var key = $( this ).attr( "key" );
			var transValue = me.translateKey( uiLocale, key );
			if( transValue !== undefined )
			{
				$( this ).html( transValue );
			}

		});

	};

	me.translateKey = function( lang, key ){
		if( me.keywords[lang] == undefined ) return undefined;
		return me.keywords[lang][key];
	};

}


