(function(){var t;Layer.prototype.fluid=function(t){return null==t&&(t={}),Framer.Fluid.register(this,t)},Layer.prototype["static"]=function(){return Framer.Fluid.unregister(this)},Layer.prototype.fix=function(){return Framer.Fluid.fix(this)},Layer.prototype.unfix=function(){return Framer.Fluid.unfix(this)},t=function(){function t(){var t;t=this,window.onresize=function(t){return function(e){return t._respond()}}(this)}var e;return e=[],t.prototype.register=function(t,e){return null==e&&(e={}),this._addLayer(t,e)},t.prototype.unregister=function(t){return this._removeLayer(t)},t.prototype.fix=function(t){return t.style={position:"fixed"},t},t.prototype.unfix=function(t){return t.style={position:"absolute"},t},t.prototype.layers=function(){return e},t.prototype._respond=function(){var t;return t=this,_.each(e,function(e,r){return t._refreshLayer(e)})},t.prototype._refreshLayer=function(t){var e,r,n,i,o;switch(e=t.targetLayer,null!=t.autoWidth&&(n=null!=t.widthOffset?this._parentWidth(e)+t.widthOffset:this._parentWidth(e),e.width=n,e.style={backgroundPosition:"center"}),null!=t.autoHeight&&(r=null!=t.heightOffset?this._parentHeight(e)+t.heightOffset:this._parentHeight(e),e.height=r,e.style={backgroundPosition:"center"}),t.xAlign){case"left":e.x=this._xWithOffset(t,0);break;case"right":i=this._parentWidth(e)-e.width,e.x=this._xWithOffset(t,i);break;case"center":e.centerX(),e.x=this._xWithOffset(t,e.x);break;case"middle":e.centerX(),e.x=this._xWithOffset(t,e.x)}switch(t.yAlign){case"bottom":return o=this._parentHeight(e)-e.height,e.y=this._yWithOffset(t,o);case"top":return e.y=this._yWithOffset(t,0);case"middle":return e.centerY(),e.y=this._yWithOffset(t,e.y);case"center":return e.centerY(),e.y=this._yWithOffset(t,e.y)}},t.prototype._xWithOffset=function(t,e){return e=null!=t.xOffset?e+t.xOffset:e},t.prototype._yWithOffset=function(t,e){return e=null!=t.yOffset?e+t.yOffset:e},t.prototype._parentWidth=function(t){return null!=t.superLayer?t.superLayer.width:window.innerWidth},t.prototype._parentHeight=function(t){return null!=t.superLayer?t.superLayer.height:window.innerHeight},t.prototype._addLayer=function(t,r){var n,i;return null==r&&(r={}),n=_.extend(r,{targetLayer:t}),e.push(n),i=this,Utils.domComplete(function(){return i._refreshLayer(n,i)}),t},t.prototype._removeLayer=function(t){var r;return r=_.findWhere(e,{targetLayer:t}),null==r?t:((null!=r.autoWidth||null!=r.autoHeight)&&(r.style={backgroundPosition:"initial"}),e=_.without(e,r),r)},t}(),Framer.Fluid=new t}).call(this);
//# sourceMappingURL=./fluid-framer.map