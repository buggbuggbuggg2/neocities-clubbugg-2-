
const image = document.getElementById("imageToggle");
const messages = [
  //randomized messages
    "you will have a lovely day!",
    "consider learning to code!",
    "you will be very successful this year!",
    "big things are coming your way!",
    "you're extremely capable of the task at hand!",
    "be mindful of who you spend your time with!",
    "make time for the things that fufill you and bring you joy! ",
    "be super silly forever!",
    "be kind, even to those that don't deserve it!",
    "do as much good and as little harm as you can!",
    "you look lovely today!",
    "i love you silly person!",
    "well aren't you wonderful?",
    "someone's looking dashing today!",
    "bugg's favorite color is green!",
    "hello freakazoid!",
    "caracas is the capital of venezuela!",
    "you're gonna get super rich",
    "start investing. get ur money up, not ur funny up!",
    "the moon is made of cheese",
    "can i have some quarters for the gumball machine pls?",
    "i ran out of ideas so you get this lame message."
    
    
];

image.addEventListener("click", function() {
    //check cookie's closed/open appearance
    if (image.getAttribute('src') === "closed-cookie.png") {
        //if closed, open
        // @ts-ignore
        image.src = "openfortune.png"; 
        //send a message 
          setTimeout(function() {
     const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        alert(randomMsg);
}, 100);
       
        
    } else {
        //reset when clicked again
        // @ts-ignore
        image.src = "closed-cookie.png";
    }
});
