// IMPORTANT: Make sure to set DebugText to run before anything else in the project's script execution order

#pragma strict

class DebugTextEntry
{
	var worldPos:Vector3;
	var text:String;

	function DebugTextEntry( _worldPos:Vector3, _text:String )
	{
		worldPos = _worldPos;
		text = _text;
	}
}

private var entries = new List.<DebugTextEntry>();

function Awake()
{
	if( s_singleton == null )
	{
		Debug.Log("DebugText singleton created");
		s_singleton = this;
	}
	else
	{
		Debug.LogError("More than one instance of DebugText! My name = "+name);
		Destroy(this);
	}
}

function Update()
{
	if( entries.Count > 0 )
	{
		// OnGUI-draw seems to be called after all script updates, so we should clear things
		// the NEXT frame. Thus, DebugText needs to be FIRST in order, so we can clear 
		// entries from the PREVIOUS frame.
		entries.Clear();
	}
}

function OnGUI()
{
  if (Application.isEditor)  // or check the app debug flag
  {
	  var style = new GUIStyle();
	  style.fontStyle = GetComponent(GUIText).fontStyle;
  
  	for( var entry in entries )
  	{
  		var screenPos = Camera.main.WorldToScreenPoint(entry.worldPos);
  		screenPos.y = Screen.height - screenPos.y;
  		var rect = Rect(Mathf.RoundToInt(screenPos.x), Mathf.RoundToInt(screenPos.y), 100, 20);
    	GUI.Label(rect, entry.text, style);
    }
  }
}

static private var s_singleton:DebugText = null;

static function Get()
{
	return s_singleton;
}

static function Add( worldPos:Vector3, text:String )
{
	s_singleton.entries.Add( new DebugTextEntry(worldPos, text) );
}

