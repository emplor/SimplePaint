(function() {
	
	var canvas = document.querySelector('#paint');
	var ctx = canvas.getContext('2d');
	
	var sketch = document.querySelector('#sketch');
	var sketch_style = getComputedStyle(sketch);
	canvas.width = parseInt(sketch_style.getPropertyValue('width'));
	canvas.height = parseInt(sketch_style.getPropertyValue('height'));

	var shapes_drawn = [];
	var colours_used = [];
	function undo(){

	}

	var activeElem = "line";
	var PAINT_FUNCTIONS = {
		'line': on_paint_line,
		'rectangle': on_paint_rectangle,
		'circle': on_paint_circle,
		'free': on_paint_free
	};

	var activeColour = "blue";
	var PAINT_COLOURS = {
		"red": "#FF0000",
		"blue": "#0000FF",
		"black": '#000000',
		"white": '#FFFFFF'
	};

	//get paint tool
	document.getElementById("rectangle").addEventListener('click', function(e){
		activeElem = 'rectangle';
	});
	document.getElementById("line").addEventListener('click', function(e){
		activeElem = 'line';
	});
	document.getElementById("circle").addEventListener('click', function(e){
		activeElem = 'circle';
	});
	document.getElementById("free").addEventListener('click', function(e){
		activeElem = 'free';
	});

	document.getElementById("erase").addEventListener('click', function(e){
		activeElem = 'free';
	});

	function get_paint_fn(){
		var fn = PAINT_FUNCTIONS[activeElem];
		return fn;
	} 

	function set_paint_tool(name){
		if(PAINT_FUNCTIONS[name]){
			shapes_drawn.push( activeElem );
			activeElem = name;
		}else{
			console.log(name + " is not defined");
		}
	}
	
	//get paint colour
	document.getElementById("red").addEventListener('click', function(e){
		activeColour = 'red';
	});
	document.getElementById("blue").addEventListener('click', function(e){
		activeColour = 'blue';
	});
	document.getElementById("black").addEventListener('click', function(e){
		activeColour = 'black';
	});
	document.getElementById("erase").addEventListener('click', function(e){
		activeColour = 'white';
	});

	function get_colour_hex(){
		var hex = PAINT_COLOURS[activeColour];
		return hex;
	}

	function set_paint_colour(colour){
		if(PAINT_COLOURS[colour]){
			colours_used.push( activeColour );
			activeColour = colour;
		}else{
			console.log(colour + " is not defined");
		}
	}
	
	// Creating a tmp canvas
	var tmp_canvas = document.createElement('canvas');
	var tmp_ctx = tmp_canvas.getContext('2d');
	tmp_canvas.id = 'tmp_canvas';
	tmp_canvas.width = canvas.width;
	tmp_canvas.height = canvas.height;
	
	sketch.appendChild(tmp_canvas);

	var mouse = {x: 0, y: 0};
	var start_mouse = {x: 0, y: 0};

	var new_mouse = {x: 0, y: 0};
	var last_mouse = {x: 0, y:0};
	
	
	/* Mouse Capturing Work */
	tmp_canvas.addEventListener('mousemove', function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

		last_mouse.x = new_mouse.x;
		last_mouse.y = new_mouse.y;
		
		new_mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		new_mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	}, false);
	
	
	/* Drawing on Paint App */
	function set_colour_on(context){
		context.lineWidth = 5;
		context.lineJoin = 'round';
		context.lineCap = 'round';
		context.strokeStyle = get_colour_hex();
		context.fillStyle = get_colour_hex();

		return context;
	}
	
	tmp_canvas.addEventListener('mousedown', function(e) {
		tmp_canvas.addEventListener('mousemove', get_paint_fn(), false);
		
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		
		start_mouse.x = mouse.x;
		start_mouse.y = mouse.y;
		
		get_paint_fn();
	}, false);
	
	tmp_canvas.addEventListener('mouseup', function() {
		tmp_canvas.removeEventListener('mousemove', get_paint_fn(), false);
		
		// Writing down to real canvas now
		ctx.drawImage(tmp_canvas, 0, 0);

		set_colour_on(tmp_ctx);
		// Clearing tmp canvas
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
	}, false);
	
	function on_paint_line() {
		set_colour_on(tmp_ctx);
		
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		tmp_ctx.beginPath();
		tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
		tmp_ctx.lineTo(mouse.x, mouse.y);
		tmp_ctx.stroke();
		tmp_ctx.closePath();
		
	}

	function on_paint_rectangle() {
		set_colour_on(tmp_ctx);
		
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		var x = Math.min(mouse.x, start_mouse.x);
		var y = Math.min(mouse.y, start_mouse.y);
		var width = Math.abs(mouse.x - start_mouse.x);
		var height = Math.abs(mouse.y - start_mouse.y);
		tmp_ctx.strokeRect(x, y, width, height);
		
	}

	function on_paint_circle() {
		set_colour_on(tmp_ctx);
	 
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

		var x = (mouse.x + start_mouse.x) / 2;
		var y = (mouse.y + start_mouse.y) / 2;

		var radius = Math.max(
		    Math.abs(mouse.x - start_mouse.x),
		    Math.abs(mouse.y - start_mouse.y)
		) / 2;

		tmp_ctx.beginPath();
		tmp_ctx.arc(x, y, radius, 0, Math.PI*2, false);
		// tmp_ctx.arc(x, y, 5, 0, Math.PI*2, false);
		tmp_ctx.stroke();
		tmp_ctx.closePath();

	}

	function on_paint_free(){
		set_colour_on(ctx);

		ctx.beginPath();
		ctx.moveTo(last_mouse.x, last_mouse.y);
		ctx.lineTo(new_mouse.x, new_mouse.y);
		ctx.closePath();
		ctx.stroke();
	}
	
}());
