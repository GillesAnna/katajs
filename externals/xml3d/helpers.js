/** Collection of small utilities. 
 */

var org;
if (!org || !org.xml3d)
  throw new Error("xml3d.js has to be included first");

//Create global symbol org.xml3d.utils
if (!org.xml3d.util)
	org.xml3d.util = {};
else if (typeof org.xml3d.util != "object")
	throw new Error("org.xml3d.utils already exists and is not an object");

/** 
 * Retrieve the transform node of a given group node. 
 */
org.xml3d.util.getGroupTransform = function(grp)
{
	var id = $(grp).attr("transform");
	if(id && id.length > 0)
		return $(id)[0]; 
	else 
		return null; 
}; 

/** 
 * Retrieve the world bounding box of a given node
 */
org.xml3d.util.getWorldBBox = function(node)
{
	var bbox = node.getBoundingBox(); 
	
	if(node.parentNode.getWorldMatrix)
	{
		var parentGlobMat = node.parentNode.getWorldMatrix(); 		 
		bbox.transform(parentGlobMat);
	}
	
	return bbox; 
}; 

/** 
 * Retrieve the world matrix of a view element. 
 * 
 * Currently the view element doesn't have a getLocalMatrix() method, so that calling 
 * getWorldMatrix() on it doesn't include the local matrix of the view node itself, 
 * but only the parent nodes. 
 * 
 * @param viewEl the element of which to retrieve the matrix. 
 * 
 * @return the world matrix of the given view element
 */
org.xml3d.util.getViewWorldMatrix = function(viewEl)
{
	var mat = viewEl.getWorldMatrix();
	var viewPos = viewEl.position; 
	
	mat = mat.translate(viewPos.x, viewPos.y, viewPos.z);
	mat = viewEl.orientation.toMatrix().multiply(mat);
	
	return mat; 
}; 

/** Returns the xml3d element in which the given element is contained.
 * If none is found, null is returned. 
 */
org.xml3d.util.getXml3dElement = function(el)
{
	if(el.tagName == "xml3d")
		return el; 
	
	if(el.parentNode)
		return org.xml3d.util.getXml3dElement(el.parentNode); 
	
	return null; 
}; 

/** Retrieve or set the shader of the given element. For a group it returns the 
 * shader associated with that group (or creates one if none is registered). 
 * For a mesh it returns the parent element's shader. 
 * 
 * If a shader is given as 2nd argument the element's shader is set to it and the 
 * overriden shader is returned. 
 * 
 * @param el the element of which to retrieve the shader. can be a group or mesh. 
 * @param sh (optional) the shader to which the element's shader attribute should be set. 
 * 	The shader has to have an id attribute. 
 */
org.xml3d.util.shader = function(el, sh)
{
	if(el.tagName === "mesh")
		return org.xml3d.util.shader(el.parentNode, sh);
	else if(el.tagName !== "group")
		throw "org.xml3d.util.shader(): invalid argument: \"" + el.tagName + "\"." +
		" Element is not a group or mesh."; 
		
	if(sh)
	{
		var lastSh = org.xml3d.util.shader(el); 
		
		var shRef = $(sh).attr("id"); 
		if(!shRef || shRef.length < 1)
			throw "org.xml3d.util.shader(): invalid argument: "
				+ "given shader does not have an id attribute."; 
		
		shRef = "#" + shRef; 
		
		$(el).attr("shader", shRef); 
		
		sh = lastSh; // return the overriden shader
	}
	else
	{	
		var shRef = $(el).attr("shader"); 
		if(shRef)
			sh = $(shRef)[0];
		else // none found, create default one and return it
		{
			var xml3d = org.xml3d.util.getXml3dElement(el); 
			var fac = org.creation.getFactory(xml3d); 
	
			var sh_id = "s_" + $(el).attr("id") + "_" + (Math.random() * 1000000);
			var sh = fac.phong(sh_id);
			
			$(xml3d).children("defs").first().append(sh); 
			$(el).attr("shader", sh_id); 
		}
	}
	
	return sh; 
};

/** 
 * Returns the active view element corresponding to the given xml3d element. 
 * 
 * @param xml3d
 * @return the active view element
 */
org.xml3d.util.getActiveView = function(xml3d)
{
	var ref = xml3d.activeView; 
	
	if(ref.charAt(0) !== "#")
		ref = "#".concat(ref); 
	
	return $(ref)[0]; 
}; 
