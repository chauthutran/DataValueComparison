
function PreloadProcessManager( afterExecuteFunc )
{
	var me = this;

	me.settingManagement_DM;
	me.orgUnit_DM;
	me.deGroup_DM;
	me.translation_DM;

	me.status_settingManagement_DM = false;
	me.status_orgUnit_DM = false;
	me.status_deGroup_DM = false;

	me.status_OrgUnitRun = false;
	me.status_DEgroupRun = false;
	me.status_LevelRun = false;
	me.status_Setting_Run = false;
	me.status_User_OrgUnits_Run = false;
	me.status_Translation_Run = false;


	me.afterExecuteFunc = afterExecuteFunc;


	// -----------------------------------------------

	me.checkAllProcessFinished = function()
	{
		return ( me.status_settingManagement_DM && me.status_orgUnit_DM && me.status_deGroup_DM && me.status_Translation_Run);
	};

	me.preLoadProcess = function()
	{
		// Start the form hiding
		MsgManager.appBlock( "Preload Step Processing" );

		me.settingManagement_DM.performSetup( function()
		{
			me.status_settingManagement_DM = true;

			if ( me.checkAllProcessFinished() )
			{
				MsgManager.appUnblock();

				me.afterExecuteFunc( me.settingManagement_DM, me.orgUnit_DM, me.deGroup_DM );
			}
		});

		me.orgUnit_DM.performSetup( function()
		{
			me.status_orgUnit_DM = true;

			if ( me.checkAllProcessFinished() )
			{
				MsgManager.appUnblock();

				me.afterExecuteFunc( me.settingManagement_DM, me.orgUnit_DM, me.deGroup_DM );
			}
		});

		me.deGroup_DM.performSetup( function()
		{
			me.status_deGroup_DM = true;

			if ( me.checkAllProcessFinished() )
			{
				MsgManager.appUnblock();

				me.afterExecuteFunc( me.settingManagement_DM, me.orgUnit_DM, me.deGroup_DM );
			}
		});

		me.translation_DM.performSetup( function()
		{
			me.status_Translation_Run = true;

			if ( me.checkAllProcessFinished() )
			{
				MsgManager.appUnblock();

				me.afterExecuteFunc( me.settingManagement_DM, me.orgUnit_DM, me.deGroup_DM );
			}
		});

	};


	// ------------------------------------------------
	// -- Initial Setup Related

	me.initialSetup = function()
	{
		me.settingManagement_DM = new SettingManagement_DM();
		me.orgUnit_DM = new OrganisationUnit_DM();
		me.deGroup_DM = new DataElementGroup();
		me.deGroup_DM.initialSetup();
		
		me.translation_DM = new Translation();

		me.preLoadProcess();
	};


	// Initial Setup Call
	me.initialSetup();
}
