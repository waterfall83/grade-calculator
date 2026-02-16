// final exam calculator logic
function calculate() {
    const current = parseFloat(document.getElementById('current').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const desired = parseFloat(document.getElementById('desired').value);

    const resultDiv = document.getElementById('result');
    const noteDiv = document.getElementById('note');

    if (isNaN(current) || isNaN(weight) || isNaN(desired)) {
        resultDiv.textContent = 'Please fill in all fields.';
        noteDiv.textContent = '';
        return;
    }

    const w = weight / 100;
    const needed = (desired - current * (1 - w)) / w;
    const rounded = Math.round(needed * 10) / 10;

    resultDiv.textContent = `You need ${rounded}% on the final.`;

    if (rounded > 100) {
        noteDiv.textContent = 'This is mathematically impossible.';
    } else if (rounded <= 0) {
        noteDiv.textContent = 'You already have the grade secured.';
    } else {
        noteDiv.textContent = '';
    }
}


// gpa calculator logic
function addCourse(listId, data = null) {
    const list = document.getElementById(listId);
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'course-row';

    row.innerHTML = `
        <input 
            type="text" 
            class="course-name"
            placeholder="Course Name" 
            value="${data ? data.name : ''}" 
            oninput="saveGPAData()">

        <select 
            class="grade course-grade" 
            onchange="saveGPAData(); calculateTotalGPA()">
            <option value="" disabled ${!data ? 'selected' : ''}>Grade</option>
            <option value="4.0" ${data?.grade === '4.0' ? 'selected' : ''}>A</option>
            <option value="3.0" ${data?.grade === '3.0' ? 'selected' : ''}>B</option>
            <option value="2.0" ${data?.grade === '2.0' ? 'selected' : ''}>C</option>
            <option value="1.0" ${data?.grade === '1.0' ? 'selected' : ''}>D</option>
            <option value="0.0" ${data?.grade === '0.0' ? 'selected' : ''}>F</option>
        </select>

        <select 
            class="weight course-level" 
            onchange="saveGPAData(); calculateTotalGPA()">
            <option value="" disabled ${!data ? 'selected' : ''}>Level</option>
            <option value="0" ${data?.weight === '0' ? 'selected' : ''}>Regular</option>
            <option value="0.5" ${data?.weight === '0.5' ? 'selected' : ''}>Honors</option>
            <option value="1.0" ${data?.weight === '1.0' ? 'selected' : ''}>AP/IB</option>
        </select>

        <input 
            type="number" 
            class="credits"
            placeholder="Credits" 
            step="0.5" 
            min="0"
            value="${data ? data.credits : 'Credits'}" 
            oninput="saveGPAData(); calculateTotalGPA()">

        <button class="delete-btn"
            onclick="this.parentElement.remove(); saveGPAData(); calculateTotalGPA()">✕</button>
    `;

    list.appendChild(row);
    if (!data) saveGPAData();
}

// gpa calculation logic
function calculateTotalGPA() {
    const rows = document.querySelectorAll('.course-row');
    
    let totalUnweightedPoints = 0;
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    rows.forEach(row => {
        const grade = parseFloat(row.querySelector('.grade').value);
        const weight = parseFloat(row.querySelector('.weight').value);
        const credits = parseFloat(row.querySelector('.credits').value);

        if (!isNaN(grade) && !isNaN(credits)) {
            totalUnweightedPoints += (grade * credits);
            totalWeightedPoints += ((grade + weight) * credits);
            totalCredits += credits;
        }
    });

    const unweightedGPA = totalCredits > 0 ? (totalUnweightedPoints / totalCredits) : 0;
    const weightedGPA = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;

    document.getElementById('unweighted-output').textContent = unweightedGPA.toFixed(2);
    document.getElementById('weighted-output').textContent = weightedGPA.toFixed(2);
    
    saveGPAData(); // save after calculating
}

// local storage save function
function saveGPAData() {
    const years = ['9th-list', '10th-list', '11th-list', '12th-list'];
    const fullData = {};

    years.forEach(yearId => {
        const container = document.getElementById(yearId);
        if (container) {
            const rows = container.querySelectorAll('.course-row');
            fullData[yearId] = Array.from(rows).map(row => ({
                name: row.querySelector('input[type="text"]').value,
                grade: row.querySelector('.grade').value,
                weight: row.querySelector('.weight').value,
                credits: row.querySelector('.credits').value
            }));
        }
    });

    localStorage.setItem('gpa_calculator_data', JSON.stringify(fullData));
}

// local storage load function
function loadGPAData() {
    const savedData = localStorage.getItem('gpa_calculator_data');
    if (!savedData) return;

    const fullData = JSON.parse(savedData);

    Object.keys(fullData).forEach(yearId => {
        fullData[yearId].forEach(course => {
            addCourse(yearId, course); 
        });
    });
    calculateTotalGPA(); 
}

// only run loadGPAData if on the gpa page (would cause error on final exam page)
window.onload = function() {
    if (document.getElementById('9th-list')) {
        loadGPAData();
    }
};