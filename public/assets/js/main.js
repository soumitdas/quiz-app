(function (document) {
  const SCORE_PER_QUESTION = 1;

  let questions = [];
  let currentQuestionNumber = 0;
  let selectedAnswers = {};

  const startButton = document.getElementById("start-btn");
  const mainContainer = document.getElementById("main");
  let questionContainer, prevButton, nextButton;

  function getRadioSelectedValue(keyName) {
    const checkedRadio = document.querySelector(
      `input[name="${keyName}"]:checked`
    );
    if (!checkedRadio) return "";
    return checkedRadio.value;
  }

  function renderOptions(options, selectedAnswerId) {
    if (!Array.isArray(options)) return "";
    const template = options
      .map(
        (eachOption) => `<li>
        <label class="quiz__option">
            <input type="radio" name="option" value="${eachOption.id}" ${
          selectedAnswerId == eachOption.id ? "checked" : ""
        } />
            ${eachOption.value}
        </label>
    </li>`
      )
      .join("\n");
    return template;
  }

  function renderQuestion({ question, options } = {}, selectedAnswerId) {
    const template = `
            <h1 class="quiz__question">${question}</h1>
            <ol class="quiz__options">
              ${renderOptions(options, selectedAnswerId)}
            </ol>`;
    return template;
  }

  function renderQuizSection() {
    const template = `
    <section class="quiz-section">
        <div class="container">
          <div id="question">
            <div class="line"></div>
            <div class="quiz__options">
              <div class="line" style="width: 50%;"></div>
              <div class="line" style="width: 50%;"></div>
              <div class="line" style="width: 50%;"></div>
              <div class="line" style="width: 50%;"></div>
            </div>
          </div>
          <nav class="question_navigation">
            <button id="prev-btn" class="btn btn-primary">Previous</button>
            <button id="next-btn" class="btn btn-primary">Next</button>
          </nav>
        </div>
      </section>`;
    return template;
  }

  function renderResult(loading, score) {
    const template = `
    <section class="quiz__result">
        ${
          loading
            ? `<div class="line" style="width: 50%;"></div>`
            : `<svg
            class="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#fff"
            viewBox="0 0 54 54"
            width="100"
          >
            <path
              className="checkmark__check"
              fill="none"
              strokeWidth="5"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
          <h2 class="quiz__score">Score: ${score}</h2>
        <button id="start-btn" class="btn btn-primary btn-lg" onclick="window.location.reload()">Restart</button>`
        }
    </section>`;
    return template;
  }

  function setPrevAndNextBtn() {
    if (questions.length === 0) {
      nextButton.setAttribute("disabled", "true");
    } else {
      nextButton.removeAttribute("disabled");
    }

    if (currentQuestionNumber === questions.length - 1) {
      nextButton.innerText = "Submit";
    } else {
      nextButton.innerText = "Next";
    }
    if (currentQuestionNumber === 0) {
      prevButton.setAttribute("disabled", "true");
    } else {
      prevButton.removeAttribute("disabled");
    }
  }

  function calculateResult(answers, selectedOptions) {
    const score = answers.reduce(
      (acc, curr) =>
        selectedOptions[curr.questionId] == curr.answerOptionId
          ? acc + SCORE_PER_QUESTION
          : acc,
      0
    );
    return score;
  }

  function main() {
    startButton.onclick = function () {
      mainContainer.innerHTML = renderQuizSection();
      questionContainer = document.getElementById("question");
      fetch("./data/questions.json")
        .then((r) => r.json())
        .then((data) => {
          questions = data;
          questionContainer.innerHTML = renderQuestion(
            questions[currentQuestionNumber]
          );
          setPrevAndNextBtn();
        });
      prevButton = document.getElementById("prev-btn");
      nextButton = document.getElementById("next-btn");
      setPrevAndNextBtn();

      nextButton.onclick = function () {
        if (currentQuestionNumber < questions.length - 1) {
          const selectedAnswerId = getRadioSelectedValue("option");
          selectedAnswers[questions[currentQuestionNumber].id] =
            selectedAnswerId;
          currentQuestionNumber++;
          questionContainer.innerHTML = renderQuestion(
            questions[currentQuestionNumber],
            selectedAnswers[questions[currentQuestionNumber].id]
          );
          setPrevAndNextBtn();
        } else {
          const selectedAnswerId = getRadioSelectedValue("option");
          selectedAnswers[questions[currentQuestionNumber].id] =
            selectedAnswerId;
          mainContainer.innerHTML = renderResult(true);
          fetch("./data/answers.json")
            .then((r) => r.json())
            .then((data) => {
              const score = calculateResult(data, selectedAnswers);
              mainContainer.innerHTML = renderResult(false, score);
            });
        }
      };
      prevButton.onclick = function () {
        if (currentQuestionNumber > 0) {
          const selectedAnswerId = getRadioSelectedValue("option");
          selectedAnswers[questions[currentQuestionNumber].id] =
            selectedAnswerId;
          currentQuestionNumber--;
          questionContainer.innerHTML = renderQuestion(
            questions[currentQuestionNumber],
            selectedAnswers[questions[currentQuestionNumber].id]
          );
          setPrevAndNextBtn();
        }
      };
    };
  }

  document.addEventListener("DOMContentLoaded", main);
})(window.document);
