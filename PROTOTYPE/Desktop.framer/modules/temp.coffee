
 
Arrange = (sublayer, fixed = []) ->
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
	switch (sublayer.name.split "_")[3]
		when "fixed"
			sublayer.originY = sublayer.y
			sublayer.bringToFront()
			fixed.push sublayer
	if sublayer.subLayers.length>0 
		for ssublayer in sublayer.subLayers 
				Arrange	ssublayer, fixed		

Parse = (Scroll, Frame, Artboard) ->
	Groups = {}
	Groups[l.name]=l for l in Artboard.subLayers
	Scroll.frame = Frame
	Fixed = []
	Artboard.superLayer = Scroll.content
	Artboard.frame = Frame
	for key,layer of Groups	
		Arrange	layer, Fixed
		

	Scroll.content.on "change:y",->
		f.y = f.originY - @y for f in Fixed
	return Artboard


Flex = ( Scroll,  Frame, Artboard) ->
	Fluid.on "change:size",->
		Parse Scroll,Screen.frame, Artboard


Make = (Scroll, Frame,Artboard )->
	Parse Scroll, Screen.frame, Artboard
	Flex Scroll, Screen.frame, Artboard
		
