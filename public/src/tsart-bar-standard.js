/* global Tsart: true */
(function () {
	"use strict";
	class GroupElement {
		constructor(name) {
			this.name = name;
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
			this.name = t.name;
			this.value = t.value;
			this.group = t.group || "";
			this.color = t.color || "#0040ff";
			this.nameVisible = t.nameVisible === false ? false : true;
		} //:~ constructor
	} //:~ class ItemElment

	class BarStandardChart {
		constructor(rg, options, data) {
			this.ct = rg.ct;
			this.doc = rg.doc;
			this.cv = rg.cv;
			this.options = options;
			this.data = data || [];
			this.groups = new Map();
			
			// 데이터는 배열 형식의 값이다.
			// [
			//     { name: "", value: 10, color: "#121212", group: "group name" }
			//     ...
			// ]

			this.minv = Number.MAX_VALUE;
			this.maxv = Number.MIN_VALUE;
			this.maxt = 0;
			this.maxn = "";
			this.maxg = "";

			this.calculateAll();
		} //:~ constructor method

		calculateAll() {
			// 항목 값 중에서 가장 큰 값과 가장 작은 값을 선별하고, 항목을 그룹화한다.
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
		} //:~ calculateOne method

		/**
		 * (public)
		 * Clear items.
		 */
		clearItems() {
			this.data = [];
			this.groups = new Map();
			this.minv = Number.MAX_VALUE;
			this.maxv = Number.MIN_VALUE;
			this.maxt = 0;
			this.maxn = "";
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
				g = new GroupElement(t.group);
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
			const d = this.data;
			const ctx = this.cv.getContext("2d");
			const posx = 0;
			const posy = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const w = Tsart.Util.toPixel(opt.regions.left.w, this.cv.width);
			const h = this.cv.height - posy - Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);

			ctx.clearRect(posx, posy, w, h);
			
			if (opt.category.visible && opt.category.position === "left") {
				this.updateCategory(ctx, Tsart.Util.toDim(posx, posy, w, h), opt, d);
			}
		} //:~ updateLeft method

		updateRight() {
			const opt = this.options;
			const d = this.data;
			const ctx = this.cv.getContext("2d");
			const w = Tsart.Util.toPixel(opt.regions.right.w, this.cv.width);
			const posx = this.cv.width - w;
			const posy = Tsart.Util.toPixel(opt.regions.header.h, this.cv.height);
			const h = this.cv.height - posy - Tsart.Util.toPixel(opt.regions.footer.h, this.cv.height);

			ctx.clearRect(posx, posy, w, h);
			
			if (opt.category.visible && opt.category.position === "right") {
				this.updateCategory(ctx, Tsart.Util.toDim(posx, posy, w, h), opt, d);
			}
		} //:~ updateRight method

		updateCategory(ctx, area, opt, d) {
			// 범례 높이, 최대 20pixel을 넘을 수 없다.
			let ch = Math.min(area.h / d.length, 20);
			let sy = parseInt((area.h / 2) - (d.length * ch / 2), 10);
			
			ctx.font = opt.category.font;
			ctx.textAlign = "start";
			ctx.textBaseline = "middle";
			for (let i = 0, t = null; i < d.length; i++) {
				t = d[i];
				ctx.fillStyle = t.color;
				ctx.fillRect(area.x + 10, area.y + sy + (ch * i), 20, ch * .8);
				ctx.fillStyle = opt.category.fontColor;
				ctx.fillText(t.name, area.x + 34, area.y + sy + (ch * i) + (ch * .4));
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
						
			const gw = area.w / this.groups.size;
			
			// gidx: 그룹 순서, gxc: 그룹 별 x축 가운데 위치
			let gidx = 0, gxc = 0;
			let iw = 0, ix = 0, bw = 0;
			let bxc = 0, cby = 0, oby = 0, barea = null;
			for (let g of this.groups.values()) {
				gxc = area.x + (gidx * gw) + (gw / 2);
				// 항목 크기
				iw = (gw * opt.item.groupGapRatio) / (opt.item.groupMerging ? 1 : g.items.length);
				// 첫 항목의 x 축 시작 위치
				ix = gxc - (gw * opt.item.groupGapRatio / 2);
				// 여백을 제외한 실제 항목이 그려지는 가로 크기 
				bw = opt.item.groupMerging ? iw : iw * opt.item.gapRatio;
				for (let i = 0, t = null; i < g.items.length; i++) {
					t = g.items[i];
					if (i === 0) oby = area.b;
					bxc = ix + (opt.item.groupMerging ? 0 : (i * iw)) + (iw / 2);
					cby = parseInt(area.b - (t.value * area.h / this.maxt), 10);
					barea = Tsart.Util.toDim(bxc - (bw / 2), cby, bw, opt.item.groupMerging ? oby - cby : area.b - cby);
					oby = cby;
					this.updateBar(ctx, barea, t, i, opt);
				}
				gidx++;
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
				ctx.moveTo(pt.x + 0.5, pt.y + 0.5);
				ctx.lineTo(yseg.x1 + (opt.axis.y.position === "left" ? -(gap * 0.5) : (gap * 0.5)) + 0.5, pt.y + 0.5);
				ctx.stroke();		
				strStep = "" + ((this.maxt / ystep) * (i + 1));

				pt.x = opt.axis.y.position === "left" ? pt.x - gap : pt.x + gap;

				ctx.font = opt.axis.y.font;
				ctx.fillStyle = opt.axis.y.fontColor;
				ctx.textAlign = opt.axis.y.position === "left" ? "right" : "left";
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

		updateBar(ctx, area, item, index, opt) {
			const gapTxt = 10;
			const pt = { x:0, y:0 };

			ctx.fillStyle = item.color;
			ctx.fillRect(area.x, area.y, area.w, area.h);

			// 그룹 라벨 출력
			if (opt.item.groupMerging && index === 0) {
				pt.x = area.c;
				pt.y = area.b + gapTxt;
				ctx.fillStyle = "#000";
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.fillText(item.name, pt.x, pt.y);
			}
			// 항목 라벨 출력
			if (opt.item.labelVisible && item.nameVisible) {
				ctx.fillStyle = opt.item.groupMerging ? "#fff" :  "#000";
				pt.x = area.c;
				pt.y = opt.item.groupMerging ? area.m : area.b + gapTxt;
				
				// 항목 라벨 회전
				if (opt.item.labelRotate == "vertical") {
					ctx.save();
					ctx.translate(pt.x, pt.y);
					ctx.rotate(-(Math.PI / 2));
					ctx.translate(-pt.x, -pt.y);
					ctx.textAlign = "right";
					ctx.textBaseline = opt.item.groupMerging ? "middle" : "top";
					ctx.fillText(item.name, pt.x, pt.y);
					ctx.restore();
				} else {
					ctx.textAlign = "center";
					ctx.textBaseline = opt.item.groupMerging ? "middle" : "top";
					ctx.fillText(item.name, pt.x, pt.y);
				}
			}
			
			// 항목 값 출력
			if (!opt.item.groupMerging && opt.item.valueVisible) {
				pt.x = area.c;
				pt.y = area.t - gapTxt;
				ctx.fillStyle = item.color;
				ctx.textAlign = "center";
				ctx.textBaseline = "baseline";
				ctx.fillText(item.value, pt.x, pt.y); 
			}
		} //:~ updateBar method
	} //:~ class BarStandardChart

	Tsart.charts.set("bar-standard", function (rg, st, d) {       		
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
			axis: {
				x: {
					// x 축 이름
					name: "",
					font: "normal 11px 'Arial'",
					fontColor: "#000",
					marginLeft: 50,
					marginRight: 50,
					lineColor: "#aaa"
				},
				y: {
					// y 축 이름
					name: "",
					font: "normal 11px 'Arial'",
					fontColor: "#000",
					marginTop: 30,
					marginBottom: 30,
					lineColor: "#aaa",
					// y 축 간격
					step: 10,
					//값
					maxValue: Number.MAX_VALUE,
					// 위치: 'left'|'right'
					position: "left"
				},
				grid: {
					lineColor: "#ddd",
					visible: true
				}
			},
			item: {
				// 그룹 간격, 0 ~ 1
				groupGapRatio: .8,
				// 항목 간격, 0 ~ 1
				gapRatio: .8,
				// 항목 라벨 위치: true | false 
				labelVisible: true,
				// 항목 라벨 회전: 'horizon'|'vertical'
				labelRotate: "horizon",
				// 항목 값 출력: false | true
				valueVisible: false,
				// 그룹 병합
				groupMerging: false
			}
		}, st);

		const chart = new BarStandardChart(rg, st, d);
		chart.update();
		return chart;
	});
})();
