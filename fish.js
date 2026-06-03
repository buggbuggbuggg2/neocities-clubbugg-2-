//and god said let there be database.
let animalDatabase = {};
let databaseReady = false; //patience young script 

// if its not async, it wont count nodes right since the fetch wont work in time 
async function loadAnimalDatabase() {
    try {
        const response = await fetch('animals.json');
        const rawData = await response.json();
        
        // grabs animals from the json so it can be used 
        animalDatabase = rawData.animals;
        databaseReady = true;
        console.log("database works! everyone say good job bugg...", animalDatabase);
    } catch (error) {
        console.error("ouhh shii database broken...", error);
    }
}

function analyzePhylogeny(userInput) {
    // force lowercase
    const animalKey = userInput.toLowerCase().trim();
    let currentAnimal = animalDatabase[animalKey];

    // is it in the database?
    if (!currentAnimal) {
        return { error: true, message: `"${userInput}" we dont have this animal yet srry` };
    }

    const customMessage = currentAnimal.message;

    //hardcoded no fish
    if (currentAnimal.parent === "non-fish") {
        const defaultMessage = `oh god finally. a ${userInput} is not a fish.`;
        return {
            isFish: false,
            nodeCount: "N/A",
            message: `${defaultMessage}${customMessage ? ' ' + customMessage : ''}`
        };
    }

    let nodeCount = 0;
    let currentKey = animalKey;

    // climb up tree till null
    while (currentAnimal.parent !== null) {
        nodeCount++;
        
        // Move our reference up to the parent animal
        currentKey = currentAnimal.parent;
        currentAnimal = animalDatabase[currentKey];
    }

    // yes fish
    const fishMessage = `yes, the ${userInput} is indeed a fish. it is ${nodeCount} node(s) away from euteleostomi.`;
    return {
        isFish: true,
        nodeCount: nodeCount, //gives nmber of nodes
        message: `${fishMessage}${customMessage ? ' ' + customMessage : ''}`
    };
}

// loady load load
loadAnimalDatabase();
//me when the button 
document.getElementById('yourSearchButton').addEventListener('click', () => {
    if (!databaseReady) {
        document.getElementById('yourOutputElement').innerText = "Database is still loading, try again in a second...";
        return;
    }
    
    const inputVal = document.getElementById('yourInputText').value;
    const result = analyzePhylogeny(inputVal);
    console.log("Calculation Result:", result);
    document.getElementById('yourOutputElement').innerText = result.message;//prints message directly onto page 
});