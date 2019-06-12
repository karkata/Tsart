;;(function () {
	"use strict";
	
	class ItemElement {
		constructor(i, t) {
			this.index = i;
			this.name = t.name;
			this.value = t.value || 0;
			this.highlight = t.highlight === true;
			this.visible = t.visible === false ? false: true;
		} //:~ constructor
	} //:~ class ItemElment
	
	const PRESERVED_COLORS = [
		"#d32f2f", "#ff4081", "#7b1fa2", "#7cfdff", "#303f9f",
		"#449aff", "#0288d1", "#00bcd4", "#00796b", "#4caf50",
		"#689f38", "#cddc39", "#fbc02d", "#ffeb3b", "#f57c00",
		"#ff5722", "#5d4037", "#9e9e9e", "#455a64", "#9e9e9e"
	];

	class PieStandardChart {
		constructor(rg, options, data) {
			this.ct = rg.ct;
			this.doc = rg.doc;
			this.cv = rg.cv;
			this.options = options;
			this.minv = Number.MAX_VALUE;
			this.maxv = Number.MIN_VALUE;
			// maxt: sum of values
			this.maxt = 0;
			this.items = [];
			this.indexItem = 0;
			this.indexColor = 0;
			data = data || [];
			for (let i = 0; i < data.length; i++) {
				this.addItem(data[i]);
			}
		} //:~ constructor method

		/**
		 * (public)
		 * Clear all resources.
		 */
		clear() {
			this.minv = Number.MAX_VALUE;
			this.maxv = Number.MIN_VALUE;
			this.maxt = 0;
			this.items = [];
			this.indexItem = 0;
			this.indexColor = 0;
		} //:~ clearItems method

		calculateOne(item) {
			if (this.minv > item.value) this.minv = item.value;
			if (this.maxv < item.value) this.maxv = item.value;
			this.maxt += item.value;
		} //:~ calculateOne method

		getPreservedColor(removeCache) {
			if (removeCache === true) this.indexColor = 0;
			if (this.indexColor === PRESERVED_COLORS.length) this.indexColor = 0;
			return PRESERVED_COLORS[this.indexColor++];
		} //:~ getPreservedColor method

		convertPolar2Cartesian(r, d) {
			return { x: Math.cos(r) * d, y: Math.sin(r) * d };
		} //:~ convertPolar2Cartesian method

		/**
		 * (public)
		 * Add an item.
		 * @param t An item that is indivisual information for diplaying line-area chart
		 */
		addItem(t) {
			let item = new ItemElement(this.items.length, t);
			item.color = item.color || this.getPreservedColor(false);
			this.items.push(item);
			this.calculateOne(item);
		} //:~ addItem method	
		
		update() {
			this.updateHeader();
			this.updateLeft();
			this.updateRight();
			this.updateFooter();
			this.updateClient();
		} //:~ update method

		updateHeader() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const h = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const tx = Tsart.Util.toPixel("50%", this.cv.width);
			const ty = Tsart.Util.toPixel("50%", h);
			
			ctx.clearRect(0, 0, this.cv.width, h);

			// 제목이 있으면 제목을 렌더링한다.
			if (opt.title.content) {
				ctx.fillStyle = opt.title.fontColor;
				ctx.font = opt.title.font;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(opt.title.content, tx, ty);
			}
		} //:~ updateHeader method

		updateLeft() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const posx = 0;
			const posy = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const w = Tsart.Util.toPixel(opt.regions.left.w, this.cv.width);
			const h = this.cv.height - posy - Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);

			ctx.clearRect(posx, posy, w, h);
			
			if (opt.category.visible && opt.category.position === "left") {
				this.updateCategory(ctx, Tsart.Util.toDim(posx, posy, w, h), opt, this.items);
			}
		} //:~ updateLeft method

		updateRight() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const w = Tsart.Util.toPixel(opt.regions.right.w, this.cv.width);
			const posx = this.cv.width - w;
			const posy = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const h = this.cv.height - posy - Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);

			ctx.clearRect(posx, posy, w, h);
			
			if (opt.category.visible && opt.category.position === "right") {
				this.updateCategory(ctx, Tsart.Util.toDim(posx, posy, w, h), opt, this.items);
			}
		} //:~ updateRight method

		updateCategory(ctx, area, opt, items) {
			// 범례 높이, 최대 20pixel을 넘을 수 없다.
			let ch = Math.min(area.h / items.length, 20);
			let sy = parseInt((area.h / 2) - (items.length * ch / 2), 10);
			
			ctx.font = opt.category.font;
			ctx.textAlign = "start";
			ctx.textBaseline = "middle";

			let i = 0;
			for (let t of items) {
				ctx.fillStyle = t.color;
				ctx.fillRect(area.x + 10, area.y + sy + (ch * i), 20, ch * .8);
				ctx.fillStyle = opt.category.fontColor;
				ctx.fillText(t.name, area.x + 34, area.y + sy + (ch * i) + (ch * .4));
				i++;
			}
		} //:~ updateCategory method

		updateFooter() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const h = Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);
			ctx.clearRect(0, this.cv.height - h, this.cv.width, h);
		} //:~ updateFooter method

		updateClient() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const posx = Tsart.Util.toPixel(opt.regions.left.w, this.cv.width);
			const posy = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const w = this.cv.width - posx - Tsart.Util.toPixel(opt.regions.right.w, this.cv.width);
			const h = this.cv.height - posy - Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);
			
			ctx.clearRect(posx, posy, w, h);
			ctx.fillStyle = opt.regions.client.bkcolor;
			ctx.fillRect(posx, posy, w, h);

			// Define the area to be rendered chart.
			const area = Tsart.Util.toDim(
				posx + opt.pie.marginLeft, 
				posy + opt.pie.marginTop, 
				w - opt.pie.marginLeft - opt.pie.marginRight, 
				h - opt.pie.marginTop - opt.pie.marginBottom);

			const cxy = { x: area.c, y: area.m };
			const radius = Tsart.Util.toPixel(opt.pie.pieRadius, parseInt(Math.min(area.w, area.h) / 2, 10));
			const holeRadius = Tsart.Util.toPixel(opt.pie.holeRadius, radius);
			
			let cradius = 0, cradian = 0, oradian = -(Math.PI / 2), pt = null;
			for (let t of this.items) {
				cradian = oradian + Tsart.Util.toRadian(360 * (t.value / this.maxt));

				cradius = t.highlight ? radius + opt.pie.highlightDistance : radius;

				ctx.fillStyle = t.color;
				ctx.beginPath();
				ctx.moveTo(cxy.x + .5, cxy.y + .5);
				ctx.arc(cxy.x + .5, cxy.y + .5, cradius, oradian, cradian, false);
				ctx.closePath();
				ctx.fill();
				
				if (opt.pie.gapWidth > 0) {
					ctx.lineWidth = opt.pie.gapWidth;
					ctx.strokeStyle = opt.regions.client.bkcolor;
					ctx.lineWidth = opt.pie.gapWidth;
					ctx.lineCap = "round";
					ctx.lineJoin = "round";
					ctx.stroke();
				}

				if (t.visible) {
					let txt = "";
					if (opt.item.labelVisible && opt.item.valueVisible) txt = t.name + "(" + t.value + ")";
					else if (opt.item.labelVisible) txt = t.name;
					else if (opt.item.valueVisible) txt = "" + t.value;

					if (txt) {
						if (opt.item.textDisplayType === "over") {
							pt = this.convertPolar2Cartesian((cradian + oradian) / 2, (cradius + holeRadius) / 2);
							pt.x = pt.x + cxy.x + .5;
							pt.y = pt.y + cxy.y + .5;
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
						} else if (opt.item.textDisplayType === "note") {
							// polar coordinate => cartesian coordinate
							pt = this.convertPolar2Cartesian((cradian + oradian) / 2, cradius + 20);
							pt.x = pt.x + cxy.x + .5;
							pt.y = pt.y + cxy.y + .5;
							ctx.strokeStyle = t.color;
							ctx.lineWidth = 1.5;
							ctx.beginPath();
							ctx.moveTo(cxy.x + .5, cxy.y + .5);
							ctx.lineTo(pt.x, pt.y);
							ctx.stroke();
							ctx.textAlign = pt.x < cxy.x ? "right" : pt.x == cxy.x ? "center" : "left";
							ctx.textBaseline = pt.y < cxy.y ? "bottom" : pt.y == cxy.y ? "middle" : "top";
						}
						ctx.font = opt.item.font;
						ctx.fillStyle = opt.item.fontColor;
						ctx.fillText(txt, pt.x, pt.y);
					}
				}
				oradian = cradian;
			}

			if (holeRadius) {
				ctx.fillStyle = opt.regions.client.bkcolor;
				ctx.beginPath();
				ctx.moveTo(cxy.x + .5, cxy.y + .5);
				ctx.arc(cxy.x + .5, cxy.y + .5, holeRadius, 0, Math.PI * 2, false);
				ctx.closePath();
				ctx.fill();
			}
		
		} //:~ updateClient method

	} //:~ class PieStandardChart
		
	Tsart.charts.set("pie-standard", function (rg, st, d) {       		
		st = Tsart.Util.extend({
			title: { content: "", font: "bold 32px 'Arial'", fontColor: "#999999" },
			regions: {
				// 길이는 pixel 또는 %로 지정
				header:	{ h: "0", bkcolor: "#fff" },
				left:	{ w: "0", bkcolor: "#fff" },
				right:	{ w: "0", bkcolor: "#fff" },
				footer:	{ h: "0", bkcolor: "#fff" },
				client:	{ bkcolor: "#fff" }
			},
			category: {
				visible: false,
				// 범례 위치: 'left' | 'right'
				position: "left",
				font: "normal 11px 'Arial'",
				fontColor: "#000"
			},
			pie: {
				marginLeft: 50,
				marginRight: 50,
				marginTop: 50,
				marginBottom: 50,
				gapWidth: 0,
				highlightDistance: 20,
				pieRadius: "100%",
				holeRadius: 0
			},
			item: {
				font: "normal 11px 'Arial'",
				fontColor: "#000",
				// Item label position: "note" | "over"
				textDisplayType: "note",
				// 항목 라벨 위치: true | false 
				labelVisible: true,
				// 항목 값 출력: false | true
				valueVisible: true 
			}
		}, st);
		const chart = new PieStandardChart(rg, st, d);
		chart.update();
		return chart;
	});
})();
