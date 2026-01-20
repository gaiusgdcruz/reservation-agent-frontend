import React from 'react';
import ReactMarkdown from 'react-markdown';

const Summary = ({ content, onClose }) => {
    return (
        <div className="summary-overlay" style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="summary-content" style={{ position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '30px',
                        right: '30px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--gold-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                    ✕
                </button>
                <h2 style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    Consultation Summary
                </h2>
                <div style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    paddingRight: '1rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.8',
                    fontSize: '1.1rem'
                }}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button
                        className="btn-primary"
                        onClick={onClose}
                        style={{ margin: '0 auto' }}
                    >
                        Close Summary
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Summary;
