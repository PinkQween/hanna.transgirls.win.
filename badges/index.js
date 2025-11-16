import "../components/index.js";

const container = document.getElementById("container");
const loading = document.getElementById("loading");

// Fetch badge data from GitHub API with caching
let data;

// Try to use Cache API for better performance
const cacheName = 'badges-cache-v1';
const cacheKey = 'https://api.github.com/repos/PinkQween/badge-scraper/contents/badges';

try {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(cacheKey);

	if (cachedResponse) {
		// Use cached data if it's less than 1 hour old
		const cachedData = await cachedResponse.json();
		const cacheTime = new Date(cachedResponse.headers.get('date') || 0).getTime();
		const now = Date.now();
		const oneHour = 60 * 60 * 1000;

		if (now - cacheTime < oneHour) {
			data = cachedData;
			console.log('Using cached badge data');
		} else {
			throw new Error('Cache expired');
		}
	} else {
		throw new Error('No cache found');
	}
} catch (e) {
	// Fetch fresh data
	console.log('Fetching fresh badge data from API');
	const response = await fetch(cacheKey, {
		headers: {
			'Accept': 'application/vnd.github.v3+json'
		}
	});
	data = await response.json();

	// Cache the response for future use
	try {
		const cache = await caches.open(cacheName);
		const responseClone = new Response(JSON.stringify(data), {
			headers: {
				'Content-Type': 'application/json',
				'date': new Date().toUTCString()
			}
		});
		await cache.put(cacheKey, responseClone);
	} catch (cacheError) {
		console.warn('Failed to cache badge data:', cacheError);
	}
}

loading.textContent = `Rendering ${data.length} badges...`;

// Use DocumentFragment for better performance
const fragment = document.createDocumentFragment();

// Use Intersection Observer for lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			const badge = entry.target;
			const actualUrl = badge.getAttribute('data-img');
			if (actualUrl) {
				badge.img = actualUrl;
				badge.removeAttribute('data-img');
				observer.unobserve(badge);
			}
		}
	});
}, {
	rootMargin: '50px' // Start loading 50px before visible
});

// Batch render in chunks to avoid blocking - reduced chunk size for faster initial render
const CHUNK_SIZE = 50;
let index = 0;

function renderChunk() {
	const end = Math.min(index + CHUNK_SIZE, data.length);
	const tempFragment = document.createDocumentFragment();

	for (let i = index; i < end; i++) {
		const badge = document.createElement("a-badge");
		badge.dest = "";

		// Lazy load images that aren't in viewport
		if (i < 20) {
			// Load first 20 immediately for LCP
			badge.img = data[i].download_url;
		} else {
			// Lazy load the rest
			badge.setAttribute('data-img', data[i].download_url);
			badge.img = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1px gif
			imageObserver.observe(badge);
		}

		tempFragment.appendChild(badge);
	}

	container.appendChild(tempFragment);
	index = end;

	if (index < data.length) {
		loading.textContent = `Rendering ${index}/${data.length} badges...`;
		requestIdleCallback(() => renderChunk(), { timeout: 100 });
	} else {
		loading.classList.add('hidden');
	}
}

renderChunk();
