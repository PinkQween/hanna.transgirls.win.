class HBadge extends HTMLElement {
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "open" });
		this.init();
	}

	async init() {
		console.log("h-badge init started", this.getAttribute("text"));

		// Fetch HTML and CSS in parallel instead of daisy-chaining
		const [htmlResponse, cssResponse] = await Promise.all([
			fetch("/components/h-badge.html"),
			fetch("/components/h-badge.css")
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

		// Set initial text value if attribute exists
		const text = this.getAttribute("text");
		const p = this.root.querySelector("p");
		if (text && p) {
			p.innerText = text;
			p.setAttribute("role", "listitem");
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
