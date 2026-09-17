import React, { useState } from 'react';
import { Download, FileText, CheckCircle, Eye, X } from 'lucide-react';
import { EDITORIAL_LOOKBOOK } from '../data/initialData';

const INVENTORY_DATA = [
  { sku: "SMB-SKN-001", name: "Swiss Glacier Cellular Serum", category: "Skincare", origin: "OPM Switzerland", retail: "₦45,000", wholesale: "₦38,250", moq: "12 pcs", status: "In Stock" },
  { sku: "SMB-SKN-002", name: "Alpine Botanical Recovery Oil", category: "Skincare", origin: "OPM Switzerland", retail: "₦38,000", wholesale: "₦32,300", moq: "12 pcs", status: "In Stock" },
  { sku: "SMB-SKN-003", name: "Crème de Edelweiss Intense", category: "Skincare", origin: "OPM Switzerland", retail: "₦65,000", wholesale: "₦55,250", moq: "6 pcs", status: "In Stock" },
  { sku: "SMB-SKN-004", name: "Purifying Glacier Mineral Essence", category: "Skincare", origin: "OPM Switzerland", retail: "₦28,000", wholesale: "₦23,800", moq: "24 pcs", status: "In Stock" },
  { sku: "SMB-COS-005", name: "Velvet Matte Royal Lip Elixir", category: "Cosmetics", origin: "OPM Korea", retail: "₦22,000", wholesale: "₦18,700", moq: "24 pcs", status: "In Stock" },
  { sku: "SMB-COS-006", name: "Luminous Silk Flawless Foundation", category: "Cosmetics", origin: "OPM USA", retail: "₦32,000", wholesale: "₦27,200", moq: "12 pcs", status: "In Stock" },
  { sku: "SMB-COS-007", name: "24K Gold Illuminating Compact", category: "Cosmetics", origin: "OPM Korea", retail: "₦35,000", wholesale: "₦29,750", moq: "12 pcs", status: "In Stock" },
  { sku: "SMB-COS-008", name: "Haute Couture Eyeshadow Palette", category: "Cosmetics", origin: "OPM USA", retail: "₦42,000", wholesale: "₦35,700", moq: "12 pcs", status: "In Stock" },
  { sku: "SMB-PRF-009", name: "Swiss Alchemist Extrait de Parfum", category: "Perfume", origin: "OPM Switzerland", retail: "₦85,000", wholesale: "₦72,250", moq: "6 pcs", status: "In Stock" },
  { sku: "SMB-PRF-010", name: "Golden Oud & Velvet Vanilla", category: "Perfume", origin: "OPM Thailand", retail: "₦95,000", wholesale: "₦80,750", moq: "6 pcs", status: "In Stock" },
  { sku: "SMB-PRF-011", name: "Fleur de Neige Alpine Parfumerie", category: "Perfume", origin: "OPM Switzerland", retail: "₦72,000", wholesale: "₦61,200", moq: "6 pcs", status: "In Stock" },
  { sku: "SMB-PRF-012", name: "Imperial Vetiver & Bergamot Cologne", category: "Perfume", origin: "OPM Thailand", retail: "₦68,000", wholesale: "₦57,800", moq: "6 pcs", status: "In Stock" },
];

export default function LookbookSection({ onSelectCategory }) {
  const [downloaded, setDownloaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDownloadInventory = () => {
    const headers = ["SKU", "Product Name", "Category", "Origin / OPM Status", "Retail Price (NGN)", "Wholesale Price (NGN)", "Minimum Order Qty", "Inventory Status"];
    const rows = INVENTORY_DATA.map(item => [
      item.sku,
      item.name,
      item.category,
      item.origin,
      item.retail,
      item.wholesale,
      item.moq,
      item.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SwissMax_Beauty_Inventory_Book_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <section className="lookbook-section" id="inventory-archive">
      <div className="container">
        {/* Section Header as requested */}
        <div className="section-header">
          <span className="section-label">Swissmax beauty archive</span>
          <h2 className="section-title">Articles & Inventory Book</h2>
        </div>

        {/* Download Inventory Banner Card */}
        <div style={{
          background: 'linear-gradient(135deg, #12141A 0%, #1A1D24 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '30px',
          borderRadius: '4px',
          marginBottom: '36px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileText size={16} color="var(--color-gold)" />
              <span style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '700' }}>
                Official Stock & Wholesale Catalogue
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#FFF', letterSpacing: '0.04em', margin: '0 0 8px 0' }}>
              SwissMax Beauty Master Inventory Book (2026 Edition)
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
              Access full product inventory with OPM manufacturer verification, verified batch codes, wholesale bulk order pricing in Naira (₦), and West Africa dispatch schedules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowPreview(true)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFF',
                padding: '12px 20px',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '2px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; e.currentTarget.style.color = '#FFF'; }}
            >
              <Eye size={14} />
              <span>Preview Table</span>
            </button>

            <button
              onClick={handleDownloadInventory}
              style={{
                background: 'var(--color-gold)',
                border: 'none',
                color: '#0B0C0E',
                padding: '12px 24px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '2px',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {downloaded ? (
                <>
                  <CheckCircle size={15} />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download Inventory (.CSV)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editorial Lookbook Cards */}
        <div className="lookbook-grid">
          {EDITORIAL_LOOKBOOK.map((item) => (
            <div key={item.id} className="lookbook-card" onClick={() => onSelectCategory('all')}>
              <img src={item.image} alt={item.title} className="lookbook-card-img" />
              <div className="lookbook-card-overlay" />
              <div className="lookbook-card-content">
                <span className="lookbook-card-sub">{item.subtitle}</span>
                <h3 className="lookbook-card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Preview Modal */}
        {showPreview && (
          <div 
            className="modal-backdrop" 
            style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowPreview(false)}
          >
            <div 
              style={{
                background: '#14161C',
                border: '1px solid var(--color-gold)',
                color: '#FFF',
                width: '100%',
                maxWidth: '960px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '30px',
                borderRadius: '4px',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-gold)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>
                    SwissMax Beauty Archive
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-display)', fontSize: '20px' }}>
                    Live Inventory & Price Tier Register (2026)
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={handleDownloadInventory}
                    style={{
                      background: 'var(--color-gold)',
                      border: 'none',
                      color: '#000',
                      padding: '8px 16px',
                      fontSize: '10px',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={13} />
                    <span>Download CSV</span>
                  </button>
                  <button 
                    onClick={() => setShowPreview(false)} 
                    style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-gold)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '10px 12px' }}>SKU</th>
                      <th style={{ padding: '10px 12px' }}>Product Name</th>
                      <th style={{ padding: '10px 12px' }}>Category</th>
                      <th style={{ padding: '10px 12px' }}>Origin / OPM</th>
                      <th style={{ padding: '10px 12px' }}>Retail (₦)</th>
                      <th style={{ padding: '10px 12px' }}>Wholesale (₦)</th>
                      <th style={{ padding: '10px 12px' }}>MOQ</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVENTORY_DATA.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#AAA' }}>{row.sku}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '500' }}>{row.name}</td>
                        <td style={{ padding: '10px 12px', color: '#AAA' }}>{row.category}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-gold)' }}>{row.origin}</td>
                        <td style={{ padding: '10px 12px' }}>{row.retail}</td>
                        <td style={{ padding: '10px 12px', color: '#4CAF50', fontWeight: '600' }}>{row.wholesale}</td>
                        <td style={{ padding: '10px 12px', color: '#AAA' }}>{row.moq}</td>
                        <td style={{ padding: '10px 12px', color: '#4CAF50' }}>● {row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
