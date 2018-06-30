function getIndex(row, col) {
    return row * size + col;
}

function getLocation(index) {
    var row = Math.trunc(index / size);
    var col = index % size;
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
function fill(words) {
    const text = words.join("");
    var frequency = new Array(alphabet.length).fill(1);
    var sum = alphabet.length;
    for (index = 0; index < text.length; index++) {
        for (letter = 0; letter < alphabet.length; letter++) {
            if (alphabet[letter] === text[index]) {
                frequency[letter]++;
                sum++;
                break;
            }
        }
    }

    for (var index = 0; index < area; index++) {
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
            return alphabet[index];
        }
    }
}

// Generates an optimal size for the alphabet soup
function getSize() {
    var characters = input.length - 2 * (words.length - 1);
    var maxLength = 0;
    for (var word = 0; word < words.length; word++) {
        if (maxLength < words[word].length) {
            maxLength = words[word].length;
        }
    }
    var size = Math.ceil(Math.sqrt(characters * 2));
    if (size < maxLength) {
        size = maxLength;
    }
    return size;
}

// Initializes array to 0
function generateArray() {
    var array = Array(size).fill(0);
    for (var index = 0; index < size; index++) {
        array[index] = Array(size).fill(0);
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
    return Math.trunc(Math.random() * 8);
}

// Returns if a given word can be placed in a given position in a determined direction
function canPlace(p) {
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

function writeWord(p) {
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
function placement(parameters) {
    if (canPlace(parameters)) {
        writeWord(parameters);
    } else if (parameters.openLocations.length !== 0) {
        parameters.available--;
        parameters.choice = tryAgain(parameters.available);
        return placement(parameters);
    } else {
        parameters.direction = (parameters.direction + 1) % 8;
        if (parameters.firstDirection === parameters.direction) {
            console.log("Failed to build");
            return -1;
        }
        return placeWord(parameters.word, parameters.direction, parameters.firstDirection);
    }
}

// Places a word in the alphabet soup
function placeWord(word, direction = undefined, firstDirection) {
    if (direction === undefined) {
        direction = getDirection();
        firstDirection = direction;
    }
    var locations = generateArray();
    var unavailable = 0;

    // Array that tracks the open locations
    var openLocations = [];
    for (var location = 0; location < area; location++) {
        openLocations.push(location);
    }
    var locationsToRemove = [];

    // Marks all the impossible spots (out of the array limit)
    for (var index = 0; index < 3; index++) {
        if (constants.left[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[notPossible][size - 1 - length] === 0) {
                        locations[notPossible][size - 1 - length] = 1;
                        unavailable++;
                        locationsToRemove.push(notPossible * size + size - 1 - length);
                    }
                }
            }
        } else if (constants.right[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[notPossible][length] === 0) {
                        locations[notPossible][length] = 1;
                        unavailable++;
                        locationsToRemove.push(notPossible * size + length);
                    }
                }
            }
        } if (constants.up[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[size - 1 - length][notPossible] === 0) {
                        locations[size - 1 - length][notPossible] = 1;
                        unavailable++;
                        locationsToRemove.push((size - 1 - length) * size + notPossible);
                    }
                }
            }
        } else if (constants.down[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[length][notPossible] === 0) {
                        locations[length][notPossible] = 1;
                        unavailable++;
                        locationsToRemove.push(length * size + notPossible);
                    }
                }
            }
        }
    }

    var available = size * size - unavailable;

    // Sorts array in descending order
    locationsToRemove = locationsToRemove.sort((a, b) => b - a);

    // Removes non-possible locations
    for (var index = 0; index < locationsToRemove.length; index++) {
        openLocations.splice(locationsToRemove[index], 1);
    }

    var choice = tryAgain(available);
    var parameters = {choice, openLocations, word, direction, locationsToRemove, available, firstDirection};

    error = placement(parameters);
    if (error === -1) {
        return -1;
    }

    return firstDirection;
}

// Main

const constants = {left: [0, 2, 3], right: [4, 6, 7], up: [1, 2, 6], down: [3, 5, 7]};
const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const input = "ELEPHANT, CAT, DOG, MOUSE, SNAKE, HEN, CHICKEN, HORSE, RABBIT, SHEEP, WOLF, DOLPHIN, EAGLE, PANDA, PENGUIN";
var words = input.split(", ");
const size = getSize();
const area = size * size;
var alphabetSoup = generateArray();
var firstDirection = undefined;

/*
EASY: Only directions 1 & 2.
MEDIUM: Only directions 1 to 4.
HARD: All directions
*/
const difficulty = "HARD";

for (word = 0; word < words.length; word++) {
    firstDirection = placeWord(words[word], undefined, firstDirection);
    if (firstDirection === -1) {
        break;
    }
}

if (firstDirection !== -1) {
    fill(words);

    // Output result
    for (var row = 0; row < size; row++) {
        console.log(alphabetSoup[row]);
    }
}
