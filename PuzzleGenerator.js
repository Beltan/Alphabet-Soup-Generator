function getIndex(row, col) {
    return row * constants.size + col;
}

function getLocation(index) {
    var row = Math.trunc(index / constants.size);
    var col = index % constants.size;
    return {row, col};
}

// Returns the next cell in a given direction
function nextLocation(row, col, direction) {
    switch(direction) {
        case 0:
            col++;
            break;
        case 1:
            row++;
            break;
        case 2:
            col++;
            row++;
            break;
        case 3:
            col++;
            row--;
            break;
        case 4:
            col--;
            break;
        case 5:
            row--;
            break;
        case 6:
            col--;
            row++;
            break;
        case 7:
            col--;
            row--;
            break;
    }
    return {row, col};
}

// Fills the array with random letters
function fill(alphabetSoup) {
    const text = constants.words.join("");
    var frequency = new Array(constants.alphabet.length).fill(1);
    var sum = constants.alphabet.length;
    for (index = 0; index < text.length; index++) {
        for (letter = 0; letter < constants.alphabet.length; letter++) {
            if (constants.alphabet[letter] === text[index]) {
                frequency[letter]++;
                sum++;
                break;
            }
        }
    }

    for (var index = 0; index < constants.area; index++) {
        var pos = getLocation(index);
        if (alphabetSoup[pos.row][pos.col] === 0) {
            var choice = 1 + Math.trunc(Math.random() * sum);
            alphabetSoup[pos.row][pos.col] = letterFill(choice, frequency);
        }
    }
}

function letterFill(choice, frequency) {
    var sum = 0;
    for (var index = 0; index < frequency.length; index++) {
        sum += frequency[index];
        if (sum >= choice) {
            return constants.alphabet[index];
        }
    }
}

// Generates an optimal size for the alphabet soup
function getSize() {
    var characters = constants.in.length - 2 * (constants.words.length - 1);
    var maxLength = 0;
    for (var word = 0; word < constants.words.length; word++) {
        if (maxLength < constants.words[word].length) {
            maxLength = constants.words[word].length;
        }
    }
    var size = Math.ceil(Math.sqrt(characters * config.size));
    if (size < maxLength) {
        size = maxLength;
    }
    return size;
}


/* Shapes
0: Square
1: Circle
*/
function generateShape(locations) {
    switch(config.shape) {
        case "0":
            return locations;
        case "1":
            return circleShape(locations);
    }
}


// Initializes array to 0
function generateArray() {
    var array = Array(constants.size).fill(0);
    for (var index = 0; index < constants.size; index++) {
        array[index] = Array(constants.size).fill(0);
    }
    return array;
}

/* Chooses a random direction where:
0: Left - Right
1: Up - Down
2: Up left - Down right
3: Down left - Up right
4: Right - Left
5: Down - Up
6: Up right - Down left
7: Down right - Up left
*/
function getDirection() {
    return Math.trunc(Math.random() * config.directions);
}

// Returns if a given word can be placed in a given position in a determined direction
function canPlace(p, alphabetSoup) {
    var pos = getLocation(p.openLocations[p.choice]);
    for (length = 0; length < p.word.length; length++) {
        if (alphabetSoup[pos.row][pos.col] !== 0 && alphabetSoup[pos.row][pos.col] !== p.word[length]) {
            p.openLocations.splice(p.choice, 1);
            return false;
        }
        pos = nextLocation(pos.row, pos.col, p.direction);
    }
    return true;
}

function writeWord(p, alphabetSoup) {
    var pos = getLocation(p.openLocations[p.choice]);
    for (length = 0; length < p.word.length; length++) {
        alphabetSoup[pos.row][pos.col] = p.word[length];
        pos = nextLocation(pos.row, pos.col, p.direction);
    }
}

function tryAgain(available) {
    return Math.trunc(Math.random() * available);
}

// Recursively calls itself to check if a word can be placed in a position in any given direction
function placement(parameters, alphabetSoup) {
    if (canPlace(parameters, alphabetSoup)) {
        writeWord(parameters, alphabetSoup);
    } else if (parameters.openLocations.length !== 0) {
        parameters.available--;
        parameters.choice = tryAgain(parameters.available);
        return placement(parameters, alphabetSoup);
    } else {
        parameters.direction = (parameters.direction + 1) % 8;
        if (parameters.firstDirection === parameters.direction) {
            console.log("Failed to build");
            return -1;
        }
        parameters = placeWord(parameters.word, parameters.direction, parameters.firstDirection);
        return placement(parameters, alphabetSoup);
    }
}

// Places a word in the alphabet soup
function placeWord(word, direction, firstDirection) {
    if (direction === undefined) {
        direction = getDirection();
        firstDirection = direction;
    }
    var locations = generateArray();
    locations = generateShape(locations);
    var unavailable = 0;

    // Array that tracks the open locations
    var openLocations = [];
    for (var location = 0; location < constants.area; location++) {
        openLocations.push(location);
    }
    var locationsToRemove = [];

    // Marks all the impossible spots (out of the array limit)
    for (var index = 0; index < 3; index++) {
        if (constants.directions.left[index] === direction) {
            for (var row = 0; row < constants.size; row++) {
                for (var col = 0; col < constants.size; col++) {
                    for (var next = 0; next < word.length; next++) {
                        if (locations[row][col] === "") {
                            break;
                        } else if ((locations[row][col + next] === undefined || locations[row][col + next] === "") && locations[row][col] === 0) {
                            locations[row][col] = 1;
                            locationsToRemove.push(getIndex(row, col));
                            unavailable++;
                            break;
                        }
                    }
                }
            }
        } else if (constants.directions.right[index] === direction) {
            for (var row = 0; row < constants.size; row++) {
                for (var col = 0; col < constants.size; col++) {
                    for (var next = 0; next < word.length; next++) {
                        if (locations[row][col] === "") {
                            break;
                        } else if ((locations[row][col - next] === undefined || locations[row][col - next] === "") && locations[row][col] === 0) {
                            locations[row][col] = 1;
                            locationsToRemove.push(getIndex(row, col));
                            unavailable++;
                            break;
                        }
                    }
                }
            }
        } if (constants.directions.up[index] === direction) {
            for (var row = 0; row < constants.size; row++) {
                for (var col = 0; col < constants.size; col++) {
                    for (var next = 0; next < word.length; next++) {
                        if (locations[row][col] === "") {
                            break;
                        } else if ((locations[row + next] === undefined || locations[row + next][col] === undefined || locations[row + next][col] === "") && locations[row][col] === 0) {
                            locations[row][col] = 1;
                            locationsToRemove.push(getIndex(row, col));
                            unavailable++;
                            break;
                        }
                    }
                }
            }
        } else if (constants.directions.down[index] === direction) {
            for (var row = 0; row < constants.size; row++) {
                for (var col = 0; col < constants.size; col++) {
                    for (var next = 0; next < word.length; next++) {
                        if (locations[row][col] === "") {
                            break;
                        } else if ((locations[row - next] === undefined || locations[row - next][col] === undefined || locations[row - next][col] === "") && locations[row][col] === 0) {
                            locations[row][col] = 1;
                            locationsToRemove.push(getIndex(row, col));
                            unavailable++;
                            break;
                        }
                    }
                }
            }
        }
    }
    var available = constants.area - unavailable;
    var choice = tryAgain(available);

    // Sorts array in descending order
    locationsToRemove = locationsToRemove.sort((a, b) => b - a);

    // Removes non-possible locations
    for (var index = 0; index < locationsToRemove.length; index++) {
        openLocations.splice(locationsToRemove[index], 1);
    }

    return {choice, openLocations, word, direction, locationsToRemove, available, firstDirection};
}

function init() {
    constants.words = constants.in.split(", ");
    constants.size = getSize();
    constants.area = constants.size * constants.size;

    // Orders the words so the longest words are placed first.
    constants.input = constants.words.sort((a, b) => b.length - a.length);
    return generateArray();
}

function validateDifficulty() {
    /*
    EASY: Small array and only directions 1 & 2.
    MEDIUM: Medium array and only directions 1 to 4.
    HARD: Big array and all directions.
    */
    //const difficulty = readlineSync.question("Enter the desired difficulty: \n 0. EASY \n 1. MEDIUM \n 2. HARD \n");
    const difficulty = "1";
    if ((difficulty !== "0" && difficulty !== "1" && difficulty !== "2")) {
        console.log("Please enter a valid argument.\n");
        return validateDifficulty();
    }
    switch(difficulty) {
        case "0":
            config.size = 1.25;
            config.directions = 2;
            break;
        case "1":
            config.size = 2.75;
            config.directions = 4;
            break;
        case "2":
            config.size = 5;
            config.directions = 8;
            break;
    }
}

function validateWords() {
    //var words = readlineSync.question("Enter the words separated by comma and space, for example: HELLO, WORLD \n").toUpperCase();
    var words = "BLACK, BLUE, RED";
    const string = words.split(", ").join("");
    for (var index = 0; index < string.length; index++) {
        var found = false;
        for (var letter = 0; letter < constants.alphabet.length; letter++) {
            if (string[index] === constants.alphabet[letter]) {
                found = true;
                break;
            }
        }
        if (!found) {
            break;
        }
    }
    if (!found) {
        console.log("Please enter a valid argument.\n");
        return validateWords();
    }
    constants.in = words;
}

const constants = {};
const config = {};
config.shape = "0";
constants.directions = {left: [0, 2, 3], right: [4, 6, 7], up: [1, 2, 6], down: [3, 5, 7]};
constants.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const readlineSync = require('readline-sync');

function main() {
    validateDifficulty();
    validateWords();
    var alphabetSoup = init();

    for (word = 0; word < constants.words.length; word++) {
        parameters = placeWord(constants.words[word], undefined, undefined);

        var error = placement(parameters, alphabetSoup);
        if (error === -1) {
            return;
        }
    }
    fill(alphabetSoup);

    // Output result
    for (var row = 0; row < constants.size; row++) {
        console.log(alphabetSoup[row].join(" "));
    }
}

main();

/* Some sets of words to test:
"ELEPHANT, CAT, DOG, MOUSE, SNAKE, HEN, CHICKEN, HORSE, RABBIT, SHEEP, WOLF, DOLPHIN, EAGLE, PANDA, PENGUIN"
"BLACK, BLUE, RED, YELLOW, CYAN, ORANGE, WHITE, PURPLE, GREEN, PINK, MAGENTA, GREY, BROWN, AZURE, AMBER, CRIMSON, MAROON, LIME, VIOLET, TURQUOISE, SAPPHIRE, BEIGE, EMERALD, CORAL"
*/
