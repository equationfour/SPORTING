# This imports all the layers for "Design" into designLayers
Layers = Framer.Importer.load "imported/Design"

# This imports all the layers for "Books" into booksLayers


# Remove framer cursor
document.body.style.cursor = "auto"

Framer.Defaults.Animation = {
	curve: "ease-in-out"
	time: 0.55
}

# ------------------------------- MODULES

actions = require "Actions"
flex = require "Flex"
response = require "Response"

# scrollScreen.content.height = 3500
#            scroll     conteiner   layers

setViews = (layers,Layers) ->
	for layer in layers
		[Layer, View] = layer.name.split("_")
		if Layer is "View"
			layer.on Events.MouseOver,->
				@style.cursor = "pointer"
			layer.on Events.Click,->
				[Layer, View] = @name.split("_")
				Layers[View].superLayer.superLayer.bringToFront()
# 				Layers.subLayersByName(View)[0].superLayer.superLayer.bringToFront()
		setViews layer.subLayers, Layers

# Layer_Xposition_Yposition_ScrollPosition_Distribution
#         left      top        fixed         distribute
#         right     bottom                   inline
#         full      full                     column
#         middle                                          

response.Make Layers

scrollCreateGame = new ScrollComponent
	scrollHorizontal: false
	backgroundColor: "white"
# 	scrollVertical: false

flex.Make scrollCreateGame, Screen, Layers.CreateGame

setViews Layers.CreateGame.subLayers, Layers
