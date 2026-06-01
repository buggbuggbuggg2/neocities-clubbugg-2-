//and god said let there be database.
let animalDatabase = {};

// whatever async does idgaf
async function loadAnimalDatabase() {
    try {
        const response = await fetch('animals.json');
        const rawData = await response.json();
        
        // target the inner "animals" object from structure
        animalDatabase = rawData.animals;
        console.log("Phylogenetic database loaded successfully!", animalDatabase);
    } catch (error) {
        console.error("Error loading JSON file. Check for missing commas or quotes!", error);
    }
}

// me when calc
function analyzePhylogeny(userInput) {
    // force lowercase
    const animalKey = userInput.toLowerCase().trim();
    let currentAnimal = animalDatabase[animalKey];

    // is it in the database?
    if (!currentAnimal) {
        return { error: true, message: `"${userInput}" was not found in the database.` };
    }

    //hardcoded no fish
    if (currentAnimal.parent === "non-fish") {
        return {
            isFish: false,
            nodeCount: "N/A",
            message: `oh god finally. a ${userInput} is not a fish.`
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
    return {
        isFish: true,
        nodeCount: nodeCount, //gives nmber of nodes
        message: `yes, the ${userInput} is indeed a fish. it is ${nodeCount} node(s) away from euteleostomi.`
    };
}

// loady load load
loadAnimalDatabase();
