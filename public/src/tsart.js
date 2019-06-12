;;const Tsart = (function () {
	"use strict";

	return {
		Color: class {
			static parseColor(value) {
				let r, g, b;
				value = value.replace("#", "");
				if (value.length == 3) {
					r = parseInt(value[0] + value[0], 16);
					g = parseInt(value[1] + value[1], 16);
					b = parseInt(value[2] + value[2], 16);
				} else {
					r = parseInt(value[0] + value[1], 16);
					g = parseInt(value[2] + value[3], 16);
					b = parseInt(value[4] + value[5], 16);
				}
				return new Tsart.Color(r, g, b);
			} //:~ static parseColor function 

			constructor(r, g, b, a) {
				this.r = r;
				this.g = g;
				this.b = b;
				this.a = a || 0x01;
			} //:~ contstructor
		
			/**
			 * (public void)
			 * Whether the color is more lighten or darken relative to amount.
			 * @param amount -1.0 ~ 1.0 
			 * @return this object
			 */
			brighten(amount) {
				if (amount >= 0) {
					this.r = Math.min(255, parseInt((255 - this.r) * amount + this.r, 10));
					this.g = Math.min(255, parseInt((255 - this.g) * amount + this.g, 10));
					this.b = Math.min(255, parseInt((255 - this.b) * amount + this.b, 10));
				} else {
					this.r = Math.max(0, parseInt(this.r * amount + this.r, 10));
					this.g = Math.max(0, parseInt(this.g * amount + this.g, 10));
					this.b = Math.max(0, parseInt(this.b * amount + this.b, 10));
				}
				return this;
			} //:~ brighten method

			setAlpha(a) {
				this.a = a < 0 ? 0 : (a > 1 ? 1 : a);
				return this;
			} //:~ setAlpha method

			toHexString(useCharp) {
				return (useCharp === true ? "#" : "") + (this.r & 0xff).toString(16) + (this.g & 0xff).toString(16) + (this.b & 0xff).toString(16);
			} //:~ toHexString method

			toRgbaString() {
				return "rgba(" + (this.r & 0xff) + "," + (this.g & 0xff) + "," + (this.b & 0xff) + "," + this.a + ")";
			} //:~ toRgbaString method
		}, //:~ Tsart.Color class

		Util: class {
			static getElement(target) {
				if (typeof target === "string") return document.querySelector(target);
				else return target;
			} //:~ getElement static method

			static getElementSize(element) {
				if (!element) throw Error("The element is undefined");
				if (element.nodeType != Node.ELEMENT_NODE) return { w:0, h:0 };
				else {
					let style = window.getComputedStyle(element);
					return { 
						//w: element.offsetWidth, 
						//h: element.offsetHeight 
						w: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
						h: element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
					};
				}
			} //:~ getSize static method

			static def(p) { return typeof p != "undefined"; }
			static undef(p) { return typeof p === "undefined"; }

			static extend(left, right) {
				function traverse(s1, s2) {
					if (!s1 || !s2) return;
					let t1 = "", t2 = "";
					for (let name in s1) {
						t1 = typeof s1[name];
						t2 = typeof s2[name];
						if (t1 === "undefined" || t2 === "undefined") continue;
						else if (t1 === "function") continue;
						else if ((t1 === "string" || t1 === "number" || t1 === "boolean") && (t2 === "string" || t2 === "number" || t2 === "boolean")) s1[name] = s2[name];
						else if (t1 != t2) continue;
						else traverse(s1[name], s2[name]);
					}
				}

				traverse(left, right);

				return left;
			}

			static toPixel(value, base) {
				let num = parseInt(value, 10);
				if (num === 0) return 0;
				else if (typeof value === "string" && value.indexOf("%") != -1) return parseInt(base * num / 100, 10);
				else return num;
			} //:~ static toPixel function 

			static toPixelString(value) {
				if (typeof value === "number") return value + "px";
				else if (typeof value === "string" && value.indexOf("px") >= 0) return value;
				else if (typeof value === "string") return value + "px";
				else return parseInt(value, 10) + "px";
			} //:~ static toPixelString function

			static addp(...p) {
				let total = 0;
				for (let i = 0, len = p.length; i < len; i++) {
					total += parseFloat(p[i]);
				}
				return `${total}%`;
			}

			static subp(...p) {
				let remainder = p[0];
				for (let i = 1, len = p.length; i < len; i++) {
					remainder -= parseFloat(p[i]);
				}
				return `${remainder}%`;
			}

			static multiply(a, b) {
				let pc = false;
				if (isNaN(a)) {
					a = parseFloat(a);
					pc = true;
				}
				a = a * b;
				return pc == true ? `${a}%` : a;
			}

			static getMaxAxisValue(v) {
				if (v > Number.MAX_SAFE_INTEGER) throw new Error(`The parameter value(${v}) is exceed`);
				let ceiled = Math.ceil(v);
				let d = 10;
				while (Math.floor(ceiled / d) > 0) { d *= 10; }
				let max = d;
				if (max > Number.MAX_SAFE_INTEGER || max === Infinity) throw new Error(`The max value(${v}) is exceed`);
				while ((max / 2) > ceiled) {
					max /= 2;
				}
				return max;
			}

			static createPadding(pl, pt, pr, pb) {
				return { l: pl, t: pt, r: pr, b: pb,
					clear: function () { this.l = this.t = this.r = this.b = 0; }
				};
			}

			static createBound(pl, pt, pr, pb) {
				return { l: pl, t: pt, r: pr, b: pb,
					get w() { return this.r - this.l; },
					get h() { return this.b - this.t; },
					clear: function () { this.l = this.t = this.r = this.b = 0; }
				};
			}
			
			static toSegment(px1, py1, px2, py2) {
				return { x1: px1, y1: py1, x2: px2, y2: py2,
					get w() { return this.x2 - this.x1; },
					get h() { return this.y2 - this.y1; },
					clear: function () { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
				};
			}

			static toSize(pw, ph) {
				if (TextMetrics && pw instanceof TextMetrics) return {
					metric: pw,
					get w() { return this.metric.width; },
					get h() { return this.metric.height; }
				};
				else return { w: pw, h: ph };
			}

			static toDim(px, py, pw, ph) {
				return { x: px, y: py, w: pw, h: ph,
					get c() { return this.x + parseInt(this.w / 2, 10); },
					get m() { return this.y + parseInt(this.h / 2, 10); },
					get l() { return this.x; },
					get r() { return this.x + this.w; },
					get t() { return this.y; },
					get b() { return this.y + this.h; },
					clear() { this.x = this.y = this.w = this.h = 0; } 
				};
			}
			
			static getTextHeight(doc, font, predictableHeight) {
				const cv = doc.createElement("canvas");
				cv.setAttribute("width", "100");
				cv.setAttribute("height", predictableHeight);
				doc.appendChild(cv);
				const w = cv.width;
				const h = cv.height;
				const ctx = cv.getContext("2d");
				ctx.font = font;
				ctx.textAlign ="left";
				ctx.textBaseline = "top";
				ctx.fillText("fißgPauljMPÜÖÄ", 25, 5);
				const data = ctx.getImageDate(0, 0, w, h).data;
				doc.removeChild(cv);
				let firstY = -1, lastY = -1;
				let alpha = -1;
				for (let y = 0; y < h; y++) {
					for (let x = 0; x < w; x++) {
						// red = data[((w * y) +x) * 4];
						// green = data[((w * y) +x) * 4 + 1];
						// blue = data[((w * y) +x) * 4 + 2];
						alpha = data[((w * y) + x) * 4 + 3];

						if (alpha > 0) {
							firstY = y;
							break;
						}
					}
					if (firstY >= 0) {
						break;
					}
				}
				for (let y = h; y > 0; y--) {
					for (let x = 0; x < w; x++) {
						alpha = data[((w * y) + x) * 4 + 3];
						if (alpha > 0) {
							lastY = y;
							break;
						}
					}
					if (lastY >= 0) {
						break;
					}
				}
				return { height: lastY - firstY, firstPixel: firstY, lastPixel: lastY };
			} //:~ getTextHeight static method

			static toRadian(degree) {
				return degree * Math.PI / 180;
			} //:~ toRadian static method

		}, // :~ class Tsart.Util 

		CanvasRegionInfo: class {
			static create(doc, container, width, height) {
				const cv = doc.createElement("canvas");	
				cv.setAttribute("width", parseInt(width, 10));
				cv.setAttribute("height", parseInt(height, 10));
				container.appendChild(cv);
				return new Tsart.CanvasRegionInfo(doc, container, cv);
			} //:~ createCanvas method

			constructor(doc, ct, cv) {
				this.doc = doc;
				this.ct = ct;
				this.cv = cv;
			} //:~ constructor
		}, //:~ Tsart.CanvaRegionInfo class

		charts: new Map(),
			
		draw: function (container, kind, style, data) {
				
			if (!Tsart.charts.has(kind)) throw new Error(`Tsart has no chart drawer such as "${kind}".`);

			const drawFunction = Tsart.charts.get(kind);
			
			if (container instanceof String) {
				container = document.querySelector(DVC.refineId(container, true));
				if (!container) throw new Error("Container does not exist.");
			}

			// container의 크기를 얻어 채워야 한다.
			let temp = container;
			container = Tsart.Util.getElement(temp);
			if (!container) throw Error("Fail to get the container(" + temp + ")"); 
			const size = Tsart.Util.getElementSize(container);
			// CanvasRegionInfo 객체를 생성하여 설정한다.
			const region = Tsart.CanvasRegionInfo.create(container.ownerDocument, container, size.w, size.h);

			return drawFunction(region, style, data);
		} // :~ draw method
	};
})();
