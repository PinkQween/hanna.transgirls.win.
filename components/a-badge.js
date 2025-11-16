class ABadge extends HTMLElement {
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "open" });
		this.init();
	}

	setOnClick = dest => () => open(dest, "_blank");

	generateAltText(imgSrc, dest) {
		// Extract meaningful description from image filename or destination
		const imgName = imgSrc?.split('/').pop()?.replace(/\.(gif|png|jpg|jpeg|webp)$/i, '').replace(/[-_]/g, ' ') || '';
		const destName = dest ? new URL(dest, window.location.href).hostname.replace('www.', '') : '';

		if (imgName && imgName !== '88by31' && imgName !== 'transnow2') {
			return imgName.charAt(0).toUpperCase() + imgName.slice(1) + ' badge';
		}
		if (destName) {
			return `Badge linking to ${destName}`;
		}
		return 'Badge image';
	}

	async init() {
		// Fetch HTML and CSS in parallel instead of daisy-chaining
		const [htmlResponse, cssResponse] = await Promise.all([
			fetch("/components/a-badge.html"),
			fetch("/components/a-badge.css")
		]);

		const [htmlText, cssText] = await Promise.all([
			htmlResponse.text(),
			cssResponse.text()
		]);

		let template = document.createElement("template");
		template.innerHTML = htmlText;

		let styles = new CSSStyleSheet();
		await styles.replace(cssText);

		this.root.appendChild(template.content.cloneNode(true));
		this.root.adoptedStyleSheets = [styles];

		this._img = this.root.querySelector("img");

		// Set initial attribute values if they exist
		const imgSrc = this.getAttribute("img");
		const dest = this.getAttribute("dest");

		if (imgSrc) {
			this._img.src = imgSrc;
			this._img.alt = this.generateAltText(imgSrc, dest);
		}
		if (dest) {
			this._img.onclick = this.setOnClick(dest);
			this._img.tabIndex = 0;
			this._img.role = 'link';
			this._img.style.cursor = 'pointer';
			this._img.onkeydown = (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					this.setOnClick(dest)();
				}
			};
		}
	}

	static get observedAttributes() {
		return ["img", "dest"]
	}

	attributeChangedCallback(attr, _, v) {
		if (!this._img) return; // Wait until init() completes

		if (attr === "img") {
			this._img.src = v;
			this._img.alt = this.generateAltText(v, this.getAttribute("dest"));
		} else if (attr === "dest") {
			this._img.alt = this.generateAltText(this.getAttribute("img"), v);
			this._img.onclick = this.setOnClick(v);
		}
	}

	get img() {
		return this.getAttribute("img");
	}

	set img(value) {
		this.setAttribute("img", value);
	}

	get dest() {
		return this.getAttribute("dest");
	}

	set dest(value) {
		this.setAttribute("dest", value);
	}
}

customElements.define("a-badge", ABadge);
