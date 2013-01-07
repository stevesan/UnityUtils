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

var anim = new ParameterAnimation();

function Awake () {
	sprite = GetComponent( tk2dSprite );
}

function SetFadeAmount( t:float ) {
	sprite.color = Color.Lerp( outColor, inColor, t );
}

function Play()
{
    anim.Play();
}

function Stop()
{
    anim.Stop();
}

function Update () {
    // Always respect the override
	if( fadeAmount != null )
    {
		SetFadeAmount(fadeAmount.GetFadeAmount());
	}
    else
    {
        if( type == ControlType.Active )
        {
            SetFadeAmount( anim.GetFraction() );
            anim.Update();
        }
    }
}
