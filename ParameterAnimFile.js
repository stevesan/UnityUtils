#pragma strict

class ParameterAnimation
{
	var duration = 1.0;
	var looping = false;
	var tweening = "linear";

	private var startTime:float;
	private var state:String;
	private var fraction = 0.0;

	function ParameterAnimation() {
		state = "stopped";
	}

	function GetFraction() : float { return fraction; }

	function Play() {
		startTime = Time.time;
		state = "playing";
	}

	function IsPlaying() : boolean {
		return state == "playing";
	}

	function Stop() {
		state = "stopped";
	}

	function Update () {
		if( state == "playing" ) {
			fraction = (Time.time-startTime) / duration;
			if( fraction > 1.0 ) {
				if( looping ) {
					fraction = fraction % 1.0;
				}
				else {
					Stop();
					fraction = 1.0;
				}
			}
		}
	}
}
