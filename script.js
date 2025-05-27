document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            const imageGrid = document.getElementById('imageGrid');
            const congratulationsMessage = document.getElementById('congratulationsMessage');
            const restartButton = document.getElementById('restartButton');

            // Define the image data with pairs
            // Each object has an id, src, alt text, and a 'match' property
            // The 'match' property links to the id of its correct partner.
            const imageData = [
                { id: 'rye', src: 'rye.jpeg', alt: 'rye', match: 'pie' },
                { id: 'pie', src: 'pie.jpeg', alt: 'pie', match: 'rye' },
                { id: 'cat', src: 'cat.jpeg', alt: 'cat', match: 'hat' },
                { id: 'hat', src: 'hat.jpeg', alt: 'hat', match: 'cat' },
                { id: 'money', src: 'money.jpeg', alt: 'money', match: 'honey' },
                { id: 'honey', src: 'honey.jpeg', alt: 'honey', match: 'money' },
                { id: 'sing', src: 'sing.jpeg', alt: 'sing', match: 'king' },
                { id: 'king', src: 'king.jpeg', alt: 'king', match: 'sing' },
            ];

            let selectedCard = null; // Stores the first selected image card element
            let matchedPairs = new Set(); // Stores IDs of images that have been successfully matched
            let lines = []; // Stores objects { startId, endId } for drawing lines

            /**
             * Shuffles an array in place using the Fisher-Yates algorithm.
             * @param {Array} array - The array to shuffle.
             */
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
                }
            }

            /**
             * Resizes the canvas to match the game container's dimensions.
             * This ensures lines are drawn correctly even if the window is resized.
             */
            function resizeCanvas() {
                const gameContainer = document.querySelector('.game-container');
                canvas.width = gameContainer.offsetWidth;
                canvas.height = gameContainer.offsetHeight;
                redrawLines(); // Redraw lines after resizing
            }

            /**
             * Draws a line on the canvas between the centers of two image cards.
             * @param {HTMLElement} card1 - The first image card element.
             * @param {HTMLElement} card2 - The second image card element.
             */
            function drawLine(card1, card2) {
                const rect1 = card1.getBoundingClientRect();
                const rect2 = card2.getBoundingClientRect();
                const gameContainerRect = document.querySelector('.game-container').getBoundingClientRect();

                // Calculate center points relative to the canvas (which is relative to game-container)
                const startX = rect1.left + rect1.width / 2 - gameContainerRect.left;
                const startY = rect1.top + rect1.height / 2 - gameContainerRect.top;
                const endX = rect2.left + rect2.width / 2 - gameContainerRect.left;
                const endY = rect2.top + rect2.height / 2 - gameContainerRect.top;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#3F51B5'; // Blue color for lines
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            /**
             * Clears the entire canvas.
             */
            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            /**
             * Redraws all stored lines on the canvas.
             * This is called after canvas resize or initial load.
             */
            function redrawLines() {
                clearCanvas();
                lines.forEach(line => {
                    const card1 = document.getElementById(line.startId);
                    const card2 = document.getElementById(line.endId);
                    if (card1 && card2) {
                        drawLine(card1, card2);
                    }
                });
            }

            /**
             * Displays the congratulations message.
             */
            function showCongratulations() {
                congratulationsMessage.classList.add('show');
            }

            /**
             * Hides the congratulations message and resets the game.
             */
            function hideCongratulations() {
                congratulationsMessage.classList.remove('show');
                resetGame();
            }

            /**
             * Handles the click event on an image card.
             * @param {Event} event - The click event.
             */
            function handleCardClick(event) {
                const clickedCard = event.currentTarget;
                const clickedId = clickedCard.dataset.id;
                const clickedMatch = clickedCard.dataset.match;

                // Do nothing if the card is already matched
                if (matchedPairs.has(clickedId)) {
                    return;
                }

                if (!selectedCard) {
                    // First card selected
                    selectedCard = clickedCard;
                    selectedCard.classList.add('selected');
                } else if (selectedCard === clickedCard) {
                    // Clicking the same card again deselects it
                    selectedCard.classList.remove('selected');
                    selectedCard = null;
                } else {
                    // Second card selected
                    const selectedId = selectedCard.dataset.id;
                    const selectedMatch = selectedCard.dataset.match;

                    // Check for a correct match
                    if (clickedId === selectedMatch && selectedId === clickedMatch) {
                        // Correct match!
                        clickedCard.classList.add('matched');
                        selectedCard.classList.add('matched');

                        // Add both IDs to matchedPairs to prevent further interaction
                        matchedPairs.add(clickedId);
                        matchedPairs.add(selectedId);

                        // Store line information
                        lines.push({ startId: selectedId, endId: clickedId });
                        redrawLines(); // Redraw all lines including the new one

                        selectedCard.classList.remove('selected'); // Deselect the first card
                        selectedCard = null; // Reset selection

                        // Check if all pairs are matched
                        if (matchedPairs.size === imageData.length) {
                            showCongratulations();
                        }
                    } else {
                        // Incorrect match - deselect both after a short delay
                        selectedCard.classList.remove('selected');
                        selectedCard = null;
                        // Optionally, add a visual feedback for incorrect match
                        clickedCard.classList.add('incorrect');
                        setTimeout(() => {
                            clickedCard.classList.remove('incorrect');
                        }, 500);
                    }
                }
            }

            /**
             * Initializes the game by shuffling images, creating cards, and setting up event listeners.
             */
            function initializeGame() {
                // Clear previous game state
                imageGrid.innerHTML = '';
                selectedCard = null;
                matchedPairs.clear();
                lines = [];
                clearCanvas();

                // Shuffle the image data to randomize card positions
                shuffleArray(imageData);

                // Create image cards and append to the grid
                imageData.forEach(item => {
                    const card = document.createElement('div');
                    card.classList.add('image-card');
                    card.dataset.id = item.id; // Store original ID
                    card.dataset.match = item.match; // Store its match ID

                    const img = document.createElement('img');
                    img.src = item.src;
                    img.alt = item.alt;

                    card.appendChild(img);
                    card.addEventListener('click', handleCardClick);
                    imageGrid.appendChild(card);
                });

                // Set canvas size initially and on window resize
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
            }

            /**
             * Resets the game to its initial state.
             */
            function resetGame() {
                initializeGame();
            }

            // Event listener for the "Play Again" button
            restartButton.addEventListener('click', hideCongratulations);

            // Start the game when the page loads
            initializeGame();
        });
