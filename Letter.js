// 1. Ask for shape, number of words or words and difficulty
// 2. Validate arguments
// 3. Calculate optimal size
// 4. For each word choose a random direction (depends on difficulty) and a random spot
// 5. Fill the rest of the array with most used letters in the words provided or in the
//    whole alphabet (depends on difficulty)
// 6. Avoid generating duplicates in previous step for words bigger than 2 or 3 letters

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

// Places a word in the alphabet soup
function placeWord(word, alphabetSoup) {
    const direction = getDirection();
    var locations = generateArray();
    var unavailable = 0;

    // Marks all the impossible spots (out of the array limit or already used)
    for (var index = 0; index < 3; index++) {
        if (constants.left[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[notPossible][word.length - length - 1] === 0) {
                        locations[notPossible][word.length - length - 1] = 1;
                        unavailable++;
                    }
                }
            }
        } else if (constants.right[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[notPossible][length] === 0) {
                        locations[notPossible][length] = 1;
                        unavailable++;
                    }
                }
            }
        } if (constants.up[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[word.length - length - 1][notPossible] === 0) {
                        locations[word.length - length - 1][notPossible] = 1;
                        unavailable++;
                    }
                }
            }
        } else if (constants.down[index] === direction) {
            for (var notPossible = 0; notPossible < size; notPossible++) {
                for (length = 0; length < word.length - 1; length++) {
                    if (locations[length][notPossible] === 0) {
                        locations[length][notPossible] = 1;
                        unavailable++;
                    }
                }
            }
        }
    }
    var available = size * size - unavailable;
    var choice = Math.trunc(Math.random() * available);
}

// Main
const constants = {left: [0, 2, 3], right: [4, 6, 7], up: [1, 2, 6], down: [3, 5, 7]};
const input = "HELLO, WORLD";
var words = input.split(", ");
const size = getSize();
var alphabetSoup = generateArray();
placeWord(words[0], alphabetSoup);