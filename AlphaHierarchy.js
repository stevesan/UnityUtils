#pragma strict

var localAlpha = 1.0;
var updateTk2dSprite = false;
var updateGuiText = false;
var updateLightIntensity = false;

private var globalAlphaCache = 1.0;
private var origLightIntensity = 1.0;

function Awake()
{
    if( updateLightIntensity && light )
        origLightIntensity = light.intensity;
}

function GetLocalAlpha() : float
{
    return localAlpha;
}

function OnParentAlphaChanged()
{
    globalAlphaCache = EvalGlobalAlpha();

    if( updateTk2dSprite )
    {
        GetComponent( tk2dSprite ).color.a = globalAlphaCache;
    }

    if( updateGuiText && guiText != null )
    {
        guiText.material.color.a = globalAlphaCache;
    }

    if( updateLightIntensity && light )
        light.intensity = globalAlphaCache * origLightIntensity;
}

function SetLocalAlpha( value:float, triggerBroadcast:boolean )
{
    localAlpha = value;

    if( triggerBroadcast )
        BroadcastMessage( "OnParentAlphaChanged", SendMessageOptions.DontRequireReceiver );
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
