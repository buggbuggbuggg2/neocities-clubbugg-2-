const canvas = document.getElementById('aquariumCanvas');
const ctx = canvas.getContext('2d'); //finds canvas tag, stores it in a variable called canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
object.addEventListener("mouseover", myScript); //fix this 
class Fish {
    constructor(imageSrc) {
        this.img = new Image();
        this.img.src = imageSrc;
        
        // Random starting position
        this.x = Math.random() * (canvas.width - 50);
        this.y = Math.random() * (canvas.height - 50);
        
        // random movement direction/speed
        this.dx = (Math.random() - 0.5) * 4; // horizontal speed
        this.dy = (Math.random() - 0.5) * 4; // vertical speed
        
        this.hits = 0; //how many times has fishy touched wall
        this.alive = true;
    }

    update() {
        // make fish swim
        this.x += this.dx;
         this.y += this.dy;
        //do this line with y if you want to make them swim up and down

        // fish reflect
        // is this a wall?
        if (this.x <= 0 || this.x >= canvas.width - 50) {
            this.dx *= -1; // swim other way
            this.hits++;
        }
        // where r the walls
        if (this.y <= 0 || this.y >= canvas.height - 50) {
            this.dy *= -1; // swim other way
            this.hits++;
        }

        // fish killer
        if (this.hits >= 3) {
            this.alive = false;
        }
    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y, 200, 200);
    }
}

// create school
let school = [];
//fish images (:
const fishImageFiles = ['aquarium/angelshark.png', 'aquarium/bigeyethresher.png','aquarium/blacknoseshark.png','aquarium/finetoothshark.png','aquarium/lemonshark.png','aquarium/pelagicthresher.png','aquarium/squid.png','aquarium/surgeonfish.png','aquarium/yellowcheekwrasse.png']; // fishes 

for (let i = 0; i < 5; i++) {
    let randomImg = fishImageFiles[Math.floor(Math.random() * fishImageFiles.length)];
    school.push(new Fish(randomImg));
}

// animate fish, with hopes n prayers 
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    for (let i = school.length - 1; i >= 0; i--) {
        school[i].update();
        school[i].draw();
        
        if (!school[i].alive) {
            school.splice(i, 1); // Remove the dead fish
            
            //respawn by replacing dead fish with random fish
            let randomImg = fishImageFiles[Math.floor(Math.random() * fishImageFiles.length)];
            //birth baby
            school.push(new Fish(randomImg));
        }
    }

    requestAnimationFrame(animate); 
}
animate();