exports.Make = (Design) ->
	for key,layer of Design
			switch (layer.name.split "_")[0]
				when "BUTTON"
					layer.on Events.MouseOver,->
						@brightness = 80
						@style.cursor = "pointer"
					layer.on Events.MouseOut,->
						@brightness = 100
						@style.cursor = "pointer"