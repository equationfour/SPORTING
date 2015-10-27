exports.Parse = (Groups) ->
	Layers = {Full: [], Center: [], Left:[], Right: []}
	for key,layers of Layers
		for Group in Groups.subLayersByName key
			for layer in Group.subLayers	
				layers.push layer
	return Layers

exports.Arrange = (Layers) ->
	for key,layers of Layers
		switch key
			when "Full"
				for flayer in layers
					flayer.superLayer.width = Screen.width
					flayer.width = flayer.superLayer.width 
					flayer.superLayer.x = 0
					flayer.x = 0
			when "Center"
				for flayer in layers
					flayer.superLayer.x = 0
					flayer.superLayer.width = Screen.width
					flayer.centerX().pixelAlign()
			when "Half"
				for flayer in layers
					flayer.superLayer.width = Screen.width*.5
					flayer.width = flayer.superLayer.width 
					flayer.superLayer.x = 0
					flayer.x = 0	
			when "Right"	
				for flayer in layers
					flayer.superLayer.x = Screen.width - flayer.superLayer.width
			when "Left"	
				for flayer in layers
					flayer.superLayer.x = 0