/* global Tsart: true */
(function () {
	"use strict";
	
	class ItemElement {
		constructor(i, t) {
			this.index = i;
			this.name = t.name;
			this.value = t.value;
			this.group = t.group || "";
            this.nameVisible = t.nameVisible === false ? false : true;
		} //:~ constructor
	} //:~ class ItemElment

	class GroupElement {
		constructor(name) {
			this.name = name;
			this.color = "#0040ff";
			this.items = [];
		} //:~ constructor

		get size() {
			return this.items.length;
		} //:~ size get property

		addItem(item) {
			if (!(item instanceof ItemElement)) throw Error("The item must be a instance of ItemElement");
			this.items.push(item);
		} //:~ addItem method
	} //:~ GroupElement class
	
	class LineAreaChart {
		constructor(rg, options, data) {
			this.ct = rg.ct;
			this.doc = rg.doc;
			this.cv = rg.cv;
			this.options = options;
			this.data = data || [];
			this.groups = new Map();
			this.minv = Number.MAX_VALUE;
			this.maxv = Number.MIN_VALUE;
			this.maxt = 0;
			this.maxn = "";
			this.maxg = "";
			this.xclass = [];
            this.xclassVisible = [];

			this.calculateAll();
		} //:~ constructor method

		/**
		 * (public)
		 * Clear all resources.
		 */
		clear() {
			this.data = [];
			this.groups = new Map();
			this.minv = Number.MAX_VALUE;
			this.maxv = Number.MIN_VALUE;
			this.maxt = 0;
			this.maxn = "";
			this.maxg = "";
			this.xclass = [];
		} //:~ clearItems method

		calculateAll() {
			for (let i = 0; i < this.data.length; i++) {
				this.addItem(this.data[i]);
			}
		} //:~ calculate method

		calculateOne(item) {
			if (this.minv > item.value) this.minv = item.value;
			if (this.maxv < item.value) this.maxv = item.value;
			if (this.maxn.length < item.name.length) this.maxn = item.name;
			if (this.maxg.length < item.group.length) this.maxg = item.group;
			this.maxt = Math.min(Tsart.Util.getMaxAxisValue(this.maxv), this.options.axis.y.maxValue);
            let idx = this.xclass.indexOf(item.name);
			if (idx < 0) {
                 this.xclass.push(item.name);
                 this.xclassVisible[idx] = item.nameVisible === false ? false : this.xclassVisible[idx];
            } else this.xclassVisible.push(item.nameVisible);
		} //:~ calculateOne method

		/**
		 * Get the target group.
		 * @param name The group name as a key.
		 */
		getGroup(name) {
			let group = null;
			if (typeof name === "undefined") name = "";
			if (!this.groups.has(name)) {
				group = new GroupElement(name);
				this.groups.set(name, group);
			} else {
				group = this.groups.get(name);
			}
			return group;
		} //:~ addGroup method
		
		/**
		 * (public)
		 * Add an item.
		 * @param t An item that is indivisual information for diplaying line-area chart
		 */
		addItem(t) {
			let g = this.getGroup(t.group);
			if (g.size == 0) g.color = t.color;
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

			let i = 0;
			for (let [gname, g] of groups) {
				ctx.fillStyle = g.color;
				ctx.fillRect(area.x + 10, area.y + sy + (ch * i), 20, ch * .8);
				ctx.fillStyle = opt.category.fontColor;
				ctx.fillText(gname, area.x + 34, area.y + sy + (ch * i) + (ch * .4));
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
			
			// Define the area to be rendered chart.
			const area = Tsart.Util.toDim(
				posx + opt.axis.x.marginLeft, 
				posy + opt.axis.y.marginTop, 
				w - opt.axis.x.marginLeft - opt.axis.x.marginRight, 
				h - opt.axis.y.marginTop - opt.axis.y.marginBottom);

			this.updateGrid(ctx, area, opt);

			for (let g of this.groups.values()) {
				this.updateArea(ctx, area, g, opt);
			}
		
		} //:~ updateClient method

		updateGrid(ctx, area, opt) {
			const gap = 10;
			const pt = { x: 0, y: 0 };
			// Define the segment of the X axis.
			const xseg = Tsart.Util.toSegment(area.l, area.b, area.r, area.b);
			// Define the segment of the Y axis.
			const yseg = Tsart.Util.toSegment(opt.axis.y.position === "left" ? area.l : area.r, area.t, opt.axis.y.position === "left" ? area.l : area.r, area.b);

			// Draw the X axis coordinate. 
			ctx.lineWidth = 1;
			ctx.strokeStyle = opt.axis.x.lineColor;
			ctx.beginPath();
			ctx.moveTo(xseg.x1, xseg.y1);
			ctx.lineTo(xseg.x2, xseg.y2);
			ctx.stroke();
			
			if (opt.axis.x.name) {
				pt.x = opt.axis.y.position === "left" ? xseg.x2 + gap : xseg.x1 - gap;
				pt.y = xseg.y2;
				ctx.font = opt.axis.x.font;
				ctx.fillStyle = opt.axis.x.fontColor;
				ctx.textAlign = opt.axis.y.position === "left" ? "left" : "right";
				ctx.textBaseline = "top";
				ctx.fillText(opt.axis.x.name, pt.x, pt.y)
			}

			const xw = area.w / this.xclass.length;
			ctx.font = opt.axis.x.font;
			ctx.fillStyle = opt.axis.x.fontColor;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			for (let i = 0; i < this.xclass.length; i++) {
				pt.x = area.x + (i * xw) + (xw / 2);
				pt.y = area.b + gap;
				ctx.fillText(this.xclass[i], pt.x, pt.y)
				if (opt.axis.grid.xVisible === true && this.xclassVisible[i] === true) {
					ctx.strokeStyle = opt.axis.grid.xLineColor;
					ctx.beginPath();
					// For drawing one pixel line, we need to add .5.
					ctx.moveTo(pt.x + .5, area.t + .5);
					ctx.lineTo(pt.x + .5, area.b + .5);
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

			let ystep = opt.axis.y.step;
			let strStep = "";

			for (let i = 0; i < ystep; i++) {
				pt.x = yseg.x1;
				pt.y = yseg.y2 - (yseg.h / ystep * (i + 1));
				ctx.strokeStyle = opt.axis.color;
				ctx.beginPath();
				ctx.moveTo(pt.x + .5, pt.y + .5);
				ctx.lineTo(yseg.x1 + (opt.axis.y.position === "left" ? -(gap * 0.5) : (gap * 0.5)) + .5, pt.y + .5);
				ctx.stroke();		
				strStep = "" + ((this.maxt / ystep) * (i + 1));

				pt.x = opt.axis.y.position === "left" ? pt.x - gap : pt.x + gap;

				ctx.font = opt.axis.y.font;
				ctx.fillStyle = opt.axis.y.fontColor;
				ctx.textAlign = opt.axis.y.position === "left" ? "right" : "left";
				ctx.textBaseline = "middle";
				ctx.fillText(strStep, pt.x, pt.y)
			
				if (opt.axis.grid.yVisible) {
					ctx.strokeStyle = opt.axis.grid.yLineColor;
					ctx.beginPath();
					// For drawing one pixel line, we need to add .5.
					ctx.moveTo(area.l + .5, pt.y + .5);
					ctx.lineTo(area.r + .5, pt.y + .5);
					ctx.stroke();
				}
			}
		} //:~ updateGrid method
		
		updateArea(ctx, area, group, opt) {
			const gapTxt = 10;
			const pt = { x:0, y:0 };

			let ix = 0, iy = 0;
			let areaColor;	
			const iw = area.w / group.items.length;
			const dim = [];	
			// Save coordinations of items and render the line.
			for (let i = 0, t = null; i < group.items.length; i++) {
				t = group.items[i];
				ix = area.x + (i * iw) + (iw / 2);
				iy = parseInt(area.b - (t.value * area.h / this.maxt), 10);
				
				dim.push({ x: ix, y: iy });

				if (i === 0) {
					areaColor = opt.item.areaAlpha === 1 ? group.color : Tsart.Color.parseColor(group.color).setAlpha(.5).toRgbaString();
					ctx.fillStyle = areaColor;
					ctx.beginPath();
					ctx.moveTo(ix, area.b);
					ctx.lineTo(ix, iy);
				} else if (i < group.items.length) {
					ctx.lineTo(ix, iy);
				} 
				
				if (i + 1 === group.items.length) {
					ctx.lineTo(ix, area.b);
					ctx.fill();
				}
			}

			for (let i = 0; i < dim.length; i++) {
				if (i === 0) {
					ctx.strokeStyle = group.color;
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.moveTo(dim[i].x + .5, dim[i].y + .5);
				} else if (i + 1 < dim.length) {
					ctx.lineTo(dim[i].x + .5, dim[i].y + .5);
				} else {
					ctx.lineTo(dim[i].x + .5, dim[i].y + .5);
					ctx.stroke();
				}
			}

			for (let i = 0, t = null; i < dim.length; i++) {
				t = group.items[i];

				// Render the spot.
				if (opt.item.spotVisible) {
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(dim[i].x, dim[i].y, 3, 0, 2 * Math.PI, false);
					ctx.fill();
					ctx.strokeStyle = group.color;
					ctx.strokeWidth = 3;
					ctx.beginPath();
					ctx.arc(dim[i].x, dim[i].y, 3, 0, 2 * Math.PI, false);
					ctx.stroke();
				}

				// Render the label.
				if (i + 1 === dim.length && opt.item.labelVisible) {
					pt.x = dim[i].x + gapTxt;
					pt.y = dim[i].y;
					ctx.textAlign = "start";
					ctx.textBaseline = "middle";
					ctx.fillStyle = group.color;
					ctx.fillText(group.name, pt.x, pt.y);
				}
				
				// Render the value.
				if (opt.item.valueVisible) {
					pt.x = dim[i].x;
					pt.y = dim[i].y - gapTxt;
					ctx.textAlign = "center";
					ctx.textBaseline = "bottom";
					ctx.fillStyle = group.color;
					ctx.fillText(t.value, pt.x, pt.y); 
				}
			}
		} //:~ updateArea method

	} //:~ class LineAreaChart
		
	Tsart.charts.set("line-area", function (rg, st, d) {       		
		st = Tsart.Util.extend({
			title: { content: "", font: "bold 32px 'Arial'", fontColor: "#999999" },
			regions: {
				header:	{ h: "0", bkcolor: "#fff" },
				left:	{ w: "0", bkcolor: "#fff" },
				right:	{ w: "0", bkcolor: "#fff" },
				footer:	{ h: "0", bkcolor: "#fff" },
				client:	{ bkcolor: "#fff" }
			},
			category: {
				visible: false,
				// position: "left"|"right"
				position: "left",
				font: "normal 11px 'Arial'", fontColor: "#000"
			},
			axis: {
				x: {
					name: "",
					font: "normal 11px 'Arial'", fontColor: "#000", marginLeft: 50,
					marginRight: 50,
					lineColor: "#aaa"
				},
				y: {
					name: "",
					font: "normal 11px 'Arial'",
					fontColor: "#000",
					marginTop: 50,
					marginBottom: 50,
					lineColor: "#aaa",
					step: 10,
					maxValue: Number.MAX_VALUE,
					// position: "left"|"right"
					position: "left"
				},
				grid: {
					xLineColor: "#ddd",
					xVisible: true,
					yLineColor: "#ddd",
					yVisible: true
				}
			},
			item: {
				// alpha: 0~1
				areaAlpha: 1,
				// spot display: true|false
				spotVisible: true,
				// label display: true|false 
				labelVisible: true,
				// value display: false|true
				valueVisible: true 
			}
		}, st);
		const chart = new LineAreaChart(rg, st, d);
		chart.update();
		return chart;
	});
})();
