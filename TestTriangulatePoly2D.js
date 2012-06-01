#pragma strict

function Awake()
{
	var p = new Polygon2D();

// monotone test
	p.pts = new Vector2[7];
	p.pts[0] = Vector2( 0,0 );
	p.pts[1] = Vector2( 1.5,0 );
	p.pts[2] = Vector2( 2,1 );
	p.pts[3] = Vector2( 3.0,2 );
	p.pts[4] = Vector2( 1.5,2 );
	p.pts[5] = Vector2( 1,1 );
	p.pts[6] = Vector2( 0.5,1 );
	var N = p.pts.length;
	p.edgeA = new int[N];
	p.edgeB = new int[N];

	for( var i = 0; i < N; i++ ) {
		p.edgeA[i] = i;
		p.edgeB[i] = (i+1)%N;
	}

	var mesh = gameObject.GetComponent(MeshFilter).mesh;

	ProGeo.TriangulatePolygon( p, mesh );
}

