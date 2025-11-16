import "./components/index.js";

const hBadges = document.getElementById("h-badges");

let aBadges = [];

let moreRows = false;
let moreRowsIndex = 0;

while (moreRows !== true) {
	moreRowsIndex++;
	aBadges.push(document.getElementById(`row${moreRowsIndex.toString()}`));
	if (!aBadges[moreRowsIndex-1]) {
		aBadges.pop();
		moreRows = !moreRows;
	}
}

const hHas = [
	"ASD",
	"BPD",
	"CAS",
	"DCD",
	"DU"
];

const shuffle = array => {
	if (!Array.isArray(array) || array.length <= 1) return array;

	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}

let iLinks = shuffle([
	{
		img: "https://transgirls.win/assets/media/transgirlsdark3.gif",
		dest: "https://transgirls.win"
	},
	{
		img: "/assets/rain.gif",
		dest: "/rain"
	},
	{
		img: "/assets/contact.gif",
		dest: "https://hannaskairipa.com/#contact"
	},
	{
		img: "https://cyber.dabamos.de/88x31/transnow2.gif",
		dest: "#"
	},
	{
		img: "/assets/cloudflare.gif",
		dest: "/admin"
	},
	{
		img: "https://cyber.dabamos.de/88x31/miku.gif",
		dest: ""
	},
	{
		img: "https://raw.githubusercontent.com/PinkQween/badge-scraper/main/badges/88by31.gif",
		dest: "/badges"
	},
	{
		img: "https://raw.githubusercontent.com/PinkQween/badge-scraper/main/badges/anything-but-windows.gif",
		dest: ""
	},
	{
		img: "https://raw.githubusercontent.com/PinkQween/badge-scraper/main/badges/99a4d00a82cc786a1a666ad70bf4e8af.gif",
		dest: ""
	},
	{
		img: "https://raw.githubusercontent.com/PinkQween/badge-scraper/main/badges/FGoogle2.gif",
		dest: ""
	}
]);

for (const i in hHas) {
	const badge = document.createElement("h-badge");
	badge.text = hHas[i];
	hBadges.appendChild(badge);
}

console.log(aBadges);

iLinks.forEach((iLink, index) => {
	const badge = document.createElement("a-badge");
	badge.img = iLink.img;
	badge.dest = iLink.dest;

	const row = index % aBadges.length;
	aBadges[row].appendChild(badge);
});
