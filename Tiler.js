#pragma strict

var prefab:GameObject;
var uStep = Vector3(1, 0, 0);
var vStep = Vector3(0, 1, 0);
var uCount = 10;
var vCount = 10;

function Start ()
{
    // Create dat grid!
    for( var i = 0; i < uCount; i++ )
    {
        for( var j = 0; j < vCount; j++ )
        {
            var inst = Instantiate( prefab, transform.position, prefab.transform.rotation );
            inst.transform.parent = this.transform;
            inst.transform.localScale = prefab.transform.localScale;
            inst.transform.localPosition = i*uStep + j*vStep;
        }
    }

    prefab.SetActive(false);
}

function Update ()
{

}
