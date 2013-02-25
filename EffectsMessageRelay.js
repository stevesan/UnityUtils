#pragma strict

function Start () {

}

function Update () {

}

function Play()
{
    Debug.Log("playing for name = "+gameObject.name);
    if( GetComponent(ParticleSystem) != null )
        GetComponent(ParticleSystem).Play();
    if( GetComponent(AudioSource) != null )
        GetComponent(AudioSource).Play();
}

function Stop()
{
    if( GetComponent(ParticleSystem) != null )
        GetComponent(ParticleSystem).Stop();
    if( GetComponent(AudioSource) != null )
        GetComponent(AudioSource).Stop();
}
