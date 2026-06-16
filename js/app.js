// ─── Month Loader ────────────────────────────────────────────────────────────
// Fetches all month HTML files and injects them into #month-container.
// Must complete before buildDatesArray() and loadCheckboxStates() run.

const MONTHS = [
    'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december',
    'january', 'march'
];

async function loadMonths() {
    const container = document.getElementById('month-container');
    const fetches = MONTHS.map(month =>
        fetch(`months/${month}.html`).then(res => {
            if (!res.ok) throw new Error(`Failed to load ${month}.html`);
            return res.text();
        })
    );
    const results = await Promise.all(fetches);
    container.innerHTML = results.join('\n');
}

// ─── Existing Logic ───────────────────────────────────────────────────────────

const datesArray = [];
const collapsables = [];

function saveCheckboxStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        localStorage.setItem(checkbox.id, checkbox.checked);
    });
}

function dateFinished() {
    const checkboxes = datesArray;
    for (let i = 0; i < checkboxes.length; i++) {
        let currentCheck = checkboxes[i];
        if (currentCheck.checked) {
            currentCheck.parentNode.style.backgroundColor = 'black';
            currentCheck.parentNode.nextElementSibling.style.visibility = 'hidden';
            currentCheck.parentNode.nextElementSibling.style.height = '0px';
            currentCheck.parentNode.classList.remove('currentDate');
            if (!checkboxes[i + 1].checked) {
                for (let j = 0; j < checkboxes.length; j++) {
                    if (checkboxes[j] === currentCheck) continue;
                    if (checkboxes[j].checked) {
                        checkboxes[j].parentNode.style.backgroundColor = 'black';
                    } else {
                        checkboxes[j].parentNode.style.backgroundColor = 'rgb(0, 127, 201)';
                    }
                    checkboxes[j].parentNode.classList.remove('currentDate');
                }
                checkboxes[i + 1].parentNode.classList.add('currentDate');
            } else {
                checkboxes[i + 1].parentNode.classList.remove('currentDate');
            }
        } else {
            if (i < checkboxes.length - 1) {
                if (!checkboxes[i + 1].checked) {
                    checkboxes[i + 1].parentNode.classList.remove('currentDate');
                }
            }
            if (checkboxes[i].parentNode.classList.contains('currentDate')) {
                checkboxes[i].parentNode.style.backgroundColor = 'rgb(121 235 255)';
            } else {
                checkboxes[i].parentNode.style.backgroundColor = 'rgb(0, 127, 201)';
            }
            currentCheck.parentNode.nextElementSibling.style.visibility = 'visible';
            currentCheck.parentNode.nextElementSibling.style.height = 'auto';
        }
    }
    setDefaultCurrentDate();
}

function setDefaultCurrentDate() {
    let dateCheck = document.querySelectorAll('.currentDate');
    if (dateCheck.length === 0) {
        datesArray[0].parentNode.classList.add('currentDate');
        datesArray[0].parentNode.style.backgroundColor = 'rgb(121 235 255)';
    }
}

function buildDatesArray() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        if (checkbox.nextElementSibling !== null) {
            if (checkbox.nextElementSibling.childNodes[0] !== null) {
                if (checkbox.nextElementSibling.childNodes[0] !== undefined) {
                    if (checkbox.nextElementSibling.childNodes[0].localName === 'strong') {
                        datesArray.push(checkbox);
                        collapsables.push(checkbox.parentNode.nextElementSibling);
                    }
                }
            }
        }
    });
    setDefaultCurrentDate();
    dateFinished();
}

function loadCheckboxStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        const savedState = localStorage.getItem(checkbox.id);
        if (savedState !== null) {
            checkbox.checked = savedState === 'true';
        }
    });

    // Re-attach change listeners after dynamic load
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', saveCheckboxStates);
        checkbox.addEventListener('change', dateFinished);
    });
}

// ─── Back to Top Button ───────────────────────────────────────────────────────

let mybutton = document.getElementById('btn-back-to-top');

window.onscroll = function () { scrollFunction(); };

function scrollFunction() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        mybutton.style.display = 'block';
    } else {
        mybutton.style.display = 'none';
    }
}

mybutton.addEventListener('click', backToTop);

function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// ─── Scroll Helpers ───────────────────────────────────────────────────────────

const scrollIntoViewWithOffset = (selector, offset) => {
    window.scrollTo({
        behavior: 'smooth',
        top:
            selector.getBoundingClientRect().top -
            document.body.getBoundingClientRect().top -
            offset,
    });
};

function scrollToCurrentDate() {
    let currentDate = document.querySelector('.currentDate');
    if (currentDate !== null) {
        if (currentDate !== datesArray[0].parentNode) {
            scrollIntoViewWithOffset(currentDate, 10);
        }
    }
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function reset() {
    let toReset = confirm('You are about to reset the guide. Would you like to proceed?');
    if (toReset) {
        let toResetConfirm = confirm('Are you sure?');
        if (toResetConfirm) {
            const checkboxes = Array.from(document.querySelectorAll('input'));
            for (let i = 0; i < checkboxes.length; i++) {
                let currentCheck = checkboxes[i];
                if (currentCheck.checked) {
                    currentCheck.checked = false;
                    dateFinished();
                    saveCheckboxStates();
                }
            }
            alert('The guide has been reset.');
        }
    }
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function loadScreen() {
    JsLoadingOverlay.show({
        'overlayBackgroundColor': 'rgb(43,43,43)',
        'overlayOpacity': 1,
        'spinnerIcon': 'ball-clip-rotate',
        'spinnerColor': '#00c5ff',
        'spinnerSize': '2x',
        'overlayIDName': 'overlay',
        'spinnerIDName': 'spinner',
        'spinnerZIndex': 99999,
        'overlayZIndex': 99998,
        'lockScroll': true
    });
    document.querySelector('.contents').style.display = 'block';
}

function hideLoad() {
    JsLoadingOverlay.hide();
    scrollToCurrentDate();
}

// ─── Prevent double-click text selection ─────────────────────────────────────

document.addEventListener('mousedown', function (event) {
    if (event.detail > 1) event.preventDefault();
}, false);

// ─── Init ─────────────────────────────────────────────────────────────────────
// Order: show overlay → fetch all months → load states → build arrays → hide overlay

document.addEventListener('DOMContentLoaded', async () => {
    loadScreen();
    scrollFunction();
    await loadMonths();
    loadCheckboxStates();
    buildDatesArray();
    hideLoad();
});
