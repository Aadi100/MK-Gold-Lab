document.addEventListener('DOMContentLoaded', () => {
    const serialInput = document.getElementById('serial-input');
    const searchBtn = document.getElementById('search-btn');
    const btnIcon = document.getElementById('btn-icon');
    const btnText = document.getElementById('btn-text');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalDetails = document.getElementById('modal-details');
    const downloadBtn = document.getElementById('download-btn');
    const carouselTrack = document.getElementById('carousel-track');
    const productsSection = document.getElementById('products-section');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let currentData = null;
    let products = [];
    let isSearching = false;

    // --- Search Logic ---
    async function searchSerial() {
        const input = serialInput.value.trim().toUpperCase();
        if (!input || isSearching) return;

        isSearching = true;
        btnText.textContent = 'Searching...';
        btnIcon.innerHTML = '<div class="spinner"></div>';
        errorMessage.classList.add('hidden');
        modal.classList.add('hidden');

        try {
            // Using absolute URL if needed, but relative works if hosted on same server
            const res = await fetch(`/api/bars.php?serial=${encodeURIComponent(input)}`);
            if (!res.ok) {
                errorMessage.classList.remove('hidden');
                return;
            }
            const json = await res.json();
            currentData = json.data;
            showModal(currentData);
        } catch (error) {
            console.error('Search failed:', error);
            errorMessage.classList.remove('hidden');
        } finally {
            isSearching = false;
            btnText.textContent = 'Search';
            btnIcon.innerHTML = `
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            `;
        }
    }

    searchBtn.addEventListener('click', searchSerial);
    serialInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchSerial();
    });

    // --- Modal Logic ---
    function showModal(data) {
        modalDetails.innerHTML = '';
        const fields = [
            ['Serial No.', data.serialNo],
            ['Weight', data.weight],
            ['Purity', data.purity],
            ['Metal', data.metal],
            ['Origin', data.origin],
            ['Certified By', data.certifiedBy],
            ['Production', data.production]
        ];

        fields.forEach(([label, value], i) => {
            const detailRow = document.createElement('div');
            detailRow.className = `flex items-baseline justify-between gap-4 py-3 ${i < fields.length - 1 ? 'border-b border-[rgba(201,168,76,0.07)]' : ''}`;
            detailRow.innerHTML = `
                <span style="font-size: 0.58rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #c9a84c; white-space: nowrap;">
                    ${label}
                </span>
                <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.95rem; font-weight: 400; color: #e8e0d0; text-align: right; word-break: break-all;">
                    ${value || '—'}
                </span>
            `;
            modalDetails.appendChild(detailRow);
        });

        modal.classList.remove('hidden');
        document.getElementById('modal-card').classList.add('modal-enter');
    }

    function closeModal() {
        modal.classList.add('hidden');
        serialInput.value = '';
        currentData = null;
    }

    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // --- Certificate Download ---
    downloadBtn.addEventListener('click', () => {
        if (!currentData) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0f0e0c');
        gradient.addColorStop(0.5, '#1a1500');
        gradient.addColorStop(1, '#0f0e0c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid pattern
        ctx.strokeStyle = 'rgba(201,168,76,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width + canvas.height; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(0, i);
            ctx.stroke();
        }

        // Borders
        ctx.strokeStyle = '#c9a84c';
        ctx.lineWidth = 6;
        ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
        ctx.strokeStyle = 'rgba(201,168,76,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

        // Logo Area
        ctx.fillStyle = 'rgba(201,168,76,0.08)';
        ctx.beginPath(); ctx.arc(400, 130, 65, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(400, 130, 65, 0, Math.PI * 2); ctx.stroke();
        
        // Checkmark
        ctx.strokeStyle = '#e0c47a'; ctx.lineWidth = 7;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(372, 132); ctx.lineTo(393, 153); ctx.lineTo(430, 110); ctx.stroke();

        // Header Text
        ctx.fillStyle = '#ffffff'; ctx.font = '300 52px Georgia, serif'; ctx.textAlign = 'center';
        ctx.fillText('MK Gold Lab', canvas.width / 2, 240);
        ctx.fillStyle = '#c9a84c'; ctx.font = '16px Helvetica, sans-serif';
        ctx.fillText('CERTIFICATE OF AUTHENTICITY', canvas.width / 2, 275);

        // Divider
        ctx.strokeStyle = 'rgba(201,168,76,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(100, 300); ctx.lineTo(700, 300); ctx.stroke();

        // Details
        const details = [
            ['Serial Number', currentData.serialNo],
            ['Weight', currentData.weight],
            ['Purity', currentData.purity],
            ['Metal', currentData.metal],
            ['Origin', currentData.origin],
            ['Certified By', currentData.certifiedBy],
            ['Production Date', currentData.production],
        ];

        details.forEach(([label, value], i) => {
            const y = 370 + i * 72;
            ctx.fillStyle = '#c9a84c'; ctx.font = '13px Helvetica, sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(label.toUpperCase(), 100, y);
            ctx.fillStyle = '#ffffff'; ctx.font = '22px Georgia, serif'; ctx.textAlign = 'right';
            ctx.fillText(value || '—', 700, y + 26);
            ctx.strokeStyle = 'rgba(201,168,76,0.15)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(100, y + 40); ctx.lineTo(700, y + 40); ctx.stroke();
        });

        // Footer Text
        ctx.fillStyle = 'rgba(201,168,76,0.5)'; ctx.font = '13px Helvetica, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('This certificate verifies the authenticity of the silver bar issued by Silver Lab', canvas.width / 2, 920);
        ctx.fillStyle = '#7a7060'; ctx.font = '12px Helvetica, sans-serif';
        ctx.fillText('© 2026 Silver Lab. All Rights Reserved.', canvas.width / 2, 960);

        // Download
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = `GoldLab-${currentData.serialNo}.png`;
            a.href = url; a.click();
            URL.revokeObjectURL(url);
        });
    });

    // --- Products Carousel Logic ---
    async function initProducts() {
        try {
            const res = await fetch('/api/products.php');
            if (!res.ok) return;
            const data = await res.json();
            products = Array.isArray(data) ? data : (data.products || []);
            
            if (products.length > 0) {
                renderProducts();
                productsSection.classList.remove('hidden');
                startCarousel();
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    }

    function renderProducts() {
        // Multiplied for infinite effect
        const displayProducts = [...products, ...products, ...products];
        carouselTrack.innerHTML = displayProducts.map((p, i) => `
            <div class="flex-shrink-0 group/card" style="width: 280px;">
                <div class="bg-[rgba(23,22,15,0.85)] border border-[rgba(201,168,76,0.12)] rounded-[3px] overflow-hidden backdrop-blur-xl transition-all duration-300 hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(201,168,76,0.06)]">
                    <div class="h-[200px] bg-[rgba(15,14,10,0.6)] border-b border-[rgba(201,168,76,0.08)] flex items-center justify-center overflow-hidden relative">
                        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.07)_0%,transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                        <img src="${p.img}" alt="${p.title}" class="max-h-[160px] max-w-[85%] object-contain transition-transform duration-500 hover:scale-[1.08] relative z-10">
                    </div>
                    <div class="p-5">
                        <div class="flex items-center gap-2 mb-3">
                            ${p.weight ? `<span class="bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)] text-[#c9a84c] text-[0.58rem] font-medium tracking-[0.16em] uppercase px-2 py-1 rounded-[2px]">${p.weight}</span>` : ''}
                            <div class="flex-1 h-[1px] bg-[rgba(201,168,76,0.08)]"></div>
                            <span class="text-[0.95rem] font-medium text-[#e0c47a]">${p.price || ''}</span>
                        </div>
                        <h3 style="font-family: 'Cormorant Garamond', Georgia, serif;" class="text-[1.1rem] font-normal text-[#e8e0d0] leading-tight mb-4">${p.title}</h3>
                    </div>
                </div>
            </div>
        `).join('');
    }

    let offset = 0;
    let isPaused = false;
    let animationId = null;

    function startCarousel() {
        const speed = 1; // pixels per frame
        const productWidth = 280 + 24; // width + gap
        const totalWidth = productWidth * products.length;

        function animate() {
            if (!isPaused) {
                offset -= speed;
                if (Math.abs(offset) >= totalWidth) {
                    offset = 0;
                }
                carouselTrack.style.transform = `translateX(${offset}px)`;
            }
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }

    carouselTrack.addEventListener('mouseenter', () => isPaused = true);
    carouselTrack.addEventListener('mouseleave', () => isPaused = false);

    prevBtn.addEventListener('click', () => {
        offset += (280 + 24);
        carouselTrack.style.transform = `translateX(${offset}px)`;
    });

    nextBtn.addEventListener('click', () => {
        offset -= (280 + 24);
        carouselTrack.style.transform = `translateX(${offset}px)`;
    });

    initProducts();
});
