#pragma strict

//----------------------------------------
//  An animation that just switches between a list of textures
//	Not efficient! Meant for prototyping only
//----------------------------------------

var frames:Texture2D[];
var fps = 30.0;
var loop : boolean = true;
var playOnAwake : boolean = true;
var playOnAwakeLoops = -1;	// set to -1 for infinite loop

//----------------------------------------
//  
//----------------------------------------
private var playStartTime : float;
private var playing : boolean = false;
private var loops = -1;

function SetFrame( i:int )
{
	if( i < frames.length ) {
		renderer.material.mainTexture = frames[i];
	}
	else {
		Debug.LogError('index = ' +i+ ' is out of range for frames list, my name = ' + gameObject.name);
	}
}

function Awake() {
	if( playOnAwake )
		Play( playOnAwakeLoops );
}

function Play( _loops:int ) {
	playStartTime = Time.time;
	playing = true;
	loops = _loops;
}

function IsPlaying() : boolean
{
	return playing;
}

function GetDuration() : float
{
	return frames.length / fps;
}

function Update () {
	if( playing )
	{
		var elapsed : float = Time.time - playStartTime;

		if( loops != -1 && elapsed > (loops*GetDuration()) ) {
			// we're done
			playing = false;
		}
		else
		{
			// update the frame
			var currFrame : int = Mathf.Floor( elapsed * fps ) % frames.length;
			SetFrame( currFrame );
		}
	}
}


@script RequireComponent( Renderer )