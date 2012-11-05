#pragma strict

// TODO - make this a general tint animator

var fadeInOnAwake = true;

var targetColorName = '_TintColor';	// default for particle shaders
// Best used with Particles/AlphaBlended shader

var fadeDuration = 1.0;
var minOpacity = 0.0;
var maxOpacity = 1.0;
private var state = "stopped";
private var fadeFraction = 0.0;

function Awake()
{
	if( fadeInOnAwake )
		FadeIn();
}

function FadeIn()
{
	state = "fadingin";
}

function FadeOut()
{
	state = "fadingout";
}

function Stop()
{
	state = "stopped";
}

function SetFade(value:float)
{
	fadeFraction = value;
}

function SetOpacity( frac : float )
{
	// works for particle shaders only..
	var c = renderer.material.GetColor(targetColorName);
	c.a = frac / 2.0;	// for whatever reason, the tint color makes the rendering fully opaque when alpha = 0.5..
	renderer.material.SetColor(targetColorName, c);
}

function Update () {
	if( state == "fadingin" ) {
		fadeFraction += Time.deltaTime / fadeDuration;
		if( fadeFraction > 1.0 ) {
			fadeFraction = 1.0;
			Stop();
		}
	}
	else if( state == "fadingout" ) {
		fadeFraction -= Time.deltaTime / fadeDuration;
		if( fadeFraction < 0.0 ) {
			fadeFraction = 0.0;
			Stop();
		}
	}

	SetOpacity( (1-fadeFraction)*minOpacity + fadeFraction*maxOpacity );
}

@script RequireComponent( Renderer );
