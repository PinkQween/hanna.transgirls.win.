import "./components/index.js";

const hBadges = document.getElementById("h-badges");

let aBadges = [];

let moreRows = false;
let moreRowsIndex = 0;

while (moreRows !== true) {
	moreRowsIndex++;
	aBadges.push(document.getElementById(`row${moreRowsIndex.toString()}`));
	if (!!aBadges[moreRowsIndex]) {
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

let iLinks = [
	{
		img: "https://transgirls.win/assets/media/transgirlsdark3.gif",
		dest: "https://transgirls.win"
	}
];

iLinks = { ...iLinks, ...iLinks }
iLinks = { ...iLinks, ...iLinks }
iLinks = { ...iLinks, ...iLinks }
iLinks = { ...iLinks, ...iLinks }
iLinks = { ...iLinks, ...iLinks }


for (const i in hHas) {
	const badge = document.createElement("h-badge");
	badge.text = hHas[i];
	hBadges.appendChild(badge);
}

iLinks.forEach((iLink, index) => {
	const badge = document.createElement("a-badge");
	badge.img = iLink.img;
	badge.dest = iLink.dest;

	const row = index % aBadges.length;
	aBadges[row].appendChild(badge);
});
