import {LODRadial} from './LODRadial';
import {Frustum, Matrix4, Vector3} from 'three';

const projection = new Matrix4();
const pov = new Vector3();
const frustum = new Frustum();
const position = new Vector3();

/**
 * Check the planar distance between the nodes center and the view position.
 *
 * Only subdivides elements inside of the camera frustum.
 */
export class LODFrustum extends LODRadial 
{
	public subdivideDistance = 120;

	public simplifyDistance = 400;

	/**
	 * If true only the central point of the plane geometry will be used
	 *
	 * Otherwise the object bouding sphere will be tested, providing better results for nodes on frustum edge but will lower performance.
	 *
	 * @type {boolean}
	 */
	public testCenter = true;

	public pointOnly: boolean;

	updateLOD(view, camera, renderer, scene) 
	{
		projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		frustum.setFromProjectionMatrix(projection);
		camera.getWorldPosition(pov);

		const self = this;
		view.children[0].traverse(function(node) 
		{
			node.getWorldPosition(position);
			let distance = pov.distanceTo(position);
			distance /= Math.pow(2, view.provider.maxZoom - node.level);

			const inFrustum = self.pointOnly ? frustum.containsPoint(position) : frustum.intersectsObject(node);

			if (distance < self.subdivideDistance && inFrustum) 
			{
				node.subdivide();
			}
			else if (distance > self.simplifyDistance && node.parentNode) 
			{
				node.parentNode.simplify();
			}
		});
	}
}
