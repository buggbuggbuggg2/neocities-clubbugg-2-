//steal this code idc! if you feel generous maybe link to my site. i have a button on my homepage. 
//this is my first real script, ive written some tidbits using tuts for the secret page but i think this is decent considering its my first try! 
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
    "stop playing clash of clans and get those grades up you chud",
    "you look lovely today!",
    "mwah! you just got a kiss from a digital cookie!",
    "i love you silly person!",
    "well aren't you wonderful?",
    "someone's looking dashing today!",
    "bugg's favorite color is green!",
    "i <3 burgas!",
    "uhh hello is this thing on!",
    "javascript sucks!",
    "hello freakazoid!",
    "caracas is the capital of venezuela!",
    "fun fact: bugg is not the executive chairman of nestle. fuck nestle!",
    "im actually so starving while writing these",
    "don't buy from shein! diy!",
    "if it can't be reused/repurposed/or recycled don't buy it!",
    "if you're reading this PLEASE doordash me a burga",
    "new semester, same mediocre grades",
    "AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
    "you're gonna get super rich",
    "start investing. get ur money up, not ur funny up!",
    "the moon is made of cheese",
    "can i have some quarters for the gumball machine pls?",
    "you win",
    "you lose",
    "you suck",
    "i can feel ur aura thru the screen bro",
    "i can smell you through the screen ew",
    "bugg is a smelly babby",
    "bugg disproves of generative ai. take part in the joy of creation!",
    "if you like the site, consider sending bugg a dollar!",
    "don't steal from small businesses!",
    "generic fortune- blah blah blah.",
    "bro does NOT know javascript",
    "i sure hope spring comes quick this year",
    "fuck you, six more weeks of winter",
    "you owe bugg 6 trillion dollars sorry ",
    "go tell owen he's queer",
    "hi",
    "mlem mlem mlem (this is the sound of me licking you)",
    "beep beep beep bop boop boop",
    "hi you owe bugg a TRILLION DOLLARS NOW",
    "i ran out of ideas so you get this lame message."
    
    
];

image.addEventListener("click", function() {
    //check cookie's closed/open appearance
    if (image.getAttribute('src') === "closed-cookie.png") {
        //if closed, open
        // @ts-ignore
        image.src = "openfortune.png"; //to whatever nerd's looking at my source code, lmk in the chat, guestbook, email me, whatever, just tell me how to fix ts
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
