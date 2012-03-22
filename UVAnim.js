#pragma strict

//----------------------------------------
//  Given an atlas of frames, this plays those frames by modifying the UV offset
//----------------------------------------

var overrideTexture : Texture2D = null;
var fps : float = 30;
var numFrames : int;
var loop : boolean = true;
var playOnAwake : boolean = true;

//----------------------------------------
//  Atlas specs
//----------------------------------------
var framePixels : Vector2;	// size of each frame in the atlas in pixels
var numRows:int;
var numCols:int;

//----------------------------------------
//  
//----------------------------------------
private var playStartTime : float;
private var playing : boolean = false;

function Awake() {
	// set the UV scale properly
	for( var mat in renderer.materials )
	{
		if( overrideTexture != null )
			mat.SetTexture('_MainTex', overrideTexture);

		var tw = mat.GetTexture('_MainTex').width;
		var th = mat.GetTexture('_MainTex').height;
		var uScale = framePixels.x / tw;
		var vScale = framePixels.y / th;
		mat.SetTextureScale( '_MainTex', Vector2(uScale, vScale) );
	}

	if( playOnAwake )
		Play();
}

function Play() {
	playStartTime = Time.time;
	playing = true;
}

function IsPlaying() : boolean
{
	return playing;
}

function GetDuration() : float
{
	return numFrames / fps;
}

function Update () {
	if( playing )
	{
		var elapsed : float = Time.time - playStartTime;

		if( !loop && elapsed > GetDuration() )
		{
			// we're done
			playing = false;
		}
		else
		{
			// update the frame
			var currFrame : int = Mathf.Floor( elapsed * fps ) % numFrames;
			var col = (currFrame % numCols);
			var row = (currFrame - col)/numRows;

			for( var mat in renderer.materials )
			{
				var atlas = mat.GetTexture('_MainTex');
				var uOfs = (col * framePixels.x) / atlas.width;
				var vOfs = 1.0 - ((row+1) * framePixels.y) / atlas.height;	// v = 0 is the BOTTOM, thus we flip Y
				var uvOffset = Vector2( uOfs, vOfs );
				mat.SetTextureOffset( '_MainTex', uvOffset );
			}
		}
	}
}

@script RequireComponent(Renderer)