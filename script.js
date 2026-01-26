
let musicOn = false;
let currentLevel = 1;
let unlockedLevel = parseInt(localStorage.getItem('unlockedLevel')) || 1;
let sfxOn = true;
let wrongAttempts = 0;

// ========== DATA LEVEL (25 Soal untuk Peta) ==========
    const levels = [
        { start: {x: -5, y: 3}, end: {x: 5, y: 3}, solution: { m: 0, c: 3 } },    // 1
        { start: {x: 0, y: 0}, end: {x: 5, y: 5}, solution: { m: 1, c: 0 } },    // 2
        { start: {x: 0, y: 0}, end: {x: 4, y: 8}, solution: { m: 2, c: 0 } },    // 3
        { start: {x: 8, y: -5}, end: {x: -8, y: -5}, solution: { m: 0, c: -5 } },// 4
        { start: {x: 0, y: 0}, end: {x: -5, y: 5}, solution: { m: -1, c: 0 } },  // 5
        { start: {x: 0, y: 0}, end: {x: 3, y: -6}, solution: { m: -2, c: 0 } },  // 6
        { start: {x: 0, y: 0}, end: {x: 8, y: 4}, solution: { m: 0.5, c: 0 } },  // 7
        { start: {x: -4, y: -1}, end: {x: 4, y: 7}, solution: { m: 1, c: 3 } },  // 8
        { start: {x: 0, y: -4}, end: {x: 6, y: -1}, solution: { m: 0.5, c: -4 }},// 9
        { start: {x: 2, y: -2}, end: {x: -2, y: 6}, solution: { m: -2, c: 2 } }, // 10
        { start: {x: 1, y: 4}, end: {x: 3, y: 8}, solution: { m: 2, c: 2 } },    // 11
        { start: {x: 2, y: 5}, end: {x: -1, y: -4}, solution: { m: 3, c: -1 } }, // 12
        { start: {x: 5, y: 2}, end: {x: -5, y: -2}, solution: { m: 0.4, c: 0 } },// 13
        { start: {x: 0, y: 5}, end: {x: 5, y: 0}, solution: { m: -1, c: 5 } },   // 14
        { start: {x: 2, y: 1}, end: {x: 4, y: 0}, solution: { m: -0.5, c: 2 } }, // 15
        { start: {x: -5, y: 7}, end: {x: 1, y: -5}, solution: { m: -2, c: -3 } },// 16
        { start: {x: -4, y: -5}, end: {x: 2, y: 4}, solution: { m: 1.5, c: 1 } },// 17
        { start: {x: 3, y: -7}, end: {x: -5, y: 5}, solution: { m: -1.5, c: -2.5 } },// 18
        { start: {x: -7, y: 1}, end: {x: 7, y: 8}, solution: { m: 0.5, c: 4.5 } },// 19
        { start: {x: -3, y: 6}, end: {x: 6, y: 0}, solution: { m: -2/3, c: 4 } },// 20
        { start: {x: -8, y: -2}, end: {x: 4, y: 2}, solution: { m: 1/3, c: 2/3 } },// 21
        { start: {x: 5, y: 9}, end: {x: -1, y: -3}, solution: { m: 2, c: -1 } }, // 22
        { start: {x: -2, y: 8}, end: {x: 3, y: -7}, solution: { m: -3, c: 2 } }, // 23
        { start: {x: 9, y: 3}, end: {x: -6, y: -2}, solution: { m: 1/3, c: 0 } },// 24
        { start: {x: -4, y: -6}, end: {x: 8, y: 0}, solution: { m: 0.5, c: -4 } }// 25
    ];
function switchTab(targetTab) {
        console.log("Mencoba pindah ke tab: " + targetTab);

        // 1. Sembunyikan semua tab-content
        const allContents = document.querySelectorAll('.tab-content');
        allContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none'; 
        });

        // 2. Tampilkan tab yang dipilih
        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block';
        
        } else {
            console.error("EROR: ID '" + targetTab + "' tidak ditemukan!");
        }

        // 3. Update status aktif di Navbar (baik itu tag <a> maupun class .nav-tab)
        const allNavLinks = document.querySelectorAll('.nav-links a, .nav-tab');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            // Cek berdasarkan data-tab atau teks
            if (link.getAttribute('data-tab') === targetTab) {
                link.classList.add('active');
            }
        });

        // 4. Logika Khusus Game
        if (targetTab === 'game') {
            document.getElementById('game-map-view').style.display = 'block';
            document.getElementById('gameplay-view').style.display = 'none';
            window.dispatchEvent(new CustomEvent('openGameMap'));
        }
    }
function backToMap() {
        console.log("Menutup level dan memperbarui peta...");

        // 1. Logika Tukar Tampilan
        const mapView = document.getElementById('game-map-view');
        const gameView = document.getElementById('gameplay-view');

        if (mapView && gameView) {
            mapView.style.display = 'block'; // Munculkan Peta
            gameView.style.display = 'none';  // Sembunyikan Permainan
            unlockedLevel = parseInt(localStorage.getItem('unlockedLevel')) || 1;
            populateLevelMap();
        }

        // 2. Bersihkan Instance p5.js agar tidak berat [DIRUBAH]
        if (window.p5InstanceGlobal) {
            window.p5InstanceGlobal.remove();
            window.p5InstanceGlobal = null;
        }
    }
function toggleMusic() {
        const bgMusic = document.getElementById('bg-music');
        const musicBtn = document.getElementById('music-toggle');
        const musicIcon = musicBtn ? musicBtn.querySelector('i') : null;
        
        if (!bgMusic) {
            console.error("Elemen audio tidak ditemukan!");
            return;
        }

        // Toggle status musik
        musicOn = !musicOn;

        if (musicOn) {
            // Jalankan musik
            bgMusic.play().catch(error => {
                console.log("Autoplay dicegah oleh browser. Harus diklik manual.");
                musicOn = false;
            });
            musicBtn.classList.add('active');
            musicBtn.querySelector('i').className = 'fas fa-music'; // Ikon nyala
            musicIcon.className = 'fa-solid fa-music';
        } else {
            // Matikan musik
            bgMusic.pause();
            musicBtn.classList.remove('active');
            musicBtn.querySelector('i').className = 'fas fa-music-slash'; // Ikon mati
            musicIcon.className = 'fa-solid fa-music';
        }
    }
function showDetail(materiId) {
    const grid = document.getElementById('materi-grid');
    const detailView = document.getElementById('materi-detail-view');
    const contentArea = document.getElementById('materi-content-area');
    const title = document.getElementById('materi-title');

    grid.style.display = 'none';
    title.style.display = 'none';
    detailView.style.display = 'block';

    let html = "";

    if (materiId === 'tujuan') {
    html = `
        <div class="materi-header-center">
            <h2>Tujuan Pemebalajaran</h2>
        </div>

        <div class="materi-body-text">
            <div class="sub-materi-section">
                <h3>1) Capaian Pembelajaran (CP)</h3>
                <p>Di akhir Fase D, peserta didik dapat menyajikan relasi dan fungsi dalam bentuk grafik pada bidang koordinat Kartesius. Peserta didik dapat menentukan gradien dan menyusun persamaan fungsi linear (Persamaan Garis Lurus) untuk menyelesaikan masalah kehidupan sehari-hari.</p>
            </div>

            <div class="sub-materi-section">
                <h3>2) Tujuan Pembelajaran (TP)</h3>
                <p>Setelah dilakukan pembelajaran dengan game edukatif, siswa diharapkan mampu:</p>
                <div class="example-container" style="border-left: 5px solid #3a5a40; background-color: #f9fdf9;">
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li style="margin-bottom: 10px;">📍 <b>Misi 1:</b> Mengidentifikasi bentuk umum persamaan garis lurus dengan tepat.</li>
                        <li style="margin-bottom: 10px;">📍 <b>Misi 2:</b> Menggambar grafik garis lurus di koordinat Cartesius sesuai pasangan titik.</li>
                        <li style="margin-bottom: 10px;">📍 <b>Misi 3:</b> Menentukan gradien (kemiringan) garis lurus dengan benar.</li>
                        <li style="margin-bottom: 10px;">📍 <b>Misi 4:</b> Menyusun persamaan garis lurus berdasarkan titik dan gradien secara runtut.</li>
                        <li style="margin-bottom: 10px;">📍 <b>Misi 5:</b> Menyelesaikan masalah kontekstual fungsi linear yang berkaitan dengan persamaan garis lurus.</li>
                    </ul>
                </div>
            </div>

            
        <img src="assets/menunjukarah.png" class="char-img-materi" alt="Ziva" style="width: 180px;">
    `;
    } else if (materiId === 'pengertian') {
        html = `
            <div class="materi-header-center">
                <h2>Pengertian dan Bentuk Umum Persamaan Garis Lurus</h2>
            </div>
            
            <div class="materi-body-text">
                <p>Persamaan Garis Lurus adalah suatu persamaan matematika yang jika direpresentasikan dalam bidang koordinat Kartesius akan membentuk sebuah grafik berupa garis lurus.</p>
                
                <p>Persamaan ini menunjukkan hubungan linear antara variabel x dan variabel y. Terdapat beberapa bentuk penulisan persamaan garis lurus yaitu:</p>

                <div class="sub-materi-section">
                    <h3>1) Bentuk Eksplisit</h3>
                    <div class="equation-box-light-green">
                        $$y = mx + c$$
                    </div>
                    <ul class="explanation-list">
                        <li><b>m</b> adalah koefisien arah atau <b>gradien</b> (kemiringan) dari garis.</li>
                        <li><b>c</b> adalah konstanta yang merupakan titik potong garis dengan <b>sumbu-y</b>. Koordinat titik potongnya adalah (0, c).</li>
                    </ul>

                    <div class="example-container">
                        <h4 class="example-title">Contoh Soal Eksplisit:</h4>
                        <div class="solution-steps">
                            <p><b>Contoh A:</b> $$y = 2x + 4$$</p>
                            <ul>
                                <li><b>Gradien (m) = 2</b> (Angka di depan x).</li>
                                <li><b>Titik Potong (c) = 4</b> (Garis memotong sumbu-y di (0, 4)).</li>
                            </ul>
                            <p style="margin-top:10px;"><b>Contoh B:</b> $$y = -3x + 1$$</p>
                            <ul>
                                <li><b>Gradien (m) = -3</b> (Garis miring ke arah kiri).</li>
                                <li><b>Titik Potong (c) = 1</b> (Garis memotong sumbu-y di (0, 1)).</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="sub-materi-section">
                    <h3>2) Bentuk Implisit</h3>
                    <div class="equation-box-light-green">
                        $$Ax + By + C = 0$$
                    </div>

                    <div class="example-container">
                        <h4 class="example-title">Contoh Soal Implisit:</h4>
                        <div class="solution-steps">
                            <p><b>Contoh A:</b> $$2x + y - 6 = 0$$</p>
                            <p><i>Langkah: Ubah ke bentuk y = ...</i></p>
                            <p>$$y = -2x + 6$$</p>
                            <ul>
                                <li><b>Gradien (m) = -2</b>.</li>
                                <li><b>Titik Potong (c) = 6</b>.</li>
                            </ul>

                            <p style="margin-top:15px;"><b>Contoh B:</b> $$4x - 2y + 8 = 0$$</p>
                            <p><i>Langkah: Pindahkan ruas agar y sendiri</i></p>
                            <p>$$-2y = -4x - 8$$</p>
                            <p>$$y = 2x + 4$$</p>
                            <ul>
                                <li><b>Gradien (m) = 2</b>.</li>
                                <li><b>Titik Potong (c) = 4</b>.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <img src="assets/materipgl.png" class="char-img-materi" alt="Reno">
        `;
    } else if (materiId === 'gradien') {
        html = `
            <div class="materi-header-center">
                <h2>Mengenal Gradien (m)</h2>
            </div>
            
            <div class="materi-body-text">
                <h3>Pengetian Gradien</h3>
                <p>Gradien (disimbolkan dengan m) merupakan konsep kunci dalam materi PGL. Gradien didefinisikan sebagai ukuran kemiringan atau kecondongan suatu garis lurus.</p> 
            </div>

            <div class="sub-materi-section">
                <h3>Rumus Menghitung Gradien jika diketahui 1 titik</h3>
                <div class="equation-box-light-green">
                        $$ m = \\frac{y}{x}$$
                    </div>
                    <div class="example-container">
                        <h4 class="example-title">Contoh Soal:</h4>
                        <p class="example-text">Tentukan gradien garis (m) yang melalui titik pusat (0,0) dan titik A(6, 18)!</p>
                        <div class="solution-steps">
                            <p><b>Langkah-langkah:</b></p>
                            <ol>
                                <li><b>Identifikasi Koordinat:</b> x = 6 dan y = 18.</li>
                                <li><b>Substitusi:</b> 
                                    <div class="math-row">
                                        <span>m = </span>
                                        <div class="fraction">
                                            <div class="frac-top">18</div>
                                            <div class="frac-bottom">6</div>
                                        </div>
                                    </div>
                                </li>
                                <li><b>Hasil Akhir:</b> m = 3.</li>
                            </ol>
                        </div>
                    </div>
                </div>
                <div class="sub-materi-section">
                    <h3>Rumus Menghitung Gradien jika diketahui 2 titik</h3>
                    <div class="equation-box-light-green">
                        $$ m = \\frac{y_2 - y_1}{x_2 - x_1}$$
                    </div>
                    <div class="example-container">
                        <h4 class="example-title">Contoh Soal:</h4>
                        <p class="example-text">Tentukan gradien garis (m) yang melalui titik P(2, 5) dan titik Q(5, 14)!</p>
                        <div class="solution-steps">
                            <p><b>Langkah-langkah:</b></p>
                            <ol>
                                <li><b>Titik 1:</b> (x₁, y₁) = (2, 5) | <b>Titik 2:</b> (x₂, y₂) = (5, 14).</li>
                                <li><b>Substitusi Rumus:</b>
                                    <div class="math-row">
                                        <span>m = </span>
                                        <div class="fraction">
                                            <div class="frac-top">14 - 5</div>
                                            <div class="frac-bottom">5 - 2</div>
                                        </div>
                                    </div>
                                </li>
                                <li><b>Hitung Selisih:</b>
                                    <div class="math-row">
                                        <span>m = </span>
                                        <div class="fraction">
                                            <div class="frac-top">9</div>
                                            <div class="frac-bottom">3</div>
                                        </div>
                                    </div>
                                </li>
                                <li><b>Hasil Akhir:</b> m = 3.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div class="materi-section">
                    <h3>Membaca Kompas Arah (Gradien)</h3>
                    <p>Sebelum melangkah, kita harus melihat <b>Gradien (m)</b> atau tingkat kemiringan, untuk menentukan ke arah mana maya harus bergerak :</p>
                    <ul style="list-style: none; padding-left: 0;">
                        <li style="margin-bottom: 10px; background: #e8f5e9; padding: 10px; border-radius: 8px;">
                            <b>📈 Gradien Positif (m > 0):</b><br>
                            Garis condong ke arah kanan atas. Secara matematis, nilai y bertambah seiring dengan peningkatan nilai x
                            <div class="gradient-img-container">
                                <img src="assets/gradien_positif.png" alt="Visual Gradien Positif" class="gradien-illustrasi">
                            </div>
                        </li>
                        <li style="margin-bottom: 10px; background: #ffebee; padding: 10px; border-radius: 8px;">
                            <b>📉 Gradien Negatif (m < 0):</b><br>
                            Garis condong ke arah kanan bawah. Secara matematis, nilai y berkurang seiring dengan peningkatan nilai x.
                            <div class="gradient-img-container">
                                <img src="assets/gradien_negatif.png" alt="Visual Gradien Negatif" class="gradien-illustrasi">
                            </div>
                        </li>
                        <li style="margin-bottom: 10px; background: #e3f2fd; padding: 10px; border-radius: 8px;">
                            <b>➡️ Gradien Nol (m = 0):</b><br>
                            Garis berada dalam posisi horizontal (sejajar dengan sumbu-x).
                            <div class="gradient-img-container">
                                <img src="assets/gradien_0.png" alt="Visual Gradien Nol" class="gradien-illustrasi">
                            </div>
                        </li>
                        <li style="margin-bottom: 10px; background: #fff3e0; padding: 10px; border-radius: 8px;">
                            <b>⬆️ Tidak Terdefinisi:</b><br>
                            Garis berada dalam posisi vertikal (sejajar dengan sumbu-y).
                            <div class="gradient-img-container">
                                <img src="assets/gradien_takterdefinisi.png" alt="Visual Gradien Vertikal" class="gradien-illustrasi">
                            </div>
                        </li>
                    </ul>
                </div>
            

            <img src="assets/menunjukarah.png" class="char-img-materi" alt="Ara">
        `;
    } else if (materiId === 'menentukan') {
        html = `
            <div class="materi-header-center">
                <h2>Menentukan Persamaan Garis Lurus</h2>
            </div>

            <div class="materi-body-text">
                <p>Persamaan sebuah garis lurus dapat ditentukan jika diketahui:</p> 
            </div>

            <div class="sub-materi-section">
                <h3>1) Jika diketahui gradien dan satu titik yang dilaluinya, </h3>
                <p>Maka menggunakan rumus:</p>
                <div class="equation-box-light-green">
                        $$ y - y_1 = m (x - x_1)$$
                    </div>

                    <div class="example-container">
                        <h4 class="example-title">Contoh Soal:</h4>
                        <p class="example-text">Tentukan persamaan garis yang melalui titik (2, 5) dan memiliki gradien m = 3.</p>
                        <div class="solution-steps">
                            <p><b>Langkah-langkah:</b></p>
                            <ol>
                                <li><b>Identifikasi:</b> Diketahui titik (x₁, y₁) = (2, 5) dan m = 3.</li>
                                <li><b>Substitusi ke Rumus:</b> Gunakan rumus y - y₁ = m(x - x₁).</li>
                                <li><b>Operasi Hitung:</b> y - 5 = 3(x - 2).</li>
                                <li><b>Penyederhanaan:</b> y - 5 = 3x - 6.</li>
                                <li><b>Hasil Akhir:</b> y = 3x - 1.</li>
                            </ol>
                        </div>
                    </div>
                </div>
                <div class="sub-materi-section">
                    <h3>2)	Jika diketahui dua titik yang dilaluinya, ada dua cara umum:</h3>
                    <p><b>Cara 1 :</b></p>
                    <p>Cari gradiennya terlebih dahulu menggunakan rumus</p>
                    <div class="equation-box-light-green">
                        $$ m = \\frac{y_2 - y_1}{x_2 - x_1}$$
                    </div>
                </div>


                    <p>Gunakan salah satu titik dan gradien yang sudah ditemukan ke dalam rumus</p>
                    <div class="equation-box-light-green">
                        $$ y - y_1 = m (x - x_1)$$
                    </div>
                    <div class="example-container">
                            <h4 class="example-title">Contoh Soal:</h4>
                            <p class="example-text">Tentukan persamaan garis yang melalui titik A(1, 2) dan titik B(3, 10)!</p>
                            <div class="solution-steps">
                            <h4 class="example-title">Penyelesaian Cara 1:</h4>
                                <ol>
                                    <li><b>Cari gradien (m):</b> 
                                        <div class="math-row">
                                            m = 
                                            <div class="fraction"><span class="frac-top">10 - 2</span><span class="frac-bottom">3 - 1</span></div>
                                            = 
                                            <div class="fraction"><span class="frac-top">8</span><span class="frac-bottom">2</span></div>
                                            = 4
                                        </div>
                                    </li>
                                    <li><b>Substitusi:</b> Gunakan titik A(1, 2) dan m = 4 ke rumus y - y₁ = m(x - x₁).</li>
                                    <li><b>Hitung:</b> y - 2 = 4(x - 1) &rarr; y - 2 = 4x - 4.</li>
                                    <li><b>Hasil Akhir:</b> y = 4x - 2.</li>
                                </ol>
                            </div>
                        </div>
                    <p><b>Cara 2 :</b></p>
                    <p>Menggunakan Rumus Langsung dua titik </p>
                    <div class="equation-box-light-green">
                        $$\\frac{y - y_1}{y_2 - y_1} = \\frac{x - x_1}{x_2 - x_1}$$
                    </div>

                    <div class="example-container">
                            <h4 class="example-title">Contoh Soal:</h4>
                            <p class="example-text">Tentukan persamaan garis yang melalui titik A(1, 2) dan titik B(3, 10)!</p>
                            <h4 class="example-title">Penyelesaian Cara 2:</h4>
                            <div class="solution-steps">
                                <ol>
                                    <li><b>Identifikasi:</b> (x₁, y₁) = (1, 2) dan (x₂, y₂) = (3, 10).</li>
                                    <li><b>Substitusi ke Rumus:</b> 
                                        <div class="math-row">
                                            <div class="fraction"><span class="frac-top">y - 2</span><span class="frac-bottom">10 - 2</span></div>
                                            <span> = </span>
                                            <div class="fraction"><span class="frac-top">x - 1</span><span class="frac-bottom">3 - 1</span></div>
                                        </div>
                                    </li>
                                    <li><b>Hitung Penyebut:</b> 
                                        <div class="math-row">
                                            <div class="fraction"><span class="frac-top">y - 2</span><span class="frac-bottom">8</span></div>
                                            <span> = </span>
                                            <div class="fraction"><span class="frac-top">x - 1</span><span class="frac-bottom">2</span></div>
                                        </div>
                                    </li>
                                    <li><b>Perkalian Silang:</b> 2(y - 2) = 8(x - 1) &rarr; 2y - 4 = 8x - 8.</li>
                                    <li><b>Hasil Akhir:</b> 2y = 8x - 4 atau y = 4x - 2.</li>
                                </ol>
                            </div>
                        </div>
                    </div>     
                </div>
            </div>

        <img src="assets/logo.png" class="char-img-materi" alt="Diko">
        `;
    } else if (materiId === 'latihan') {
        const data = daftarLatihan[currentLatihanIndex];
        html = `
            <div style="text-align: center;">
                <h2 style="color: #3a5a40; font-family: 'Baloo 2'; font-size: 32px;">Ayo Berlatih !</h2>

                <div class="slider-nav">
                    <button onclick="moveSlide(-1)" class="nav-btn" ${currentLatihanIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i>
                    </button>

                <div class="soal-container">
                    <div class="soal-badge">Soal ${data.id}</div>
                    <div class="soal-content">
                    <p>${data.soal}</p>
                    </div>
                </div>
                
                <button onclick="moveSlide(1)" class="nav-btn" ${currentLatihanIndex === daftarLatihan.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
                <div id="exercise-steps-container">
                    </div>
            </div>

            <div class="equation-box-light-green">
                <h3>1. Gradien:</h3>
                <div class="step-container">
                    <span class="math-text">$$m = \\frac{y_2 - y_1}{x_2 - x_1} = $$</span>
                    <div class="fraction-container">
                        <div class="top-row">
                            <input type="text" id="m1" class="box-input" placeholder="?">
                            <span> - </span>
                            <input type="text" id="m2" class="box-input" placeholder="?">
                        </div>
                        <div class="fraction-line"></div>
                        <div class="bottom-row">
                            <input type="text" id="m3" class="box-input" placeholder="?">
                            <span> - </span>
                            <input type="text" id="m4" class="box-input" placeholder="?">
                        </div>
                    </div>
                    <span class="math-text"> = </span>
                    <div class="fraction-container">
                        <input type="text" id="m5" class="box-input" placeholder="?">
                        <div class="fraction-line"></div>
                        <input type="text" id="m6" class="box-input" placeholder="?">
                    </div>
                    <span class="math-text"> = </span>
                    <div class="fraction-container">
                        <input type="text" id="m7" class="box-input" placeholder="?">
                        <div class="fraction-line"></div>
                        <input type="text" id="m8" class="box-input" placeholder="?">
                    </div>
                </div>
            </div>

            <div class="equation-box-light-green">
                <h3>2. Menentukan Persamaan Garis:</h3>
                <div class="step-container">
                    <span class="math-text">$$y - y_1 = m (x - x_1) $$</span>
                </div>
                <div class="step-container">
                    <span class="math-text">$$y - $$</span>
                    <input type="text" id="p1" class="box-input" placeholder="?">
                    <span class="math-text">$$ = m(x - $$</span>
                    <input type="text" id="p2" class="box-input" placeholder="?">
                    <span class="math-text">$$)$$</span>
                </div>
                <div class="step-container" style="margin-top: 15px;">
                    <span class="math-text">$$y - $$</span>
                    <input type="text" id="p3" class="box-input" placeholder="?">
                    <span class="math-text">$$ = $$</span>
                    <div class="fraction-container" style="margin: 0 10px;">
                        <input type="text" id="p4" class="box-input" placeholder="?">
                        <div class="fraction-line"></div>
                        <input type="text" id="p5" class="box-input" placeholder="?">
                    </div>
                    <span class="math-text">$$(x - $$</span>
                    <input type="text" id="p6" class="box-input" placeholder="?">
                    <span class="math-text">$$)$$</span>
                </div>
            </div>

            <div class="equation-box-light-green">
                <h3>3. Persamaan Akhir:</h3>
                <div class="step-container">
                    <span class="math-text">$$y = mx + c $$</span>
                </div>
                <div class="step-container">
                    <span class="math-text">$$y = $$</span>
                    <div class="fraction-container" style="margin: 0 10px;">
                        <input type="text" id="f1" class="box-input" placeholder="?">
                        <div class="fraction-line"></div>
                        <input type="text" id="f2" class="box-input" placeholder="?">
                    </div>
                    <span class="math-text">$$x + $$</span>
                    <input type="text" id="f3" class="box-input" placeholder="?">
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <button onclick="checkAllAnswers()" class="card-button" style="background-color: #3a5a40; color: white;">Cek Jawaban Saya</button>
                <p id="final-feedback" style="font-weight: bold; margin-top: 15px; font-size: 1.2rem;"></p>
            </div>

            <img src="assets/penjelajahpeta.png" class="char-img-materi" alt="Orang Clue">
        `;
    }

    contentArea.innerHTML = html;
    if (window.MathJax) MathJax.typeset();
}

// 1. Data Soal dan Indeks Global (Taruh di bagian paling atas file JS)
let currentLatihanIndex = 0;
const daftarLatihan = [
    {
        id: 1, soal: "Tentukan Persamaan Garis Lurus yang melalui titik (0, 5) dan (2, 1)!",
        kunci: { m1: "1", m2: "5", m3: "2", m4: "0", m5: "-4", m6: "2", m7: "-2", m8: "1", p1: "5", p2: "0", p3: "5", p4: "-2", p5: "1", p6: "0", f1: "-2", f2: "1", f3: "5" }
    },
    {
        id: 2, soal: "Tentukan Persamaan Garis Lurus yang melalui titik (-2, -1) dan (2, 7)!",
        kunci: { m1: "7", m2: "-1", m3: "2", m4: "-2", m5: "8", m6: "4", m7: "2", m8: "1", p1: "-1", p2: "-2", p3: "-1", p4: "2", p5: "1", p6: "-2", f1: "2", f2: "1", f3: "3" }
    },
    {
        id: 3, soal: "Tentukan Persamaan Garis Lurus yang melalui titik (4, 10) dan (10, 13)!",
        kunci: { m1: "13", m2: "10", m3: "10", m4: "4", m5: "3", m6: "6", m7: "1", m8: "2", p1: "10", p2: "4", p3: "10", p4: "1", p5: "2", p6: "4", f1: "1", f2: "2", f3: "8" }
    },
    {
        id: 4, soal: "Tentukan Persamaan Garis Lurus yang melalui titik (1, 2) dan (3, 6)!",
        kunci: { m1: "6", m2: "2", m3: "3", m4: "1", m5: "4", m6: "2", m7: "2", m8: "1", p1: "2", p2: "1", p3: "2", p4: "2", p5: "1", p6: "1", f1: "2", f2: "1", f3: "0" }
    },
    {
        id: 5, soal: "Tentukan Persamaan Garis Lurus yang melalui titik (2, 3) dan (6, 5)!",
        kunci: { m1: "5", m2: "3", m3: "6", m4: "2", m5: "2", m6: "4", m7: "1", m8: "2", p1: "3", p2: "2", p3: "3", p4: "1", p5: "2", p6: "2", f1: "1", f2: "2", f3: "2" }
    }
];
function moveSlide(direction) {
    // 1. Ubah index berdasarkan arah (1 atau -1)
    currentLatihanIndex += direction;

    // 2. Pastikan index tetap di antara 0 sampai 4 (5 soal)
    if (currentLatihanIndex < 0) currentLatihanIndex = 0;
    if (currentLatihanIndex >= daftarLatihan.length) currentLatihanIndex = daftarLatihan.length - 1;

    // 3. PANGGIL showDetail (sesuaikan dengan nama fungsi utama Anda)
    showDetail('latihan'); 
    
    // Log untuk memastikan di console browser
    console.log("Berpindah ke Soal ID: " + daftarLatihan[currentLatihanIndex].id);
}
function checkAllAnswers() {
            const feedback = document.getElementById('final-feedback');
            const currentData = daftarLatihan[currentLatihanIndex];
            const answers = currentData.kunci;
            

            let allCorrect = true;
            for (let key in answers) {
                const input = document.getElementById(key);
                if (input.value.trim() !== answers[key]) {
                    input.style.borderColor = "#c62828"; // Merah jika salah
                    allCorrect = false;
                } else {
                    input.style.borderColor = "#2e7d32"; // Hijau jika benar
                }
            }

            if (allCorrect) {
                feedback.innerHTML = "✅ LUAR BIASA! Semua jawabanmu benar! 🎉";
                feedback.style.color = "#2e7d32";
            } else {
                feedback.innerHTML = "❌ Hmm, ada beberapa kotak yang masih salah. Periksa kembali ya!";
                feedback.style.color = "#c62828";
            }
        }


function hideDetail() {
    document.getElementById('materi-grid').style.display = 'flex';
    document.getElementById('materi-title').style.display = 'block';
    document.getElementById('materi-detail-view').style.display = 'none';
}    
document.addEventListener('DOMContentLoaded', () => {

    // ========== PENGATURAN STATE & UI ==========

    const ui = {
        tabs: document.querySelectorAll('.nav-tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        levelSelectModal: document.getElementById('level-select-modal'),
        helpModal: document.getElementById('help-modal'),
        closeButtons: document.querySelectorAll('.close-button'),
        helpButton: document.getElementById('help-button'),
        levelMapContainer: document.getElementById('level-map-container'),
        equationForm: document.getElementById('equation-form'),
        musicToggle: document.getElementById('music-toggle'),
        sfxToggle: document.getElementById('sfx-toggle'),
        bgMusic: document.getElementById('bg-music'),
        sfxCorrect: document.getElementById('sfx-correct'),
        sfxStar: document.getElementById('sfx-star'),
        victoryModal: document.getElementById('victory-modal'),
        victoryStars: document.getElementById('victory-stars'),
        victoryStatusText: document.getElementById('victory-status-text'), 
        settingsToggle: document.getElementById('settings-toggle'),       
        settingsSidebar: document.getElementById('settings-sidebar'),     
        closeSettings: document.getElementById('close-settings'),        
        resetBtn: document.getElementById('reset-progress'),
        musicCheckbox: document.getElementById('music-checkbox'),
        sfxCheckbox: document.getElementById('sfx-checkbox')
    };
    

    // ========== LOGIKA NAVIGASI & MODAL ==========
    
    window.addEventListener('renderMap', populateLevelMap);
    window.addEventListener('openGameMap', () => {openLevelSelect(); });

    
    function openLevelSelect() {
        // Tampilkan Peta, Sembunyikan Gameplay
        document.getElementById('game-map-view').style.display = 'block';
        document.getElementById('gameplay-view').style.display = 'none';
        populateLevelMap(); 
    }

    function populateLevelMap() {
    const container = document.getElementById('level-map-container');
    if (!container) return;
    container.innerHTML = ''; 

    levels.forEach((levelData, index) => {
        const levelNumber = index + 1;
        const savedStars = parseInt(localStorage.getItem(`level_${levelNumber}_stars`)) || 0;

        // 1. Buat Kartu Utama
        const card = document.createElement('div');
        card.className = `level-card ${levelNumber === unlockedLevel ? 'current' : ''} ${levelNumber > unlockedLevel ? 'locked' : ''}`;
        
        // 2. Area Foto Persegi (1:1)
        const photoContainer = document.createElement('div');
        photoContainer.className = 'level-photo-preview';

        // Cek apakah ada gambar di data level
        if (levelData.img) {
            // Jika ada, buat elemen gambar
            const imgElement = document.createElement('img');
            imgElement.src = levelData.img;
            imgElement.alt = `Preview Level ${levelNumber}`;
            // Event listener jika gambar gagal dimuat (error), ganti jadi ikon
            imgElement.onerror = function() {
                photoContainer.innerHTML = `<i class="fas fa-map-marked-alt placeholder-icon"></i>`;
            };
            photoContainer.appendChild(imgElement);
        } else {
            // Jika tidak ada link gambar, pakai ikon placeholder
            photoContainer.innerHTML = `<i class="fas fa-map-marked-alt placeholder-icon"></i>`;
        }

        // 3. Judul Level (Warna Kuning di CSS)
        const title = document.createElement('h3');
        title.textContent = `Level ${levelNumber}`;

        // 4. Bintang
        const starsContainer = document.createElement('div');
        starsContainer.className = 'card-stars';
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('i');
            star.className = `fas fa-star ${i <= savedStars ? 'active' : ''}`;
            starsContainer.appendChild(star);
        }

        // Susun Kartu
        card.appendChild(photoContainer);
        card.appendChild(title);
        card.appendChild(starsContainer);

        // Logika Klik
        if (levelNumber <= unlockedLevel) {
            card.onclick = () => selectLevel(levelNumber);
        }

        container.appendChild(card);
    });
}

    function selectLevel(levelNum) {
        currentLevel = levelNum;
        
        document.getElementById('game-map-view').style.display = 'none';
        document.getElementById('gameplay-view').style.display = 'block';
        
        if (window.p5InstanceGlobal) window.p5InstanceGlobal.remove();
        
        // Simpan instance ke window agar bisa dihapus oleh fungsi backToMap() di atas
        window.p5InstanceGlobal = new p5(sketch, 'canvas-container');
    }
    // ========== LOGIKA AUDIO ==========
    function toggleSfx() {
        sfxOn = !sfxOn;
        ui.sfxToggle.classList.toggle('active', sfxOn);
        ui.sfxToggle.querySelector('i').className = sfxOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }

    function updateStarDisplay(count) {
        const container = document.getElementById('star-rating');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('i');
            star.className = `fas fa-star star ${i <= count ? 'active' : ''}`;
            star.style.animationDelay = `${i * 0.15}s`;
            container.appendChild(star);
        }
    }
    
    // ========== LOGIKA GAME (P5.JS) ==========
    const sketch = (p) => {
        let characterImg, goalImg;
        let scale, origin, levelData, userLine, characterPos, isAnimating, animationProgress;

        p.preload = function() {
            characterImg = p.loadImage('assets/petualang.png');
            goalImg = p.loadImage('assets/telur-emas.png');
        }

        p.setup = function() {
            const container = document.getElementById('canvas-container');
            p.createCanvas(container.offsetWidth, container.offsetHeight);
            p.frameRate(60);
            loadLevel(currentLevel);
        };
        
        p.windowResized = function() {
            const container = document.getElementById('canvas-container');
            p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        }

        function loadLevel(levelNum) {
            levelData = levels[levelNum - 1];
            currentLevel = levelNum;
            isAnimating = false; animationProgress = 0; userLine = null;
            characterPos = { ...levelData.start };
            wrongAttempts = 0; 
            updateStarDisplay(3);   

            document.getElementById('level-title').textContent = `Level ${levelNum}`;
            document.getElementById('start-point-text').textContent = `(${levelData.start.x}, ${levelData.start.y})`;
            document.getElementById('end-point-text').textContent = `(${levelData.end.x}, ${levelData.end.y})`;
            document.getElementById('message-box').innerHTML = '';
            
            const allBoxInputs = document.querySelectorAll('.box-input');
            allBoxInputs.forEach(input => input.value = '');
            
            const formModel1 = document.getElementById('form-model-1');
            const formModel2 = document.getElementById('form-model-2');
            const instruction = document.getElementById('level-instruction');
            
            if (levelNum <= 10) {
                formModel1.style.display = 'flex';
                formModel2.style.display = 'none';
                instruction.textContent = "Lengkapi rumus y = mx + c di bawah ini!";
            } else {
                formModel1.style.display = 'none';
                formModel2.style.display = 'flex';
                instruction.textContent = "Gunakan salah satu titik yang ada untuk melengkapi rumus di bawah!";
            }
        }

        p.draw = function() {
            scale = p.width / 22; 
            origin = { x: p.width / 2, y: p.height / 2 };
            p.clear();
            drawGrid();
            if (userLine) drawUserLine();
            drawGoal(toScreen(levelData.end));
            drawCharacter(toScreen(characterPos));
            if(isAnimating) updateAnimation();
        };

        function toScreen(coord) { return { x: origin.x + coord.x * scale, y: origin.y - coord.y * scale }; }
        
        function drawGrid() {
            p.stroke(255, 255, 255, 80); p.strokeWeight(1);
            for (let x = -10; x <= 10; x++) p.line(toScreen({x, y: -10}).x, toScreen({x, y: -10}).y, toScreen({x, y: 10}).x, toScreen({x, y: 10}).y);
            for (let y = -10; y <= 10; y++) p.line(toScreen({x: -10, y}).x, toScreen({x: -10, y}).y, toScreen({x: 10, y}).x, toScreen({x: 10, y}).y);
            p.stroke(255, 255, 255, 150); p.strokeWeight(2);
            p.line(origin.x, 0, origin.x, p.height); p.line(0, origin.y, p.width, origin.y);
            p.noStroke(); p.fill(255); p.textAlign(p.CENTER, p.CENTER); p.textSize(12); p.textStyle(p.BOLD);
            for (let x = -10; x <= 10; x++) if (x !== 0) p.text(x, toScreen({x, y: 0}).x, toScreen({x, y: 0}).y + 12);
            for (let y = -10; y <= 10; y++) if (y !== 0) p.text(y, toScreen({x: 0, y}).x - 12, toScreen({x: 0, y}).y);
        }

        function drawUserLine() { 
            p.stroke(255, 193, 7, 200); p.strokeWeight(6); 
            let lineStart = toScreen({x: -10, y: userLine.m * -10 + userLine.c}); 
            let lineEnd = toScreen({x: 10, y: userLine.m * 10 + userLine.c}); 
            p.line(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y); 
        }

        function drawCharacter(pos) { p.imageMode(p.CENTER); p.image(characterImg, pos.x, pos.y, 40, 40); }
        function drawGoal(pos) { p.imageMode(p.CENTER); p.image(goalImg, pos.x, pos.y, 40, 40); }
        
        function showVictory() {
            isAnimating = false;
            
            // Simpan progres level
            if (currentLevel >= unlockedLevel && currentLevel < levels.length) {
                unlockedLevel = currentLevel + 1;
                localStorage.setItem('unlockedLevel', unlockedLevel); 
            }

            // Hitung bintang
            let finalStarsCount = 3 - Math.floor(wrongAttempts / 3);
            if (finalStarsCount < 1) finalStarsCount = 1;
            
            // Simpan jumlah bintang per level untuk peta
            const oldStars = parseInt(localStorage.getItem(`level_${currentLevel}_stars`)) || 0;
            if (finalStarsCount > oldStars) {
                localStorage.setItem(`level_${currentLevel}_stars`, finalStarsCount);
            }
            // Tentukan kata-kata pujian
            let statusText = "";
            if (finalStarsCount === 1) statusText = "GOOD JOB";
            else if (finalStarsCount === 2) statusText = "PERFECT";
            else if (finalStarsCount === 3) statusText = "EXCELLENT";

            // Update Tampilan Modal Kemenangan
            document.getElementById('victory-level-title').textContent = `Level ${currentLevel}`;
            ui.victoryStatusText.textContent = statusText;
            
            // Render Bintang di Modal dengan Animasi Delay
            ui.victoryStars.innerHTML = '';
            ui.victoryModal.style.display = 'block';

            for (let i = 1; i <= 3; i++) {
                const starIcon = document.createElement('i');
                starIcon.className = `fas fa-star star ${i <= finalStarsCount ? 'active' : ''}`;
                
                setTimeout(() => {
                    ui.victoryStars.appendChild(starIcon);
                    if (i <= finalStarsCount && sfxOn && ui.sfxStar) {
                        const soundClone = ui.sfxStar.cloneNode();
                        soundClone.play();
                    }
                }, i * 350);
            }

            // Logika Tombol Modal
            document.getElementById('replay-btn').onclick = () => {
                ui.victoryModal.style.display = 'none';
                selectLevel(currentLevel); 
            };

            document.getElementById('next-level-modal-btn').onclick = () => {
                ui.victoryModal.style.display = 'none';
                if (currentLevel < levels.length) selectLevel(currentLevel + 1);
            };

            document.getElementById('victory-x').onclick = () => {
                ui.victoryModal.style.display = 'none';
                openLevelSelect(); 
            };
        }

        function updateAnimation() {
            animationProgress += 0.015;
            
            if (animationProgress >= 1) {
                animationProgress = 1; 
                isAnimating = false;

                // BERI JEDA 1 DETIK SEBELUM MODAL MUNCUL
                setTimeout(() => {
                    showVictory(); 
                }, 1000);
            }

            characterPos.x = p.lerp(levelData.start.x, levelData.end.x, animationProgress);
            characterPos.y = p.lerp(levelData.start.y, levelData.end.y, animationProgress);
        }
        
        function parseBoxValue(val) { 
            if (val.trim() === '') return NaN; 
            if (val.includes('/')) { 
                const parts = val.split('/'); 
                const num = parseFloat(parts[0]); 
                const den = parseFloat(parts[1]); 
                return (isNaN(num) || isNaN(den) || den === 0) ? NaN : num / den; 
            } 
            return parseFloat(val); 
        }
        
        window.checkAnswer = function() {
            const messageBox = document.getElementById('message-box');
            const solution = levelData.solution;
            const tolerance = 0.01;
            let userM, userC;
            if (currentLevel <= 10) {
                userM = parseBoxValue(document.getElementById('m1-input').value);
                userC = parseBoxValue(document.getElementById('c-input').value);
            } else {
                const y1 = parseBoxValue(document.getElementById('y1-input').value);
                const m = parseBoxValue(document.getElementById('m2-input').value);
                const x1 = parseBoxValue(document.getElementById('x1-input').value);
                userM = m; userC = (-m * x1) + y1;
            }
            if (isNaN(userM) || isNaN(userC)) { 
                messageBox.textContent = 'Pastikan semua kotak terisi dengan benar!'; 
                messageBox.className = 'error'; 
                return; 
            }
            userLine = { m: userM, c: userC };
            if (Math.abs(userM - solution.m) < tolerance && Math.abs(userC - solution.c) < tolerance) {
                messageBox.textContent = 'Peta Benar! Menuju Telur Emas...'; 
                messageBox.className = 'success';
                if (sfxOn) {
                    ui.sfxCorrect.play();
                    setTimeout(() => ui.sfxCorrect.play(), 100);
                }
                isAnimating = true;
                animationProgress = 0;
            } else { 
                wrongAttempts++; 
                messageBox.textContent = 'Peta salah! Coba lagi!'; 
                messageBox.className = 'error'; 
                let currentStars = 3 - Math.floor(wrongAttempts / 3);
                if (currentStars < 1) currentStars = 1;
                updateStarDisplay(currentStars);
                characterPos = { ...levelData.start }; 
            }
        };
    };
    
    // ========== EVENT LISTENERS ==========
    ui.tabs.forEach(tab => tab.addEventListener('click', (e) => { 
        e.preventDefault(); 
        switchTab(tab.getAttribute('data-tab')); 
    
    }));

        // --- LOGIKA BUKA/TUTUP SIDEBAR ---
    if (ui.settingsToggle && ui.settingsSidebar) {
        ui.settingsToggle.onclick = (e) => {
            e.preventDefault(); // Mencegah loncatan halaman
            ui.settingsSidebar.classList.add('active');
            console.log("Panel Pengaturan Dibuka");
        };
    }

    if (ui.closeSettings && ui.settingsSidebar) {
        ui.closeSettings.onclick = () => {
            ui.settingsSidebar.classList.remove('active');
        };
    }
    if (ui.musicCheckbox) ui.musicCheckbox.checked = musicOn;
    if (ui.sfxCheckbox) ui.sfxCheckbox.checked = sfxOn;

    // --- LOGIKA RESET PROGRES (Hapus Bintang & Level) ---
    if (ui.resetBtn) {
        ui.resetBtn.onclick = () => {
            const konfirmasi = confirm("Apakah kamu yakin ingin menghapus seluruh progres belajar dan mengulang dari level 1?");
            
            if (konfirmasi) {
                // 1. Hapus semua data simpanan di browser
                localStorage.clear(); 
                
                // 2. Tampilkan pesan berhasil
                alert("Progres telah direset! Semua level terkunci kembali.");
                
                // 3. Muat ulang halaman agar peta level terupdate otomatis
                location.reload(); 
            }
        };
    }
    if (ui.musicCheckbox) {
        ui.musicCheckbox.onchange = () => {
            // Panggil fungsi toggleMusic yang sudah kamu buat
            toggleMusic(); 
        };
    }

    // 4. Event Listener untuk Sakelar SFX di Sidebar
    if (ui.sfxCheckbox) {
        ui.sfxCheckbox.onchange = () => {
            sfxOn = ui.sfxCheckbox.checked;
            // Update juga ikon volume di navbar agar sinkron
            if (ui.sfxToggle) {
                ui.sfxToggle.querySelector('i').className = sfxOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        };
    }

    // 5. Logika Buka/Tutup Sidebar Pengaturan
    if (ui.settingsToggle && ui.settingsSidebar) {
        ui.settingsToggle.onclick = (e) => {
            e.preventDefault();
            // Saat dibuka, pastikan posisi sakelar sesuai status musik saat ini
            if (ui.musicCheckbox) ui.musicCheckbox.checked = musicOn;
            if (ui.sfxCheckbox) ui.sfxCheckbox.checked = sfxOn;
            
            ui.settingsSidebar.classList.add('active');
        };
    }

    if (ui.closeSettings) {
        ui.closeSettings.onclick = () => {
            ui.settingsSidebar.classList.remove('active');
        };
    }

    if (ui.equationForm) {
        ui.equationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof window.checkAnswer === 'function') window.checkAnswer();
        });
    }

    ui.helpButton.onclick = () => ui.helpModal.style.display = 'block';
    ui.closeButtons.forEach(btn => btn.onclick = () => {
        ui.helpModal.style.display = 'none';
        ui.victoryModal.style.display = 'none';
    });
    
    document.getElementById('replay-btn').onclick = () => {
        ui.victoryModal.style.display = 'none';
        selectLevel(currentLevel);
    };

    document.getElementById('next-level-modal-btn').onclick = () => {
        ui.victoryModal.style.display = 'none';
        if (currentLevel < levels.length) selectLevel(currentLevel + 1);
    };

    document.getElementById('victory-x').onclick = backToMap;

    ui.sfxToggle.onclick = toggleSfx;
    document.getElementById('music-toggle').onclick = toggleMusic;
    

    switchTab('home');
});
