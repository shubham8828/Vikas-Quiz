let quizes = {};
let totalQuestions = null;
let startTime;

document.querySelector('#submitQ').addEventListener('click', (e) => {
    submitQuiz();
    alert();
    startTime = Date.now();  // Record the start time in milliseconds
});

// Function to fetch quiz data from API
async function fetchQuizData() {
    const loadingContainer = document.getElementById('loading-container');
    const quizContainer = document.getElementById('quiz-container');

    try {
        // Show loading bar before making the fetch request
        loadingContainer.style.display = 'block';
        quizContainer.style.display = 'none';  // Hide quiz until it's loaded

        // Simulate loading bar progress (optional)
        let progress = 0;
        const loadingInterval = setInterval(() => {
            if (progress < 70) {
                progress += 10;
                updateLoadingBar(progress);
            }
        }, 500);

        // Fetch data from the API
        const response = await fetch('http://localhost:3001/api/quizzes');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const quizData = await response.json();  // Parse the JSON response

        // Clear loading interval once data is fetched
        clearInterval(loadingInterval);
        updateLoadingBar(100);  // Complete the loading bar

        // Populate the quiz with the fetched data
        populateQuiz(quizData);
        quizes = quizData;

        // Hide the loading bar and show the quiz after data is loaded
        setTimeout(() => {
            loadingContainer.style.display = 'none';  // Hide the loading bar
            quizContainer.style.display = 'block';    // Show the quiz
        }, 500);

    } catch (error) {
        console.error('Error fetching quiz data:', error);
    }
}

// Function to update the loading bar's progress
function updateLoadingBar(progress) {
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.width = progress + '%';
}

// Function to populate the quiz HTML dynamically
function populateQuiz(quizData) {
    totalQuestions = quizData.length;
    const quizContainer = document.getElementById('quiz-container');

    quizData.forEach((item, index) => {
        const questionContainer = document.createElement('div');
        questionContainer.id = item._id;
        questionContainer.classList.add('question-container');

        // Question section
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `<div class="difficulty-circle ${item.difficulty}"></div><span>${index + 1}] </span> <span>${decodeHtmlEntities(item.question)}</span>`;

        // Option container
        const optionContainer = document.createElement('div');
        optionContainer.classList.add('option-container');
        const ul = document.createElement('ul');

        // Combine correct and incorrect answers and shuffle them
        const options = [...item.incorrect_answers, item.correct_answer];
        shuffleArray(options);

        // Create options
        options.forEach((option, i) => {
            const li = document.createElement('li');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question${index + 1}`;
            input.id = `option${index + 1}_${i + 1}`;
            input.value = option;

            const label = document.createElement('label');
            label.setAttribute('for', `option${index + 1}_${i + 1}`);
            label.textContent = decodeHtmlEntities(option);

            li.appendChild(input);
            li.appendChild(label);
            ul.appendChild(li);
        });

        optionContainer.appendChild(ul);

        // Append question and options to the main container
        questionContainer.appendChild(questionDiv);
        questionContainer.appendChild(optionContainer);
        quizContainer.appendChild(questionContainer);
    });
}

// Utility function to decode HTML entities
function decodeHtmlEntities(text) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
}

// Utility function to shuffle array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Call the fetchQuizData function to initiate quiz setup
fetchQuizData();
function submitQuiz() {
  let correctCount = 0;  // Count of correct answers
  const totalQuestions = quizes.length;
  const quizContainer = document.getElementById('quiz-container');
  
  quizes.forEach((quizItem, index) => {
      // Find the selected option for each question
      const questionId = quizItem._id;
      const selectedOption = quizContainer.querySelector(`input[name="question${index + 1}"]:checked`);

      if (selectedOption) {
          const selectedAnswer = selectedOption.value;

          // Check if the selected answer is correct
          if (selectedAnswer === quizItem.correct_answer) {
              correctCount++;  // Increment if correct
              selectedOption.parentElement.classList.add('correct');  // Highlight correct answer
          } else {
              selectedOption.parentElement.classList.add('incorrect');  // Highlight incorrect answer
          }
      }
  });

  // Calculate score as percentage
  const scorePercentage = (correctCount / totalQuestions) * 100;

  // Show result summary
  const resultContainer = document.getElementById('result-container');
  resultContainer.innerHTML = `
      <h2>Quiz Results</h2>
      <p>Correct Answers: ${correctCount} out of ${totalQuestions}</p>
      <p>Score: ${scorePercentage.toFixed(2)}%</p>
  `;

  // Show the time taken to complete the quiz if `startTime` is defined
  if (startTime) {
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);  // Time in seconds
      resultContainer.innerHTML += `<p>Time Taken: ${timeTaken} seconds</p>`;
  }

  // Display the result container (make sure it’s initially hidden in your HTML)
  resultContainer.style.display = 'block';
}
