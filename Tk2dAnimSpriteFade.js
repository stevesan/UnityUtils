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

function Start()
{
	// Avoid 1-frame of bad alpha value when created
	Update();
}

function SetLocalFade( t:float, broadcast:boolean )
{
	sprite.color = Color.Lerp( outColor, inColor, t );

    // modulate alpha to respect the hierarchy
    var ah = GetComponent(AlphaHierarchy);
    if( ah != null )
    {
        ah.SetLocalAlpha(sprite.color.a, broadcast);
        sprite.color.a = ah.GetGlobalAlpha();
    }
}

function Play()
{
    playback.Play();
}

function Unpause()
{
    playback.Unpause();
}

function Stop()
{
    playback.Stop();
}

function SkipToEnd()
{
    playback.Pause();
    playback.SetLinearFraction(1.0);
}

function OnParentAlphaChanged()
{
    if( type == ControlType.Active )
    {
        SetLocalFade( playback.GetFraction(), false );
    }
}

function Update()
{
    // Always respect the override
    // TODO I should stop using this. Use the AlphaHierarchy instead.
	if( fadeAmount != null )
    {
		SetLocalFade( fadeAmount.GetFadeAmount(), true );
	}
    else
    {
        if( type == ControlType.Active )
        {
            SetLocalFade( playback.GetFraction(), true );
            playback.Update();
        }
    }
}
