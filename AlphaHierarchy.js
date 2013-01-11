#pragma strict

var localAlpha = 1.0;

var updateTk2dSprite = false;
var updateGuiText = false;

function Update ()
{
    if( updateTk2dSprite )
    {
        GetComponent( tk2dSprite ).color.a = EvalGlobalAlpha();
    }

    if( updateGuiText && guiText != null )
    {
        guiText.material.color.a = EvalGlobalAlpha();
    }
}

function GetLocalAlpha() : float
{
    return localAlpha;
}

function EvalGlobalAlpha() : float
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
