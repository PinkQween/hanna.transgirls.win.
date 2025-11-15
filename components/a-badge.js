class ABadge extends HTMLElement {
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "open" });
		this.init();
	}

	setOnClick = dest => () => open(dest, "_blank");

	async init() {
		const htmlResponse = await fetch("/components/a-badge.html");
		const htmlText = await htmlResponse.text();
		let template = document.createElement("template");
		template.innerHTML = htmlText;

		const cssResponse = await fetch("/components/a-badge.css");
		const cssText = await cssResponse.text();
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
		}
		if (dest) {
			this._img.alt = dest;
			this._img.onclick = this.setOnClick(dest);
		}
	}

	static get observedAttributes() {
		return ["img", "dest"]
	}

	attributeChangedCallback(attr, _, v) {
		if (!this._img) return; // Wait until init() completes

		if (attr === "img") {
			this._img.src = v;
		} else if (attr === "dest") {
			this._img.alt = v;
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
