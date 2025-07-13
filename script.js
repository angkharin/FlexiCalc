const display = document.getElementById("display-text");
let historyLines = [""]; 

function updateDisplay() {
  const formatted = historyLines.map(line =>
    `<div>${line.replace(/\*/g, '×').replace(/\//g, '÷')}</div>`
  ).join('');

  const displayText = document.getElementById("display-text");
  displayText.innerHTML = formatted;

  // ✅ เก็บลง localStorage ทุกครั้งที่ display อัปเดต
  localStorage.setItem('calc_history', JSON.stringify(historyLines));

  const displayBox = document.getElementById("display2");
  setTimeout(() => {
    displayBox.scrollTop = 0;
  }, 0);
}



function appendNumber(number) {
  hasInsertedNumber = true;

  let lastLine = historyLines[historyLines.length - 1] || '';
  const lastChar = lastLine.slice(-1);

  // ✅ ถ้าลงท้ายด้วย % → ใส่ × ก่อนใส่เลขใหม่
  if (lastChar === '%') {
    lastLine += '×';
  }

  const match = lastLine.match(/(\d{1,3}(?:,\d{3})*|\d*\.\d*|\d+)$/);
  const lastNumber = match ? match[0] : '';
  const cleanNumber = lastNumber.replace(/,/g, '');

  const digitCount = cleanNumber.replace('.', '').length;
  if (digitCount >= 15) {
    const lang = navigator.language || 'en';
    alert(lang.startsWith('th') ? 'ไม่สามารถใส่ตัวเลขเกิน 15 หลักได้' : "Can't enter more than 15 digits.");
    return;
  }

  if (cleanNumber.includes('.')) {
    const [_, decimals] = cleanNumber.split('.');
    if (decimals.length >= 10) {
      const lang = navigator.language || 'en';
      alert(lang.startsWith('th')
        ? 'ไม่สามารถใส่ตัวเลขหลังจุดทศนิยมเกิน 10 หลักได้'
        : "Can't enter more than 10 digits after decimal point.");
      return;
    }
  }

  let updated;
  if (cleanNumber.includes('.')) {
    updated = cleanNumber + number;
  } else {
    updated = Number(cleanNumber + number).toLocaleString();
  }

  if (lastNumber) {
    lastLine = lastLine.replace(new RegExp(lastNumber + '$'), updated);
  } else {
    lastLine += number;
  }

  historyLines[historyLines.length - 1] = lastLine;
  updateDisplay();
}

function formatWithComma(str) {
  if (str.includes('.')) {
    let [int, dec] = str.split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return int + '.' + dec;
  } else {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}


function calculatePercent() {
  const lastLine = historyLines[historyLines.length - 1];
  const lastChar = lastLine.slice(-1);
  const lang = navigator.language || 'en';
  const msg = lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.';

  // ❌ บล็อก % หลัง (+ หรือ (−
  if (lastLine.endsWith('(+') || lastLine.endsWith('(−')) {
    alert(msg);
    return;
  }

  // ❌ ห้ามลงท้ายด้วย operator, (, %, ฯลฯ
  if (!lastLine || /[+\-*/(%]$/.test(lastChar)) {
    alert(msg);
    return;
  }

  // ✅ ปกติ → ใส่ %
  historyLines[historyLines.length - 1] += '%';
  updateDisplay();
}



function appendOperator(displayOp, realOp = displayOp) {
  let lastLine = historyLines[historyLines.length - 1] || '';
  const lang = navigator.language || 'en';
  const msg = lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.';

  const allLinesJoined = historyLines.join('');
  const operatorCount = (allLinesJoined.match(/[+\-×÷]/g) || []).length;
  if (operatorCount >= 40) {
    alert(lang.startsWith('th') ? 'ไม่สามารถใส่สัญลักษณ์ทางคณิตศาสตร์ได้เกิน 40 ตัว' : "Can't enter more than 40 operators.");
    return;
  }

  // ตรวจ operator ซ้อนท้าย
  const trailingOps = lastLine.match(/[+\-×÷]{1,}$/);
if (trailingOps) {
  const ops = trailingOps[0];

  if (ops === displayOp) {
    // ✅ ถ้ากดซ้ำตัวเดิม → เงียบ
    return;
  }

  if (ops.length === 1) {
    // ✅ ถ้ามี operator เดียว → แทนที่เป็นตัวใหม่
    lastLine = lastLine.slice(0, -1) + displayOp;
    historyLines[historyLines.length - 1] = lastLine;
    updateDisplay();
    return;
  }

  // ❌ ถ้ามี operator ซ้อนมากกว่า 1 → แจ้งเตือน
  alert(msg);
  return;
}


  // ✅ กรณีในวงเล็บเปิด
  if (lastLine.endsWith('(+') && (displayOp === '−' || realOp === '-')) {
    lastLine = lastLine.slice(0, -1) + '−';
    historyLines[historyLines.length - 1] = lastLine;
    updateDisplay();
    return;
  }
  if (lastLine.endsWith('(−') && displayOp === '+') {
    lastLine = lastLine.slice(0, -1) + '+';
    historyLines[historyLines.length - 1] = lastLine;
    updateDisplay();
    return;
  }

  // ❌ บล็อก × หรือ ÷ ตามหลัง (+ หรือ (−
  if (lastLine.endsWith('(+') || lastLine.endsWith('(−')) {
    if (['×', '÷'].includes(displayOp) || ['*', '/'].includes(realOp)) {
      alert(msg);
      return;
    }
  }

  // ✅ อนุญาต + − หลัง (
  if (lastLine.endsWith('(')) {
    if (displayOp === '+' || displayOp === '−' || realOp === '-') {
      lastLine += displayOp;
      historyLines[historyLines.length - 1] = lastLine;
      updateDisplay();
      return;
    } else {
      alert(msg);
      return;
    }
  }

  // ❌ ห้าม × ÷ หลัง (+
  if (/\([+\-]$/.test(lastLine)) {
    if (['×', '÷'].includes(displayOp) || ['*', '/'].includes(realOp)) {
      alert(msg);
      return;
    }
  }

  if (!hasInsertedNumber) {
    alert(msg);
    return;
  }

  const is2Operator = /2[+\-×÷]$/.test(lastLine + displayOp);
  const operatorInLine = (lastLine.match(/[+\-×÷]/g) || []).length;

  if (is2Operator && operatorInLine > 0 && operatorInLine % 16 === 0) {
    historyLines.push(displayOp);
  } else {
    lastLine += displayOp;
    historyLines[historyLines.length - 1] = lastLine;
  }

  hasInsertedNumber = false;
  updateDisplay();
}




function openSciPanel() {
  localStorage.setItem('calc_history', JSON.stringify(historyLines)); // ✅ เก็บค่าก่อน
  window.location.href = "Scipannel.html";
}



function appendDot() {
  let lastLine = historyLines[historyLines.length - 1] || '';
  const lastChar = lastLine.slice(-1);

  // ✅ ถ้าตัวก่อนหน้าเป็น % → ใส่ ×0. แทน ×.
  if (lastChar === '%') {
    lastLine += '×0.';
  } 
  // ✅ ถ้าเริ่มต้นใหม่ หรือลงท้ายด้วย operator → ใส่ 0.
  else if (lastLine === '' || /[+\-×÷*/(]$/.test(lastChar)) {
    lastLine += '0.';
  } 
  // ✅ ใส่จุดถ้ายังไม่มี
  else {
    const match = lastLine.match(/(\d*\.\d*|\d+)$/);
    if (!match || (match && !match[0].includes('.'))) {
      lastLine += '.';
    }
  }

  historyLines[historyLines.length - 1] = lastLine;
  updateDisplay();
}

function clearEntry() {
  let lastLine = historyLines[historyLines.length - 1] || '';

  // ✅ ดึงเลขล่าสุดจากท้ายสุด
  const match = lastLine.match(/(\d{1,3}(?:,\d{3})*|\d*\.\d*|\d+)$/);
  const lastNumber = match ? match[0] : null;

  if (lastNumber) {
    const cleanNumber = lastNumber.replace(/,/g, '');
    const updated = cleanNumber.slice(0, -1); // ลบเลขจริง

    // ✅ ถ้าไม่มีเลขเหลือหลังลบ → ลบตัวเลขทั้งหมด
    if (updated === '') {
      lastLine = lastLine.slice(0, -lastNumber.length);
    } else {
      const formatted = updated.includes('.')
        ? updated
        : Number(updated).toLocaleString();

      lastLine = lastLine.replace(new RegExp(lastNumber + '$'), formatted);
    }
  } else {
    // ✅ ลบ 1 ตัวอักษรทั่วไป
    lastLine = lastLine.slice(0, -1);
  }

  historyLines[historyLines.length - 1] = lastLine;
  updateDisplay();
}



function clearAll() {
  historyLines = [""];
  hasInsertedNumber = false;
  localStorage.removeItem('calc_history'); // ✅ ล้างค่าด้วย
  updateDisplay();
}

function truncateDecimal(num, digits = 10) {
  const parts = num.toString().split(".");
  if (parts.length === 1) return num; // ไม่มีทศนิยม

  const truncated = parts[0] + "." + parts[1].substring(0, digits);
  return parseFloat(truncated);
}


function roundToFixed(num, digits = 10) {
  const factor = Math.pow(10, digits);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}


function calculate() {
  try {
    let expression = historyLines.join('').replace(/,/g, '');

    // ✅ factorial แบบรองรับ 1 และ 2 ตัว !!
    expression = expression.replace(/(\d+)(!+)/g, (_, num, bangs) => {
      if (bangs.length > 2) { 
        return `INVALID_FACTORIAL(${num})`;
      }
      let result = num;
      for (let i = 0; i < bangs.length; i++) {
        result = `factorial(${result})`;
      }
      return result;
    });

    if (expression.includes('INVALID_FACTORIAL')) {
      const lang = navigator.language || 'en';
      alert(lang.startsWith('th')
        ? 'ไม่สามารถแสดงผลลัพธ์ที่ไม่ได้ระบุ'
        : "Can't show undefined result.");
      return;
    }

    // ✅ แทน √ ก่อน เพื่อให้ e^(...√...) ทำงานได้
    expression = expression.replace(/√\(/g, 'Math.sqrt(');

    // ✅ e^x และ e^(...) ทุกแบบ
    expression = expression.replace(/e\^\(([^()]*)\)/g, 'Math.exp($1)');
    expression = expression.replace(/e\^([\d.]+)/g, 'Math.exp($1)');
    expression = expression.replace(/e\^\(([^()]*)$/g, 'Math.exp($1)');

    // ✅ แทนค่าฟังก์ชันคณิต
    expression = expression
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'Math.E')
      .replace(/π/g, 'Math.PI')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/cbrt\(/g, 'Math.cbrt(')
      .replace(/asin\(/g, 'Math.asin(')
      .replace(/acos\(/g, 'Math.acos(')
      .replace(/atan\(/g, 'Math.atan(')
      .replace(/sinh\(/g, 'Math.sinh(')
      .replace(/cosh\(/g, 'Math.cosh(')
      .replace(/tanh\(/g, 'Math.tanh(')
      .replace(/asinh\(/g, 'Math.asinh(')
      .replace(/acosh\(/g, 'Math.acosh(')
      .replace(/atanh\(/g, 'Math.atanh(')
      .replace(/sin\(/g, 'Math.sin(toAngle(')
      .replace(/cos\(/g, 'Math.cos(toAngle(')
      .replace(/tan\(/g, 'Math.tan(toAngle(')
      .replace(/−/g, '-')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/1÷([\d.]+)/g, '1/($1)')
      .replace(/(\d)\(/g, '$1*(')
      .replace(/2\^\(/g, 'Math.pow(2,');

    // ✅ เปอร์เซ็นต์
    expression = expression.replace(/([\d.]+)\s*([+\-])\s*([\d.]+)%/g, (_, base, op, percent) =>
      `(${base} ${op} ((${percent} * ${base}) / 100))`
    );
    expression = expression.replace(/([\d.]+)%\s*([+\-])\s*([\d.]+)%/g, (_, base, op, percent) => {
      const baseVal = `(${base}/100)`;
      const percentVal = `(${percent}/100)*${baseVal}`;
      return `${baseVal} ${op} ${percentVal}`;
    });
    expression = expression.replace(/([*/+\-])\(([\d.]+)%\)/g, '$1(($2/100))');
    expression = expression.replace(/\(([\d.]+)%\)/g, '(($1/100))');
    expression = expression.replace(/([\d.,]+)%/g, (_, num) => {
      const clean = num.replace(/,/g, '');
      return `(${clean}/100)`;
    });

    // ✅ ล้าง space และปิดวงเล็บอัตโนมัติ
    expression = expression.replace(/\s+/g, '');
    const open = (expression.match(/\(/g) || []).length;
    const close = (expression.match(/\)/g) || []).length;
    if (open > close) {
      expression += ')'.repeat(open - close);
    }

    // ✅ ตรวจหารด้วยศูนย์
    if (/\/0(?!\d)/.test(expression)) {
      const lang = navigator.language || 'en';
      alert(lang.startsWith('th') ? 'ไม่สามารถหารด้วยศูนย์ได้' : "Can't divide by zero.");
      return;
    }

    // ✅ ตรวจหาฟังก์ชันว่าง
    if (
      /\bMath\.(sqrt|log|log10|abs|sin|cos|tan|sinh|cosh|tanh|cbrt|asin|acos|atan|asinh|acosh|atanh|exp)\(\)/.test(expression)
      || /Math\.pow\(2,\s*\)/.test(expression)
    ) {
      const lang = navigator.language || 'en';
      alert(lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.');
      return;
    }

    // ✅ ประมวลผลยกกำลังซ้ายไปขวา
    expression = evaluateLeftToRightPowers(expression);

    // ✅ คำนวณ
    let result = Function('toAngle', 'toDegrees', 'factorial', `return ${expression}`)(
      toAngle, toDegrees, factorial
    );

    if (!isFinite(result)) {
      const lang = navigator.language || 'en';
      alert(lang.startsWith('th')
        ? 'การคำนวณนี้เกินช่วงผลลัพธ์ที่แสดงได้'
        : 'Calculation outside of accepted range.');
      return;
    }

    // ✅ inverse trig ให้กลับเป็นองศา
    if (angleMode === 'deg' && /Math\.a(sin|cos|tan)\(/.test(expression)) {
      result = toDegrees(result);
    }

    // ✅ ปัดผลลัพธ์ให้แม่นยำ
    let rounded;

    if (expression.includes('/100')) {
      if (result > 1_000_000_000_000) {
        const decimalStr = result.toString().split('.')[1] || '0';
        const secondDecimalDigit = parseInt(decimalStr.charAt(1) || '0');

        rounded = secondDecimalDigit >= 5
          ? Math.ceil(result * 10) / 10
          : Math.floor(result * 10) / 10;
      } else {
        rounded = roundToFixed(result, 10);
      }
    } else {
      rounded = roundToFixed(result, 10);
    }

    const formatted = (Math.abs(result) >= 1e15 || Math.abs(result) < 1e-6)
        ? result.toExponential(8).replace('e+', 'E+').replace('e', 'E')
        : rounded.toLocaleString(undefined, {
          maximumFractionDigits: 10,
          useGrouping: true
        });


    historyLines = [formatted];
    updateDisplay();
  } catch (error) {
    const lang = navigator.language || 'en';
    alert(lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.');
  }
}

// ฟังก์ชันเสริมที่จำเป็น
function toAngle(degOrRad) {
  return angleMode === 'deg' ? degOrRad * (Math.PI / 180) : degOrRad;
}


function toDegrees(rad) {
  return angleMode === 'deg' ? rad * (180 / Math.PI) : rad;
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Invalid input for factorial");
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function evaluateLeftToRightPowers(expr) {
  const pattern = /(\d+(?:\.\d+)?)(\^\([^)]+\))+/

  while (pattern.test(expr)) {
    expr = expr.replace(pattern, (match) => {
      // ดึง base และ exponents
      const baseMatch = match.match(/^(\d+(?:\.\d+)?)/);
      let base = parseFloat(baseMatch[1]);

      // ดึง exponent แต่ละตัวในลำดับ
      const exponentMatches = [...match.matchAll(/\^\(([^()]+)\)/g)];
      for (const exp of exponentMatches) {
        base = Math.pow(base, parseFloat(exp[1]));
      }

      return base.toString();
    });
  }

  return expr;
}

function toggleMenu() {
  const menu = document.getElementById("extraMenu");
  menu.classList.toggle("hidden");
}

function insertFunction(func) {
  const lang = navigator.language || 'en';

  const primaryFuncs = ['sin', 'cos', 'tan', 'ln', 'log', 'abs'];
  const advancedFuncs = ['cbrt', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'];
  const autoMultiplyFuncs = [
    '√', 'sin', 'cos', 'tan', 'ln', 'log', '1/x', 'eˣ', 'abs', 'π', 'e', 'cbrt',
    'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh', '2powx'
  ];

  const allText = historyLines.join('');
  const totalLength = allText.length;

  if (
    advancedFuncs.includes(func) &&
    totalLength >= 200
  ) {
    alert(lang.startsWith('th')
      ? 'ไม่สามารถใส่ตัวอักษรมากกว่า 200 ตัว'
      : "Can't enter more than 200 characters.");
    return;
  }

  const regexPrimary = new RegExp(`(${primaryFuncs.join('|')})\\(`, 'g');
  const regexAdvanced = new RegExp(`(${advancedFuncs.join('|')})\\(`, 'g');
  const primaryCount = (allText.match(regexPrimary) || []).length;
  const advancedCount = (allText.match(regexAdvanced) || []).length;
  const oneDivCount = (allText.match(/1÷/g) || []).length;
  const sqrtCount = (allText.match(/√\(/g) || []).length;
  const customCount = (allText.match(/e\^|π|(?<![a-z])e(?![a-z])|2\^|\^|\!/g) || []).length;

  if (
    (primaryFuncs.includes(func) && primaryCount >= 40) ||
    (advancedFuncs.includes(func) && advancedCount >= 40) ||
    (func === '1/x' && oneDivCount >= 40) ||
    (func === '√' && sqrtCount >= 40) ||
    (customCount >= 40)
  ) {
    alert(lang.startsWith('th')
      ? 'ไม่สามารถใส่ฟังก์ชันเกิน 40 ตัวได้'
      : "Can't enter more than 40 functions.");
    return;
  }

  // ตรวจบรรทัดใหม่
  let lastLine = historyLines[historyLines.length - 1];
  const linePrimaryCount = (lastLine.match(regexPrimary) || []).length;
  const lineAdvancedCount = (lastLine.match(regexAdvanced) || []).length;
  const lineOneDivCount = (lastLine.match(/1÷/g) || []).length;
  const lineSqrtCount = (lastLine.match(/√\(/g) || []).length;

  if (
    (primaryFuncs.includes(func) && linePrimaryCount > 0 && linePrimaryCount % 8 === 0) ||
    (advancedFuncs.includes(func) && lineAdvancedCount > 0 && lineAdvancedCount % 6 === 0) ||
    (func === '1/x' && lineOneDivCount > 0 && lineOneDivCount % 16 === 0) ||
    (func === '√' && lineSqrtCount > 0 && lineSqrtCount % 16 === 0)
  ) {
    historyLines.push('');
  }

  // อัปเดตบรรทัดล่าสุดอีกครั้งหลัง push
  lastLine = historyLines[historyLines.length - 1];
  const lastChar = lastLine.slice(-1).replace(/,/g, '');

  const shouldAddMultiply =
    autoMultiplyFuncs.includes(func) &&
    /[0-9)!eπ]$/.test(lastChar);

  switch (func) {
    case 'asin':
    case 'acos':
    case 'atan':
      lastLine += shouldAddMultiply ? `×${func}(` : `${func}(`;
      break;
    case 'π':
      lastLine += shouldAddMultiply ? '×π' : 'π';
      break;
    case 'e':
      lastLine += shouldAddMultiply ? '×e' : 'e';
      break;
    case 'eˣ':
    case 'exp':
      lastLine += shouldAddMultiply ? '×e^(' : 'e^(';
      break;
    case '1/x':
      lastLine += shouldAddMultiply ? '×1÷' : '1÷';
      historyLines[historyLines.length - 1] = lastLine;
      updateDisplay();
      return;
    case '√':
      lastLine += shouldAddMultiply ? '×√(' : '√(';
      historyLines[historyLines.length - 1] = lastLine;
      updateDisplay();
      return;
    case 'square':
      if (!hasInsertedNumber) {
        alert(lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.');
        return;
      }
      lastLine += '^(' + '2' + ')';
      break;
    case 'cube':
      if (!hasInsertedNumber) {
        alert(lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.');
        return;
      }
      lastLine += '^(' + '3' + ')';
      break;
    case '^':
      if (!hasInsertedNumber || lastLine.endsWith('^(')) {
        alert(lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.');
        return;
      }
      lastLine += '^(';
      break;
    case 'factorial':
      if (!hasInsertedNumber) {
        alert(lang.startsWith('th') ? 'รูปแบบใช้ไม่ถูกต้อง' : 'Invalid format used.');
        return;
      }
      lastLine += '!';
      break;
    case '2powx':
      lastLine += shouldAddMultiply ? '×2^(' : '2^(';
      break;
    case 'cbrt':
      lastLine += shouldAddMultiply ? '×cbrt(' : 'cbrt(';
      break;
    default:
      lastLine += shouldAddMultiply ? `×${func}(` : `${func}(`;
  }

  historyLines[historyLines.length - 1] = lastLine;
  updateDisplay();
}


let angleMode = 'deg'; // เริ่มต้นโหมดจริงเป็น deg

window.onload = function () {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    localStorage.removeItem('calc_history');
  }

  const saved = localStorage.getItem('calc_history');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(line => line.trim() !== '')) {
        historyLines = parsed;
        hasInsertedNumber = /\d/.test(parsed[parsed.length - 1]); // ✅ เพิ่มบรรทัดนี้
        updateDisplay();
      } else {
        localStorage.removeItem('calc_history');
        historyLines = [""];
      }
    } catch {
      localStorage.removeItem('calc_history');
      historyLines = [""];
    }
  }

  const btn = document.getElementById("modeToggle") || document.getElementById("modeToggle2");
  const label = document.getElementById("angleLabel");

  if (btn) btn.innerText = "Rad";
  if (label) label.innerText = "";
};


function toggleAngleMode() {
  const btn = document.getElementById("modeToggle") || document.getElementById("modeToggle2");
  const label = document.getElementById("angleLabel");

  if (!btn) return;

  if (angleMode === 'deg') {
    angleMode = 'rad';
    btn.innerText = 'Deg';
    if (label) label.innerText = 'Rad';
  } else {
    angleMode = 'deg';
    btn.innerText = 'Rad';
    if (label) label.innerText = '';
  }
}


let openBrackets = 0;
let hasInsertedNumber = false;

function insertBracket() {
  let lastLine = historyLines[historyLines.length - 1] || '';
  const openCount = (lastLine.match(/\(/g) || []).length;
  const closeCount = (lastLine.match(/\)/g) || []).length;
  const lastChar = lastLine.slice(-1);

  // ยังไม่มีเลข → เปิดวงเล็บ
  if (!hasInsertedNumber) {
    if (/\d|\)/.test(lastChar)) {
      lastLine += '×(';
    } else {
      lastLine += '(';
    }
  } else {
    // ถ้ายังมีวงเล็บเปิดค้าง → ปิดวงเล็บก่อน
    if (openCount > closeCount) {
      lastLine += ')';
    } else {
      // ปิดครบแล้ว → เริ่มเปิดวงเล็บใหม่
      if (/\d|\)/.test(lastChar)) {
        lastLine += '×(';
      } else {
        lastLine += '(';
      }
      hasInsertedNumber = false;
    }
  }

  historyLines[historyLines.length - 1] = lastLine;
  updateDisplay();
}

function togglePanel() {
  localStorage.setItem('calc_history', JSON.stringify(historyLines)); // ✅ เก็บค่า
  const current = window.location.href;

  if (current.includes("Scipannel2.html")) {
    window.location.href = "Scipannel.html";
  } else {
    window.location.href = "Scipannel2.html";
  }
}



function square() {
  const value = parseFloat(document.getElementById("display2").innerText);
  if (!isNaN(value)) {
    display.innerText = value ** 2;
  } else {
    display.innerText = 'Error';
  }
}

function toggleScientific() {
  const panel = document.getElementById("sciPanel");
  panel.classList.toggle("sci-hidden");
}
function updateSciBtnPosition() {
  const current = display.innerText.replace(/[^0-9]/g, ''); 
  const digitCount = current.length;

  const btn = document.getElementById("toggleSciBtn");

  const maxShift = 60; 
  const shift = Math.min(digitCount / 15 * maxShift, maxShift);

  btn.style.transform = `translateX(-${shift}px)`;
}

let tooltipTimeout;

function showTooltip(button) {
  // ลบ tooltip เดิมถ้ามี
  const oldTip = document.querySelector('.tooltip');
  if (oldTip) oldTip.remove();

  // ตรวจภาษาระบบ
  const isThai = (navigator.language || 'en').startsWith('th');
  const text = isThai
    ? button.getAttribute('data-tooltip-th')
    : button.getAttribute('data-tooltip-en');

  if (!text) return; // ถ้าไม่มี tooltip ไม่ต้องแสดง

  // สร้าง tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  document.body.appendChild(tooltip);

  // ตำแหน่งปุ่ม
  const rect = button.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top}px`;

  // หายไปใน 3 วิ
  clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => {
    tooltip.remove();
  }, 300);
}

let hintTimeout;

function showHint(el, id) {
  const lang = navigator.language || 'en';
  const text = id === 'modeToggle' || id === 'modeToggle2'
    ? (lang.startsWith('th') 
        ? (el.innerText === 'Rad' ? 'เรเดียน' : 'องศา') 
        : (el.innerText === 'Rad' ? 'Radian' : 'Degree'))
    : '';

  const hintBox = document.getElementById('hintBox');
  hintBox.innerText = text;
  hintBox.style.display = 'block';

  const rect = el.getBoundingClientRect();
  hintBox.style.left = `${rect.left + window.scrollX}px`;
  hintBox.style.top = `${rect.top + window.scrollY - 35}px`;

  clearTimeout(window.hintTimeout);
  window.hintTimeout = setTimeout(() => {
    hintBox.style.display = 'none';
  }, 300);
}


function hideHint() {
  clearTimeout(hintTimeout);
  document.getElementById("hintBox").style.display = "none";
}

function setTheme(themeName) {
  const themes = ['theme-original', 'theme-warm', 'theme-cool', 'theme-love', 'theme-natural'];
  document.body.classList.remove(...themes);
  document.body.classList.add(`theme-${themeName}`);
  localStorage.setItem('theme', themeName); // ✅ บันทึกด้วย
}
window.onload = function () {
  const theme = localStorage.getItem('theme') || 'original';
  setTheme(theme);
  // (โค้ดโหลดหน้าจอของคุณเดิมก็ตามมาครับ)
};


// ฟังก์ชันสำหรับเปลี่ยนธีม
window.addEventListener('DOMContentLoaded', () => {
  // --- โหลดธีมล่าสุด ---
  const theme = localStorage.getItem('theme') || 'original';
  setTheme(theme);

  // --- ตรวจภาษา ---
  const lang = navigator.language || 'en';
  const isThai = lang.startsWith('th');

  // --- โหลดเลขเดิม ถ้ามี ---
  const savedHistory = localStorage.getItem('calc_history');
  if (savedHistory) {
    try {
      historyLines = JSON.parse(savedHistory);
      updateDisplay();
    } catch (e) {
      historyLines = [""];
    }
  }

  // --- แปลข้อความ sidebar ---
  document.getElementById('theme-header').innerText = isThai ? 'ธีม' : 'Theme';
  document.getElementById('theme-original').innerText = isThai ? '🎨 ดั้งเดิม' : '🎨 Original';
  document.getElementById('theme-warm').innerText = isThai ? '🔥 โทนร้อน' : '🔥 Warm';
  document.getElementById('theme-cool').innerText = isThai ? '❄️ โทนเย็น' : '❄️ Cool';
  document.getElementById('theme-love').innerText = isThai ? '🩷 ความรัก' : '🩷 Love';
  document.getElementById('theme-natural').innerText = isThai ? '🍀 ธรรมชาติ' : '🍀 Natural';

  // --- FORCE ปิด sidebar ทุกครั้งที่โหลด ---
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const body = document.body;

  sidebar.classList.add('hidden');
  body.classList.add('sidebar-hidden');
  toggleBtn.innerText = '❯';
  toggleBtn.style.left = '0px';
  
  localStorage.setItem('sidebarHidden', '1');

  // --- แปล custom theme panel ---
  const translations = {
    'bg-color': isThai ? 'พื้นหลัง' : 'Background',
    'number-color': isThai ? 'ปุ่มเลข' : 'Number',
    'number-hover': isThai ? 'เลขโฮเวอร์' : 'Number Hover',
    'btn-color': isThai ? 'ปุ่มเลขคณิต' : 'Button',
    'btn-hover': isThai ? 'เลขคณิตโฮเวอร์' : 'Button Hover',
    'btn2-color': isThai ? 'ปุ่มลบ' : 'Clear Button',
    'btn2-hover': isThai ? 'ลบโฮเวอร์' : 'Clear Hover',
    'sci-color': isThai ? 'ปุ่มวิทย์1' : 'sci1 Button',
    'sci-hover': isThai ? 'วิทย์1โฮเวอร์' : 'sci1 Hover',
    'sci2-color': isThai ? 'ปุ่มวิทย์2' : 'sci2 Button',
    'sci2-hover': isThai ? 'วิทย์2โฮเวอร์' : 'sci2 Hover',
    'function-color': isThai ? 'ปุ่มล้าง' : 'AC',
    'function-hover': isThai ? 'ล้างโฮเวอร์' : 'AC Hover',
    'equal-color': isThai ? 'เท่ากับ' : 'Equal',
    'equal-hover': isThai ? 'เท่ากับโฮเวอร์' : 'Equal Hover',
    'calc-bg': isThai ? 'สีเครื่องคิดเลข' : 'Calc BG',
    'calc2-bg': isThai ? 'สีเครื่องคิดเลข' : 'Calc BG',
    'menu-color': isThai ? 'เมนู' : 'Menu',
    'menu-hover': isThai ? 'เมนูโฮเวอร์' : 'Menu Hover',
    'applyCustomBtn': isThai ? 'ใช้' : 'Apply',
    'custom-theme-header': isThai ? '✏️ กำหนดธีม' : '✏️ Custom Theme'
  };

  for (const key in translations) {
    if (key === 'applyCustomBtn') {
      const btn = document.getElementById(key);
      if (btn) btn.innerText = translations[key];
    } else if (key === 'custom-theme-header') {
      const header = document.getElementById(key);
      if (header) header.innerText = translations[key];
    } else {
      const label = document.querySelector(`label[for="${key}"]`) ||
                    document.querySelector(`input#${key}`)?.closest('label');
      if (label) {
        label.childNodes[0].nodeValue = translations[key] + ': ';
      }
    }
  }

  // --- แปลเมนูเพิ่มเติม (extraMenu) ---
  const menuTranslations = {
    'menu-unit': isThai ? 'ตัวแปลงหน่วย' : 'Unit Converter',
    'menu-researcher': isThai ? 'ประวัติผู้วิจัย' : 'About Researcher',
    'menu-questionnaire': isThai ? 'แบบสอบถาม' : 'Questionnaire'
  };

  for (const id in menuTranslations) {
    const el = document.getElementById(id);
    if (el) el.innerText = menuTranslations[id];
  }
});




function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const body = document.body;

  sidebar.classList.toggle('hidden');
  body.classList.toggle('sidebar-hidden');

  const isHidden = sidebar.classList.contains('hidden');
  toggleBtn.innerText = isHidden ? '❯' : '❮';
  toggleBtn.style.left = isHidden ? '0px' : '140px';

  // เก็บค่าใหม่
  localStorage.setItem('sidebarHidden', isHidden ? '1' : '0');
}


function toggleCustomTheme() {
  const panel = document.getElementById('customThemePanel');
  const toggleBtn = document.getElementById('customThemeToggle');

  panel.classList.toggle('hidden');

  const isHidden = panel.classList.contains('hidden');
  toggleBtn.innerText = isHidden ? '❮' : '❯';
  toggleBtn.style.right = isHidden ? '0px' : '220px';
}



function applyCustomTheme() {
  const vars = [
    "bg-color", "btn-color", "btn-hover", "calc-bg", "calc2-bg",
    "number-color", "number-hover", "function-color", "function-hover",
    "equal-color", "equal-hover", "menu-color", "menu-hover",
    "btn2-color", "btn2-hover", "sci-color", "sci-hover",
    "sci2-color", "sci2-hover"
  ];

  const themeValues = {};
  for (const v of vars) {
    const input = document.getElementById(v);
    if (input) {
      const color = input.value;
      document.body.style.setProperty(`--${v}`, color);
      themeValues[v] = color;
    }
  }

  // ลบธีมเก่าแล้วตั้ง class ใหม่
  document.body.classList.remove(
    "theme-original", "theme-warm", "theme-cool", "theme-love", "theme-natural"
  );
  document.body.classList.add("theme-custom");

  localStorage.setItem("theme", "custom");
  localStorage.setItem("customColors", JSON.stringify(themeValues));
}