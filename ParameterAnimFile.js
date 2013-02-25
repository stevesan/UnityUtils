#pragma strict

class ParameterAnimation
{
	var duration = 1.0;
	var looping = false;
	var tweening = "linear";
    var playOnAwake = false;
    var delay = 0.0;

    var debug = false;

	private var passed:float;
	private var state:String;

	function ParameterAnimation()
    {
		state = "idle";
	}

    function GetLinearFraction() : float
    {
        var x = (Mathf.Max(0.0, passed-delay) / duration);

        if( looping )
        {
            return x % 1.0;
        }
        else
        {
            return Mathf.Clamp( x, 0.0, 1.0 );
        }
    }

    function SetLinearFraction(value:float)
    {
        passed = Mathf.Clamp(value, 0.0, 1.0)*duration + delay;
    }

	function GetFraction() : float
    {
        var t = GetLinearFraction();

        if( tweening == "sincycle" )
        {
            // Map [0,1] to a full sin-cycle, mapped within [0,1]
            // So 0->0, and 1->0, but 0.5->1.0
            var rads = (1.0-t)*(-Mathf.PI/2.0) + t*(3.0*Mathf.PI/2.0);
            var rv = Mathf.Sin(rads)*0.5 + 0.5;
            return rv;
        }
        // TODO other tweeners here
        else
        {
            return t;
        }
    }

	function Play()
    {
        passed = 0.0;
		state = "playing";
	}

	function IsPlaying() : boolean
    {
		return state == "playing";
	}

	function Stop()
    {
        passed = 0.0;
		state = "idle";
	}

    function Pause()
    {
        state = "idle";
    }

	function Unpause()
    {
		state = "playing";
	}

    function Awake()
    {
        passed = 0.0;

        if( playOnAwake )
        {
            Play();
        }
    }

	function Update ()
    {
		if( state == "playing" )
        {
            passed += Time.deltaTime;

            if( (passed-delay) > duration && !looping )
            {
                Pause();
            }
        }
	}
}
