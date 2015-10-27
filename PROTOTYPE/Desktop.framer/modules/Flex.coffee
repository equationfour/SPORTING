exports.Fluid = new Layer
	backgroundColor: "transparent"
exports.Fluid.fluid
	autoWidth: true
	autoHeight: true


exports.Arrange = (sublayer, fixed = []) ->
	switch (sublayer.name.split "_")[1]
		when "full"
			sublayer.width = sublayer.superLayer.width
			sublayer.x = 0
		when "center"
			sublayer.centerX()
			sublayer.pixelAlign()
		when "right"
			sublayer.x = sublayer.superLayer.width - sublayer.width
			sublayer.pixelAlign()	
		when "left"
			sublayer.x = 0
			sublayer.pixelAlign()
		when "middle"	
			left = s for s in sublayer.siblingLayers when (s.name.split "_")[1] is "left"
			right = s for s in sublayer.siblingLayers when (s.name.split "_")[1] is "right"
			if left? && right?
				right.x = right.superLayer.width - right.width
				right.pixelAlign()
				left.x = 0
				left.pixelAlign()
				sublayer.x = left.width
				sublayer.width = right.x - left.width
		
	switch (sublayer.name.split "_")[2]
		when "bottom"
			sublayer.y = sublayer.superLayer.height - sublayer.height
		when "top"
			sublayer.y = 0
		when "full"
			sublayer.height = sublayer.superLayer.height
			sublayer.y = 0		
	switch (sublayer.name.split "_")[3]
		when "fixed"
			sublayer.originY = sublayer.y
			sublayer.bringToFront()
			fixed.push sublayer
	switch (sublayer.name.split "_")[4]
		when "distribute"
			exports.Distribute sublayer	
		when "inline"
			exports.Inline sublayer
		when "column"
			exports.Column sublayer	
			
	if sublayer.subLayers.length>0 
		for ssublayer in sublayer.subLayers 
				exports.Arrange	ssublayer, fixed		

exports.Parse = (Scroll, Container, Artboard) ->
	Artboard.visible = true
	Frame = Container.frame
	Groups = {}
	Groups[l.name]=l for l in Artboard.subLayers
	Scroll.frame = Frame
	Scroll.superLayer = if Container.id isnt 1 then Container
	Scroll.x = 0
	Scroll.y = 0
	Fixed = []
	Artboard.superLayer = Scroll.content
	Artboard.x = 0
	Artboard.y = 0
	Artboard.width = Frame.width
	for key,layer of Groups
		exports.Arrange	layer, Fixed

	Scroll.content.on "change:y",->
		f.y = f.originY - @y for f in Fixed



exports.Flex = ( Scroll,  Container, Artboard) ->
	exports.Fluid.on "change:size",->
		exports.Parse Scroll,Container, Artboard


exports.Make = (Scroll, Container, Artboard)->
	exports.Parse Scroll, Container, Artboard
	exports.Flex Scroll, Container, Artboard

exports.Column = (Container) ->
	Container.subLayers[0].y = 0
	Block.y = Container.subLayers[i-1].y + Container.subLayers[i-1].height for Block,i in Container.subLayers when i>0
	Container.pixelAlign()

exports.Inline = (Container) ->
	Container.width = Container.superLayer.width
	Container.x = 0
	Width = Container.width/Container.subLayers.length
	Height = Container.subLayers[0].height
	H = 0
	if Width < Container.subLayers[0].width then Width = Container.subLayers[0].width
	COLS = Math.floor(Container.width/Width)
	Container.x = (Width -  Container.subLayers[0].width)*.5
	COLS = if COLS > -1 then COLS else 0
	Width = Container.width/COLS
	jx = 0
	jy = -1
	for sublayer,i in Container.subLayers
		if jx<COLS
			jx = jx
		else
			jx = 0
			
		jk = if jx is 0 then jy++
		sublayer.y = jy*Height
		sublayer.x = jx*Width
		jx++
		sublayer.pixelAlign()
	
	Container.height = (jy+1)*Height
		

	
exports.Distribute = (Container) ->
	Container.width = Container.superLayer.width
	Container.x = 0
	for sublayer,i in Container.subLayers
		virtual = new Layer
			superLayer: Container
			width: Container.width/Container.subLayers.length
			backgroundColor: "transparent"
		virtual.x = i*virtual.width
		sublayer.superLayer = virtual
		sublayer.centerX()	
		sublayer.pixelAlign()
		X = sublayer.x+virtual.x
		sublayer.superLayer = Container
		sublayer.x = X
		virtual.destroy()
		