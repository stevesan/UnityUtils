#pragma strict

function TestHole()
{
	var p = new Polygon2D();

	// monotone test
	p.pts = new Vector2[6];
	var i = 0;
	p.pts[i++] = Vector2( 0,0 );
	p.pts[i++] = Vector2( 10,0 );
	p.pts[i++] = Vector2( 0,10 );
	p.pts[i++] = Vector2( 2,2 );
	p.pts[i++] = Vector2( 2,4 );
	p.pts[i++] = Vector2( 4,2 );
	p.edgeA = [0, 1, 2, 3, 4, 5];
	p.edgeB = [1, 2, 0, 4, 5, 3];

	var mesh = gameObject.GetComponent(MeshFilter).mesh;

	ProGeo.TriangulateSimplePolygon( p, mesh, false );
}

function TestColinear()
{
	var p = new Polygon2D();

	// monotone test
	p.pts = new Vector2[8];
	var i = 0;
	p.pts[i++] = Vector2( 0,0 );
	p.pts[i++] = Vector2( 1,0 );
	p.pts[i++] = Vector2( 1,1 );
	p.pts[i++] = Vector2( 1,2 );
	p.pts[i++] = Vector2( 1,3 );
	p.pts[i++] = Vector2( 0,3 );
	p.pts[i++] = Vector2( 0,2 );
	p.pts[i++] = Vector2( 0,1 );
	var N = p.pts.length;
	p.edgeA = new int[N];
	p.edgeB = new int[N];

	for( i = 0; i < N; i++ ) {
		p.edgeA[i] = i;
		p.edgeB[i] = (i+1)%N;
	}

	var mesh = gameObject.GetComponent(MeshFilter).mesh;

	ProGeo.TriangulateSimplePolygon( p, mesh, false );
}

function TestSimple()
{
	var p = new Polygon2D();

	// monotone test
	p.pts = new Vector2[5];
	p.pts[0] = Vector2( 0,0 );
	p.pts[1] = Vector2( 2,0 );
	p.pts[2] = Vector2( 1,1 );
	p.pts[3] = Vector2( 2,2 );
	p.pts[4] = Vector2( 0,2 );
	var N = p.pts.length;
	p.edgeA = new int[N];
	p.edgeB = new int[N];

	for( var i = 0; i < N; i++ ) {
		p.edgeA[i] = i;
		p.edgeB[i] = (i+1)%N;
	}

	var mesh = gameObject.GetComponent(MeshFilter).mesh;

	ProGeo.TriangulateSimplePolygon( p, mesh, false );
}

function TestMonotone()
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

	ProGeo.TriangulateSimplePolygon( p, mesh, false );
}

function Awake()
{
	TestHole();
}

