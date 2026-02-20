"use client"

import { useState, useEffect } from 'react';

export default function Home() {
  const [currentData, setCurrentData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [serialInput, setSerialInput] = useState('');

  const searchSerial = async () => {
    const input = serialInput.trim().toUpperCase();
    setShowModal(false);
    setShowError(false);
    if (input === '') return;

    try {
      const res = await fetch(`/api/bars?serial=${encodeURIComponent(input)}`);
      if (!res.ok) {
        setShowError(true);
        return;
      }
      const json = await res.json();
      setCurrentData(json.data);
      setShowModal(true);
    } catch (err) {
      setShowError(true);
    }
  };

  // fetch products for public view
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) setProducts(data);
        else if (data?.products && Array.isArray(data.products)) setProducts(data.products);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, []);

  const closeCard = () => {
    setShowModal(false);
    setSerialInput('');
    setCurrentData(null);
  };

  const downloadCertificate = () => {
    if (!currentData) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Background gradient (golden / black)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.4, '#0b0b0b');
    gradient.addColorStop(0.7, '#3b2b00');
    gradient.addColorStop(1, '#1f1300');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 70) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - canvas.height, canvas.height);
      ctx.stroke();
    }

    // Border (gold)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner border (lighter gold)
    ctx.strokeStyle = '#f1d77b';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Shield icon (simplified)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(400, 120, 60, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark (gold accent)
    ctx.strokeStyle = '#f6e29a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(370, 125);
    ctx.lineTo(390, 145);
    ctx.lineTo(430, 105);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SILVER LAB', canvas.width / 2, 220);

    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillStyle = '#f6e29a';
    ctx.fillText('Official Certificate of Authenticity', canvas.width / 2, 260);

    // Verification badge
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('✓ VERIFIED', canvas.width / 2, 320);

    // Details section
    const startY = 380;
    const lineHeight = 70;
    const leftX = 120;
    const rightX = 680;

    ctx.font = '22px Arial';
    ctx.textAlign = 'left';

    const details = [
      { label: 'Serial Number:', value: currentData.serialNo },
      { label: 'Weight:', value: currentData.weight },
      { label: 'Purity:', value: currentData.purity },
      { label: 'Metal:', value: currentData.metal },
      { label: 'Origin:', value: currentData.origin },
      { label: 'Certified By:', value: currentData.certifiedBy },
      { label: 'Production Date:', value: currentData.production }
    ];

    details.forEach((detail, index) => {
      const y = startY + (index * lineHeight);

      // Label
                ctx.fillStyle = '#f6e29a';
      ctx.fillText(detail.label, leftX, y);

      // Value
                ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(detail.value, rightX, y);
      ctx.textAlign = 'left';
      ctx.font = '22px Arial';

                // Line
                ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, y + 15);
      ctx.lineTo(rightX, y + 15);
      ctx.stroke();
    });

    // Footer
    ctx.fillStyle = '#f6e29a';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('This certificate verifies the authenticity of the silver bar', canvas.width / 2, 900);
    ctx.fillText('issued by Silver Lab', canvas.width / 2, 930);
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('© 2026 Silver Lab. All Rights Reserved.', canvas.width / 2, 970);

    // Convert to image and download
    canvas.toBlob(function(blob) {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `SilverLab-Certificate-${currentData.serialNo}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchSerial();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 relative z-10">
      {/* Header */}
      <div className="text-center mb-16 search-container">
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-6 border-4 border-white/20">
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 logo-text">Silver Lab</h1>
        <p className="text-amber-100 text-xl font-medium">Official Silver Bar Verification System</p>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto mb-12 search-container">
        <div className="bg-white rounded-3xl p-10 shadow-2xl glow-effect">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Verify Your Silver Bar</h2>
          <p className="text-gray-500 text-center mb-8">Enter the serial number to check authenticity</p>
          <div className="relative">
            <input
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Your Serial Number"
              className="w-full px-6 py-5 pr-20 rounded-2xl text-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:border-amber-500 transition-all placeholder-gray-400"
            />
            <button
              onClick={searchSerial}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-black p-4 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </div>
          <p className="text-amber-600 text-sm mt-6 text-center font-medium">Try: KHI0B7C6Y, LHR1A2B3C, ISB2D4E6F, KHI3F5G7H</p>
        </div>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white border-l-4 border-red-500 px-6 py-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p className="font-bold text-gray-800">Serial Number Not Found</p>
                <p className="text-sm text-gray-600 mt-1">Please check the serial number and try again.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Showcase */}
      {products.length > 0 && (
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-xl shadow-lg p-4 relative overflow-hidden">
                <div className="absolute top-3 left-3 bg-amber-700 text-white text-xs px-3 py-1 rounded-full">{p.weight || ''}</div>
                <div className="flex items-center justify-center h-40 mb-4">
                  <img src={p.img} alt={p.title} className="max-h-36 object-contain" />
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-800">{p.title}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-amber-600 font-bold">{p.price}</div>
                  <button className="bg-amber-600 text-black px-3 py-1 rounded-md">Buy</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={closeCard}>
        <div className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-black to-amber-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-700 verification-card">
            {/* Close Button */}
            <div className="relative">
              <button
                onClick={closeCard}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all hover:scale-110 z-10 backdrop-blur-sm border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Success Icon */}
            <div className="text-center pt-12 pb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 shadow-lg shadow-green-500/50 border-4 border-green-400">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Verification Done</h3>
              <p className="text-amber-200 text-base px-8 leading-relaxed">This Silver Bar is Verified from the<br/>Official Silver Lab Production</p>
            </div>

            {/* Details */}
            <div className="px-8 pb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">Weight:</span>
                <span className="text-white font-bold text-base">{currentData?.weight}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">Purity:</span>
                <span className="text-white font-bold text-base">{currentData?.purity}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">Certified By:</span>
                <span className="text-white font-bold text-base">{currentData?.certifiedBy}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">S.No:</span>
                <span className="text-white font-bold text-base">{currentData?.serialNo}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">Origin:</span>
                <span className="text-white font-bold text-base">{currentData?.origin}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">Metal:</span>
                <span className="text-white font-bold text-base">{currentData?.metal}</span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-800/50 pb-4">
                <span className="text-amber-300 font-semibold text-base">Production:</span>
                <span className="text-white font-bold text-sm">{currentData?.production}</span>
              </div>
            </div>

            {/* Download Button */}
            <div className="px-8 pb-8">
              <button onClick={downloadCertificate} className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-4 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-20 search-container">
        <div className="inline-block bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full border border-white/20">
          <p className="text-white font-medium">&copy; 2026 Silver Lab. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
