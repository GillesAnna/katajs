
var org;
if (!org || !org.xml3d)
  throw new Error("xml3d.js has to be included first");

//Create global symbol org.xml3d.math
if (!org.xml3d.math)
	org.xml3d.math = {};
else if (typeof org.xml3d.math != "object")
	throw new Error("org.xml3d.math already exists and is not an object");

// epsilon and corresponding equals method 
org.xml3d.math.EPSILON = 0.00001; 

/** 
 * Compare two values for equality that differ at most by 
 * org.xml3d.math.EPSILON. 
 */
org.xml3d.math.epsilonEquals = function(a, b) {
	var diff;

    diff = a - b;
    if ((diff < 0 ? -diff : diff) > org.xml3d.math.EPSILON) {
        return false;
    }
    return true;
};

/** convert degrees to radians */ 
org.xml3d.math.degToRad = function(deg)
{
	return (deg*(Math.PI/180));
};

/** convert radians to degrees */ 
org.xml3d.math.radToDeg = function(rad)
{
	return (rad*(180/Math.PI));
};

/** 
 * Return the vector containing the minimal values of each component. 
 */
org.xml3d.math.minVec = function(v1, v2)
{
	return org.xml3d.math.extractVec(v1, v2, Math.min); 
}

/** 
 * Return the vector containing the maximum values of each component. 
 */
org.xml3d.math.maxVec = function(v1, v2)
{
	return org.xml3d.math.extractVec(v1, v2, Math.max); 
}

/** 
 * Extract a vector where the given function is applied to each 
 * component. 
 * 
 * @return XML3DVec3(f(v1.x,v2.x),f(v1.y,v2.y), f(v1.z,v2.z))
 */
org.xml3d.math.extractVec = function(v1, v2, f)
{
	var vec = new XML3DVec3(); 
	vec.x = f(v1.x, v2.x); 
	vec.y = f(v1.y, v2.y);
	vec.z = f(v1.z, v2.z); 
	
	return vec; 
}

/** intersect a ray with a plane formed by plOrigin and plNormal
 *
 * in ray: XML3DRay
 * in plOrigin, plNormal: XML3DVec3
 * 
 * out hitPoint (optional): XML3DVec3 
 * 
 * returns: 
 * 	-1 if ray inside plane
 * 	 0 if no intersection 
 * 	 1 if intersection at single point
 */
org.xml3d.math.intersectRayPlane = function(ray, plOrigin, plNormal, hitPoint)
{ 
	// Algorithm taken from http://en.wikipedia.org/wiki/Line-plane_intersection

	var d = plOrigin.dot(plNormal);

	// calculate distance t on ray
	var num = d - ray.origin.dot(plNormal);
	var denom = ray.direction.dot(plNormal);

	if(Math.abs(denom) < org.xml3d.EPSILON)
	{
		if(Math.abs(num) < org.xml3d.EPSILON)
			return -1;
		else
			return 0;
	}

	var t = num / denom;

	// calculate hit point 
	if(hitPoint !== undefined)
	{
		var scalDir = ray.direction.scale(t); 
		var hit = ray.origin.add(scalDir);
		
		hitPoint.x = hit.x; 
		hitPoint.y = hit.y;
		hitPoint.z = hit.z; 
	}

	return 1;
}; 

/** computes the transformation matrix from the given source plane to 
 * the destination plane. 
 * 
 * @param srcOrig  
 * @param srcNorm 
 * @param destOrig (optional) if not given, (0,0,0) is taken 
 * @param destNorm (optional) if not given, (0,0,1) is taken
 * 
 * @return an instance of XML3DMatrix representing the transformation from
 * 	source to destination. 
 */
org.xml3d.math.getTransformPlaneToPlane = function(srcOrig, srcNorm, destOrig, destNorm)
{
	// default params
	if(!destOrig)
		destOrig = new XML3DVec3(0,0,0); 
	if(!destNorm)
		destNorm = new XML3DVec3(0,0,1); 
	
	// generate translation & rotation
	var transl = destOrig.subtract(srcOrig);
	var rot = new XML3DRotation(); 
	rot.setRotation(srcNorm, destNorm);
	
	// make matrix
	var xfmMat = (new XML3DMatrix()).translate(transl.x, transl.y, transl.z); 
	xfmMat = xfmMat.rotateAxisAngle(rot.axis.x, rot.axis.y, rot.axis.z, rot.angle); 
	
	return xfmMat; 
}; 