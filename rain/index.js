import * as THREE from "../libs/three.module.min.js";

let scene,camera,renderer,rain,cloudParticles = [], rainParticles = [],flash,rainGeo,rainCount = 10000;
let audioContext, rainNoiseSource, rainFilter, rainGain, thunderSound;
let lastThunderTime = 0;
const minThunderInterval = 5000; // Minimum 5 seconds between thunder strikes

// Generate noise buffer for rain sound
const createNoiseBuffer = (context, noiseType) => {
	const bufferSize = 2 * context.sampleRate;
	const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
	const data = buffer.getChannelData(0);
	let lastOut = 0;

	for (let i = 0; i < bufferSize; i++) {
		const white = Math.random() * 2 - 1;

		if (noiseType === 'white') {
			data[i] = white;
		} else if (noiseType === 'pink') {
			data[i] = (lastOut + 0.02 * white) / 1.02;
			lastOut = data[i];
			data[i] *= 3.5;
		} else if (noiseType === 'brown') {
			data[i] = (lastOut + 0.1 * white) / 1.1;
			lastOut = data[i];
			data[i] *= 6;
		}
	}

	const source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = true;
	return source;
};

const initAudio = () => {
	try {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();

		// Create rain noise (brown noise for deeper rain sound)
		rainNoiseSource = createNoiseBuffer(audioContext, 'brown');

		// Create filter for rain
		rainFilter = audioContext.createBiquadFilter();
		rainFilter.type = 'lowpass';
		// RAIN SPEED CONTROL: Lower frequency = slower/gentler rain (500-2000)
		rainFilter.frequency.value = 500;
		// RAIN TEXTURE: Higher Q = more filtered/gentle (0.1-5)
		rainFilter.Q.value = 2;

		// Create gain for rain volume
		rainGain = audioContext.createGain();
		// RAIN VOLUME: Adjust this value (0.0-1.0)
		rainGain.gain.value = 0.15;

		// Connect rain audio chain
		rainNoiseSource.connect(rainFilter);
		rainFilter.connect(rainGain);
		rainGain.connect(audioContext.destination);

		// Start rain sound
		rainNoiseSource.start();
	} catch (e) {
		console.error('Web Audio API initialization failed:', e);
	}
};

const init = () => {
	// Initialize thunder sound
	thunderSound = new Audio('./thunder.mp3');
	thunderSound.volume = 1;

	const overlay = document.getElementById('overlay');
	const startBtn = document.getElementById('startBtn');

	// Handle button click
	startBtn.addEventListener('click', () => {
		// Hide overlay with fade out
		overlay.classList.add('hidden');
		setTimeout(() => {
			overlay.style.display = 'none';
		}, 1000);

		// Initialize audio
		if (!audioContext) {
			initAudio();
		}
	});

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);

	camera.position.z = 1;
	camera.rotation.x = 1.16;
	camera.rotation.y = -0.12;
	camera.rotation.z = 0.27;

	const ambient = new THREE.AmbientLight(0x555555);
	scene.add(ambient);

	const directionalLight = new THREE.DirectionalLight(0xFFEEDD);
	directionalLight.position.set(0,0,1);
	scene.add(directionalLight);

	flash = new THREE.PointLight(0x88BBFF, 0, 2000, 1);
	flash.position.set(0, 0, 200);
	scene.add(flash);

	renderer = new THREE.WebGLRenderer();

	scene.fog = new THREE.FogExp2(0x11111F, 0.002);
	renderer.setClearColor(scene.fog.color);

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 1.5;
	document.body.appendChild(renderer.domElement);

	let positions= [];
	let sizes = [];

	rainGeo = new THREE.BufferGeometry();

	for (let i = 0; i < rainCount; i++) {
		const rainDrop = new THREE.Vector3(
			Math.random() * 400 - 200,
			Math.random() * 500 - 250,
			Math.random() * 400 - 200
		);

		positions.push(Math.random() * 400 - 200);
		positions.push(Math.random() * 500 - 250);
		positions.push(Math.random() * 400 - 200);
		sizes.push(30);
	}

	rainGeo.setAttribute(
		"position",
		new THREE.BufferAttribute(new Float32Array(positions), 3)
	);

	rainGeo.setAttribute(
		"size",
		new THREE.BufferAttribute(new Float32Array(sizes), 1)
	);

	const rainMaterial = new THREE.PointsMaterial({
		color: 0xAAAAAA,
		size: 0.4,
		transparent: true,
		opacity: 0.7
	});
	rain = new THREE.Points(rainGeo, rainMaterial);
	scene.add(rain);

	let loader = new THREE.TextureLoader();
	loader.load(
		"./bg.webp",
		texture => {
			const cloudGeo = new THREE.PlaneGeometry(500, 500);
			const cloudMaterial = new THREE.MeshLambertMaterial({
				map: texture,
				transparent: true,
				color: 0xCCCCCC,
				emissive: 0x555555
			});

			for (let p = 0; p < 100; p++) {
				let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
				cloud.position.set(
					Math.random() * 1200 - 600,
					500,
					Math.random() * 800 - 400
				);

				cloud.rotation.x = 1.18;
				cloud.rotation.y = -0.12;
				cloud.rotation.z = Math.random() * 2 * Math.PI;
				cloud.material.opacity = 0.65;
				cloudParticles.push(cloud);
				scene.add(cloud);
			}

			animate();
			window.addEventListener("resize", onWindowResize);
		}
	);
}

const animate = () => {
	cloudParticles.forEach(p => {
		p.rotation.z -= 0.002;
	});

	const posArray = rainGeo.attributes.position.array;
	for (let i = 1; i < posArray.length; i += 3) {
		posArray[i] -= 2.5;
		if (posArray[i] < -250) {
			posArray[i] = 250;
			posArray[i - 1] = Math.random() * 400 - 200;
			posArray[i + 1] = Math.random() * 400 - 200;
		}
	}
	rainGeo.attributes.position.needsUpdate = true;

	// Flash lightning effect
	if (flash.intensity > 0.1) {
		flash.intensity *= 0.9;
	} else {
		flash.intensity = 0;
		// Random chance to trigger new flash (with cooldown to prevent clustering)
		const currentTime = Date.now();
		const timeSinceLastThunder = currentTime - lastThunderTime;

		if (Math.random() > 0.996 && timeSinceLastThunder >= minThunderInterval) {
			// Randomly choose trans blue or trans pink
			flash.color.setHex(Math.random() > 0.5 ? 0x5BCEFA : 0xF5A9B8);
			flash.position.set(
				Math.random() * 600 - 300,
				Math.random() * 400 + 100,
				Math.random() * 400 - 200
			);
			flash.intensity = 3000;

			// Play thunder sound
			if (thunderSound) {
				thunderSound.currentTime = 0;
				thunderSound.play().catch(e => console.log('Thunder sound failed:', e));
			}

			lastThunderTime = currentTime;
		}
	}

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

init();

const onWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}
