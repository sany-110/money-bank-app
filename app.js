const GOAL = 150000;

const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

// Monthly box template
const TEMPLATE = [
    100,200,500,1000,
    100,200,500,1000,
    100,200,500,1000
];

let saved = Number(localStorage.getItem("saved")) || 0;
let history = JSON.parse(localStorage.getItem("history")) || {};
let challenge = JSON.parse(localStorage.getItem("challenge")) || {};

MONTHS.forEach(m => {
    if (!challenge[m]) {
        challenge[m] = TEMPLATE.map(v => ({ amount: v, done: false }));
    }
    if (!history[m]) history[m] = [];
});

// Month dropdown
const monthSelect = document.getElementById("monthSelect");
MONTHS.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    monthSelect.appendChild(opt);
});
monthSelect.onchange = render;

// Deposit
function deposit(amount) {
    if (!confirm(`Deposit ৳${amount}?`)) return;

    const month = monthSelect.value;
    const cell = challenge[month].find(c => c.amount === amount && !c.done);
    if (!cell || saved + amount > GOAL) return;

    cell.done = true;
    saved += amount;

    history[month].push({
        date: new Date().toLocaleDateString(),
        amount
    });

    save();
    render();
}

// Undo last deposit
function undoLast() {
    for (let i = MONTHS.length - 1; i >= 0; i--) {
        const m = MONTHS[i];
        if (history[m].length > 0) {
            const last = history[m].pop();
            saved -= last.amount;

            const boxes = challenge[m];
            for (let j = boxes.length - 1; j >= 0; j--) {
                if (boxes[j].amount === last.amount && boxes[j].done) {
                    boxes[j].done = false;
                    break;
                }
            }
            break;
        }
    }
    save();
    render();
}

// Render UI
function render() {
    document.getElementById("saved").textContent = saved;
    document.getElementById("remaining").textContent = GOAL - saved;

    const month = monthSelect.value;
    const boxes = challenge[month];

    const completed = boxes.filter(b => b.done).length;
    const total = boxes.length;
    const percent = (completed / total) * 100;

    let progressClass = "p1";
    if (percent > 75) progressClass = "p4";
    else if (percent > 50) progressClass = "p3";
    else if (percent > 25) progressClass = "p2";

    document.getElementById("monthSummary").innerHTML =
        completed === total
            ? "✅ Month Completed!"
            : `📦 ${completed}/${total} boxes filled — ${Math.round(percent)}%`;

    const grid = document.getElementById("challengeGrid");
    grid.innerHTML = "";

    boxes.forEach(c => {
        const div = document.createElement("div");
        div.className = "cell";

        if (c.done) {
            div.classList.add("done", progressClass);
            div.textContent = `৳${c.amount} ❌`;
        } else {
            div.textContent = `৳${c.amount}`;
        }
        grid.appendChild(div);
    });

    renderHistory();
}

// History
function renderHistory() {
    const ul = document.getElementById("history");
    ul.innerHTML = "";
    history[monthSelect.value].slice().reverse().forEach(h => {
        const li = document.createElement("li");
        li.textContent = `${h.date} → ৳${h.amount}`;
        ul.appendChild(li);
    });
}

function toggleHistory() {
    document.getElementById("historyBox").classList.toggle("hidden");
}

function save() {
    localStorage.setItem("saved", saved);
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("challenge", JSON.stringify(challenge));
}

// Init
monthSelect.value = MONTHS[new Date().getMonth()];
render();

