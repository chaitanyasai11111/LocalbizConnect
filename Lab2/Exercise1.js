
const canvas = document.getElementById("myCanvas");


const ctx = canvas.getContext("2d");


ctx.fillStyle = "blue";         
ctx.fillRect(50, 50, 150, 100); // Draw rect at (x=50, y=50)



ctx.beginPath();                // Start a new shape path
ctx.arc(350, 100, 50, 0, 2 * Math.PI); // Draw circle at (x=350, y=100), radius=50
ctx.fillStyle = "red";          
ctx.fill();                     



ctx.beginPath();                // Start a new path
ctx.moveTo(50, 200);            // Move pen to start (x=50, y=200)
ctx.lineTo(450, 200);           // Draw line to end (x=450, y=200)
ctx.strokeStyle = "green";      
ctx.lineWidth = 5;              
ctx.stroke();                   



ctx.font = "30px Arial";        
ctx.fillStyle = "black";        
ctx.fillText("HTML5 Canvas", 150, 270); // Draw text at (x=150, y=270)