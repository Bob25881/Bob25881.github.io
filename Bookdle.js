// Main function
async function main(booksData) {
    // Function to render the list of titles based on the search query
    function renderTitles(searchQuery) {
        // Clear previous list if searchQuery is empty
        if (searchQuery === '') {
            const titlesList = document.getElementById('titlesList');
            titlesList.innerHTML = '';
            return;
        }

        // Clear previous list
        const titlesList = document.getElementById('titlesList');
        titlesList.innerHTML = '';

        // Filter titles based on search query
        const filteredTitles = booksData.filter(book => book.Title.toLowerCase().startsWith(searchQuery.toLowerCase()));

        // Render filtered titles
        filteredTitles.forEach(book => {
            const li = document.createElement('li');
            li.textContent = book.Title;
            titlesList.appendChild(li);
        });
    }

    // Event listener for input field
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.trim();
        renderTitles(searchQuery);
    });

    // A function to cut out a certain percentage of the words in the summary. Do not cut out any special characters or spaces. Replace all un-cut out letters with a _
    function summaryCutOut(percentage, summary) {
        let words = summary.split(" ");
        let newSummary = "";

        for (let i = 0; i < words.length; i++) {
            if (Math.random() < percentage / 100) { // Randomly reveal a certain percentage of words
                newSummary += words[i] + " ";
            } else {
                // Replace the word with underscores, keeping special characters and spaces intact
                let underscoredWord = "";
                for (let j = 0; j < words[i].length; j++) {
                    if ((words[i][j] >= "a" && words[i][j] <= "z") || (words[i][j] >= "A" && words[i][j] <= "Z")) {
                        underscoredWord += "_";
                    } else {
                        underscoredWord += words[i][j];
                    }
                }
                newSummary += underscoredWord + " ";
            }
        }

        return newSummary.trim();
    }

    // Update the summary display
    function updateSummary(summary) {
        document.getElementById("summary").innerHTML = summary;
    }

    // If it's correct, do a congratulations message and end, if it's wrong, do a wrong message and continue.
    function congratulationsMessage(guessCount, title, guess) {
        if (guess.toLowerCase() === title.toLowerCase()) {
            document.getElementById("congratulationsMessage").innerHTML = (`Congratulations! You're correct! The answer was ${title} and you guessed it in ${guessCount} guess/guesses!`);
            return true;
        } else {
            if (guessCount === 10) {
                alert(`Sorry, your answer of ${guess} was incorrect. You have 0 guesses remaining. The correct answer was ${title}. Play again!`);
            } else {
                alert(`Sorry, your answer of ${guess} was incorrect. You have ${10 - guessCount} guesses remaining. Try again!`);
            }
            return false;
        }
    }

    // Randomly select one row from the list that contains all of the specifications.
    let randomRow = booksData[Math.floor(Math.random() * booksData.length)];
    while (randomRow.Summary === null) {
        randomRow = booksData[Math.floor(Math.random() * booksData.length)];
    }
    const randomSummary = randomRow.Summary;
    const title = randomRow.Title;

    // Cut out a random 10% of the words in the summary and print the results.
    let originalCutUpSummary = summaryCutOut(10, randomSummary);
    let guessCount = 0;

    // ask the user to input their guess
    function guessInput() {
        return new Promise(resolve => {
            let guessForm = document.getElementById("guessForm");
            guessForm.addEventListener("submit", (e) => {
                e.preventDefault();
                let guess = document.getElementById("guess").value;
                // Remove the event listener to prevent multiple submissions
                guessForm.removeEventListener("submit", submitHandler);
                // Resolve with the guess value
                resolve(guess);
            });
            // Define the submit handler
            function submitHandler(e) {
                e.preventDefault();
            }
        });
    }

    // Start the game loop
    while (guessCount < 10) {
        if (guessCount >= 3) {
            document.getElementById("publicationDateHint").innerHTML = (`\nHint: The publication date of this novel is ${randomRow.PublicationDate}`);
        }
        if (guessCount >= 5) {
            document.getElementById("genre/genresHint").innerHTML = (`\nHint: The genre/genres of this novel is ${randomRow["Genre/Genres"]}`);
        }
        if (guessCount >= 8) {
            document.getElementById("authorHint").innerHTML = (`\nHint: The author of this novel is ${randomRow.Author}`);
        }
        updateSummary(originalCutUpSummary); // Update the summary with the current cut-up summary

        // ask the user to input their guess
        const guess = await guessInput();

        // Count Guesses
        guessCount++;

        // If it's correct, do a congratulations message and end, if it's wrong, do a wrong message and continue.
        const didWin = congratulationsMessage(guessCount, title, guess);
        if (!didWin && guessCount < 10) {
            // Increase the percentage of revealed words by 10%
            const newPercentage = 10 + (10 * guessCount);
            originalCutUpSummary = summaryCutOut(newPercentage, randomSummary);
        } else {
            break; // Exit loop if the game ends
        }
    }
}

// Declare a single array to hold data from both CSV files
const booksData = [];

// Fetch both CSV files simultaneously
Promise.all([
    fetch('Books(1).csv'),
    fetch('Books(2).csv')
])
    .then(responses => Promise.all(responses.map(response => response.text())))
    .then(csvDataArray => {
        // Parse each CSV data and push it into the booksData array
        csvDataArray.forEach(csvData => {
            const rows = csvData.split('\n');
            const headers = rows[0].split(',');

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',');
                if (values.length === headers.length) {
                    const book = {};
                    for (let j = 0; j < headers.length; j++) {
                        book[headers[j]] = values[j];
                    }
                    booksData.push(book);
                }
            }
        });

        // Call the main function with the combined booksData array
        main(booksData);
    })
    .catch(error => console.error('Error fetching or parsing CSV:', error));

    // scrollbar color dark
    // dont make it so have to reload the page to play again
    // dont make the you got it wrong thingie alerts
    // congratulations message modal with play again button
    // make the inputs vanish after submit is pressed.
    // make a mobile version
