#pragma strict

var duration = 1.0;
var scales = Vector3(2,2,2);
var fontSizeMax = 30;
var looping = false;
var playOnAwake = false;

private var startTime:float = 0.0;
private var startScale:Vector3;
private var startFontSize:float;
private var state:String;

function Start () {
}

function Awake() {
	state = "stopped";
	if( playOnAwake )
		Play();
}

function Play() {
	startScale = transform.localScale;
	startTime = Time.time;
	state = "playing";

	if( GetComponent(GUIText) ) {
		startFontSize = GetComponent(GUIText).fontSize;
	}
}

function Stop() {
	transform.localScale = startScale;
	state = "stopped";
}

function Update () {
	if( state == "playing" ) {
		var frac = (Time.time-startTime) / duration;
		if( frac > 1.0 ) {
			if( looping ) {
				frac = frac % 1.0;
			}
			else {
				Stop();
			}
		}

		var lerpVal = Mathf.Sin(Mathf.PI*frac);

		if( GetComponent(GUIText) ) {
			GetComponent(GUIText).fontSize = (1-lerpVal)*startFontSize + lerpVal*fontSizeMax;
		}
		else
			transform.localScale = Vector3.Scale( startScale, Vector3.Lerp(Vector3(1,1,1), scales, lerpVal) );
	}
}