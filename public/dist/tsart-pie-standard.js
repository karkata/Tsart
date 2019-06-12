!function(){"use strict";class t{constructor(t,i){this.index=t,this.name=i.name,this.value=i.value||0,this.highlight=!0===i.highlight,this.visible=!1!==i.visible}}const i=["#d32f2f","#ff4081","#7b1fa2","#7cfdff","#303f9f","#449aff","#0288d1","#00bcd4","#00796b","#4caf50","#689f38","#cddc39","#fbc02d","#ffeb3b","#f57c00","#ff5722","#5d4037","#9e9e9e","#455a64","#9e9e9e"];class e{constructor(t,i,e){this.ct=t.ct,this.doc=t.doc,this.cv=t.cv,this.options=i,this.minv=Number.MAX_VALUE,this.maxv=Number.MIN_VALUE,this.maxt=0,this.items=[],this.indexItem=0,this.indexColor=0,e=e||[];for(let t=0;t<e.length;t++)this.addItem(e[t])}clear(){this.minv=Number.MAX_VALUE,this.maxv=Number.MIN_VALUE,this.maxt=0,this.items=[],this.indexItem=0,this.indexColor=0}calculateOne(t){this.minv>t.value&&(this.minv=t.value),this.maxv<t.value&&(this.maxv=t.value),this.maxt+=t.value}getPreservedColor(t){return!0===t&&(this.indexColor=0),this.indexColor===i.length&&(this.indexColor=0),i[this.indexColor++]}convertPolar2Cartesian(t,i){return{x:Math.cos(t)*i,y:Math.sin(t)*i}}addItem(i){let e=new t(this.items.length,i);e.color=e.color||this.getPreservedColor(!1),this.items.push(e),this.calculateOne(e)}update(){this.updateHeader(),this.updateLeft(),this.updateRight(),this.updateFooter(),this.updateClient()}updateHeader(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),o=Tsart.Util.toPixel("50%",this.cv.width),l=Tsart.Util.toPixel("50%",e);i.clearRect(0,0,this.cv.width,e),t.title.content&&(i.fillStyle=t.title.fontColor,i.font=t.title.font,i.textAlign="center",i.textBaseline="middle",i.fillText(t.title.content,o,l))}updateLeft(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),o=Tsart.Util.toPixel(t.regions.left.w,this.cv.width),l=this.cv.height-e-Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(0,e,o,l),t.category.visible&&"left"===t.category.position&&this.updateCategory(i,Tsart.Util.toDim(0,e,o,l),t,this.items)}updateRight(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.right.w,this.cv.width),o=this.cv.width-e,l=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),s=this.cv.height-l-Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(o,l,e,s),t.category.visible&&"right"===t.category.position&&this.updateCategory(i,Tsart.Util.toDim(o,l,e,s),t,this.items)}updateCategory(t,i,e,o){let l=Math.min(i.h/o.length,20),s=parseInt(i.h/2-o.length*l/2,10);t.font=e.category.font,t.textAlign="start",t.textBaseline="middle";let h=0;for(let a of o)t.fillStyle=a.color,t.fillRect(i.x+10,i.y+s+l*h,20,.8*l),t.fillStyle=e.category.fontColor,t.fillText(a.name,i.x+34,i.y+s+l*h+.4*l),h++}updateFooter(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(0,this.cv.height-e,this.cv.width,e)}updateClient(){const t=this.options,i=this.cv.getContext("2d"),e=Tsart.Util.toPixel(t.regions.left.w,this.cv.width),o=Tsart.Util.toPixel(t.regions.header.h,this.cv.height),l=this.cv.width-e-Tsart.Util.toPixel(t.regions.right.w,this.cv.width),s=this.cv.height-o-Tsart.Util.toPixel(t.regions.footer.h,this.cv.height);i.clearRect(e,o,l,s),i.fillStyle=t.regions.client.bkcolor,i.fillRect(e,o,l,s);const h=Tsart.Util.toDim(e+t.pie.marginLeft,o+t.pie.marginTop,l-t.pie.marginLeft-t.pie.marginRight,s-t.pie.marginTop-t.pie.marginBottom),a=h.c,r=h.m,n=Tsart.Util.toPixel(t.pie.pieRadius,parseInt(Math.min(h.w,h.h)/2,10)),c=Tsart.Util.toPixel(t.pie.holeRadius,n);let g=0,f=0,d=-Math.PI/2,m=null;for(let e of this.items){if(f=d+Tsart.Util.toRadian(e.value/this.maxt*360),g=e.highlight?n+t.pie.highlightDistance:n,i.fillStyle=e.color,i.beginPath(),i.moveTo(a+.5,r+.5),i.arc(a+.5,r+.5,g,d,f,!1),i.closePath(),i.fill(),t.pie.gapWidth>0&&(i.lineWidth=t.pie.gapWidth,i.strokeStyle=t.regions.client.bkcolor,i.lineWidth=t.pie.gapWidth,i.lineCap="round",i.lineJoin="round",i.stroke()),e.visible){let o="";t.item.labelVisible&&t.item.valueVisible?o=e.name+"("+e.value+")":t.item.labelVisible?o=e.name:t.item.valueVisible&&(o=""+e.value),o&&("over"===t.item.textDisplayType?((m=this.convertPolar2Cartesian((f+d)/2,(g+c)/2)).x=m.x+a+.5,m.y=m.y+r+.5,i.textAlign="center",i.textBaseline="middle"):"note"===t.item.textDisplayType&&((m=this.convertPolar2Cartesian((f+d)/2,g+20)).x=m.x+a+.5,m.y=m.y+r+.5,i.strokeStyle=e.color,i.lineWidth=1.5,i.beginPath(),i.moveTo(a+.5,r+.5),i.lineTo(m.x,m.y),i.stroke(),i.textAlign=m.x<a?"right":m.x==a?"center":"left",i.textBaseline=m.y<r?"bottom":m.y==r?"middle":"top"),i.font=t.item.font,i.fillStyle=t.item.fontColor,i.fillText(o,m.x,m.y))}d=f}c&&(i.fillStyle=t.regions.client.bkcolor,i.beginPath(),i.moveTo(a+.5,r+.5),i.arc(a+.5,r+.5,c,0,2*Math.PI,!1),i.closePath(),i.fill())}}Tsart.charts.set("pie-standard",function(t,i,o){i=Tsart.Util.extend({title:{content:"",font:"bold 32px 'Arial'",fontColor:"#999999"},regions:{header:{h:"0",bkcolor:"#fff"},left:{w:"0",bkcolor:"#fff"},right:{w:"0",bkcolor:"#fff"},footer:{h:"0",bkcolor:"#fff"},client:{bkcolor:"#fff"}},category:{visible:!1,position:"left",font:"normal 11px 'Arial'",fontColor:"#000"},pie:{marginLeft:50,marginRight:50,marginTop:50,marginBottom:50,gapWidth:0,highlightDistance:20,pieRadius:"100%",holeRadius:0},item:{font:"normal 11px 'Arial'",fontColor:"#000",textDisplayType:"note",labelVisible:!0,valueVisible:!0}},i);const l=new e(t,i,o);return l.update(),l})}();