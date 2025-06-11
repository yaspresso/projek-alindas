// Variabel Global
let currentMatrix = [];
let determinantResult = 0;
let currentStep = 0; // Mengontrol langkah pembelajaran utama
let matrixSize = 3; // Default matrix size
let selectedMethod = 'auto'; // Default method (auto, sarrus, cofactor)

// Log untuk menyimpan setiap langkah perhitungan determinan untuk ditampilkan
let calculationStepsLog = [];
let currentLogStep = 0; // Mengontrol langkah detail di dalam log

// Elemen-elemen HTML
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const exampleButton = document.getElementById('exampleButton');
const explanationSection = document.getElementById('explanationSection');
const explanationArea = document.getElementById('explanationArea');
const prevStepButton = document.getElementById('prevStepButton');
const nextStepButton = document.getElementById('nextStepButton');
const matrixOrderSelect = document.getElementById('matrixOrderSelect');
const methodSelect = document.getElementById('methodSelect');
const matrixInputGrid = document.getElementById('matrixInputGrid');

// --- Definisi Langkah-langkah Pembelajaran Utama ---
const learningSteps = [
    {
        name: "Intro",
        display: () => {
            explanationArea.innerHTML = `
                <p>Pilih ordo matriks dan metode perhitungan, masukkan angka-angka, lalu klik "Mulai Pembelajaran" untuk memulai.</p>
                <p><strong>Catatan:</strong> Metode Sarrus hanya berlaku untuk matriks 3x3. Untuk ordo lainnya, hanya Ekspansi Kofaktor yang tersedia.</p>
            `;
            prevStepButton.disabled = true;
            nextStepButton.disabled = true;
            removeSarrusArrows();
            removeHighlight();
        }
    },
    {
        name: "Ringkasan Perhitungan",
        display: () => {
            const currentSelectedOrder = parseInt(matrixOrderSelect.value);
            const currentSelectedMethod = methodSelect.value;
            let methodDescription = '';
            let matrixType = '';

            if (currentSelectedMethod === 'sarrus') {
                methodDescription = 'Metode Sarrus (khusus 3x3).';
            } else if (currentSelectedMethod === 'cofactor') {
                methodDescription = 'Metode Ekspansi Kofaktor.';
            } else { // auto
                if (currentSelectedOrder === 3) {
                    methodDescription = 'Metode Otomatis (Sarrus karena ordo 3x3).';
                } else {
                    methodDescription = 'Metode Otomatis (Ekspansi Kofaktor karena ordo >3x3).';
                }
            }

            // Hitung dan log semua langkah sebelum menampilkan ringkasan
            calculationStepsLog = []; // Reset log
            determinantResult = determinant(currentMatrix, true, currentSelectedMethod); // True untuk logging

            if (currentSelectedOrder === 3 && (currentSelectedMethod === 'sarrus' || currentSelectedMethod === 'auto')) {
                 matrixType = `Matriks ${currentSelectedOrder}x${currentSelectedOrder} ini akan dihitung determinannya menggunakan ${methodDescription}`;
            } else {
                 matrixType = `Matriks ${currentSelectedOrder}x${currentSelectedOrder} ini akan dihitung determinannya menggunakan ${methodDescription}`;
            }

            const matrixHTMLString = displayMatrixHTML(currentMatrix, currentSelectedOrder);

            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Ringkasan Perhitungan</h4>
                    <p>Anda telah memilih matriks ordo <strong>${currentSelectedOrder}x${currentSelectedOrder}</strong> dan ${methodDescription}</p>
                    <p>${matrixType}:</p>
                    <div class="matrix-output-display" id="currentMatrixDisplayContainer">
                        <div class="matrix-bracket left"></div>
                        <div class="output-grid order-${currentSelectedOrder}" id="currentMatrixDisplay">${matrixHTMLString}</div>
                        <div class="matrix-bracket right"></div>
                    </div>
                    <p>Determinan akhirnya adalah: <strong>${determinantResult}</strong></p>
                    <p>Klik 'Langkah Selanjutnya' untuk melihat detail perhitungan secara bertahap.</p>
                </div>
            `;
            currentLogStep = 0; // Reset log step untuk mulai dari awal detailnya
            prevStepButton.disabled = false;
            nextStepButton.disabled = (calculationStepsLog.length === 0);
            removeSarrusArrows();
            removeHighlight();
        }
    },
    {
        name: "Detail Perhitungan Langkah demi Langkah",
        display: () => {
            if (calculationStepsLog.length === 0) {
                explanationArea.innerHTML = `<p>Tidak ada langkah perhitungan detail yang terekam. Silakan kembali ke Ringkasan Perhitungan.</p>`;
                nextStepButton.disabled = true;
                prevStepButton.disabled = false;
                return;
            }
            displayCurrentLogStep(); // Tampilkan langkah detail dari log

            // Tombol prev/next untuk langkah detail akan diatur oleh displayCurrentLogStep
        }
    },
    {
        name: "Kesimpulan",
        display: () => {
            explanationArea.innerHTML = `
                <div class="explanation-step">
                    <h4>Kesimpulan Pembelajaran</h4>
                    <p>Anda telah berhasil mempelajari cara menghitung determinan matriks ordo ${matrixSize}x${matrixSize} menggunakan ${selectedMethod === 'sarrus' ? 'Metode Sarrus' : 'Ekspansi Kofaktor'}.</p>
                    <p>Determinan Matriks yang Anda masukkan adalah: <strong>${determinantResult}</strong></p>
                    <p>Anda bisa mengubah nilai matriks, ordo, atau metode di atas dan klik "Mulai Pembelajaran" lagi untuk mencoba soal baru, atau klik "Contoh Soal".</p>
                    <p>Terima kasih telah menggunakan media pembelajaran ini!</p>
                </div>
            `;
            prevStepButton.disabled = false;
            nextStepButton.disabled = true; // Tidak bisa maju lagi
            removeSarrusArrows();
            removeHighlight();
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

    // Untuk langkah perhitungan detail, kita pakai logika yang berbeda
    if (currentStep === 2) { // 'Detail Perhitungan Langkah demi Langkah'
        displayCurrentLogStep();
    } else {
        learningSteps[currentStep].display();
    }

    setTimeout(() => {
        // Atur status tombol Previous/Next
        if (currentStep === 2) { // Untuk langkah perhitungan detail, tombol dikendalikan oleh log
            prevStepButton.disabled = (currentLogStep === 0);
            nextStepButton.disabled = (currentLogStep === calculationStepsLog.length - 1);
        } else {
            prevStepButton.disabled = (currentStep === 0);
            nextStepButton.disabled = (currentStep === learningSteps.length - 1);
        }

        // Auto-scroll ke bagian penjelasan
        explanationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

// Mengatur tampilan langkah log perhitungan (untuk currentStep === 2)
function displayCurrentLogStep() {
    if (calculationStepsLog.length === 0) {
        explanationArea.innerHTML = `<p>Tidak ada langkah perhitungan detail yang terekam. Silakan kembali ke Ringkasan Perhitungan.</p>`;
        return;
    }

    const logEntry = calculationStepsLog[currentLogStep];
    
    // Perbaikan: Pastikan output-grid mendapatkan kelas order-N yang benar
    const matrixGridClass = `output-grid order-${logEntry.matrixOrder}`;
    const submatrixGridClass = `submatrix-grid order-${logEntry.submatrixOrder}`;

    let contentHTML = `
        <div class="explanation-step">
            <h4>${logEntry.title}</h4>
            <p>${logEntry.description}</p>
            ${logEntry.matrixHtml ? `
            <div class="matrix-output-display" id="logMatrixDisplayContainer">
                <div class="matrix-bracket left"></div>
                <div class="${matrixGridClass} ${logEntry.isExtendedForSarrus ? 'extended-sarrus' : ''}" id="logMatrixDisplay">${logEntry.matrixHtml}</div>
                <div class="matrix-bracket right"></div>
            </div>` : ''}
            ${logEntry.submatrixHtml ? `
            <div class="submatrix-display">
                <p>Sub-matriks ${logEntry.submatrixLabel}:</p>
                <span>|</span>
                <div class="${submatrixGridClass}">${logEntry.submatrixHtml}</div>
                <span>|</span>
            </div>` : ''}
            ${logEntry.sarrusProductsHtml ? `<div class="sarrus-products">${logEntry.sarrusProductsHtml}</div>` : ''}
            ${logEntry.equationHtml ? `<div class="equation-display">${logEntry.equationHtml}</div>` : ''}
        </div>
    `;
    explanationArea.innerHTML = contentHTML;

    // Highlight sel yang sedang diekspansi (jika ada)
    removeHighlight(); // Bersihkan highlight sebelumnya
    if (logEntry.highlightCell) {
        const targetMatrixContainer = document.getElementById('logMatrixDisplayContainer');
        if (targetMatrixContainer) {
            const row = logEntry.highlightCell.row;
            const col = logEntry.highlightCell.col;
            const cellToHighlight = targetMatrixContainer.querySelector(`.output-cell[data-row="${row}"][data-col="${col}"]`);
            if (cellToHighlight) {
                cellToHighlight.classList.add('highlighted-cell');
            }
        }
    }

    // Tampilkan panah Sarrus jika ini adalah langkah Sarrus (logEntry.isExtendedForSarrus === true)
    // dan pastikan methodnya sarrus atau auto
    if (logEntry.sarrusDisplayData && logEntry.sarrusDisplayData.extendedMatrix && logEntry.sarrusDisplayData.type && (selectedMethod === 'sarrus' || selectedMethod === 'auto')) {
        displaySarrusArrows(logEntry.sarrusDisplayData.extendedMatrix, 'logMatrixDisplayContainer', logEntry.sarrusDisplayData.type);
    } else {
        removeSarrusArrows();
    }

    prevStepButton.disabled = (currentLogStep === 0);
    nextStepButton.disabled = (currentLogStep === calculationStepsLog.length - 1);
}


function nextStep() {
    if (currentStep === 2) { // Jika sedang di langkah perhitungan detail
        if (currentLogStep < calculationStepsLog.length - 1) {
            currentLogStep++;
            displayCurrentLogStep();
        } else {
            // Jika sudah di log terakhir, maju ke langkah utama berikutnya (Kesimpulan)
            currentStep++;
            goToStep(currentStep);
        }
    } else if (currentStep < learningSteps.length - 1) {
        currentStep++;
        goToStep(currentStep);
    }
}

function prevStep() {
    if (currentStep === 2) { // Jika sedang di langkah perhitungan detail
        if (currentLogStep > 0) {
            currentLogStep--;
            displayCurrentLogStep();
        } else {
            // Jika sudah di log pertama, mundur ke langkah utama sebelumnya (Ringkasan)
            currentStep--;
            goToStep(currentStep);
        }
    } else if (currentStep > 0) {
        currentStep--;
        goToStep(currentStep);
    }
}

// --- FUNGSI-FUNGSI BANTUAN MATRIKS ---

// Fungsi untuk membuat input matriks secara dinamis
function generateMatrixInputs(order) {
    matrixInputGrid.innerHTML = ''; // Clear previous inputs
    matrixInputGrid.style.gridTemplateColumns = `repeat(${order}, 1fr)`; // Set CSS grid

    for (let i = 0; i < order; i++) {
        for (let j = 0; j < order; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `a${i + 1}${j + 1}`;
            input.value = ''; // Default empty
            input.step = 'any';
            matrixInputGrid.appendChild(input);
        }
    }
}

// Fungsi untuk membaca matriks dari input HTML
function getMatrixFromInputs() {
    const matrix = [];
    let isValid = true;
    const currentOrder = parseInt(matrixOrderSelect.value);

    for (let i = 0; i < currentOrder; i++) {
        let row = [];
        for (let j = 0; j < currentOrder; j++) {
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

// Fungsi untuk menampilkan matriks (NxN) sebagai string HTML
// isExtendedForSarrus: true jika ini adalah matriks 3x5 Sarrus yang diperluas
function displayMatrixHTML(mat, order, isExtendedForSarrus = false) {
    let html = '';
    // if (isExtendedForSarrus) { // Ini tidak perlu di sini, karena sudah diatur di displayCurrentLogStep
    //     order = 5; // Untuk Sarrus extended, ordonya 5 kolom
    // }
    
    for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
            const copyClass = (isExtendedForSarrus && (c === 3 || c === 4)) ? 'copy-col' : '';
            html += `<div class="output-cell${copyClass ? ' ' + copyClass : ''}" data-row="${r}" data-col="${c}">${mat[r][c]}</div>`;
        }
    }
    return html;
}

// Fungsi untuk mendapatkan sub-matriks (untuk Minor)
function getMinor(mat, rowToRemove, colToRemove) {
    const minor = [];
    for (let r = 0; r < mat.length; r++) {
        if (r === rowToRemove) continue;
        let newRow = [];
        for (let c = 0; c < mat[r].length; c++) {
            if (c === colToRemove) continue;
            newRow.push(mat[r][c]);
        }
        minor.push(newRow);
    }
    return minor;
}

// Fungsi untuk menghitung determinan matriks 2x2
function det2x2(m) {
    return (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
}

// Fungsi untuk menghitung produk-produk Sarrus (khusus 3x3)
function calculateSarrusProducts(mat) {
    if (mat.length !== 3 || mat[0].length !== 3) {
        return { determinant: NaN, sumPositive: NaN, sumNegative: NaN, extendedMatrix: [], productsHtml: '' };
    }
    const a = mat[0][0], b = mat[0][1], c = mat[0][2];
    const d = mat[1][0], e = mat[1][1], f = mat[1][2];
    const g = mat[2][0], h = mat[2][1], i = mat[2][2];

    const p1 = a * e * i;
    const p2 = b * f * g;
    const p3 = c * d * h;
    const sumPositive = p1 + p2 + p3;

    const n1 = c * e * g;
    const n2 = a * f * h;
    const n3 = b * d * i;
    const sumNegative = n1 + n2 + n3;

    const extendedMatrix = [
        [a, b, c, a, b],
        [d, e, f, d, e],
        [g, h, i, g, h]
    ];

    let productsHtml = `
        <div class="sarrus-positive-products">
            <p>Produk Positif:</p>
            <div class="sarrus-product-item positive">${a} &times; ${e} &times; ${i} = ${p1}</div>
            <div class="sarrus-product-item positive">${b} &times; ${f} &times; ${g} = ${p2}</div>
            <div class="sarrus-product-item positive">${c} &times; ${d} &times; ${h} = ${p3}</div>
        </div>
        <div class="sarrus-negative-products">
            <p>Produk Negatif:</p>
            <div class="sarrus-product-item negative">${c} &times; ${e} &times; ${g} = ${n1}</div>
            <div class="sarrus-product-item negative">${a} &times; ${f} &times; ${h} = ${n2}</div>
            <div class="sarrus-product-item negative">${b} &times; ${d} &times; ${i} = ${n3}</div>
        </div>
    `;

    return {
        determinant: sumPositive - sumNegative,
        sumPositive: sumPositive,
        sumNegative: sumNegative,
        extendedMatrix: extendedMatrix,
        productsHtml: productsHtml
    };
}


// FUNGSI UTAMA REKURSIF UNTUK MENGHITUNG DETERMINAN (EKSPANSI KOFAKTOR)
function determinant(mat, logging = false, methodOverride = 'auto') {
    const n = mat.length;
    const currentMethod = methodOverride; // Method for this specific calculation call

    if (n === 1) {
        if (logging) calculationStepsLog.push({
            title: `Perhitungan Determinan Matriks 1x1`,
            description: `Determinan matriks 1x1 adalah nilai elemen itu sendiri.`,
            matrix: mat,
            matrixOrder: 1,
            matrixHtml: displayMatrixHTML(mat, 1),
            equationHtml: `det = <strong>${mat[0][0]}</strong>`
        });
        return mat[0][0];
    }

    if (n === 2) {
        const detVal = det2x2(mat);
        if (logging) calculationStepsLog.push({
            title: `Perhitungan Determinan Matriks 2x2`,
            description: `Determinan matriks 2x2 dihitung dengan (ad - bc).`,
            matrix: mat,
            matrixOrder: 2,
            matrixHtml: displayMatrixHTML(mat, 2),
            equationHtml: `(${mat[0][0]} &times; ${mat[1][1]}) - (${mat[0][1]} &times; ${mat[1][0]}) = <strong>${detVal}</strong>`
        });
        return detVal;
    }

    if (n === 3 && (currentMethod === 'sarrus' || currentMethod === 'auto')) {
        const sarrusResult = calculateSarrusProducts(mat);
        if (logging) {
            // Log for Sarrus general concept (showing original 3x3)
            calculationStepsLog.push({
                title: `Perhitungan Determinan Matriks 3x3 (Metode Sarrus)`,
                description: `Untuk matriks 3x3, kita dapat menggunakan Metode Sarrus. Matriks asli adalah:`,
                matrix: mat,
                matrixOrder: 3,
                matrixHtml: displayMatrixHTML(mat, 3)
            });
            // Log for Sarrus extended matrix
            calculationStepsLog.push({
                title: `Perluasan Matriks 3x3 untuk Sarrus`,
                description: `Matriks diperluas dengan menyalin dua kolom pertama di sebelah kanan.`,
                matrix: sarrusResult.extendedMatrix,
                matrixOrder: 5, // Extended matrix has 5 columns
                matrixHtml: displayMatrixHTML(sarrusResult.extendedMatrix, 5, true), // true for isExtendedForSarrus
                sarrusDisplayData: { extendedMatrix: sarrusResult.extendedMatrix, type: 'all' }
            });
            // Log for Sarrus products summary
            calculationStepsLog.push({
                title: `Detail Perhitungan Sarrus`,
                description: `Hasil produk diagonal positif dan negatif, serta totalnya adalah:`,
                matrix: sarrusResult.extendedMatrix,
                matrixOrder: 5, // Extended matrix has 5 columns
                matrixHtml: displayMatrixHTML(sarrusResult.extendedMatrix, 5, true), // true for isExtendedForSarrus
                sarrusProductsHtml: sarrusResult.productsHtml,
                equationHtml: `
                    Jumlah Positif = ${sarrusResult.sumPositive}<br>
                    Jumlah Negatif = ${sarrusResult.sumNegative}<br>
                    Determinan = ${sarrusResult.sumPositive} - (${sarrusResult.sumNegative})
                `
            });
            // Log for Sarrus final result
            calculationStepsLog.push({
                title: `Hasil Akhir Determinan 3x3`,
                description: `Determinan akhir untuk matriks 3x3 ini adalah:`,
                matrix: mat,
                matrixOrder: 3,
                matrixHtml: displayMatrixHTML(mat, 3),
                equationHtml: `Determinan = <strong>${sarrusResult.determinant}</strong>`
            });
        }
        return sarrusResult.determinant;
    }

    let det = 0;
    // Ekspansi kofaktor sepanjang baris pertama
    for (let c = 0; c < n; c++) {
        const minorMat = getMinor(mat, 0, c); // Menghilangkan baris 0 dan kolom c
        const cofactorSign = Math.pow(-1, (0 + c)); // (-1)^(i+j)
        const element = mat[0][c];

        if (logging) {
            calculationStepsLog.push({
                title: `Ekspansi Kofaktor untuk Elemen a<sub>1,${c+1}</sub> (Ordo ${n}x${n})`,
                description: `Kita akan menghitung kofaktor untuk elemen di baris 1, kolom ${c+1} (${element}). Ini melibatkan pembentukan sub-matriks minor ${n-1}x${n-1} dengan menghilangkan baris 1 dan kolom ${c+1} dari matriks asli.`,
                matrix: mat,
                matrixOrder: n,
                matrixHtml: displayMatrixHTML(mat, n),
                highlightCell: {row: 0, col: c}, // Highlight elemen yang sedang diekspansi
                submatrix: minorMat,
                submatrixOrder: n-1,
                submatrixLabel: `M<sub>1,${c+1}</sub>`,
                submatrixHtml: displayMatrixHTML(minorMat, n-1)
            });
            calculationStepsLog.push({
                title: `Perhitungan Kofaktor C<sub>1,${c+1}</sub>`,
                description: `Determinan dari sub-matriks minor ${n-1}x${n-1} tersebut kemudian dihitung. Kofaktor adalah determinan minor dikalikan dengan tanda kofaktor (${cofactorSign === 1 ? '+' : '-'}).`,
                matrix: mat,
                matrixOrder: n,
                matrixHtml: displayMatrixHTML(mat, n),
                highlightCell: {row: 0, col: c},
                submatrix: minorMat,
                submatrixOrder: n-1,
                submatrixLabel: `M<sub>1,${c+1}</sub>`,
                submatrixHtml: displayMatrixHTML(minorMat, n-1),
                equationHtml: `
                    C<sub>1,${c+1}</sub> = (${cofactorSign}) &times; det(M<sub>1,${c+1}</sub>)<br>
                    Di mana M<sub>1,${c+1}</sub> = <div style="display:inline-flex; vertical-align:middle; gap:5px; font-size:0.8em; margin:0 5px; background-color:#f5f5f5; padding:5px; border-radius:5px;"><div class="matrix-bracket left"></div><div class="output-grid order-${n-1}">${displayMatrixHTML(minorMat, n-1)}</div><div class="matrix-bracket right"></div></div>
                `
            });
        }

        const minorDet = determinant(minorMat, logging, 'cofactor'); // Rekursi, selalu pakai cofactor untuk sub-matriks
        const term = cofactorSign * element * minorDet;
        
        if (logging) {
            calculationStepsLog.push({
                title: `Total Term untuk Elemen a<sub>1,${c+1}</sub>`,
                description: `Produk elemen ${element}, tanda kofaktor (${cofactorSign}), dan determinan minor (${minorDet}) adalah:`,
                matrix: mat,
                matrixOrder: n,
                matrixHtml: displayMatrixHTML(mat, n),
                highlightCell: {row: 0, col: c},
                equationHtml: `(${element}) &times; (${cofactorSign}) &times; (${minorDet}) = <strong>${term}</strong>`
            });
        }
        
        det += term;
    }

    if (logging) {
        calculationStepsLog.push({
            title: `Penjumlahan Semua Term Kofaktor (Ordo ${n}x${n})`,
            description: `Determinan akhir untuk matriks ordo ${n}x${n} ini adalah jumlah dari semua term kofaktor yang dihitung dari ekspansi baris pertama.`,
            matrix: mat,
            matrixOrder: n,
            matrixHtml: displayMatrixHTML(mat, n),
            equationHtml: `Determinan = <span style="font-size:1.1em; font-weight:bold;">${det}</span>`
        });
    }

    return det;
}

// FUNGSI VISUALISASI PANAH SARRUS (HANYA UNTUK 3X3)
function displaySarrusArrows(extendedMatrix, containerId, type) {
    removeSarrusArrows();

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container for Sarrus arrows not found:', containerId);
        return;
    }

    const gridElement = container.querySelector('.output-grid');
    if (!gridElement) {
        console.error('Output grid not found within container for Sarrus arrows.');
        return;
    }

    // Perbaikan: Setel grid-template-columns berdasarkan jumlah kolom dari extendedMatrix
    gridElement.style.gridTemplateColumns = `repeat(${extendedMatrix[0].length}, max-content)`;


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

    // Data indeks sel untuk panah positif dan negatif (berdasarkan matriks 3x5)
    // Ini adalah indeks kolom pada extended matrix (3x5)
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

function removeHighlight() {
    document.querySelectorAll('.highlighted-cell').forEach(cell => {
        cell.classList.remove('highlighted-cell');
    });
}

// --- FUNGSI PENGATUR OPSI DAN INPUT MATRIKS ---
function updateMethodOptions() {
    const currentOrder = parseInt(matrixOrderSelect.value);
    const sarrusOption = methodSelect.querySelector('option[value="sarrus"]');

    if (currentOrder !== 3) {
        sarrusOption.disabled = true;
        if (methodSelect.value === 'sarrus') {
            methodSelect.value = 'auto'; // Kembali ke otomatis jika Sarrus tidak valid
        }
    } else {
        sarrusOption.disabled = false;
    }
    // Update global matrixSize for other functions
    matrixSize = currentOrder;
    generateMatrixInputs(matrixSize); // Regenerate inputs based on new size
    resetExplanationArea(); // Clear explanation when order/method changes
}

function resetExplanationArea() {
    explanationSection.style.display = 'none';
    explanationArea.innerHTML = '<p>Pilih ordo dan metode, lalu klik "Mulai Pembelajaran".</p>';
    currentStep = 0;
    currentLogStep = 0;
    calculationStepsLog = [];
    prevStepButton.disabled = true;
    nextStepButton.disabled = true;
    removeSarrusArrows();
    removeHighlight();
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial setup based on default select values
    matrixSize = parseInt(matrixOrderSelect.value);
    generateMatrixInputs(matrixSize);
    updateMethodOptions();
    goToStep(0); // Display intro

    // Event listeners for select changes
    matrixOrderSelect.addEventListener('change', updateMethodOptions);
    methodSelect.addEventListener('change', resetExplanationArea); // Reset when method changes

    startButton.addEventListener('click', () => {
        const { matrix, isValid } = getMatrixFromInputs();
        if (!isValid) {
            alert("Mohon masukkan semua angka pada matriks (tidak boleh kosong atau non-angka).");
            return;
        }
        currentMatrix = matrix;
        selectedMethod = methodSelect.value; // Get selected method for this calculation
        explanationSection.style.display = 'block';
        goToStep(1); // Mulai dari langkah Ringkasan
    });

    resetButton.addEventListener('click', () => {
        resetExplanationArea();
        // Clear all input fields
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                document.getElementById(`a${i + 1}${j + 1}`).value = '';
            }
        }
    });

    exampleButton.addEventListener('click', () => {
        const currentOrder = parseInt(matrixOrderSelect.value);
        const defaultValuesMap = {
            2: [[1, 2], [3, 4]],
            3: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
            4: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]],
            5: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]
        };
        const defaultValues = defaultValuesMap[currentOrder];

        if (defaultValues) {
            for (let i = 0; i < currentOrder; i++) {
                for (let j = 0; j < currentOrder; j++) {
                    document.getElementById(`a${i + 1}${j + 1}`).value = defaultValues[i][j];
                }
            }
        }
        
        const { matrix, isValid } = getMatrixFromInputs();
        currentMatrix = matrix;
        selectedMethod = methodSelect.value; // Get selected method for this calculation
        explanationSection.style.display = 'block';
        goToStep(1);
    });

    prevStepButton.addEventListener('click', prevStep);
    nextStepButton.addEventListener('click', nextStep);
});