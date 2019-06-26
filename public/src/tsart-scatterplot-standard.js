/* global Tsart: true */
(function () {
	"user strict";
	
	class GroupElement {
		constructor(name, color) {
			this.name = name;
			this.color = color || "#0080FF"; 
			this.items = [];
		} //:~ constructor

		get size() {
			return this.items.length;
		} //:~ size property

		addItem(item) {
			if (!(item instanceof ItemElement)) throw Error("The item must be a instance of ItemElement");
			this.items.push(item);
		} //:~ addItem method
	} //:~ GroupElement class

	class ItemElement {
		constructor(i, t) {
			this.index = i;
			this.x = t.x;
			this.y = t.y;
			this.group = t.group || "";
		} //:~ constructor
	} //:~ class ItemElment

	class ScatterPlotStandardChart {
		constructor(rg, options, data) {
			this.ct = rg.ct;
			this.doc = rg.doc;
			this.cv = rg.cv;
			this.options = options;
			this.data = data || [];
			this.groups = new Map();
			this.minxv = Number.MAX_VALUE;
			this.maxxv = Number.MIN_VALUE;
			this.minyv = Number.MAX_VALUE;
			this.maxyv = Number.MIN_VALUE;
			this.minxt = 0;
			this.minyt = 0;
			this.maxxt = 0;
			this.maxyt = 0;
			this.maxg = "";
		
			this.calculateAll();
		} //:~ constructor method

		calculateAll() {
			for (let i = 0; i < this.data.length; i++) {
				this.addItem(this.data[i]);
			}
		} //:~ calculate method

		calculateOne(item) {
			if (this.minxv > item.x) this.minxv = item.x;
			if (this.maxxv < item.x) this.maxxv = item.x;
			if (this.minyv > item.y) this.minyv = item.y;
			if (this.maxyv < item.y) this.maxyv = item.y;
			if (this.maxg.length < item.group.length) this.maxg = item.group;
			this.minxt = this.options.axis.x.minValue;
			this.minyt = this.options.axis.y.minValue;
			this.maxxt = Math.min(Tsart.Util.getMaxAxisValue(this.maxxv), this.options.axis.x.maxValue);
			this.maxyt = Math.min(Tsart.Util.getMaxAxisValue(this.maxyv), this.options.axis.y.maxValue);
		} //:~ calculateOne method

		/**
		 * (public)
		 * Clear items.
		 */
		clearItems() {
			this.data = [];
			this.groups = new Map();
			this.minxv = Number.MAX_VALUE;
			this.maxxv = Number.MIN_VALUE;
			this.minyv = Number.MAX_VALUE;
			this.maxyv = Number.MIN_VALUE;
			this.minxt = 0;
			this.minyt = 0;
			this.maxxt = 0;
			this.maxyt = 0;
			this.maxg = "";
		} //:~ clearItems method

		/**
		 * (public)
		 * Add an item
		 * @param t An item that is indivisual information for diplaying bar chart.
		 */
		addItem(t) {
			let g = null;
			if (typeof t.group === "undefined") t.group = "";
			if (!this.groups.has(t.group)) {
				g = new GroupElement(t.group, t.color);
				this.groups.set(t.group, g);
			} else {
				g = this.groups.get(t.group);
			}

			let item = new ItemElement(g.size, t);
			g.addItem(item);

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
				this.updateCategory(ctx, Tsart.Util.toDim(posx, posy, w, h), opt, this.groups);
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
				this.updateCategory(ctx, Tsart.Util.toDim(posx, posy, w, h), opt, this.groups);
			}
		} //:~ updateRight method

		updateCategory(ctx, area, opt, groups) {
			// 범례 높이, 최대 20pixel을 넘을 수 없다.
			let ch = Math.min(area.h / groups.size, 20);
			let sy = parseInt((area.h / 2) - (groups.size * ch / 2), 10);
			
			ctx.font = opt.category.font;
			ctx.textAlign = "start";
			ctx.textBaseline = "middle";

			let idx = -1;
			let pt = { x: 0, y: 0 };
			for (let [name, g] of groups) {
				console.log(name);
				idx++;
				pt.x = area.x + 15;
				pt.y = area.y + sy + (ch * idx) + (ch / 2);
				ctx.fillStyle = g.color;
				ctx.beginPath();
				ctx.moveTo(pt.x, pt.y)
				ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = opt.category.fontColor;
				ctx.fillText(name, area.x + 30, pt.y);
			}
		} //:~ updateCategory method

		updateFooter() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const h = Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);
			ctx.clearRect(0, this.cv.height - h, this.cv.width, h);
		} //:~ updateFooter method

		/**
		 * (public)
		 * Render the client area.
		 */
		updateClient() {
			const opt = this.options;
			const ctx = this.cv.getContext("2d");
			const posx = Tsart.Util.toPixel(opt.regions.left.w, this.cv.width);
			const posy = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const w = this.cv.width - posx - Tsart.Util.toPixel(opt.regions.right.w, this.cv.width);
			const h = this.cv.height - posy - Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);
			
			ctx.clearRect(posx, posy, w, h);
			
			// Define the area to be rendered chart.
			const area = Tsart.Util.toDim(
				posx + opt.axis.x.marginLeft, 
				posy + opt.axis.y.marginTop, 
				w - opt.axis.x.marginLeft - opt.axis.x.marginRight, 
				h - opt.axis.y.marginTop - opt.axis.y.marginBottom);

			this.updateGrid(ctx, area, opt);
			this.updateScatterplot(ctx, area, opt);
						
		} //:~ updateClient method

		updateGrid(ctx, area, opt) {
			const gap = 10;
			const pt = { x: 0, y: 0 };
			// Define the segment of the X axis.
			const xseg = Tsart.Util.toSegment(area.l, area.b, area.r, area.b);
			// Define the segment of the Y axis.
			const yseg = Tsart.Util.toSegment(area.l, area.t, area.l, area.b);

			// Draw the X axis coordinate. 
			ctx.lineWidth = 1;
			ctx.strokeStyle = opt.axis.x.lineColor;
			ctx.beginPath();
			ctx.moveTo(xseg.x1, xseg.y1);
			ctx.lineTo(xseg.x2, xseg.y2);
			ctx.stroke();
			
			if (opt.axis.x.name) {
				pt.x = xseg.x2 + gap;
				pt.y = xseg.y2;
				ctx.font = opt.axis.x.font;
				ctx.fillStyle = opt.axis.x.fontColor;
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				ctx.fillText(opt.axis.x.name, pt.x, pt.y)
			}
		
			let step = opt.axis.x.step;
			let strStep = "";

			for (let i = 0; i < step; i++) {
				pt.x = xseg.x1 + (xseg.w / step * (i + 1));
				pt.y = xseg.y1;
				ctx.strokeStyle = opt.axis.color;
				ctx.beginPath();
				ctx.moveTo(pt.x + 0.5, pt.y + 0.5);
				ctx.lineTo(pt.x + 0.5, pt.y + (gap * 0.5) + 0.5);
				ctx.stroke();		
				strStep = "" + (this.minxt + ((this.maxxt - this.minxt) / step) * (i + 1));

				ctx.font = opt.axis.x.font;
				ctx.fillStyle = opt.axis.x.fontColor;
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.fillText(strStep, pt.x, pt.y + gap)
			
				if (opt.axis.grid.visible) {
					ctx.strokeStyle = opt.axis.grid.lineColor;
					ctx.beginPath();
					ctx.moveTo(pt.x + 0.5, area.t + 0.5);
					ctx.lineTo(pt.x + 0.5, area.b + 0.5);
					ctx.stroke();
				}
			}

			// Draw the Y axis coordinate.
			ctx.strokeStyle = opt.axis.y.lineColor;
			ctx.beginPath();
			ctx.moveTo(yseg.x1, yseg.y1);
			ctx.lineTo(yseg.x2, yseg.y2);
			ctx.stroke();

			if (opt.axis.y.name) {
				pt.x = yseg.x1;
				pt.y = yseg.y1 - gap;
				ctx.font = opt.axis.y.font;
				ctx.fillStyle = opt.axis.y.fontColor;
				ctx.textAlign = "center";
				ctx.textBaseline = "bottom";
				ctx.fillText(opt.axis.y.name, pt.x, pt.y)
			}

			step = opt.axis.y.step;

			for (let i = 0; i < step; i++) {
				pt.x = yseg.x1;
				pt.y = yseg.y2 - (yseg.h / step * (i + 1));
				ctx.strokeStyle = opt.axis.color;
				ctx.beginPath();
				ctx.moveTo(pt.x + 0.5, pt.y + 0.5);
				ctx.lineTo(yseg.x1 - (gap * 0.5) + 0.5, pt.y + 0.5);
				ctx.stroke();		
				strStep = "" + (this.minyt + ((this.maxyt - this.minyt) / step) * (i + 1));

				pt.x = pt.x - gap;

				ctx.font = opt.axis.y.font;
				ctx.fillStyle = opt.axis.y.fontColor;
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				ctx.fillText(strStep, pt.x, pt.y)
			
				if (opt.axis.grid.visible) {
					ctx.strokeStyle = opt.axis.grid.lineColor;
					ctx.beginPath();
					ctx.moveTo(area.l + 0.5, pt.y + 0.5);
					ctx.lineTo(area.r + 0.5, pt.y + 0.5);
					ctx.stroke();
				}
			}
		} //:~ updateGrid method

		updateScatterplot(ctx, area, opt) {
			const pt = { x:0, y:0 };

			const rangex = this.maxxt - this.minxt;
			const rangey = this.maxyt - this.minyt;
			
			for (let g of this.groups.values()) {
				ctx.fillStyle = g.color;
				for (let i = 0, t = null; i < g.items.length; i++) {
					t = g.items[i];
					pt.x = area.l + parseInt(area.w * (t.x - this.minxt) / rangex, 10);
					pt.y = area.b - parseInt(area.h * (t.y - this.minyt) / rangey, 10);
					ctx.beginPath();
					ctx.moveTo(pt.x + .5, pt.y + .5);
					if (opt.item.useBubble) {
						ctx.arc(pt.x + .5, pt.y + .5, opt.item.size, 0, Math.PI * 2);
					}  else ctx.arc(pt.x + .5, pt.y + .5, opt.item.size, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		} //:~ updateScatterplot method
	} //:~ class ScatterPlotStandardChart
	
	Tsart.charts.set("scatterplot-standard", function (rg, st, d) {       		
		st = Tsart.Util.extend({
			title: { content: "", font: "bold 32px 'Arial'", fontColor: "#999999" },
			regions: {
				// The length should be written by pixel or percentage unit.
				header:	{ h: "0", bkcolor: "#fff" },
				left:	{ w: "0", bkcolor: "#fff" },
				right:	{ w: "0", bkcolor: "#fff" },
				footer:	{ h: "0", bkcolor: "#fff" },
				client:	{ bkcolor: "#fff" }
			},
			category: {
				visible: false,
				// category position: 'left' | 'right'
				position: "left",
				font: "normal 11px 'Arial'",
				fontColor: "#000"
			},
			axis: {
				x: {
					name: "",
					font: "normal 11px 'Arial'",
					fontColor: "#000",
					marginLeft: 50,
					marginRight: 50,
					lineColor: "#aaa",
					step: 10,
					minValue: 0,
					maxValue: Number.MAX_VALUE
				},
				y: {
					name: "",
					font: "normal 11px 'Arial'",
					fontColor: "#000",
					marginTop: 50,
					marginBottom: 50,
					lineColor: "#aaa",
					step: 10,
					minValue: 0,
					maxValue: Number.MAX_VALUE
				},
				grid: {
					lineColor: "#ddd",
					visible: true
				}
			},
			item: {
				size: 3,
				useBubble: false,
				// depending on: "x" : "y"
				bubbleTarget: "x",
				bubbleMinRadius: 0,
				bubbleMaxRadius: 10
			}
		}, st);

		const chart = new ScatterPlotStandardChart(rg, st, d);
		chart.update();
		return chart;
	});
})();
