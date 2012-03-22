
var holdDuration = 0.5;
var fadeDuration = 0.5;
var opacityStart = 1.0;
var opacityEnd = 0.0;
var playOnAwake = false;
var loop = false;
var targetColorName = '_TintColor';	// default for particle shaders
// Best used with Particles/AlphaBlended shader

private var timeRemain = 0.0;

function Awake()
{
	if( playOnAwake )
		Play();
}

function Play()
{
	timeRemain = holdDuration + fadeDuration;
}

function SetOpacity( frac : float )
{
	// works for particle shaders only..
	var c = renderer.material.GetColor(targetColorName);
	c.a = frac / 2.0;	// for whatever reason, the tint color makes the rendering fully opaque when alpha = 0.5..
	renderer.material.SetColor(targetColorName, c);
}

function Update () {
	if( timeRemain > 0.0 )
	{
		if( timeRemain > fadeDuration )
			SetOpacity( opacityStart );
		else
		{
			var alpha = 1.0 - timeRemain / fadeDuration;
			var o = (1-alpha)*opacityStart + alpha*opacityEnd;
			SetOpacity( o );
		}

		timeRemain -= Time.deltaTime;

		if( loop && timeRemain < 0.0 )
			Play();
	}
	else
	{
		SetOpacity( opacityEnd );
	}
}

@script RequireComponent( Renderer );