#pragma strict

public var offsetPixels = Vector2(1, -1);
public var shadowColor = Color.black;

private var shadow:GameObject;

// Important to do this on Start and NOT Awake..because Awake is called when we instantiate
function Start()
{
    if( shadow == null )
    {
        shadow = Instantiate(this.gameObject, Vector3.zero, Quaternion.identity);
        shadow.name = this.gameObject.name + "-shadow";
        shadow.transform.parent = this.transform;

        // compute GUI space offset
        var gsOffset = Vector3(
                offsetPixels.x/Screen.width,
                offsetPixels.y / Screen.height,
                -0.1 );
        shadow.transform.localPosition = gsOffset;

        // IMPORTANT: Otherwise it'll recurse infinitely. Destroy it before its Start gets called.
        Destroy(shadow.GetComponent(GUITextShadow));

        shadow.GetComponent(GUIText).material.color = shadowColor;
    }
}

function LateUpdate()
{
    var shadowText = shadow.GetComponent(GUIText);
    shadowText.text = GetComponent(GUIText).text;
}
