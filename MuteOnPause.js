#pragma strict
@script RequireComponent(AudioSource)

private var prevVolume:float = 1.0;
private var isMuted:boolean = false;

function Awake () {
	prevVolume = GetComponent(AudioSource).volume;
}

function Update () {

}

function OnApplicationFocus(focus:boolean)
{
	Debug.Log("OnAppFocus called");
	if( focus && isMuted ) {
		Debug.Log("Restoring volume");
		GetComponent(AudioSource).volume = prevVolume;
	}
	else if( !focus && !isMuted ) {
		prevVolume = GetComponent(AudioSource).volume;
		GetComponent(AudioSource).volume = prevVolume;
		isMuted = true;
		Debug.Log("Muting from volume = "+prevVolume);
	}
}
