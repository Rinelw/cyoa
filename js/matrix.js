// Get the canvas node and the drawing context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// set the width and height of the canvas
const w = canvas.width = document.body.offsetWidth;
const h = canvas.height = document.body.offsetHeight;

// draw a black rectangle of width and height same as that of the canvas
ctx.fillStyle = '#0000';
ctx.fillRect(0, 0, w, h);

const cols = Math.floor(w / 10) + 1;
const ypos = Array(cols).fill(0);

function matrix () {
	// Draw a semitransparent black rectangle on top of previous drawing
	ctx.fillStyle = '#0001';
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillRect(0, 0, w, h);
	ctx.fillStyle = '#0005';
	ctx.globalCompositeOperation = 'xor';
	ctx.fillRect(0, 0, w, h);
  
	// Set color to green and font to 15pt pixelSGA in the drawing context
	ctx.fillStyle = '#8c5dca';
	ctx.font = '10px PixelSGA';
  
	// for each column put a random character at the end
	ypos.forEach((y, ind) => {
	  // generate a random character
	  const text = String.fromCharCode(0x0041 + Math.random() * (0x005A - 0x0041 + 1));
  
	  // x coordinate of the column, y coordinate is already given
	  const x = ind * 10;
	  // render the character at (x, y)
	  ctx.globalCompositeOperation = 'source-over';
	  ctx.fillText(text, x, y);
	  
  
	  // randomly reset the end of the column if it's at least 100px high
	  if (y > 300 + Math.random() * 10000) ypos[ind] = 0;
	  // otherwise just move the y coordinate for the column 20px down,
	  else ypos[ind] = y + 10;
	});
  }
  
  // render the animation at 20 FPS.
  setInterval(matrix, 50);