/* global Tsart: true */
(function () {
	"user strict";
	
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
			this.visible = t.visible === false ? false : true;
		} //:~ constructor
	} //:~ class ItemElment

	class BarHorizonChart {
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
		
			this.calculateAll();
		} //:~ constructor method

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
			this.maxt = Math.min(Tsart.Util.getMaxAxisValue(this.maxv), this.options.axis.x.maxValue);
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
						
			const gh = area.h / this.groups.size;
			
			// gidx: 그룹 순서, gyc: 그룹 별 y축 가운데 위치
			let gidx = 0, gyc = 0;
			let ih = 0, iy = 0, bh = 0;
			let byc = 0, cbx = 0, obx = 0, barea = null;
			for (let g of this.groups.values()) {
				gyc = area.y + (gidx * gh) + (gh / 2);
				// 항목 높이 
				ih = (gh * opt.item.groupGapRatio) / (opt.item.groupMerging ? 1 : g.items.length);
				// 첫 항목의 y 축 시작 위치
				iy = gyc - (gh * opt.item.groupGapRatio / 2);
				// 여백을 제외한 실제 항목이 그려지는 높이 
				bh = opt.item.groupMerging ? ih : ih * opt.item.gapRatio;
				for (let i = 0, t = null; i < g.items.length; i++) {
					t = g.items[i];
					if (i === 0) obx = area.x;
					byc = iy + (opt.item.groupMerging ? 0 : (i * ih)) + (ih / 2);
					cbx = parseInt(area.x + (t.value * area.w / this.maxt), 10);
					//barea = Tsart.Util.toDim(bxc - (bw / 2), cby, bw, opt.item.groupMerging ? oby - cby : area.b - cby);
					barea = Tsart.Util.toDim(obx, byc - (bh / 2), cbx - obx, bh);
					obx = opt.item.groupMerging? cbx : obx;
					this.updateBar(ctx, barea, t, i, opt);
				}
				gidx++;
			}
		} //:~ updateClient method

		updateGrid(ctx, area, opt) {
			const gap = 10;
			const pt = { x: 0, y: 0 };
			// Define the segment of the X axis.
			const xseg = Tsart.Util.toSegment(area.l, opt.axis.x.position === "bottom" ? area.b : area.t, area.r, opt.axis.x.position === "bottom" ? area.b : area.t);
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
		
			let xstep = opt.axis.x.step;
			let strStep = "";

			for (let i = 0; i < xstep; i++) {
				pt.x = xseg.x1 + (xseg.w / xstep * (i + 1));
				pt.y = xseg.y1;
				ctx.strokeStyle = opt.axis.color;
				ctx.beginPath();
				ctx.moveTo(pt.x + 0.5, pt.y + 0.5);
				ctx.lineTo(pt.x + 0.5, pt.y + (opt.axis.x.position === "bottom" ? (gap * 0.5) : -(gap * 0.5)) + 0.5);
				ctx.stroke();		
				strStep = "" + ((this.maxt / xstep) * (i + 1));

				pt.y = opt.axis.x.position === "bottom" ? pt.y + gap : pt.y - gap;

				ctx.font = opt.axis.y.font;
				ctx.fillStyle = opt.axis.x.fontColor;
				ctx.textAlign = "center";
				ctx.textBaseline = opt.axis.x.position === "bottom" ? "top" : "bottom";
				ctx.fillText(strStep, pt.x, pt.y)
			
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
				pt.y = opt.axis.x.position === "bottom" ? yseg.y1 - gap : yseg.y2 + gap;
				ctx.font = opt.axis.y.font;
				ctx.fillStyle = opt.axis.y.fontColor;
				ctx.textAlign = "center";
				ctx.textBaseline = opt.axis.x.position === "bottom" ? "bottom" : "top";
				ctx.fillText(opt.axis.y.name, pt.x, pt.y)
			}

		} //:~ updateGrid method

		updateBar(ctx, area, item, index, opt) {
			const gapTxt = 10;
			const valueGap = 5;
			const pt = { x:0, y:0 };

			ctx.fillStyle = item.color;
			ctx.fillRect(area.x, area.y, area.w, area.h);

			// 그룹 라벨 출력
			if (opt.item.groupMerging && index === 0) {
				pt.x = area.x - gapTxt;
				pt.y = area.m;
				ctx.fillStyle = "#000";
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				ctx.fillText(item.name, pt.x, pt.y);
			}

			// 항목 라벨 출력
			if (opt.item.labelVisible && item.visible) {
				ctx.fillStyle = opt.item.groupMerging ? "#fff" :  "#000";
				pt.x = opt.item.groupMerging ? area.c : area.x - gapTxt;
				pt.y = area.m;
				
				// 항목 라벨 회전
				if (opt.item.labelRotate == "vertical") {
					ctx.save();
					ctx.translate(pt.x, pt.y);
					ctx.rotate(-(Math.PI / 2));
					ctx.translate(-pt.x, -pt.y);
					ctx.textAlign = opt.item.groupMerging ? "center" : "right";
					ctx.textBaseline = "middle";
					ctx.fillText(item.name, pt.x, pt.y);
					ctx.restore();
				} else {
					ctx.textAlign = opt.item.groupMerging ? "center" : "right";
					ctx.textBaseline = "middle";
					ctx.fillText(item.name, pt.x, pt.y);
				}
			}
			
			// 항목 값 출력
			if (!opt.item.groupMerging && opt.item.valueVisible) {
				pt.x = opt.item.valuePosition === "in" ? area.r - valueGap : area.r + valueGap;
				pt.y = area.m + 1;
				ctx.fillStyle = opt.item.valuePosition === "in" ? "#fff" : item.color;
				ctx.textAlign = opt.item.valuePosition === "in" ? "right" : "left";
				ctx.textBaseline = "middle";
				ctx.fillText(item.value, pt.x, pt.y); 
			}
		} //:~ updateBar method
	} //:~ class BarHorizonChart
	
	Tsart.charts.set("bar-horizon", function (rg, st, d) {       		
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
					lineColor: "#aaa",
					// x 축 간격
					step: 10,
					// 값
					maxValue: Number.MAX_VALUE,
					// 위치: 'bottom'|'top'
					position: "bottom"
				},
				y: {
					// y 축 이름
					name: "",
					font: "normal 11px 'Arial'",
					fontColor: "#000",
					marginTop: 50,
					marginBottom: 50,
					lineColor: "#aaa"
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
				// 값 출력 위치: out | in
				valuePosition: "out",
				// 그룹 병합
				groupMerging: false
			}
		}, st);

		const chart = new BarHorizonChart(rg, st, d);
		chart.update();
		return chart;
	});
})();
