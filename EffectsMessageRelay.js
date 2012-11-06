#pragma strict

function Start () {

}

function Update () {

}

function Play()
{
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
