const BUTTONS = document.querySelectorAll('button')
const RESULT_INP = document.querySelector('.action-inp')
const HISTORY_INP = document.querySelector('.history-inp')
let pressedBtn;
let equalBtn;
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

    if (btn.value === "=") equalBtn = btn
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
            calculation(btn)
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
        case "ones-division":
            onesDivision()
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

    if (currentOperand.length >= 12) return;
    else if (key === "." && currentOperand.includes(".")) return;
    else if (key === "0" && currentOperand === "0") return;
    else if (key === "." && currentOperand === "") currentOperand = '0.';
    else if (key !== "." && key !== "0" && currentOperand === "0") currentOperand = key;
    else currentOperand += key

    RESULT_INP.value = currentOperand;
    manageOperand('set', currentOperand)
}

// Set operator for calculation
function setOperator(btn) {
    if (operator !== "" && operand2 !== "") calculation(equalBtn)
    if (operand1 === "") operand1 = "0";

    operator = btn.value
    RESULT_INP.value = lengthControl(operand1)
    showHistory(operand1)

    isCalculated = false;
    operand2 = "";
}

// Indicate calculation type and get result
function calculation(btn) {
    if (operator === "") return;
    if (operand2 === "") operand2 = operand1;
    let key = btn.value
    let a = Number(operand1);
    let b = Number(operand2);
    let calcResult = 0;

    if (key === "=") {
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
                else {
                    cleanCalculator()
                    RESULT_INP.value = 'Error';
                    return;
                }
                break;
        }
    }
    else if (key === "%") {
        let index = (operator === "-" || operator === "+") ? 100 : 1000;
        calcResult = a / index * b
    }

    RESULT_INP.value = lengthControl(calcResult)
    isCalculated = true
    showHistory(operand1, operand2)
    operand1 = calcResult.toString()
}

// Truncate infinity/floats and big numbers to exponential
function lengthControl(number) {
    // Chech if length is valid function
    const lenghtIsOkCheck = (a) => {
        a = a.toString()
        if ((a.charAt(0) === "-" && a.length <= 13) || (a.charAt(0) !== "-" && a.length <= 12)) return true;
        else return false;
    }
    if (lenghtIsOkCheck(number)) return number;

    number = +number
    // Remove inaccuracy
    number = Number(number.toFixed(13))
    if (lenghtIsOkCheck(number)) return number;
    // To exponential or get round float
    if (number % 1 !== 0) {
        number = Math.round((number + Number.EPSILON) * 1000000) / 1000000;
        if (lenghtIsOkCheck(number)) return number;
    }
    number = number.toExponential(6)
    return number;
}

// Show previous action in history input
function showHistory(a, b) {
    let out = lengthControl(a) + " " + operator + " ";
    if (b !== undefined) out += lengthControl(b) + " =";
    HISTORY_INP.value = out;
}

// Clean calculator
function cleanCalculator() {
    operand1 = "";
    operand2 = "";
    operator = "";
    HISTORY_INP.value = "";
    RESULT_INP.value = "0";
    isCalculated = false;
}

// Clean last entry
function cleanEntry() {
    if (operator !== "" && !isCalculated) {
        operand2 = "0";
        RESULT_INP.value = operand2;
        return;
    }
    else cleanCalculator()
}

// Backspace function 
function backspace() {
    if (isCalculated === true) HISTORY_INP.value = "";

    let currentOperand = manageOperand('get')

    currentOperand = (currentOperand.length > 1) ? currentOperand.slice(0, -1) : "";
    RESULT_INP.value = (currentOperand !== "" && currentOperand !== "-") ? currentOperand : "0"
    if (Number(currentOperand) === 0) currentOperand = "0";

    manageOperand('set', currentOperand)
}

// Make a number negative
function negateNumber() {
    let showNegation = false;
    if (isCalculated) {
        operand2 = ""
        operator = ""
        isCalculated = false
        showNegation = true
    }

    let currentOperand = manageOperand('get')
    if (currentOperand === "0") return;
    if (currentOperand === "" && operand1 !== "") currentOperand = operand1;
    if (currentOperand === "") return;

    currentOperand = +currentOperand * -1;
    RESULT_INP.value = lengthControl(currentOperand)
    if (showNegation) HISTORY_INP.value = lengthControl(currentOperand)
    manageOperand('set', currentOperand)
}

// Delete 1 by another number
function onesDivision() {
    if(isCalculated) {
        operand2 = "";
        operator = "";
        isCalculated = false;
    }
    let currentOperand = manageOperand('get')

    if(currentOperand==="") currentOperand = "1"
    else if(Number(currentOperand)==0) {
        cleanCalculator()
        RESULT_INP.value = "Error";
        return;
    }
    
    currentOperand = 1 / +currentOperand;
    manageOperand('set', currentOperand);
    
    RESULT_INP.value = lengthControl(currentOperand);
    if(operand2!=="" && !isCalculated) {
        HISTORY_INP.value = lengthControl(operand1)+" "+operator+" "+lengthControl(operand2)
    }
    else HISTORY_INP.value = lengthControl(operand1)
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