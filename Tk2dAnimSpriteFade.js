#pragma strict

enum ControlType {
    Passive,    // respects fadeAmount if set, otherwise does nothing
    Active     // still respects fadeAmount if set, otherwise, uses its own anim clock
};

var type:ControlType = ControlType.Passive;

var outColor = new Color(1,1,1,0);
var inColor = new Color(1,1,1,1);

// Can override fade amount if desired
var fadeAmount:FadeAmount = null;

private var sprite : tk2dSprite = null;

var playback = new ParameterAnimation();

function Awake ()
{
	sprite = GetComponent( tk2dSprite );
    playback.Awake();
}

function SetLocalFade( t:float )
{
	sprite.color = Color.Lerp( outColor, inColor, t );

    // modulate alpha to respect the hierarchy
    var ah = GetComponent(AlphaHierarchy);
    if( ah != null )
    {
        ah.localAlpha = sprite.color.a;
        sprite.color.a = ah.GetGlobalAlpha();
    }
}

function Play()
{
    playback.Play();
}

function Stop()
{
    playback.Stop();
}

function OnParentAlphaChanged()
{
    if( type == ControlType.Active )
    {
        SetLocalFade( playback.GetFraction() );
    }
}

function Update () {
    // Always respect the override
	if( fadeAmount != null )
    {
		SetLocalFade(fadeAmount.GetFadeAmount());
	}
    else
    {
        if( type == ControlType.Active )
        {
            SetLocalFade( playback.GetFraction() );
            playback.Update();
        }
    }
}
