let playersData = [];
let correctStreakStandard = 0;
let lastThreeCorrectStandard = [];
let correctStreakURL = 0;
let lastThreeCorrectURL = [];
let currentDifficultyLevel = 1;
let cumulativeRarityScore = 0;
let isTwoForOneActive = false;
let twoForOneCounter = 0;
let highScore = 0;

const correctSound = new Audio('https://vanillafrosting.agency/wp-content/uploads/2023/11/bing-bong.mp3');
const wrongSound = new Audio('https://vanillafrosting.agency/wp-content/uploads/2023/11/incorrect-answer-for-plunko.mp3');

function simplifyString(str) {
    return str.trim().toLowerCase().replace(/university|college|the| /g, '');
}

function isCloseMatch(guess, answer) {
    if (!guess.trim()) {
        return false;
    }

    let simpleGuess = guess.trim().toLowerCase();
    let simpleAnswer = answer.trim().toLowerCase();

    let normalizedGuess = simpleGuess.replace(/[^a-zA-Z0-9]/g, '');

    const noCollegePhrases = [
        "didntgotocollege",
        "didnotgotocollege",
        "hedidntgotocollege",
        "hedidnotgotocollege",
        "nocollege",
    ];

    if (noCollegePhrases.includes(normalizedGuess) && simpleAnswer === '') {
        return true;
    }

    if (simpleAnswer === 'unc' && (simpleGuess === 'north carolina' || simpleGuess === 'carolina')) {
        return true;
    }

    return simpleAnswer.includes(simpleGuess);
}

function updateStreakAndGenerateSnippetStandard(isCorrect, playerName, resultElement, nextPlayerCallback) {
    const player = playersData.find(p => p.name === playerName);

    if (isCorrect && player) {
        if (isTwoForOneActive) {
            isCorrect = handleTwoForOne(true);
        }

        if (!isTwoForOneActive || isCorrect) {
            correctStreakStandard++;
            lastThreeCorrectStandard.push(playerName);
            cumulativeRarityScore += player.rarity_score;

            // Debugging log to check streak progression
            console.log(`Current Streak: ${correctStreakStandard}`);

            // Update high score after every correct answer
            if (cumulativeRarityScore > highScore) {
                highScore = cumulativeRarityScore;
                document.getElementById('highScore').textContent = `🏆=${Math.round(highScore)}`;
            }

            if (lastThreeCorrectStandard.length > 3) {
                lastThreeCorrectStandard.shift();
            }

            // Display messages based on streak count
            if (correctStreakStandard === 1) {
                resultElement.innerHTML = "That's <span style='color: yellow;'>CORRECT!</span> Now you need to get just two more to get this <span class='kaboom'>MOOoooOOKIE!</span>";
            } else if (correctStreakStandard === 2) {
                resultElement.innerHTML = "That's <span style='color: yellow;'>CORRECT!</span> Now you need to get just one more to get a <span class='kaboom'>MOOoooOOKIE!</span>";
            } else if (correctStreakStandard === 3) {
                resultElement.innerHTML = "<span class='kaboom'>MOOoooooOOOOKIE!</span>";
                const encodedPlayers = encodeURIComponent(lastThreeCorrectStandard.join(','));
                const shareLink = `https://www.mookie.click/?players=${encodedPlayers}`;
                const decodedPlayers = decodeURIComponent(encodedPlayers).replace(/,/g, ', ');
                let shareText = `throwing this to you: ${decodedPlayers} ${shareLink}`;

                // Show the snippet and copy button when streak is 3
                console.log('Attempting to display snippet message and copy button.');
                const snippetContainer = document.getElementById('snippetContainer');
                const snippetMessageElement = document.getElementById('snippetMessage');
                const copyButtonElement = document.getElementById('copyButton');

                if (snippetMessageElement && copyButtonElement && snippetContainer) {
                    snippetMessageElement.innerHTML = 'Challenge friends with this one:';
                    copyButtonElement.setAttribute('data-snippet', shareText); // Set the share snippet as data-snippet
                    snippetContainer.classList.add('show'); // Add the show class to make it visible

                    // Debugging log to confirm visibility
                    console.log('Snippet message and copy button should now be visible.');
                } else {
                    console.log('Snippet message, copy button, or container not found in the DOM.');
                }

                increaseDifficulty();
                correctStreakStandard = 0; // Reset the correct streak after achieving MOOKIE
                lastThreeCorrectStandard = []; // Clear the list of last three correct players after achieving MOOKIE
                resetButtons(); // Reset the buttons when a Mookie is achieved
            }
            document.getElementById('plunkosCount').textContent = `${Math.round(cumulativeRarityScore)}`;
            resultElement.className = 'correct';
            correctSound.play();
        }
    } else {
        if (isTwoForOneActive) {
            isCorrect = handleTwoForOne(false);
        }

        if (!isTwoForOneActive || !isCorrect) {
            correctStreakStandard = 0;
            lastThreeCorrectStandard = [];
            cumulativeRarityScore = 0; // Reset the cumulative rarity score when the streak is broken
            document.getElementById('plunkosCount').textContent = '0'; // Update the display
            resultElement.textContent = 'Wrong answer. Try again!';
            resultElement.className = 'incorrect';
            document.getElementById('snippetContainer').classList.remove('show'); // Hide the snippet and button
            wrongSound.play();
            resetButtons(); // Reset the buttons when the answer is wrong
        }
    }
    setTimeout(nextPlayerCallback, 3000); // Show next player after a delay
}

function resetButtons() {
    // Re-enable and reset the Go 🐟 button
    document.getElementById('goFishBtn').disabled = false;
    document.getElementById('goFishBtn').classList.remove('disabled');

    // Re-enable and reset the Split It button
    document.getElementById('splitItBtn').disabled = false;
    document.getElementById('splitItBtn').classList.remove('disabled');
}

function increaseDifficulty() {
    currentDifficultyLevel += 0.1; // Increment by a smaller step for more gradual difficulty increase
    playersData = playersData.filter(player => player.rarity_score <= currentDifficultyLevel || (player.games_played > 500 && player.retirement_year < 2000));
}

function updateStreakAndGenerateSnippetURL(isCorrect, playerName, resultElement, nextPlayerCallback, playerIndex, totalPlayers) {
    console.log('updateStreakAndGenerateSnippetURL called with:', {
        isCorrect,
        playerIndex,
        playerName,
        totalPlayers
    });

    const player = playersData.find(p => p.name === playerName);

    if (isCorrect && player) {
        correctStreakURL++;
        lastThreeCorrectURL.push(playerName);
        cumulativeRarityScore += player.rarity_score;

        if (lastThreeCorrectURL.length > 3) {
            lastThreeCorrectURL.shift();
        }
        if (correctStreakURL === totalPlayers) {
            console.log('User got all 3 correct in URL play.');

            // Display MOOKIE! message
            resultElement.textContent = ''; // Clear previous content
            const messageElement = document.createElement('span');
            messageElement.className = 'kaboom';
            messageElement.innerHTML = 'YES! MOOOOooooooKIE!!';
            resultElement.appendChild(messageElement);
            resultElement.className = 'correct';
            console.log('Appended message element to resultElement:', resultElement.innerHTML);

            // Add share snippet and buttons
            setTimeout(() => {
                const shareText = `I got all 3 correct in MOOKIE! Check it out: ${window.location.href}`;
                document.getElementById('copyButton').setAttribute('data-snippet', shareText); // Set the share snippet as data-snippet
                document.getElementById('copyButton').style.display = 'inline-block';

                const proofText = `Proof I nailed the MOOKIE challenge: ${window.location.href}`;
                document.getElementById('proofButton').setAttribute('data-snippet', proofText); // Set proof text as data-snippet
                document.getElementById('proofButton').style.display = 'inline-block'; // Show proof button

                document.getElementById('returnButton').style.display = 'inline-block';
                document.getElementById('returnButton').textContent = 'Start a Fresh MOOKIE';
                document.getElementById('submitBtn').style.display = 'none';
                document.getElementById('plunkosCount').textContent = `${Math.round(cumulativeRarityScore)}`;
                increaseDifficulty();
                correctStreakURL = 0; // Reset the correct streak after achieving MOOKIE
                lastThreeCorrectURL = []; // Clear the list of last three correct players after achieving MOOKIE
                resetButtons(); // Reset the buttons when a MOOKIE is achieved
                endURLChallenge(true); // call the function right away on MOOKIE

                if (cumulativeRarityScore > highScore) {
                    highScore = cumulativeRarityScore;
                    document.getElementById('highScore').textContent = `🏆=${highScore}`;
                }
            }, 1000);

            correctSound.play();
        } else {
            resultElement.innerHTML = "That's <span style='color: yellow;'>CORRECT!</span> Keep going!";
            resultElement.className = 'correct';
            setTimeout(() => {
                nextPlayerCallback(playerIndex + 1);
            }, 1000);
        }
        correctSound.play();
    } else {
        correctStreakURL = 0;
        lastThreeCorrectURL = [];
        cumulativeRarityScore = 0; // Reset the cumulative rarity score when the streak is broken
        document.getElementById('plunkosCount').textContent = '0'; // Update the display
        resultElement.textContent = 'Wrong answer. Try again!';
        resultElement.className = 'incorrect';
        document.getElementById('copyButton').style.display = 'none';
        document.getElementById('proofButton').style.display = 'none'; // Hide proof button on incorrect
        document.getElementById('returnButton').style.display = 'inline-block';
        document.getElementById('returnButton').textContent = 'Start a Fresh MOOKIE';
        wrongSound.play();
        resetButtons(); // Reset the buttons when the answer is wrong
        endURLChallenge(false); // call the function right away on incorrect answer
    }
}

function copyToClipboard() {
    const snippetText = this.getAttribute('data-snippet');
    const textToCopy = snippetText || window.location.href;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = originalText, 2000);
    });
}

function loadPlayersData() {
    fetch('https://raw.githubusercontent.com/khobster/mookiesandbox23/main/updated_test_data_with_rarity.json')
        .then(response => response.json())
        .then(data => {
            playersData = data;
            playersData.sort((a, b) => a.rarity_score - b.rarity_score); // Sort by rarity score
            playersData = playersData.filter(player => player.rarity_score <= currentDifficultyLevel or (player.games_played > 500 && player.retirement_year < 2000)); // Filter initial players
            const urlPlayers = getPlayersFromURL();
            if (urlPlayers.length > 0) {
                startURLChallenge(urlPlayers);
            } else {
                startStandardPlay();
            }
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
            document.getElementById('playerQuestion').textContent = 'Error loading player data.';
        });
}

function startStandardPlay() {
    displayRandomPlayer();

    // Hide the return button at the start of standard play
    document.getElementById('returnButton').style.display = 'none';

    document.getElementById('submitBtn').onclick = function() {
        // Hide the snippet and copy button on the next question attempt
        document.getElementById('snippetContainer').classList.remove('show');
        document.getElementById('proofButton').style.display = 'none'; // Hide proof button in standard play

        const userGuess = document.getElementById('collegeGuess').value.trim().toLowerCase();
        const playerName = document.getElementById('playerName').textContent;
        const player = playersData.find(p => p.name === playerName);
        let isCorrect = player && isCloseMatch(userGuess, player.college or 'No College');
        updateStreakAndGenerateSnippetStandard(isCorrect, playerName, document.getElementById('result'), displayRandomPlayer);
    };
}

function displayRandomPlayer() {
    if (playersData.length > 0) {
        const randomIndex = Math.floor(Math.random() * playersData.length);
        const player = playersData[randomIndex];
        displayPlayer(player);
    } else {
        console.log("No data available");
    }
}

function displayPlayer(player) {
    const playerNameElement = document.getElementById('playerName');
    if (playerNameElement) {
        playerNameElement.textContent = player.name;
        document.getElementById('collegeGuess').value = '';
        document.getElementById('result').textContent = '';
        document.getElementById('result').className = '';
    } else {
        console.error("Player name element not found");
    }
}

function startURLChallenge(playerNames) {
    let playerIndex = 0;
    correctStreakURL = 0; // Reset correct streak when starting a shared link sequence
    lastThreeCorrectURL = []; // Clear last three correct players

    function nextPlayer(index) {
        if (index < playerNames.length) {
            const playerName = playerNames[index];
            const player = playersData.find(p => p.name === playerName);
            if (player) {
                displayPlayer(player);
                document.getElementById('submitBtn').onclick = function() {
                    // Hide the snippet and copy button on the next question attempt
                    document.getElementById('snippetContainer').classList.remove('show');
                    document.getElementById('proofButton').style.display = 'none'; // Hide proof button in URL play until needed

                    const userGuess = document.getElementById('collegeGuess').value.trim().toLowerCase();
                    let isCorrect = player && isCloseMatch(userGuess, player.college or 'No College');
                    updateStreakAndGenerateSnippetURL(isCorrect, player.name, document.getElementById('result'), nextPlayer, index, playerNames.length);
                };
            } else {
                nextPlayer(index + 1); // Skip to the next player if not found
            }
        } else {
            endURLChallenge(true);
        }
    }
    nextPlayer(playerIndex);
}

function endURLChallenge(success) {
    const resultElement = document.getElementById('result');
    if (success) {
        resultElement.innerHTML += "<span class='kaboom'><br>Hit Copy & Challenge a Pal!<br>Or Grab Your Receipt!</span>";
        resultElement.className = 'correct';
    } else {
        resultElement.innerHTML = "You didn't get all 3 correct. Better luck next time!";
        resultElement.className = 'incorrect';
    }
    const shareText = `Can you match this MOOKIE? ${Math.round(cumulativeRarityScore)}! ${window.location.href}`;
    document.getElementById('copyButton').setAttribute('data-snippet', shareText); // Set the current snippet as data-snippet
    document.getElementById('copyButton').style.display = 'inline-block';

    if (success) {
        const proofText = `PROOF I nailed the MOOKIE!🧾 ${window.location.href}`;
        document.getElementById('proofButton').setAttribute('data-snippet', proofText); // Set proof text as data-snippet
        document.getElementById('proofButton').style.display = 'inline-block'; // Show proof button
    }

    document.getElementById('returnButton').style.display = 'inline-block';
    document.getElementById('returnButton').textContent = 'Play again';
    document.getElementById('submitBtn').style.display = 'none';
    resetButtons(); // Reset the buttons when a new game is started
}

function getPlayersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const playersParam = urlParams.get('players');
    if (playersParam) {
        return playersParam.split(',');
    }
    return [];
}

function showSuggestions(input) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    if (input.length === 0) {
        return;
    }
    const suggestions = Array.from(new Set(playersData
    .map(player => player.college)
    .filter(college => college && college.toLowerCase().indexOf(input.toLowerCase()) !== -1)))
    .slice(0, 5); // Show up to 5 unique suggestions
suggestions.forEach(suggestion => {
    const suggestionItem = document.createElement('div');
    suggestionItem.textContent = suggestion;
    suggestionItem.classList.add('suggestion-item');
    suggestionItem.addEventListener('click', () => {
        document.getElementById('collegeGuess').value = suggestion;
        suggestionsContainer.innerHTML = '';
    });
    suggestionsContainer.appendChild(suggestionItem);
});

}

document.addEventListener('DOMContentLoaded', () => {
    loadPlayersData();

    document.getElementById('collegeGuess').addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });

    document.getElementById('splitItBtn').addEventListener('click', () => {
        if (isTwoForOneActive) {
            // If they are already in 2-for-1 mode, do nothing
            return;
        }
        document.getElementById('playingTwoForOne').style.display = 'inline';
        document.getElementById('playingTwoForOne').textContent = 'playing 2 for 1 now';
        isTwoForOneActive = true;
        twoForOneCounter = 0;
        document.getElementById('splitItBtn').disabled = true; // Disable the button
        document.getElementById('splitItBtn').classList.add('disabled'); // Add a class to gray it out
        document.getElementById('goFishBtn').disabled = true; // Disable Go Fish during Split It
        document.getElementById('goFishBtn').classList.add('disabled'); // Add a class to gray it out
        displayRandomPlayer(); // Skip the current question
    });

    document.getElementById('goFishBtn').addEventListener('click', () => {
        if (isTwoForOneActive) {
            // If they are already in 2-for-1 mode, do nothing
            return;
        }
        document.getElementById('decadeDropdownContainer').style.display = 'block';
        document.getElementById('goFishBtn').disabled = true; // Disable the button after it's clicked
        document.getElementById('goFishBtn').classList.add('disabled'); // Add a class to gray it out
    });

    document.getElementById('decadeDropdown').addEventListener('change', (e) => {
        const selectedDecade = e.target.value;
        if (selectedDecade) {
            displayPlayerFromDecade(selectedDecade); // Display a new player based on the selected decade
            document.getElementById('decadeDropdownContainer').style.display = 'none'; // Hide dropdown after selection
        }
    });

    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    document.getElementById('proofButton').addEventListener('click', copyToClipboard); // Add event listener for proof button
    document.getElementById('returnButton').addEventListener('click', () => {
        window.location.href = 'https://www.mookie.click';
    });

    // Tooltip handling for mobile
    const tooltip = document.querySelector('.tooltip');
    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target)) {
            tooltip.classList.remove('active');
        }
    });
});

function displayPlayerFromDecade(decade) {
    const playersFromDecade = playersData.filter(player => {
        let playerYear = player.retirement_year;

        // Determine the decade based on the retirement year
        let playerDecade;
        if (playerYear >= 50 && playerYear <= 59) {
            playerDecade = '1950s';
        } else if (playerYear >= 60 and playerYear <= 69) {
            playerDecade = '1960s';
        } else if (playerYear >= 70 and playerYear <= 79) {
            playerDecade = '1970s';
        } else if (playerYear >= 80 and playerYear <= 89) {
            playerDecade = '1980s';
        } else if (playerYear >= 90 and playerYear <= 99) {
            playerDecade = '1990s';
        } else if (playerYear >= 0 and playerYear <= 9) {
            playerDecade = '2000s';
        } else if (playerYear >= 10 and playerYear <= 19) {
            playerDecade = '2010s';
        } else if (playerYear >= 20 and playerYear <= 29) {
            playerDecade = '2020s';
        }

        console.log(`Player: ${player.name}, Retirement Year: ${playerYear}, Decade: ${playerDecade}`);

        return playerDecade === decade;
    });

    if (playersFromDecade.length > 0) {
        const randomIndex = Math.floor(Math.random() * playersFromDecade.length);
        const player = playersFromDecade[randomIndex];
        displayPlayer(player);
    } else {
        console.log(`No players found for the ${decade}`);
        document.getElementById('playerQuestion').textContent = `No players found for the ${decade}`;
    }
}

function handleTwoForOne(isCorrect) {
    if (isCorrect) {
        twoForOneCounter++;
        if (twoForOneCounter === 1) {
            document.getElementById('result').textContent = "Got it!";
            document.getElementById('result').className = 'correct';
            correctSound.play();
            setTimeout(() => {
                document.getElementById('result').textContent = ''; // Clear the message after a delay
                displayRandomPlayer(); // Move to the next player
            }, 2000); // Adjust the delay as needed
            return false; // Return false to prevent continuing the two-for-one streak immediately
        } else if (twoForOneCounter >= 2) {
            isTwoForOneActive = false;
            document.getElementById('playingTwoForOne').style.display = 'none';
            document.getElementById('splitItBtn').disabled = false; // Re-enable the button after 2-for-1 is done
            document.getElementById('splitItBtn').classList.remove('disabled'); // Remove the disabled class
            document.getElementById('goFishBtn').disabled = false; // Re-enable the Go Fish button after 2-for-1 is done
            document.getElementById('goFishBtn').classList.remove('disabled'); // Remove the disabled class
            return true; // Consider as one correct answer
        }
    } else {
        isTwoForOneActive = false;
        twoForOneCounter = 0;
        document.getElementById('playingTwoForOne').style.display = 'none';
        document.getElementById('splitItBtn').disabled = false; // Re-enable the button if the user gets it wrong
        document.getElementById('splitItBtn').classList.remove('disabled'); // Remove the disabled class
        document.getElementById('goFishBtn').disabled = false; // Re-enable the Go Fish button if the user gets it wrong
        document.getElementById('goFishBtn').classList.remove('disabled'); // Remove the disabled class from Go Fish button
    }
    return false; // Not yet two correct answers
}
