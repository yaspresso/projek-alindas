// Variabel Global
let currentMatrix = [];
let minorMatrixValues = [];
let cofactorMatrixValues = [];
let determinantResult = 0;
let currentStep = 0;

// Elemen-elemen HTML
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const exampleButton = document.getElementById('exampleButton');
const explanationSection = document.getElementById('explanationSection');
const explanationArea = document.getElementById('explanationArea');
const prevStepButton = document.getElementById('prevStepButton');
const nextStepButton = document.getElementById('nextStepButton');
const matrixInputs = document.querySelectorAll('#matrixInputGrid input');

// Definisi langkah-langkah pembelajaran
const learningSteps = [
    {
        name: "Intro",
        display: () => {
            explanationArea.innerHTML = `
                <p>Klik "Mulai Pembelajaran" untuk melihat langkah pertama atau masukkan angka matriks Anda sendiri.</p>
            `;
            prevStepButton.disabled = true;
            nextStepButton.disabled = true;
        }
    },
    {
        name: "Pengantar Determinan",
        display: () => {
            const matrixHTMLString = displayMatrixHTML(currentMatrix);
            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 1: Memahami Determinan Matriks Ordo 3x3</h4>
                    <p><strong>Determinan</strong> adalah nilai skalar yang dapat dihitung dari elemen-elemen suatu matriks persegi. Untuk matriks 3x3, kita akan menggunakan <strong>Metode Sarrus</strong>. Ini adalah matriks yang akan kita hitung determinannya:</p>
                    <div class="matrix-output-display" id="currentMatrixDisplayContainer">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid" id="currentMatrixDisplay">${matrixHTMLString}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <p>Metode Sarrus akan membantu kita menemukan nilai ini dengan cara yang sistematis.</p>
                </div>
            `;
            prevStepButton.disabled = true;
            nextStepButton.disabled = false;
            removeSarrusArrows();
        }
    },
    {
        name: "Matriks Diperluas",
        display: () => {
            const extendedMatrixData = getExtendedMatrixData(currentMatrix);
            const extendedMatrixHTMLString = displayMatrixHTML(extendedMatrixData, '', true);
            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 2: Perluas Matriks</h4>
                    <p>Untuk metode Sarrus, kita perlu menuliskan kembali dua kolom pertama matriks di sebelah kanan matriks asli. Ini akan membantu kita melihat pola diagonalnya.</p>
                    <div class="matrix-output-display" id="extendedMatrixDisplayContainer">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid extended" id="extendedMatrixDisplay">${extendedMatrixHTMLString}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <p>Perhatikan bahwa kolom ke-4 dan ke-5 adalah salinan dari kolom ke-1 dan ke-2.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
            removeSarrusArrows();
        }
    },
    {
        name: "Diagonal Positif",
        display: () => {
            const extendedMatrixData = getExtendedMatrixData(currentMatrix);
            const extendedMatrixHTMLString = displayMatrixHTML(extendedMatrixData, '', true);
            const products = calculateSarrusProducts(currentMatrix);

            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 3: Hitung Jumlah Perkalian Diagonal Positif (+)</h4>
                    <p>Sekarang, kita hitung perkalian elemen-elemen sepanjang tiga diagonal dari kiri atas ke kanan bawah (diagonal positif), lalu menjumlahkannya:</p>
                    <div class="matrix-output-display" id="extendedMatrixDisplayContainer">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid extended" id="extendedMatrixDisplay">${extendedMatrixHTMLString}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <div class="sarrus-products">
                        <div class="sarrus-product-item positive">${products.pos_terms[0].formula} = ${products.pos_values[0]}</div>
                        <div class="sarrus-product-item positive">${products.pos_terms[1].formula} = ${products.pos_values[1]}</div>
                        <div class="sarrus-product-item positive">${products.pos_terms[2].formula} = ${products.pos_values[2]}</div>
                    </div>
                    <div class="equation-display">
                        Jumlah Positif = ${products.pos_values[0]} + ${products.pos_values[1]} + ${products.pos_values[2]} = <strong>${products.sumPositive}</strong>
                    </div>
                    <p>Angka-angka ini akan ditambah dalam perhitungan akhir determinan.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
        }
    },
    {
        name: "Diagonal Negatif",
        display: () => {
            const extendedMatrixData = getExtendedMatrixData(currentMatrix);
            const extendedMatrixHTMLString = displayMatrixHTML(extendedMatrixData, '', true);
            const products = calculateSarrusProducts(currentMatrix);

            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 4: Hitung Jumlah Perkalian Diagonal Negatif (-)</h4>
                    <p>Selanjutnya, kita hitung perkalian elemen-elemen sepanjang tiga diagonal dari kanan atas ke kiri bawah (diagonal negatif), lalu menjumlahkannya:</p>
                    <div class="matrix-output-display" id="extendedMatrixDisplayContainer">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid extended" id="extendedMatrixDisplay">${extendedMatrixHTMLString}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <div class="sarrus-products">
                        <div class="sarrus-product-item negative">${products.neg_terms[0].formula} = ${products.neg_values[0]}</div>
                        <div class="sarrus-product-item negative">${products.neg_terms[1].formula} = ${products.neg_values[1]}</div>
                        <div class="sarrus-product-item negative">${products.neg_terms[2].formula} = ${products.neg_values[2]}</div>
                    </div>
                    <div class="equation-display">
                        Jumlah Negatif = ${products.neg_values[0]} + ${products.neg_values[1]} + ${products.neg_values[2]} = <strong>${products.sumNegative}</strong>
                    </div>
                    <p>Angka-angka ini akan dikurangkan dalam perhitungan akhir determinan.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
        }
    },
    {
        name: "Hasil Determinan",
        display: () => {
            const products = calculateSarrusProducts(currentMatrix);
            determinantResult = products.sumPositive - products.sumNegative;

            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 5: Hitung Determinan Akhir</h4>
                    <p>Determinan matriks diperoleh dengan mengurangkan total produk diagonal negatif dari total produk diagonal positif:</p>
                    <div class="equation-display">
                        Determinan = Jumlah Positif - Jumlah Negatif<br>
                        Determinan = ${products.sumPositive} - (${products.sumNegative})<br>
                        Determinan = <strong>${determinantResult}</strong>
                    </div>
                    <p>Jadi, determinan dari matriks yang Anda masukkan adalah:</p>
                    <div class="final-result-display">
                        Determinan = ${determinantResult}
                    </div>
                    <p>Sekarang kita akan beralih ke Matriks Minor.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
            removeSarrusArrows();
        }
    },
    {
        name: "Pengantar Minor",
        display: () => {
            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 6: Memahami Matriks Minor</h4>
                    <p><strong>Matriks Minor (M<sub>ij</sub>)</strong> dari suatu elemen (a<sub>ij</sub>) dalam matriks adalah determinan dari sub-matriks yang terbentuk dengan menghilangkan baris ke-i dan kolom ke-j dari matriks asli.</p>
                    <p>Untuk setiap elemen di matriks 3x3, kita akan mendapatkan sub-matriks 2x2. Kita akan menghitung determinan dari masing-masing sub-matriks ini untuk mendapatkan nilai minornya.</p>
                    <p>Klik 'Langkah Selanjutnya' untuk melihat perhitungan Minor untuk setiap elemen.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
        }
    },
    {
        name: "Perhitungan Minor",
        display: () => {
            let minorExplanationHtml = `
                <div class="explanation-step">
                    <h4>Langkah 7: Hitung Semua Elemen Matriks Minor</h4>
                    <p>Mari kita hitung satu per satu elemen minor dari matriks awal:</p>
            `;
            minorMatrixValues = [];

            for (let r = 0; r < 3; r++) {
                let row = [];
                minorExplanationHtml += `<h3>Minor Baris ${r + 1}</h3>`;
                for (let c = 0; c < 3; c++) {
                    const sub = getSubmatrix(currentMatrix, r, c);
                    const minorValue = det2x2(sub);
                    row.push(minorValue);

                    minorExplanationHtml += `
                        <p>M<sub>${r + 1}${c + 1}</sub> (elemen di baris ${r + 1}, kolom ${c + 1}):</p>
                        <div class="submatrix-display">
                            <span>|</span>
                            <div class="submatrix-grid">
                                <div class="cell">${sub[0][0]}</div>
                                <div class="cell">${sub[0][1]}</div>
                                <div class="cell">${sub[1][0]}</div>
                                <div class="cell">${sub[1][1]}</div>
                            </div>
                            <span>|</span>
                        </div>
                        <div class="equation-display">
                            (${sub[0][0]} &times; ${sub[1][1]}) - (${sub[0][1]} &times; ${sub[1][0]}) = <strong>${minorValue}</strong>
                        </div>
                        <hr style="border-color: var(--border-color); margin: 15px auto; width: 50%;">
                    `;
                }
                minorMatrixValues.push(row);
            }
            minorExplanationHtml += `
                    <h4>Hasil Matriks Minor:</h4>
                    <div class="matrix-output-display">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid" id="minorMatrixResult">${displayMatrixHTML(minorMatrixValues)}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                </div>
            `;
            explanationArea.innerHTML = minorExplanationHtml;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
        }
    },
    {
        name: "Pengantar Kofaktor",
        display: () => {
            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 8: Memahami Matriks Kofaktor</h4>
                    <p><strong>Matriks Kofaktor (C<sub>ij</sub>)</strong> terkait erat dengan matriks minor. Kofaktor dari suatu elemen (a<sub>ij</sub>) dihitung dengan rumus:</p>
                    <div class="equation-display">
                        C<sub>ij</sub> = (-1)<sup>i+j</sup> &times; M<sub>ij</sub>
                    </div>
                    <p>Di mana M<sub>ij</sub> adalah minor yang sesuai, dan <code>(-1)<sup>i+j</sup></code> menentukan tanda positif atau negatifnya berdasarkan posisi baris (i) dan kolom (j) elemen tersebut.</p>
                    <p>Pola tanda untuk matriks 3x3 adalah:</p>
                    <div class="cofactor-sign-matrix">
                        <div class="matrix-bracket left"></div>
                        <div class="sign-grid">
                            <div class="sign-cell positive">+</div>
                            <div class="sign-cell negative">-</div>
                            <div class="sign-cell positive">+</div>
                            <div class="sign-cell negative">-</div>
                            <div class="sign-cell positive">+</div>
                            <div class="sign-cell negative">-</div>
                            <div class="sign-cell positive">+</div>
                            <div class="sign-cell negative">-</div>
                            <div class="sign-cell positive">+</div>
                        </div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <p>Klik 'Langkah Selanjutnya' untuk melihat perhitungan Kofaktor untuk setiap elemen.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
        }
    },
    {
        name: "Perhitungan Kofaktor",
        display: () => {
            let cofactorExplanationHtml = `
                <div class="explanation-step">
                    <h4>Langkah 9: Hitung Semua Elemen Matriks Kofaktor</h4>
                    <p>Kita akan mengalikan setiap elemen minor dengan tanda yang sesuai berdasarkan posisinya:</p>
            `;
            cofactorMatrixValues = [];

            for (let r = 0; r < 3; r++) {
                let row = [];
                cofactorExplanationHtml += `<h3>Kofaktor Baris ${r + 1}</h3>`;
                for (let c = 0; c < 3; c++) {
                    const sign = ((r + c) % 2 === 0) ? 1 : -1;
                    const minorValue = minorMatrixValues[r][c];
                    const cofactorValue = sign * minorValue;
                    row.push(cofactorValue);

                    const signSymbol = (sign === 1) ? '+' : '-';
                    const termSign = (sign === 1) ? '' : '-';

                    cofactorExplanationHtml += `
                        <p>C<sub>${r + 1}${c + 1}</sub> = <span style="font-weight: bold; color: ${sign === 1 ? 'var(--sarrus-positive)' : 'var(--sarrus-negative)'};">(${signSymbol}1)</span> &times; M<sub>${r + 1}${c + 1}</sub></p>
                        <div class="equation-display">
                            C<sub>${r + 1}${c + 1}</sub> = ${termSign}${Math.abs(minorValue)} = <strong>${cofactorValue}</strong>
                        </div>
                        <hr style="border-color: var(--border-color); margin: 15px auto; width: 50%;">
                    `;
                }
                cofactorMatrixValues.push(row);
            }
            cofactorExplanationHtml += `
                    <h4>Hasil Matriks Kofaktor:</h4>
                    <div class="matrix-output-display">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid" id="cofactorMatrixResult">${displayMatrixHTML(cofactorMatrixValues)}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                </div>
            `;
            explanationArea.innerHTML = cofactorExplanationHtml;
            prevStepButton.disabled = false;
            nextStepButton.disabled = false;
        }
    },
    {
        name: "Kesimpulan",
        display: () => {
            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Langkah 10: Ringkasan Pembelajaran</h4>
                    <p>Anda telah berhasil mempelajari cara menghitung:</p>
                    <ul>
                        <li><strong>Determinan Matriks 3x3</strong> menggunakan Metode Sarrus.</li>
                        <li><strong>Matriks Minor</strong> untuk setiap elemen.</li>
                        <li><strong>Matriks Kofaktor</strong> yang berasal dari matriks minor.</li>
                    </ul>
                    <p>Pemahaman tentang determinan, minor, dan kofaktor adalah dasar penting dalam aljabar linear dan memiliki banyak aplikasi dalam berbagai bidang ilmu.</p>
                    <p>Determinan Matriks Anda adalah: <strong>${determinantResult}</strong></p>
                    <h4>Matriks Minor Anda:</h4>
                    <div class="matrix-output-display">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid" id="finalMinorMatrix">${displayMatrixHTML(minorMatrixValues)}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <h4>Matriks Kofaktor Anda:</h4>
                    <div class="matrix-output-display">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid" id="finalCofactorMatrix">${displayMatrixHTML(cofactorMatrixValues)}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <p>Anda bisa mengubah nilai matriks di atas dan klik "Mulai Pembelajaran" lagi untuk mencoba soal baru, atau klik "Contoh Soal" untuk melihat matriks contoh.</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = true;
        }
    }
];

// FUNGSI UTAMA UNTUK MENGATUR ALUR PEMBELAJARAN
function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= learningSteps.length) {
        console.warn("Langkah tidak valid:", stepIndex);
        return;
    }
    currentStep = stepIndex;
    learningSteps[currentStep].display();

    setTimeout(() => {
        prevStepButton.disabled = (currentStep === 0 || currentStep === 1);
        nextStepButton.disabled = (currentStep === learningSteps.length - 1);

        if (currentStep === 3) {
            displaySarrusArrows(getExtendedMatrixData(currentMatrix), 'extendedMatrixDisplayContainer', 'positive');
        } else if (currentStep === 4) {
            displaySarrusArrows(getExtendedMatrixData(currentMatrix), 'extendedMatrixDisplayContainer', 'negative');
        } else {
            removeSarrusArrows();
        }

        explanationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

function nextStep() {
    if (currentStep < learningSteps.length - 1) {
        currentStep++;
        goToStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        goToStep(currentStep);
    } else if (currentStep === 1) {
        currentStep = 0;
        goToStep(currentStep);
    }
}

// FUNGSI-FUNGSI BANTUAN PERHITUNGAN MATRIKS
function getMatrixFromInputs() {
    const matrix = [];
    let isValid = true;
    for (let i = 0; i < 3; i++) {
        let row = [];
        for (let j = 0; j < 3; j++) {
            const inputId = `a${i + 1}${j + 1}`;
            const inputValue = document.getElementById(inputId).value;
            const numValue = parseFloat(inputValue);

            if (isNaN(numValue) || inputValue.trim() === '') {
                isValid = false;
                break;
            }
            row.push(numValue);
        }
        if (!isValid) break;
        matrix.push(row);
    }
    return { matrix, isValid };
}

function displayMatrixHTML(mat, elementId = '', isExtended = false) {
    let html = '';
    for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
            const copyClass = (isExtended && c >= 3) ? 'copy-col' : '';
            // Perbaikan ada di sini: Hanya tambahkan kelas jika 'copyClass' tidak kosong
            html += `<div class="output-cell${copyClass ? ' ' + copyClass : ''}" data-row="${r}" data-col="${c}">${mat[r][c]}</div>`;
        }
    }
    return html;
}

function getExtendedMatrixData(mat) {
    return [
        [mat[0][0], mat[0][1], mat[0][2], mat[0][0], mat[0][1]],
        [mat[1][0], mat[1][1], mat[1][2], mat[1][0], mat[1][1]],
        [mat[2][0], mat[2][1], mat[2][2], mat[2][0], mat[2][1]]
    ];
}

function calculateSarrusProducts(mat) {
    const p1 = mat[0][0] * mat[1][1] * mat[2][2];
    const p2 = mat[0][1] * mat[1][2] * mat[2][0];
    const p3 = mat[0][2] * mat[1][0] * mat[2][1];
    const sumPositive = p1 + p2 + p3;

    const n1 = mat[0][2] * mat[1][1] * mat[2][0];
    const n2 = mat[0][0] * mat[1][2] * mat[2][1];
    const n3 = mat[0][1] * mat[1][0] * mat[2][2];
    const sumNegative = n1 + n2 + n3;

    return {
        pos_values: [p1, p2, p3],
        neg_values: [n1, n2, n3],
        pos_terms: [
            {r1:0,c1:0,r2:1,c2:1,r3:2,c3:2, formula:`${mat[0][0]} &times; ${mat[1][1]} &times; ${mat[2][2]}`},
            {r1:0,c1:1,r2:1,c2:2,r3:2,c3:3, formula:`${mat[0][1]} &times; ${mat[1][2]} &times; ${mat[2][0]}`},
            {r1:0,c1:2,r2:1,c2:3,r3:2,c3:4, formula:`${mat[0][2]} &times; ${mat[1][0]} &times; ${mat[2][1]}`},
        ],
        neg_terms: [
            {r1:0,c1:2,r2:1,c2:1,r3:2,c3:0, formula:`${mat[0][2]} &times; ${mat[1][1]} &times; ${mat[2][0]}`},
            {r1:0,c1:0,r2:1,c2:2,r3:2,c3:1, formula:`${mat[0][0]} &times; ${mat[1][2]} &times; ${mat[2][1]}`},
            {r1:0,c1:1,r2:1,c2:0,r3:2,c3:2, formula:`${mat[0][1]} &times; ${mat[1][0]} &times; ${mat[2][2]}`},
        ],
        sumPositive: sumPositive,
        sumNegative: sumNegative
    };
}

function det2x2(m) {
    return (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
}

function getSubmatrix(mat, r, c) {
    const sub = [];
    for (let i = 0; i < 3; i++) {
        if (i === r) continue;
        let row = [];
        for (let j = 0; j < 3; j++) {
            if (j === c) continue;
            row.push(mat[i][j]);
        }
        sub.push(row);
    }
    return sub;
}

// FUNGSI VISUALISASI PANAH SARRUS
function displaySarrusArrows(extendedMatrixData, containerId, type) {
    removeSarrusArrows();

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container untuk panah tidak ditemukan:', containerId);
        return;
    }

    const gridElement = container.querySelector('.output-grid');
    if (!gridElement) {
        console.error('Output grid tidak ditemukan di dalam container.');
        return;
    }
    const cells = gridElement.querySelectorAll('.output-cell');
    const containerRect = container.getBoundingClientRect();

    function addArrow(startRow, startCol, endRow, endCol, arrowType) {
        const startCell = Array.from(cells).find(cell =>
            parseInt(cell.dataset.row) === startRow && parseInt(cell.dataset.col) === startCol
        );
        const endCell = Array.from(cells).find(cell =>
            parseInt(cell.dataset.row) === endRow && parseInt(cell.dataset.col) === endCol
        );

        if (!startCell || !endCell) {
            console.error('Sel tidak ditemukan untuk indeks:', startRow, startCol, 'dan', endRow, endCol);
            return;
        }

        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const startX_viewport = (startRect.left + startRect.right) / 2;
        const startY_viewport = (startRect.top + startRect.bottom) / 2;
        const endX_viewport = (endRect.left + endRect.right) / 2;
        const endY_viewport = (endRect.top + endRect.bottom) / 2;

        const lineStartX = startX_viewport - containerRect.left;
        const lineStartY = startY_viewport - containerRect.top;
        const lineEndX = endX_viewport - containerRect.left;
        const lineEndY = endY_viewport - containerRect.top;

        const length = Math.sqrt(Math.pow(lineEndX - lineStartX, 2) + Math.pow(lineEndY - lineStartY, 2));
        const angle = Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180 / Math.PI;

        const line = document.createElement('div');
        line.classList.add('sarrus-line', arrowType, 'active');
        line.style.width = `${length}px`;
        line.style.left = `${lineStartX}px`;
        line.style.top = `${lineStartY}px`;
        line.style.transform = `rotate(${angle}deg)`;

        container.appendChild(line);
    }

    const positivePaths = [
        { start: {r:0,c:0}, end: {r:2,c:2} },
        { start: {r:0,c:1}, end: {r:2,c:3} },
        { start: {r:0,c:2}, end: {r:2,c:4} }
    ];

    const negativePaths = [
        { start: {r:0,c:2}, end: {r:2,c:0} },
        { start: {r:0,c:3}, end: {r:2,c:1} },
        { start: {r:0,c:4}, end: {r:2,c:2} }
    ];

    if (type === 'positive' || type === 'all') {
        positivePaths.forEach(path => addArrow(path.start.r, path.start.c, path.end.r, path.end.c, 'positive'));
    }
    if (type === 'negative' || type === 'all') {
        negativePaths.forEach(path => addArrow(path.start.r, path.start.c, path.end.r, path.end.c, 'negative'));
    }
}

function removeSarrusArrows() {
    document.querySelectorAll('.sarrus-line').forEach(line => line.remove());
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    goToStep(0);

    startButton.addEventListener('click', () => {
        const { matrix, isValid } = getMatrixFromInputs();
        if (!isValid) {
            alert("Mohon masukkan semua angka pada matriks (tidak boleh kosong atau non-angka).");
            return;
        }
        currentMatrix = matrix;
        explanationSection.style.display = 'block';
        goToStep(1);
    });

    resetButton.addEventListener('click', () => {
        matrixInputs.forEach(input => {
            input.value = '';
        });
        explanationSection.style.display = 'none';
        goToStep(0);
        removeSarrusArrows();
    });

    exampleButton.addEventListener('click', () => {
        document.getElementById('a11').value = 1;
        document.getElementById('a12').value = 2;
        document.getElementById('a13').value = 3;
        document.getElementById('a21').value = 4;
        document.getElementById('a22').value = 5;
        document.getElementById('a23').value = 6;
        document.getElementById('a31').value = 7;
        document.getElementById('a32').value = 8;
        document.getElementById('a33').value = 9;
        
        const { matrix, isValid } = getMatrixFromInputs();
        currentMatrix = matrix;
        explanationSection.style.display = 'block';
        goToStep(1);
    });

    prevStepButton.addEventListener('click', prevStep);
    nextStepButton.addEventListener('click', nextStep);
});