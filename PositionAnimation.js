#pragma strict

var anim = new ParameterAnimation();
var offset : Vector3;
var decayPow = 2.0;
var numCycles = 2.0;
private var origPosition:Vector3;

function Awake()
{
	origPosition = transform.localPosition;
    anim.Awake();
}

function Start () {

}

function Play()
{
	anim.Play();
}

function Stop()
{
    anim.Stop();
}

function Update ()
{
	anim.Update();

	if( anim.IsPlaying() )
    {
		var t = anim.GetFraction();
		var sinFactor = Mathf.Sin( 2*Mathf.PI*numCycles*t );
		var decayFactor = 1 - Mathf.Pow(t, decayPow);
		transform.localPosition = origPosition + sinFactor*offset*decayFactor;
	}
}
