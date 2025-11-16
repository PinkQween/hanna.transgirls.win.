import "../components/index.js";

const container = document.getElementById("container");
const loading = document.getElementById("loading");

// Fetch from static cache first, fallback to API
let data;
try {
	const cacheResponse = await fetch("./cache.json");
	if (cacheResponse.ok) {
		data = await cacheResponse.json();
	} else {
		throw new Error("Cache not found");
	}
} catch (e) {
	// Fallback to API
	const response = await fetch("https://api.github.com/repos/PinkQween/badge-scraper/contents/badges", {
		headers: {
			'Accept': 'application/vnd.github.v3+json'
		}
	});
	data = await response.json();
}

loading.textContent = `Rendering ${data.length} badges...`;

// Use DocumentFragment for better performance
const fragment = document.createDocumentFragment();

// Batch render in chunks to avoid blocking
const CHUNK_SIZE = 100;
let index = 0;

function renderChunk() {
	const end = Math.min(index + CHUNK_SIZE, data.length);

	for (let i = index; i < end; i++) {
		const badge = document.createElement("a-badge");
		badge.dest = "";
		badge.img = data[i].download_url;
		fragment.appendChild(badge);
	}

	container.appendChild(fragment);
	index = end;

	if (index < data.length) {
		loading.textContent = `Rendering ${index}/${data.length} badges...`;
		requestAnimationFrame(renderChunk);
	} else {
		loading.classList.add('hidden');
	}
}

renderChunk();
