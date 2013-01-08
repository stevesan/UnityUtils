#pragma strict

import System.Collections.Generic;

//----------------------------------------
//  The children of this object will be used as the control points.
//  They should be in %03d order, 000, 001, 002, etc.
//----------------------------------------

var samplesPerUnit = 10.0;

// Note that smoothing is done "geodesically", ie. a point is NOT smoothed by finding all sample points within some distance of itself.
// But rather, the distance is measured along the control curve.
var smoothingDistance = 0.5;

var destroyControls = false;

var debugDrawSamples = false;
var debugDrawSmoothed = false;
var debugDrawNumSegs = 50;

private var samples = new List.<Vector3>();
private var sampleLengths = new List.<float>();
private var totalLen = 0.0;

function Awake()
{
    //----------------------------------------
    //  Gather control points
    //----------------------------------------

    var cpoints = new List.<Vector3>();

    for( var i = 0; true; i++ )
    {
        var childName = i.ToString("000");
        var childXform = transform.Find(childName);

        if( childXform == null )
            break;

        cpoints.Add( childXform.position );

        if( destroyControls )
            Destroy(childXform.gameObject);
    }

    //----------------------------------------
    //  Generate equidistant sample points
    //----------------------------------------

    totalLen = 0.0;
    var remainLen = 0.0;
    var lenPerSample = 1.0/samplesPerUnit;

    for( i = 0; i < cpoints.Count-1; i++ )
    {
        var p0 = cpoints[ i == 0 ? 0 : i-1 ];
        var p1 = cpoints[i];
        var p2 = cpoints[i+1];
        var dir = (p2-p1).normalized;
        var length = Vector3.Distance( p1, p2 );

        var usedLen = (remainLen == 0.0 ? 0.0 : lenPerSample-remainLen);
        for( ; usedLen < length; usedLen += lenPerSample )
        {
            var sp = p1 + dir*usedLen;
            samples.Add(sp);
            sampleLengths.Add(usedLen + totalLen);
        }

        remainLen = length - usedLen + lenPerSample;
        totalLen += length;
    }
}

//----------------------------------------
//  t in [0,1]
//  This makes no guarantees really about where t=0 and t=1 are relative to the control points.. heh
//----------------------------------------
function GetSmoothedPoint( t:float ) : Vector3
{
    var padAmount = smoothingDistance/totalLen;
    t = (1-t)*padAmount + t*(1-padAmount);

    var tLen = t*totalLen;
    var tLow = tLen - smoothingDistance;
    var tHigh = tLen + smoothingDistance;

    var p = Vector3(0,0,0);
    var numSamples = 0;

    for( var i = 0; i < sampleLengths.Count; i++ )
    {
        if( sampleLengths[i] >= tLow && sampleLengths[i] <= tHigh )
        {
            p += samples[i];
            numSamples++;
        }

        // short circuit
        if( sampleLengths[i] >= tHigh )
            break;
    }

    return p / numSamples;
}

function Update()
{
    if( debugDrawSamples )
    {
        for( var p:Vector3 in samples )
        {
            Utils.DebugDrawCircle( p, 1.0/samplesPerUnit/2.0, Color.red, 10 );
        }
    }

    if( debugDrawSmoothed )
    {
        var prev = GetSmoothedPoint(0.0);

        for( var i = 0; i < debugDrawNumSegs; i++ )
        {
            var t = (i+1) * 1.0/debugDrawNumSegs;
            var pt = GetSmoothedPoint(t);
            Debug.DrawLine( prev, pt, Color.green, 0.0, false );
            prev = pt;
        }
    }
}
