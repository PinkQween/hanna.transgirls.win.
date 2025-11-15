class HBadge extends HTMLElement {
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "open" });
		this.init();
	}

	async init() {
		console.log("h-badge init started", this.getAttribute("text"));
		const htmlResponse = await fetch("/components/h-badge.html");
		const htmlText = await htmlResponse.text();
		let template = document.createElement("template");
		template.innerHTML = htmlText;

		const cssResponse = await fetch("/components/h-badge.css");
		const cssText = await cssResponse.text();
		let styles = new CSSStyleSheet();
		await styles.replace(cssText);

		this.root.appendChild(template.content.cloneNode(true));
		this.root.adoptedStyleSheets = [styles];

		// Set initial text value if attribute exists
		const text = this.getAttribute("text");
		if (text) {
			this.root.querySelector("p").innerText = text;
		}
		console.log("h-badge init completed", text);
	}

	static get observedAttributes() {
		return ["text"];
	}

	attributeChangedCallback(attr, _, v) {
		if (attr === "text") {
			const p = this.root.querySelector("p");
			if (p) {
				p.innerText = v;
			}
		}
	}

	get text() {
		return this.getAttribute("text");
	}

	set text(value) {
		this.setAttribute("text", value);
	}
}

customElements.define("h-badge", HBadge);
