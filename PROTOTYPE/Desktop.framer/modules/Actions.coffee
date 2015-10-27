exports.attachStates = (Layer,Properties = {On: {opacity: 1},Off: {opacity: 0}})->
	for state,properties of Properties
		Layer.states.add(state, properties)

exports.Toggle = (Layer, States = ["On","Off"]) ->
	Layer.states.switch if Layer.states.current isnt States[0] then States[0] else States[1]


exports.getLayer = (parentLayer,Path) ->
	layer = parentLayer
	layer = layer.subLayersByName(group)[0] for group in Path
	return layer

exports.setViews = (layers,Layers) ->
	for layer in layers
		[Layer, View] = layer.name.split("_")
		if Layer is "View"
			layer.on Events.Click,->
				[Layer, View] = @name.split("_")
				Layers[View].superLayer.superLayer.bringToFront()
		setViews layer.subLayers, Layers