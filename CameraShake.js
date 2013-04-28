#pragma strict

//----------------------------------------
//  
//----------------------------------------
var shakeMax = Vector3(1,1,1);
var playback = new ParameterAnimation();

//----------------------------------------
//  
//----------------------------------------
private var posOnPlay : Vector3;

function Awake()
{
    playback.Awake();
	posOnPlay = transform.localPosition;
}

function Start()
{
}

function Play()
{
	posOnPlay = transform.localPosition;
    playback.Play();
}

function Update()
{
    playback.Update();

    if( playback.IsPlaying() )
    {
        var f = playback.GetFraction();
        var delta =	Vector3.Scale( Random.insideUnitSphere, shakeMax );
        transform.localPosition = posOnPlay + (1-f)*delta;
    }

}
