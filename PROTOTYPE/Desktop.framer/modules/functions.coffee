exports.Navigator = (Layer)->
	Selector = Layer.subLayersByName("Selector")[0]
	Selector.visible = false
	view.visible = false for view in Layer.subLayersByName("Views")[0].subLayers
	for controller in Layer.subLayersByName("Controllers")[0].subLayers
		Selector.states.add(controller.name,{x:controller.x + controller.superLayer.x, y:controller.y + controller.superLayer.y})
		controller.on Events.Click,->
			Selector.visible = true
			Selector.states.switchInstant this.name
			
			for view in  Layer.subLayersByName("Views")[0].subLayers
				if view.name is this.name
					view.visible = true
					view.opacity = 0
					show = new Animation({
						layer: view,
						properties: {opacity: 1}
					})
					show.start()
				else 
					view.visible = false		

exports.setTabActive = (Docker,tabName) ->
	if tabName?
		Docker.subLayersByName("Views")[0].subLayersByName(tabName)[0].states.switch "On"
		l.states.switch "On" for l in Docker.subLayersByName("Controllers")[0].subLayersByName(tabName)[0].subLayers
	else
		view.states.switch "Off" for view in Docker.subLayersByName("Views")[0].subLayers
		l.states.switch "Off"  for l in controller.subLayers for controller in  Docker.subLayersByName("Controllers")[0].subLayers


exports.Inspector = (Layer)->
	Labels = Layer.subLayersByName("Labels")[0]
	Labels.states.add
		On: {opacity: 1}
		Off: {opacity: 0}
	for view in Layer.subLayersByName("Views")[0].subLayers
		view.visible = false 
		ContentScroll = new ScrollComponent
			width: 240
			height: 840
			superLayer: view.subLayersByName("Back")[0]
		ContentScroll.scrollHorizontal = false
		content = view.subLayersByName("Content")[0]	
		content.superLayer = ContentScroll.content
		content.x=24
		content.y=48
		
		
	for controller in Layer.subLayersByName("Controllers")[0].subLayers
		back = controller.subLayersByName("Bckgr")[0]
		
		
		back.states.add
			On: {opacity: 1}
			Off: {opacity: 0}
		back.states.switch "Off"
		back.on Events.Click,->
			otherbacks = []
			otherbacks.push b.subLayersByName("Bckgr")[0] for b in this.superLayer.siblingLayers
			ob.states.switch "Off" for ob in otherbacks
			this.states.switch if this.states.current is "Off" then "On" else "Off"
			Labels.states.switch if this.states.current is "On" then "Off" else "On"	
				
			for view in  Layer.subLayersByName("Views")[0].subLayers
				if this.states.current is "On" and this.superLayer.name is view.name
					view.visible = true
					view.opacity = 0
					show = new Animation({
						layer: view,
						properties: {opacity: 1}
					})
					show.start()
				else
					hide = new Animation({
						layer: view,
						properties: {opacity: 0}
					})
					hide.start() 
					view.visible = false		

# One Controller rules one View in Layer
exports.Docker = (Layer,layerAnimation,sAnimations) ->
	modelDocker = {Controllers:Layer.subLayersByName("Controllers")[0],Views:Layer.subLayersByName("Views")[0]}
	Layers = []
	Layers.push {Layer: layer, Animation: layerAnimation}  for layer in modelDocker.Views.subLayers	
	Switchers = []
	Switchers.push {Layer: layer, Animation: sAnimations}  for layer in modelDocker.Controllers.subLayers
	
	for view in Layers
		for animation in view.Animation
# 			print ani÷÷ation
			view.Layer.states.add animation 
	view.Layer.states.switch "Off" for view in Layers

	
	for switcher,k in Switchers
		
		switcher.Layer.on Events.Click,->
			
			state = "Off"
			sl.states.switch "Off" for sl in switcher.Layer.subLayers for switcher in Switchers
			for layer in this.subLayers
				if layer.states.current isnt "On"
					state = "On"
					layer.states.switch "On"
					
				else 
					state = "Off" 
					layer.states.switch "Off"
			view.Layer.states.switch "Off" for view in Layers
			
			for view in Layers when view.Layer.name is this.name
				view.Layer.states.switch state 		
	
		for set in switcher.Animation
			switcher.Layer.subLayersByName(set.layer)[0].states.add animation for animation in set.animation
		sl.states.switch "Off" for sl in switcher.Layer.subLayers	


					
					
exports.attachColorPalletToView = (Layer) ->
		pallett = Layer.subLayersByName("ColorPallett")[0]
		pallett.states.add
			On: {opacity: 1}
			Off: {opacity: 0}
		pallett.states.switchInstant "Off"	

		for item in Layer.subLayers
			item.states.add
				Up: {y: item.y}
				Down: {y: item.y + 200}
			if item.name is "ColorButton"
				item.states.add
					On: {opacity: 1}
					Off: {opacity: 1}
				item.states.switchInstant "Off"
				item.on Events.Click,->
					if this.states.current is "Off"
						this.superLayer.subLayersByName("ColorPallett")[0].visible = true
						this.superLayer.subLayersByName("ColorPallett")[0].states.switch "On"
						this.states.switch "On"
						layer.states.switch "Down" for layer in this.siblingLayers when layer.name isnt "ColorPallett"
					else
						this.states.switch "Off"
						this.superLayer.subLayersByName("ColorPallett")[0].visible = false
						this.superLayer.subLayersByName("ColorPallett")[0].states.switch "Off"
						layer.states.switch "Up" for layer in this.siblingLayers

	
 				
exports.Settings = (Layer) ->
	buttonSettings = Layer.subLayersByName("ButtonSettings")[0]
	buttonSettings.states.add
		On: {grayscale: 0}
		Off: {grayscale: 100}
	buttonSettings.states.switchInstant "Off"
	
	stylerSettings = Layer.subLayersByName("PanelSettings")[0]
	stylerSettings.states.add
		On: {opacity: 1}
		Off: {opacity: 0}
	stylerSettings.states.switchInstant "Off"
	
	exports.attachColorPalletToView stylerSettings
	
	buttonSettings.on Events.Click,->
		this.states.next ["On","Off"]
		stylerSettings.states.next ["On","Off"]


# Switcher rules Layers
exports.attachSwitcher = (Layers,Switcher) ->
	prefix = Switcher.Layer.name
	for Item in Layers
		exports.attachAnimation Item.Layer, Item.Animation, prefix
		Item.Layer.states.switch "Off" + prefix
	
	for animation in Switcher.Animation
		exports.attachAnimation Switcher.Layer.subLayersByName(animation.layer)[0], animation.animation,prefix
		Switcher.Layer.subLayersByName(animation.layer)[0].states.switch "Off" + prefix

	Switcher.Layer.on Events.Click,->
		layer.states.next ["On"+prefix,"Off"+prefix] for layer in this.subLayers
		Layer.Layer.states.next ["On"+prefix,"Off"+prefix] for Layer  in Layers


exports.attachAnimation =  (layer, animation, prefix) ->
	for state in animation
		layer.states.add s+prefix,a for s,a of state

exports.Slider = (Group,controllerAnimation,slideAnimation,SelectedTab)->
	for controller in Group.subLayersByName("Controllers")[0].subLayers
		for animation in controllerAnimation
			controller.subLayersByName(animation.Layer)[0].states.add animation.Animation
			controller.subLayersByName(animation.Layer)[0].states.switch "Off"
			if SelectedTab? then controller.subLayersByName(animation.Layer)[0].states.switch "On" if controller.name is SelectedTab
		controller.on Events.Click,->
			Group.subLayersByName("Content")[0].states.switch "On"+this.name
			sublayer.states.switch "On" for sublayer in this.subLayers
			sublayer.states.switch "Off" for sublayer in layer.subLayers for layer in this.siblingLayers
			
		for animation in slideAnimation
			for state,properties of animation.Animation
				state = state + animation.Layer
				Group.subLayersByName("Content")[0].states.add state,properties

exports.Select = (item)->
	s.destroy() for s in item.superLayer.subLayers when s.name is "Selection"
	Selection = new Layer
		backgroundColor: "transparent"
		width: item.width+4
		height: item.height+4
		superLayer: item.superLayer
		x: item.x-2
		y: item.y-2
		opacity: 0
		name: "Selection"
	Selection.style =
		border: "1px solid #0075FD"
	setSelection = new Animation
		properties: { opacity: 1}
		layer: Selection
	setSelection.start()


exports.Inspector = (Views,Controllers,Select,Postfix = "Inspector") ->
	for view in Views
		for state,properties of view.Animation
			view.Layer.states.add state,properties
		view.Layer.states.switchInstant "Off"
	for controller in Controllers
# 		print controller.Layer
		controller.Layer.on Events.Click,->
			Select this
			for view in Views
				view.Layer.states.switchInstant if view.Layer.name is this.name+Postfix then "On" else "Off" 
				view.Layer.visible = if view.Layer.name is this.name+Postfix then true else false 

exports.getLayer = (parentLayer,Path) ->
	layer = parentLayer
	layer = layer.subLayersByName(group)[0] for group in Path
	return layer
	
	
exports.Ruler = (rulerLayer,sScales) ->
	
	ScalerRule = exports.getLayer rulerLayer,["Slider","ScalerWrapper","ScalerRule"]
	ScalerRule.states.add
		Normal: {grayscale: 100,opacity: 0.6}
		Active: {grayscale: 0,opacity:1}
	ScalerRule.states.switchInstant "Normal"
	Back =	exports.getLayer rulerLayer,["Slider","Back"]
	Back.on Events.MouseOver,->
		ScalerRule.states.switch "Active"
	Back.on Events.MouseOut,->
		ScalerRule.states.switch "Normal"	
	ScalerRule.draggable.enabled = true
	ScalerRule.draggable.vertical = false
	ScalerRule.draggable.momentum = false
	ScalerRule.draggable.speedX = 0.9
	ScalerRule.on Events.MouseOver,->
		this.style =
			cursor: "pointer"
		this.states.switch "Active"	
	Label = exports.getLayer(rulerLayer,["Label"]).subLayers[0]
	
	if exports.getLayer(rulerLayer,["Value"])?
		Value = exports.getLayer(rulerLayer,["Value"])
		Value.visible = false
		valueLive = new Layer
			width: 43
			height: 18
			x: 180
			y: 8
			superLayer: Value.superLayer
			backgroundColor: "transparent"
		styleNormal =
			fontSize: "12px"
			color: "#4A90E2"
			textAlign: "right"
			lineHeight: "1"
			background: "transparent"
			padding: "0px"
			paddingRight: "4px"
		styleEdit =
			fontSize: "12px"
			color: "black"
			textAlign: "right"
			lineHeight: "1"
			background: "white"
			paddingTop: "8px"	
			paddingRight: "4px"
			height: "28px"
			borderRadius: "0px 3px 3px 0px"
		valueLive.style = styleNormal
		valueLive.states.add 
			Normal: {y:8}
			Edit:{y:0}
		valueLive.states.switchInstant "Normal"
		
		valueLive.on Events.MouseOver,->
			this.style.cursor = "pointer"
				
		valueLive.on Events.Click,->
			if this.states.current is "Normal"
				this.style = styleEdit
				this.states.switchInstant "Edit"
			else
				this.style = styleNormal
				this.states.switchInstant "Normal" 
		valueLive.html = Math.round Utils.modulate(ScalerRule.x,[275, 493],sScales[Label.name])
			
		ScalerRule.on Events.Drag,->
			this.states.switch "Active"
			valueLive.html = Math.round Utils.modulate(this.x,[275, 493],sScales[Label.name])	