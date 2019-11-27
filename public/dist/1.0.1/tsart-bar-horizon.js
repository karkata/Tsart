!function(){class t{constructor(t,i){this.name=t,this.items=[],this.color=i}get size(){return this.items.length}addItem(t){if(!(t instanceof i))throw Error("The item must be a instance of ItemElement");this.items.push(t)}}class i{constructor(t,i){this.index=t,this.name=i.name,this.value=i.value,this.group=i.group||"",this.color=i.color||"#0040ff",this.nameVisible=!1!==i.nameVisible}}class e{constructor(t,i,e){this.ct=t.ct,this.doc=t.doc,this.cv=t.cv,this.options=i,this.data=e||[],this.groups=new Map,this.minv=Number.MAX_VALUE,this.maxv=Number.MIN_VALUE,this.maxt=0,this.maxn="",this.maxg="",this.calculateAll()}calculateAll(){for(let t=0;t<this.data.length;t++)this.addItem(this.data[t])}calculateOne(t){this.minv>t.value&&(this.minv=t.value),this.maxv<t.value&&(this.maxv=t.value),this.maxn.length<t.name.length&&(this.maxn=t.name),this.maxg.length<t.group.length&&(this.maxg=t.group),this.maxt=Math.min(Tsart.Util.getMaxAxisValue(this.maxv),this.options.axis.x.maxValue)}clearItems(){this.data=[],this.groups=new Map,this.minv=Number.MAX_VALUE,this.maxv=Number.MIN_VALUE,this.maxt=0,this.maxn="",this.maxg=""}addItem(e){let o=null;void 0===e.group&&(e.group=""),this.groups.has(e.group)?o=this.groups.get(e.group):(o=new t(e.group,e.color),this.groups.set(e.group,o));let l=new i(o.size,e);o.addItem(l),this.calculateOne(l)}update(){this.updateHeader(),this.updateLeft(),this.updateRight(),this.updateFooter(),this.updateClient()}updateHeader(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),o=Tsart.Util.toPixel("50%",this.cv.width),l=Tsart.Util.toPixel("50%",e);i.clearRect(0,0,this.cv.width,e),t.title.content&&(i.fillStyle=t.title.fontColor,i.font=t.title.font,i.textAlign="center",i.textBaseline="middle",i.fillText(t.title.content,o,l))}updateLeft(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),o=Tsart.Util.toPixel(t.regions.left.w,this.cv.width),l=this.cv.height-e-Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(0,e,o,l),t.category.visible&&"left"===t.category.position&&this.updateCategory(i,Tsart.Util.toDim(0,e,o,l),t,this.groups,this.data)}updateRight(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.right.w,this.cv.width),o=this.cv.width-e,l=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),s=this.cv.height-l-Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(o,l,e,s),t.category.visible&&"right"===t.category.position&&this.updateCategory(i,Tsart.Util.toDim(o,l,e,s),t,this.groups,this.data)}updateCategory(t,i,e,o,l){const s="group"===e.category.target?o.size:l.length,a=Math.min(i.h/s,20),r=parseInt(i.h/2-s*a/2,10);if(t.font=e.category.font,t.textAlign="start",t.textBaseline="middle","group"===e.category.target){let l=0;for(let s of o.values())t.fillStyle=s.color,t.fillRect(i.x+10,i.y+r+a*l,20,.8*a),t.fillStyle=e.category.fontColor,t.fillText(s.name,i.x+34,i.y+r+a*l+.4*a),l++}else for(let o=0,s=null;o<l.length;o++)s=l[o],t.fillStyle=s.color,t.fillRect(i.x+10,i.y+r+a*o,20,.8*a),t.fillStyle=e.category.fontColor,t.fillText(s.name,i.x+34,i.y+r+a*o+.4*a)}updateFooter(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(0,this.cv.height-e,this.cv.width,e)}updateClient(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.left.w,this.cv.width),o=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),l=this.cv.width-e-Tsart.Util.toPixel(t.regions.right.w,this.cv.width),s=this.cv.height-o-Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(e,o,l,s);const a=Tsart.Util.toDim(e+t.axis.x.marginLeft,o+t.axis.y.marginTop,l-t.axis.x.marginLeft-t.axis.x.marginRight,s-t.axis.y.marginTop-t.axis.y.marginBottom);this.updateGrid(i,a,t);const r=a.h/this.groups.size;let n=0,h=0,g=0,x=0,m=0,c=0,f=0,u=0,p=null;for(let e of this.groups.values()){!0===t.item.groupMerging&&e.items.sort((t,i)=>t.value===i.value?0:t.value-i.value<0?-1:1),h=a.y+n*r+r/2,g=r*t.item.groupGapRatio/(t.item.groupMerging?1:e.items.length),x=h-r*t.item.groupGapRatio/2,m=t.item.groupMerging?g:g*t.item.gapRatio;for(let o=0,l=null;o<e.items.length;o++)l=e.items[o],0===o&&(u=a.x),c=x+(t.item.groupMerging?0:o*g)+g/2,f=parseInt(a.x+l.value*a.w/this.maxt,10),p=Tsart.Util.toDim(u,c-m/2,f-u,m),u=t.item.groupMerging?f:u,this.updateBar(i,p,l,o,t);n++}}updateGrid(t,i,e){const o={x:0,y:0},l=Tsart.Util.toSegment(i.l,"bottom"===e.axis.x.position?i.b:i.t,i.r,"bottom"===e.axis.x.position?i.b:i.t),s=Tsart.Util.toSegment(i.l,i.t,i.l,i.b);t.lineWidth=1,t.strokeStyle=e.axis.x.lineColor,t.beginPath(),t.moveTo(l.x1,l.y1),t.lineTo(l.x2,l.y2),t.stroke(),e.axis.x.name&&(o.x=l.x2+10,o.y=l.y2,t.font=e.axis.x.font,t.fillStyle=e.axis.x.fontColor,t.textAlign="left",t.textBaseline="top",t.fillText(e.axis.x.name,o.x,o.y));let a=e.axis.x.step,r="";for(let s=0;s<a;s++)o.x=l.x1+l.w/a*(s+1),o.y=l.y1,t.strokeStyle=e.axis.color,t.beginPath(),t.moveTo(o.x+.5,o.y+.5),t.lineTo(o.x+.5,o.y+("bottom"===e.axis.x.position?5:-5)+.5),t.stroke(),r=""+this.maxt/a*(s+1),o.y="bottom"===e.axis.x.position?o.y+10:o.y-10,t.font=e.axis.y.font,t.fillStyle=e.axis.x.fontColor,t.textAlign="center",t.textBaseline="bottom"===e.axis.x.position?"top":"bottom",t.fillText(r,o.x,o.y),e.axis.grid.visible&&(t.strokeStyle=e.axis.grid.lineColor,t.beginPath(),t.moveTo(o.x+.5,i.t+.5),t.lineTo(o.x+.5,i.b+.5),t.stroke());t.strokeStyle=e.axis.y.lineColor,t.beginPath(),t.moveTo(s.x1,s.y1),t.lineTo(s.x2,s.y2),t.stroke(),e.axis.y.name&&(o.x=s.x1,o.y="bottom"===e.axis.x.position?s.y1-10:s.y2+10,t.font=e.axis.y.font,t.fillStyle=e.axis.y.fontColor,t.textAlign="center",t.textBaseline="bottom"===e.axis.x.position?"bottom":"top",t.fillText(e.axis.y.name,o.x,o.y))}updateBar(t,i,e,o,l){const s={x:0,y:0};t.fillStyle=e.color,t.fillRect(i.x,i.y,i.w,i.h),l.item.groupMerging&&0===o&&(s.x=i.x-10,s.y=i.m,t.fillStyle="#000",t.textAlign="right",t.textBaseline="middle",t.fillText(e.group,s.x,s.y)),l.item.labelVisible&&e.nameVisible&&(t.fillStyle=l.item.groupMerging?"#fff":"#000",s.x=l.item.groupMerging?i.c:i.x-10,s.y=i.m,"vertical"==l.item.labelRotate?(t.save(),t.translate(s.x,s.y),t.rotate(-Math.PI/2),t.translate(-s.x,-s.y),t.textAlign=l.item.groupMerging?"center":"right",t.textBaseline="middle",t.fillText(e.name,s.x,s.y),t.restore()):(t.textAlign=l.item.groupMerging?"center":"right",t.textBaseline="middle",t.fillText(e.name,s.x,s.y))),!l.item.groupMerging&&l.item.valueVisible&&(s.x="in"===l.item.valuePosition?i.r-5:i.r+5,s.y=i.m+1,t.fillStyle="in"===l.item.valuePosition?"#fff":e.color,t.textAlign="in"===l.item.valuePosition?"right":"left",t.textBaseline="middle",t.fillText(e.value,s.x,s.y))}}Tsart.charts.set("bar-horizon",(function(t,i,o){i=Tsart.Util.extend({title:{content:"",font:"bold 32px 'Arial'",fontColor:"#999999"},regions:{header:{h:"0",bkcolor:"#fff"},left:{w:"0",bkcolor:"#fff"},right:{w:"0",bkcolor:"#fff"},footer:{h:"0",bkcolor:"#fff"},client:{bkcolor:"#fff"}},category:{visible:!1,target:"item",position:"left",font:"normal 11px 'Arial'",fontColor:"#000"},axis:{x:{name:"",font:"normal 11px 'Arial'",fontColor:"#000",marginLeft:50,marginRight:50,lineColor:"#aaa",step:10,maxValue:Number.MAX_VALUE,position:"bottom"},y:{name:"",font:"normal 11px 'Arial'",fontColor:"#000",marginTop:50,marginBottom:50,lineColor:"#aaa"},grid:{lineColor:"#ddd",visible:!0}},item:{groupGapRatio:.8,gapRatio:.8,labelVisible:!0,labelRotate:"horizon",valueVisible:!1,valuePosition:"out",groupMerging:!1}},i);const l=new e(t,i,o);return l.update(),l}))}();