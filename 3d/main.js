// Created by Bjorn Sandvik - thematicmapping.org
(function () {

	var webglEl = document.getElementById('webgl');

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage(webglEl);
		return;
	}

	var width  = window.innerWidth,
		height = window.innerHeight;

	// Earth params
	var radius   = 0.25,
		segments = 20,
		rotation = 6;

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
	camera.position.z = 1.5;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);

	scene.add(new THREE.AmbientLight(0x333333));

	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);

    var sphere = createSphere(radius, segments);
	//sphere.rotation.y = rotation;
	scene.add(sphere)

    //var clouds = createClouds(radius, segments);
	//clouds.rotation.y = rotation;
	//scene.add(clouds)

	var stars = createStars(90, 64);
	scene.add(stars);

	var controls = new THREE.TrackballControls(camera);

	webglEl.appendChild(renderer.domElement);
	renderer.shadowMapEnabled	= true


	function geoToCartesian(R,lat, lon) {
		var phi   = (90-lat)*(Math.PI/180);
		var theta = (lon+180)*(Math.PI/180);

		x = -((R) * Math.sin(phi)*Math.cos(theta));
		z = ((R) * Math.sin(phi)*Math.sin(theta));
		y = ((R) * Math.cos(phi));

	    return {x:x,y:y,z:z};
	}
	function toECEFEarth(R, lat, lon) {

	    var cosLat = Math.cos(degToRad(lat));
	    var sinLat = Math.sin(degToRad(lat));
	    var cosLon = Math.cos(degToRad(lon));
	    var sinLon = Math.sin(degToRad(lon));

	    var f = 1.0 / 298.257224;
	    var C = 1.0 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
	    var S = (1.0 - f) * (1.0 - f) * C;
	    var h = 0.0;

	    var x = (R * C + h) * cosLat * cosLon;
	    var y = (R * C + h) * cosLat * sinLon;
	    var z = (R * S + h) * sinLat;

		return {x:x,y:y,z:z};
	}


	function addLine(scene, lat, lng, color) {

		var R = 10;

		var transformInner = geoToCartesian(radius, lat, lng);
		var transformOuter = geoToCartesian(R, lat, lng);



		var lineMaterial = new THREE.LineBasicMaterial({color: color});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(transformInner.x,transformInner.y,transformInner.z));
		geometry.vertices.push(new THREE.Vector3(transformOuter.x,transformOuter.y,transformOuter.z));

		var line = new THREE.Line(geometry, lineMaterial);
		scene.add(line);
	}

	function degToRad(degress) {
	    var radians = degress * (Math.PI/180);

	    return radians;
	}

	// var points = [
	// 	{lat:,lng;}
	// ];
	//
	// points.forEach(function(d){
	// 	addLine(scene, d.lng, d.lat, 0xff0000)
	// });

	pusher = new Pusher('54da1f9bddbf14929983');
	channel = pusher.subscribe('world_map');

	channel.bind('login', function(point) {
		console.log(point);
		addLine(scene,point.geo.lat, point.geo.lng, 0xff0000)
	});

	render();

	function render() {
		controls.update();
		// sphere.rotation.y += 0.0005;
		// clouds.rotation.y += 0.0005;
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}

	function createSphere(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			/*new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale:   0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')
			})*/
			new THREE.MeshPhongMaterial({
				map		: THREE.ImageUtils.loadTexture('images/map.jpg')
			})
		);
	}

	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);
	}

	function createStars(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshBasicMaterial({
				map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
				side: THREE.BackSide
			})
		);
	}

}());
