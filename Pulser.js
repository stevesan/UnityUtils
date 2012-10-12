#pragma strict

var duration = 1.0;
var scales = Vector3(2,2,2);
var fontScale = 2.0;
var looping = false;
var playOnAwake = false;

private var startTime:float;
private var startScale:Vector3;
private var startFontSize:float;
private var state:String;

function Start () {
	state = "stopped";
}

function Awake() {
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

		if( frac < 0.5 ) {
			frac = frac*2;
			transform.localScale = Vector3.Scale( startScale, Vector3.Lerp(Vector3(1,1,1), scales, frac) );
			if( GetComponent(GUIText) ) {
				GetComponent(GUIText).fontSize = startFontSize * ((1-frac)*1 + frac*fontScale);
			}
		}
		else {
			frac = (frac-0.5)*2;
			transform.localScale = Vector3.Scale( startScale, Vector3.Lerp(scales, Vector3(1,1,1), frac) );
			if( GetComponent(GUIText) ) {
				GetComponent(GUIText).fontSize = startFontSize * ((1-frac)*fontScale + frac*1);
			}
		}
	}
}