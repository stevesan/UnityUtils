#pragma strict

var localAlpha = 1.0;
var updateTk2dSprite = false;
var updateGuiText = false;

private var globalAlpha = 1.0;

function GetLocalAlpha() : float
{
    return localAlpha;
}

function OnParentAlphaChanged()
{
    globalAlpha = EvalGlobalAlpha();

    if( updateTk2dSprite )
    {
        GetComponent( tk2dSprite ).color.a = globalAlpha;
    }

    if( updateGuiText && guiText != null )
    {
        guiText.material.color.a = globalAlpha;
    }
}

function SetLocalAlpha( value:float, triggerBroadcast:boolean )
{
    localAlpha = value;

    if( triggerBroadcast )
        BroadcastMessage( "OnParentAlphaChanged", SendMessageOptions.DontRequireReceiver );
}

function GetGlobalAlpha() : float
{
    return globalAlpha;
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
