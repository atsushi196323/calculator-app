const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const themeToggle = document.getElementById("themeToggle");

let currentValue = "";
let previousValue = "";
let operator = "";

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.getAttribute("data-value");

    if (!isNaN(value) || value === ".") {
      // 数字または小数点の処理
      if (currentValue === "ERR") currentValue = ""; // エラー時リセット

      if (currentValue === "0" && value === "0") {
        return; // 既に "0" の場合は無視
      }

      if (currentValue === "0" && value !== ".") {
        // 先頭が "0" で、数字入力の場合は置き換える
        currentValue = value;
      } else if (value === ".") {
        if (currentValue === "") {
          currentValue = "0."; // 空の場合は "0." にする
        } else if (!currentValue.includes(".")) {
          currentValue += "."; // 小数点がなければ追加
        }
      } else if (currentValue.length < 8) {
        currentValue += value; // 数字を追加
      }
      updateDisplay(currentValue);
    } else if (value === "C") {
      currentValue = "";
      updateDisplay("0");
    } else if (value === "AC") {
      resetCalculator();
    } else if (value === "=") {
      handleEquals();
    } else {
      if (value !== "=" && currentValue) {
        if (previousValue) {
          previousValue = calculate(
            previousValue,
            currentValue,
            operator
          ).toString();
          currentValue = "";
          operator = value;
          updateDisplay(`${previousValue} ${value}`);
        } else {
          previousValue = currentValue;
          currentValue = "";
          operator = value;
          updateDisplay(`${previousValue} ${value}`);
        }
      }
    }
    if (voiceEnabled) {
      speak(getVoiceText(value));
    }
  });
});

function updateDisplay(value) {
  if (value === "ERR") {
    display.style.color = "red";
  } else {
    display.style.color = "white";
  }
  display.textContent = value !== undefined && value !== null ? value : "0";
}

function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);

  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "x":
    case "*":
      return a * b;
    case "÷":
    case "/":
      return b !== 0 ? a / b : "ERR";
    default:
      throw new Error(`Unsupported operator ${op}`);
  }
}

function validateResult(result) {
  if (result === "ERR") return "ERR";

  const MAX_DIGITS = 8;
  const resultString = result.toString();

  if (resultString.length > MAX_DIGITS) {
    return parseFloat(result).toPrecision(MAX_DIGITS);
  }
  return result;
}

function resetCalculator() {
  currentValue = "";
  previousValue = "";
  operator = "";
  updateDisplay("0");
}

function handleEquals() {
  if (previousValue && operator) {
    const result = validateResult(
      calculate(previousValue, currentValue, operator)
    );
    const expression = `${previousValue} ${operator} ${currentValue}`;
    addToHistory(expression, result);
    updateDisplay(result);
    currentValue = result !== "ERR" ? result.toString() : "";
    previousValue = "";
    operator = "";
  }
}

function getVoiceText(value) {
  switch (value) {
    case "+":
      return "足す";
    case "-":
      return "引く";
    case "x":
    case "*":
      return "かける";
    case "÷":
    case "/":
      return "わる";
    case ".":
      return "てん";
    case "=":
      return "イコール";
    case "C":
      return "クリア";
    case "AC":
      return "オールクリア";
    case "ERR":
      return "エラー";
    default:
      return value; // 数字や記号はそのまま
  }
}

let voiceEnabled = true;
const voiceToggle = document.getElementById("voiceToggle");

voiceToggle.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.textContent = voiceEnabled ? "Voice: On" : "Voice: Off";
});

function speak(text) {
  if (voiceEnabled) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}

function addToHistory(expression, result) {
  const history = document.getElementById("history");
  if (!history) return;
  const entry = document.createElement("li");
  entry.textContent = `${expression} = ${result}`;
  history.appendChild(entry);
}

// テーマ切り替え
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDarkTheme = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
});

// ページロード時にテーマを適用
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
});

// 初期化
resetCalculator();
