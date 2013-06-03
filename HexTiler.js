#pragma strict

import SteveSharp;

var prefab:GameObject;
var upRightOffset = Vector3(0.75, 0.5, 0);
var numCols = 10;
var numRows = 10;

private var tiles = new Grid.<GameObject>();

private function GetLocalOffset( i:int, j:int )
{
    var dy = upRightOffset.y * i;
    var dx = (i%2 == 0 ? 0.0f : upRightOffset.x) + j * upRightOffset.x * 2;
    return Vector3( dx, dy, 0 );
}

function GetGlobalPosition( i:int, j:int )
{
    return transform.TransformPoint( GetLocalOffset(i, j) );
}

//----------------------------------------
//  Maps 0-5 (num) to nbors around the given hex. 0 is the top
//----------------------------------------
public static function GetNbor( i:int, j:int, num:int ) : Int2
{
    if( i%2 == 1 )
    {
        switch( num )
        {
            case 0: return new Int2(i+2, j);
            case 1: return new Int2(i+1, j+1);
            case 2: return new Int2(i-1, j+1);
            case 3: return new Int2(i-2, j);
            case 4: return new Int2(i-1, j);
            case 5: return new Int2(i+1, j);
            default: return new Int2(i, j);
        }
    }
    else
    {
        switch( num )
        {
            case 0: return new Int2(i+2, j);
            case 1: return new Int2(i+1, j);
            case 2: return new Int2(i-1, j);
            case 3: return new Int2(i-2, j);
            case 4: return new Int2(i-1, j-1);
            case 5: return new Int2(i+1, j-1);
            default: return new Int2(i, j);
        }
    }
}

function Start ()
{
    // Create dat grid!
    tiles.Resize( numRows, numCols, null );

    for( var i = 0; i < numRows; i++ )
    {
        for( var j = 0; j < numCols; j++ )
        {
            var inst = Instantiate( prefab, transform.position, prefab.transform.rotation );
            inst.transform.parent = this.transform;
            inst.transform.localScale = prefab.transform.localScale;
            inst.transform.localPosition = GetLocalOffset( i, j );
            tiles.Set( i, j, inst );
        }
    }

    prefab.SetActive(false);
}

function Update ()
{

}
