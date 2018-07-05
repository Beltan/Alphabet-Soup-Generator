function main() {
    const constants = {};
    const config = {};
    constants.directions = {left: [0, 2, 3], right: [4, 6, 7], up: [1, 2, 6], down: [3, 5, 7]};
    constants.alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const readlineSync = require('readline-sync');

    function getIndex(row, col) {
        return row * constants.size + col;
    }

    function getLocation(index) {
        var row = Math.trunc(index / constants.size);
        var col = index % constants.size;
        return {row, col};
    }
    
    function tryAgain(available) {
        return Math.trunc(Math.random() * available);
    }

    function validate() {
        function validateDifficulty() {
            /*
            EASY: Small array and only directions 1 & 2.
            MEDIUM: Medium array and only directions 1 to 4.
            HARD: Big array and all directions.
            */
            //const difficulty = "0";
            const difficulty = readlineSync.question("Enter the desired difficulty: \n 0. EASY \n 1. MEDIUM \n 2. HARD \n");
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
        
        function validateShape() {
            //config.shape = "1";
            config.shape = readlineSync.question("Enter the desired shape: \n 0. SQUARE \n 1. CIRCLE \n ");
            if ((config.shape !== "0" && config.shape !== "1")) {
                console.log("Please enter a valid argument.\n");
                return validateShape();
            }
        }
        
        function validateWords() {
            //var words = "ELEPHANT, CAT, DOG, MOUSE, SNAKE, HEN, CHICKEN, HORSE, RABBIT, SHEEP, WOLF, DOLPHIN, EAGLE, PANDA, PENGUIN";
            var words = readlineSync.question("Enter the words separated by comma and space, for example: HELLO, WORLD \n").toUpperCase();
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

        validateDifficulty();
        validateWords();
        validateShape();
    }

    // Initializes array to 0
    function generateArray() {
        var array = Array(constants.size).fill(0);
        for (var index = 0; index < constants.size; index++) {
            array[index] = Array(constants.size).fill(0);
        }
        return array;
    }

    function init() {
        function generateShape() {
            function circleShape() {
                function distance(row, col) {
                    if (Math.sqrt(Math.pow(row - rad, 2) + Math.pow(col - rad, 2)) - rad < 0.5) {
                        return true;
                    }
                    return false;
                }
                var remove = [];
                const rad = Math.round(10 * (constants.size - 1) / 2) / 10;
                for (var row = 0; row < constants.size; row++) {
                    for (var col = 0; col < constants.size; col++) {
                        if (!distance(row, col)) {
                            alphabetSoup[row][col] = " ";
                            constants.empty++;
                            remove.push(getIndex(row, col));
                        }
                    }
                }
                constants.remove = remove;
                return alphabetSoup;
            }
        
            /* Shapes
            0: Square
            1: Circle
            */
            switch(config.shape) {
                case "0":
                    return alphabetSoup;
                case "1":
                    return circleShape();
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
            if (config.shape === '1') {
                size = Math.round(2 * Math.sqrt(size * size / Math.PI));
            }
            if (size < maxLength) {
                size = maxLength;
            }
            return size;
        }
    
        constants.words = constants.in.split(", ");
        constants.size = getSize();
        constants.area = constants.size * constants.size;
        constants.empty = 0;
    
        // Orders the words so the longest words are placed first.
        constants.input = constants.words.sort((a, b) => b.length - a.length);
    
        var alphabetSoup = generateArray();
        return generateShape();
    }

    // Places a word in the alphabet soup
    function placeWord(word, direction, firstDirection) {

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

        if (direction === undefined) {
            direction = getDirection();
            firstDirection = direction;
        }
        var locations = generateArray();
        var unavailable = constants.empty;

        // Array that tracks the open locations
        var openLocations = [];
        for (var location = 0; location < constants.area; location++) {
            openLocations.push(location);
        }
        var locationsToRemove = constants.remove.slice();

        // Marks all the impossible spots (out of the array limit)
        for (var index = 0; index < 3; index++) {
            if (constants.directions.left[index] === direction) {
                for (var row = 0; row < constants.size; row++) {
                    for (var col = 0; col < constants.size; col++) {
                        for (var next = 0; next < word.length; next++) {
                            if (alphabetSoup[row][col] === " ") {
                                break;
                            } else if ((locations[row][col + next] === undefined || alphabetSoup[row][col + next] === " ") && locations[row][col] === 0) {
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
                            if (alphabetSoup[row][col] === " ") {
                                break;
                            } else if ((locations[row][col - next] === undefined || alphabetSoup[row][col - next] === " ") && locations[row][col] === 0) {
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
                            if (alphabetSoup[row][col] === " ") {
                                break;
                            } else if ((locations[row + next] === undefined || locations[row + next][col] === undefined || alphabetSoup[row + next][col] === " ") && locations[row][col] === 0) {
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
                            if (alphabetSoup[row][col] === " ") {
                                break;
                            } else if ((locations[row - next] === undefined || locations[row - next][col] === undefined || alphabetSoup[row - next][col] === " ") && locations[row][col] === 0) {
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

        return {choice, openLocations, word, direction, available, firstDirection};
    }

    // Recursively calls itself to check if a word can be placed in a position in any given direction
    function placement(parameters) {
        // Returns the next cell in a given direction
        function nextLocation(row, col) {
            switch(parameters.direction) {
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

        function writeWord() {
            var pos = getLocation(parameters.openLocations[parameters.choice]);
            for (length = 0; length < parameters.word.length; length++) {
                alphabetSoup[pos.row][pos.col] = parameters.word[length];
                pos = nextLocation(pos.row, pos.col);
            }
        }

        // Returns if a given word can be placed in a given position in a determined direction
        function canPlace() {
            var pos = getLocation(parameters.openLocations[parameters.choice]);
            for (length = 0; length < parameters.word.length; length++) {
                if (alphabetSoup[pos.row][pos.col] !== 0 && alphabetSoup[pos.row][pos.col] !== parameters.word[length]) {
                    parameters.openLocations.splice(parameters.choice, 1);
                    return false;
                }
                pos = nextLocation(pos.row, pos.col);
            }
            return true;
        }

        if (canPlace()) {
            writeWord();
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
            parameters = placeWord(parameters.word, parameters.direction, parameters.firstDirection);
            return placement(parameters);
        }
    }


    // Fills the array with random letters
    function fill() {
        function letterFill(choice, frequency) {
            var sum = 0;
            for (var index = 0; index < frequency.length; index++) {
                sum += frequency[index];
                if (sum >= choice) {
                    return constants.alphabet[index];
                }
            }
        }

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

    validate();
    var alphabetSoup = init();

    for (word = 0; word < constants.words.length; word++) {
        if (placement(placeWord(constants.words[word], undefined, undefined)) === -1) {
            return;
        }
    }
    fill();

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
