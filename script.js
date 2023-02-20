const BUTTONS = document.querySelectorAll('button')
const RESULT_INP = document.querySelector('.action-inp')
const HISTORY_INP = document.querySelector('.history-inp')
let pressedBtn;
let operand1 = "";
let operand2 = "";
let operator = "";
let isCalculated = false;

// Events after button click
BUTTONS.forEach((btn) => {
    const dataType = btn.getAttribute('data-type')
    btn.addEventListener('click', function (e) {
        e.preventDefault()
        setAction(dataType, btn)
    })

    btn.addEventListener("mousedown", () => {
        btn.classList.add('pressed')
        pressedBtn = btn
    })
})

// Events after keydown
window.addEventListener('keydown', function (e) {
    if (document.querySelector(`button[value="${e.key}"]`) !== null) {
        const btn = document.querySelector(`button[value="${e.key}"]`)
        const dataType = btn.getAttribute('data-type')
        setAction(dataType, btn)
        btn.classList.add('pressed')
        pressedBtn = btn
    }
})

// Set action after interaction with buttons
function setAction(dataType, btn) {
    switch (dataType) {
        case "number":
            operandConstructor(btn);
            break;
        case "operation":
            setOperator(btn)
            break;
        case "result":
            calculation()
            break;
        case "percent":
            getPercent()
            break;
        case "backspace":
            backspace()
            break;
        case "clean":
            cleanCalculator()
            break;
        case "clean-entry":
            cleanEntry()
            break;
        case "negate":
            negateNumber()
            break;
        case "num-action":
            singleNumAction(btn)
            break;
    }
}

// Set or get current operand
function manageOperand(action, value) {
    switch (action) {
        case 'get':
            return (operator === "") ? operand1 : operand2;
        case 'set':
            value = value.toString()
            if (operator === "") operand1 = value
            else operand2 = value
            break;
    }
}

// Creating operands
function operandConstructor(btn) {
    if (isCalculated) cleanCalculator()
    let key = btn.value
    let currentOperand = manageOperand('get')

    if((currentOperand.charAt(0) === "-" && currentOperand.length >= 13) ||
     (currentOperand.charAt(0) !== "-" && currentOperand.length >= 12)) return;
    else if (key === "." && currentOperand.includes(".")) return;
    else if (key === "0" && currentOperand === "0") return;
    else if (key === "." && currentOperand === "") currentOperand = '0.';
    else if (key !== "." && key !== "0" && currentOperand === "0") currentOperand = key;
    else currentOperand += key

    manageOperand('set', currentOperand)
    showResult(currentOperand)
}

// Set operator for calculation
function setOperator(btn) {
    if (operator !== "" && operand2 !== "") calculation()
    if (operand1 === "") operand1 = "0";

    operator = btn.value
    showResult(operand1)

    isCalculated = false;
    operand2 = "";
    showHistory()
}

// Indicate calculation type and get result
function calculation() {
    if (operator === "") return;
    if (operand2 === "") operand2 = operand1;
    let a = +operand1;
    let b = +operand2;
    let calcResult = 0;

    switch (operator) {
        case '+':
            calcResult = a + b;
            break;
        case '-':
            calcResult = a - b;
            break;
        case '*':
            calcResult = a * b;
            break;
        case '/':
            if (b !== 0) calcResult = a / b
            else return showError();
            break;
    }

    showResult(calcResult)
    isCalculated = true
    showHistory()
    operand1 = calcResult.toString()
}

// Get percent
function getPercent() {
    if (isCalculated) resetLastEntry()

    if (operator === "") {
        operand1 = +operand1 / 100;

        showResult(operand1)
        operand1 = operand1.toString();
        showHistory()
        return;
    }

    if (operand2 === "") operand2 = operand1;

    if (operator === "/" || operator === "*")
        operand2 = +operand2 / 100;
    else if (operator === "-" || operator === "+")
        operand2 = (+operand1) / 100 * (+operand2);

    showResult(operand2)
    operand2 = operand2.toString();
    showHistory();
}

// Truncate infinity/floats, remove inaccuracy and big numbers to exponential
function lengthControl(number) {
    const lenghtIsOkCheck = (a) => {
        a = a.toString()
        if ((a.charAt(0) === "-" && a.length <= 10) || (a.charAt(0) !== "-" && a.length <= 9)) {
            document.querySelector('.inputs').classList.remove('small')
            return true;
        }
        if ((a.charAt(0) === "-" && a.length <= 13) || (a.charAt(0) !== "-" && a.length <= 12)) {
            document.querySelector('.inputs').classList.add('small')
            return true;
        }
        else return false;
    }

    number = +number
    // Remove inaccuracy
    number = Number(number.toFixed(13))
    if (lenghtIsOkCheck(number)) return number;
    // To exponential or get round float
    if (number % 1 !== 0) {
        number = Math.round((number + Number.EPSILON) * 1000000) / 1000000;
        if (lenghtIsOkCheck(number)) return number;
    }
   
    number = number.toExponential(7)
    return number;
}

// Make a number negative
function negateNumber() {
    if (isCalculated) resetLastEntry()

    let currentOperand = manageOperand('get')
    if (currentOperand === "0") return;
    if (currentOperand === "" && operand1 !== "") currentOperand = operand1;
    if (currentOperand === "") return;

    currentOperand = +currentOperand * -1;
    showResult(currentOperand)
    manageOperand('set', currentOperand)
    showHistory()
}

// Indicate a single number action and calculate
function singleNumAction(btn) {
    if (isCalculated) resetLastEntry()
    if (operator !== "" && operand2 === "") operand2 = "1";

    let currentOperand = manageOperand('get')
    let action = btn.value
    currentOperand = +currentOperand

    switch (action) {
        case "1/x":
            if (currentOperand === 0) return showError();
            currentOperand = 1 / currentOperand;
            break;
        case "square":
            currentOperand = currentOperand ** 2;
            break;
        case "root":
            if (currentOperand < 0) return showError();
            currentOperand = Math.sqrt(currentOperand)
            break;
    }

    manageOperand('set', currentOperand);

    showResult(currentOperand)
    showHistory()
}

// Set output into result input
function showResult(result) {
    result = lengthControl(result).toString()
    if (!result.includes("e")) {
        let pointIndx = result.indexOf(".")
        let wholeNum;
        if (pointIndx !== -1) {
            wholeNum = result.slice(0, pointIndx)
            wholeNum = Number(wholeNum).toLocaleString()
            result = wholeNum + result.substring(pointIndx, result.length)
        }
        // Else if not infinity
        else if(isFinite(result)) result = Number(result).toLocaleString();
    }

    RESULT_INP.value = result;
}

// Show previous action in history input
function showHistory() {
    let out = "";
    let a = lengthControl(operand1).toString()
    a = (!a.includes("e")) ? Number(a) : a;
    out += a
    if (operator !== "") out += " " + operator + " ";
    if (operand2 !== "") {
        let b = lengthControl(operand2).toString()
        b = (!b.includes("e")) ? Number(b) : b;
        out += b
    }
    if (isCalculated && operand2 !== "") out += " = ";
    HISTORY_INP.value = out;
}

// Clean calculator
function cleanCalculator() {
    operand1 = "";
    operand2 = "";
    operator = "";
    showHistory()
    showResult("0")
    isCalculated = false;
}

// Clean last entry
function cleanEntry() {
    if (operator !== "" && !isCalculated) {
        operand2 = "";
        showResult("0")
        showHistory()
        return;
    }
    else cleanCalculator()
}

// Reset last entry
function resetLastEntry() {
    operand2 = "";
    operator = "";
    isCalculated = false;
}

// Backspace function 
function backspace() {
    if (isCalculated === true) HISTORY_INP.value = "";

    let currentOperand = manageOperand('get')

    currentOperand = (currentOperand.length > 1) ? currentOperand.slice(0, -1) : "";
    (currentOperand !== "" && currentOperand !== "-") ? showResult(currentOperand) : showResult("0")
    if (Number(currentOperand) === 0) currentOperand = "0";

    manageOperand('set', currentOperand)
}

// Show error function
function showError() {
    cleanCalculator()
    RESULT_INP.value = "Error";
}

// Remove pressed button style
document.addEventListener('mouseup', () => {
    if (pressedBtn !== undefined) {
        pressedBtn.classList.remove("pressed")
        pressedBtn = undefined;
    }
})
document.addEventListener('keyup', () => {
    if (pressedBtn !== undefined) {
        pressedBtn.classList.remove("pressed")
        pressedBtn = undefined;
    }
})