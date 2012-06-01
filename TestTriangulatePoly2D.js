#pragma strict

function Awake()
{
	var p = new Polygon2D();

	p.pts = new Vector2[6];
	p.pts[0] = Vector2( 0,0 );
	p.pts[1] = Vector2( 2,0 );
	p.pts[2] = Vector2( 2,2 );
	p.pts[3] = Vector2( 1,2 );
	p.pts[4] = Vector2( 1,1 );
	p.pts[5] = Vector2( 0,1 );
	p.edgeA = new int[6];
	p.edgeB = new int[6];

	for( var i = 0; i < 6; i++ ) {
		p.edgeA[i] = i;
		p.edgeB[i] = (i+1)%6;
	}

	var mesh = gameObject.GetComponent(MeshFilter).mesh;

	ProGeo.TriangulatePolygon( p, mesh );
}

