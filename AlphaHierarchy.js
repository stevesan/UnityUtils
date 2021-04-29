#pragma strict

// By default, we use the transform parent. But you can override that here.
var parentOverride:GameObject = null;

var debug = false;
var localAlpha = 1.0;
var updateTk2dSprite = false;
var updateGuiText = false;
var updateLightIntensity = false;
var updateMaterialColor = false;
var updateGuiTexture = false;

private var globalAlphaCache = 1.0;
private var origLightIntensity = 1.0;

function Awake()
{
    if( updateLightIntensity && GetComponent.<Light>() )
        origLightIntensity = GetComponent.<Light>().intensity;
}

function Start()
{
	// We need to receive on-change messages from the parent
	if( parentOverride != null )
	{
		var con = parentOverride.GetComponent(Connectable);

		if( con != null )
		{
			if(debug)
				Debug.Log("adding listener from "+this.gameObject.name+ " to " + parentOverride.name);
			con.AddListener(this.gameObject, "OnParentAlphaChanged", "OnOverrideParentAlphaChanged");
		}
		else
		{
			Debug.LogError("AlphaHierarchy: parentOverride set, but parent does not have Connectable - can't get change messages from it!");
		}
	}
}

function GetLocalAlpha() : float
{
    return localAlpha;
}

function OnOverrideParentAlphaChanged()
{
	OnParentAlphaChanged();

	// We have to re-broadcast the message to all our children..
	// THIS IS REALLY UNCLEAN. We should just only broadcast to immediate children, and let it propogate naturally. That would be way more efficient anyway.
	BroadcastMessage( "OnParentAlphaChanged", SendMessageOptions.DontRequireReceiver );
}

function OnParentAlphaChanged()
{
    globalAlphaCache = EvalGlobalAlpha();

    if( updateTk2dSprite )
        GetComponent( tk2dSprite ).color.a = globalAlphaCache;

    if( updateGuiText && GetComponent.<GUIText>() != null )
        GetComponent.<GUIText>().material.color.a = globalAlphaCache;

    if( updateLightIntensity && GetComponent.<Light>() )
        GetComponent.<Light>().intensity = globalAlphaCache * origLightIntensity;

	if( updateMaterialColor )
	{
		var c = GetComponent.<Renderer>().material.GetColor("_Color");
		c.a = globalAlphaCache;
		GetComponent.<Renderer>().material.SetColor("_Color", c);
	}

    if( updateGuiTexture && GetComponent.<GUITexture>() )
        GetComponent.<GUITexture>().color.a = globalAlphaCache;
}

private var isBroadcasting = false;

function SetLocalAlpha( value:float, triggerBroadcast:boolean )
{
    localAlpha = value;
    OnParentAlphaChanged();

    if( triggerBroadcast && !isBroadcasting )
    {
        // guard to prevent infinite recursion
        isBroadcasting = true;
        BroadcastMessage( "OnParentAlphaChanged", SendMessageOptions.DontRequireReceiver );
		var con = GetComponent(Connectable);
		if( con != null )
		{
			con.TriggerEvent("OnParentAlphaChanged");
		}
        isBroadcasting = false;
    }
}

function GetGlobalAlpha() : float
{
    return globalAlphaCache;
}

function GetParent()
{
	if( parentOverride != null )
		return parentOverride;
	else if( transform.parent )
		return transform.parent.gameObject;
	else
		return null;
}

private function EvalGlobalAlpha() : float
{
    var alpha = localAlpha;
    var ancestor:GameObject = GetParent();

    // Go up the hierarchy looking for ancestor's with the AlphaHierarchy component
    // Multiply in their alphas

    while( ancestor != null )
    {
		var comp = ancestor.GetComponent(AlphaHierarchy);

		// We don't require all ancestors to have the component.
		if( comp != null )
		{
			alpha *= comp.GetLocalAlpha();
			ancestor = comp.GetParent();
		}
		else if( ancestor.transform.parent )
        	ancestor = ancestor.transform.parent.gameObject;
		else
			ancestor = null;
    }

    return alpha;
}
