#pragma strict

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
    /* TEMP TEMP

    if( updateLightIntensity && light )
        origLightIntensity = light.intensity;
        */
}

function GetLocalAlpha() : float
{
    return localAlpha;
}

function OnParentAlphaChanged()
{
    globalAlphaCache = EvalGlobalAlpha();

    /*
       TEMP TEMP TEMP
    if( updateTk2dSprite )
        GetComponent( tk2dSprite ).color.a = globalAlphaCache;

    if( updateGuiText && guiText != null )
        guiText.material.color.a = globalAlphaCache;

    if( updateLightIntensity && light )
        light.intensity = globalAlphaCache * origLightIntensity;

	if( updateMaterialColor )
	{
		var c = renderer.material.GetColor("_Color");
		c.a = globalAlphaCache;
		renderer.material.SetColor("_Color", c);
	}
		
        */

    if( updateGuiTexture && guiTexture )
        guiTexture.color.a = globalAlphaCache;
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
        isBroadcasting = false;
    }
}

function GetGlobalAlpha() : float
{
    return globalAlphaCache;
}

private function EvalGlobalAlpha() : float
{
    var alpha = localAlpha;
    var ancestor = transform.parent;

    // go up the hierarchy looking for ancestor's with the AlphaHierarchy component
    // MULTIPLY in their alphas

    while( ancestor != null )
    {
        var ah = ancestor.gameObject.GetComponent(AlphaHierarchy);

        if( ah != null )
        {
            alpha *= ah.GetLocalAlpha();
        }

        ancestor = ancestor.parent;
    }

    return alpha;
}
