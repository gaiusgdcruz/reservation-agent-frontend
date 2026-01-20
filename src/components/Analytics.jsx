import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PRICING = {
    PARTICIPANT_PER_MIN: 0.0105, // LiveKit Agent + Participant
    STT_PER_MIN: 0.0043,         // Deepgram Nova-2
    INPUT_TOKEN_1M: 0.15,        // GPT-4o-mini
    OUTPUT_TOKEN_1M: 0.60,
    TTS_CHAR_1M: 40.00           // Cartesia TTS (Approx)
};

const Analytics = ({ onClose }) => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                console.log(`Fetching analytics from: ${API_BASE_URL}/analytics/summaries`);
                const response = await fetch(`${API_BASE_URL}/analytics/summaries`);
                const result = await response.json();
                console.log("Analytics API Result:", result);
                if (result.status === "success") {
                    setSummaries(result.data);
                } else {
                    console.error("Analytics API returned error status:", result);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaries();
    }, []);

    const calculateCost = (usageData) => {
        let usage = usageData;
        if (typeof usage === 'string') {
            try {
                usage = JSON.parse(usage);
            } catch (e) {
                console.error("Failed to parse usage data", e);
                return 0;
            }
        }
        if (!usage) return 0;
        
        const connectionCost = ((usage.duration_seconds || 0) / 60) * PRICING.PARTICIPANT_PER_MIN;
        const sttCost = ((usage.duration_seconds || 0) / 60) * PRICING.STT_PER_MIN;
        const inputCost = ((usage.input_tokens || 0) / 1000000) * PRICING.INPUT_TOKEN_1M;
        const outputCost = ((usage.output_tokens || 0) / 1000000) * PRICING.OUTPUT_TOKEN_1M;
        const ttsCost = ((usage.tts_characters || 0) / 1000000) * PRICING.TTS_CHAR_1M;
        return connectionCost + sttCost + inputCost + outputCost + ttsCost;
    };

    const getUsageVal = (usageData, key) => {
        let usage = usageData;
        if (typeof usage === 'string') {
            try {
                usage = JSON.parse(usage);
            } catch (e) { return 0; }
        }
        return usage ? (usage[key] || 0) : 0;
    };

    const totalCost = summaries.reduce((acc, s) => acc + calculateCost(s.usage), 0);
    const totalDuration = summaries.reduce((acc, s) => acc + getUsageVal(s.usage, 'duration_seconds'), 0);

    return (
        <div className="summary-overlay" style={{ background: 'rgba(0,0,0,0.95)' }}>
            <div className="summary-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>Call Cost Analytics</h2>
                    <button className="btn-secondary" onClick={onClose}>Close Dashboard</button>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics data...</p>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Operational Cost</span>
                                <h3 style={{ color: 'var(--gold-primary)', fontSize: '2.5rem', margin: '0.5rem 0' }}>${totalCost.toFixed(4)}</h3>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Call Volume</span>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '2.5rem', margin: '0.5rem 0' }}>{summaries.length}</h3>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Avg Duration</span>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '2.5rem', margin: '0.5rem 0' }}>
                                    {summaries.length > 0 ? (totalDuration / summaries.length / 60).toFixed(1) : 0}m
                                </h3>
                            </div>
                        </div>

                        <div className="tool-log" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>Historical Breakdown</h4>
                            {summaries.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No call history found.</p>
                            )}
                            {summaries.map((s, i) => (
                                <div key={i} className="tool-entry" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600' }}>{s.timestamp}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {getUsageVal(s.usage, 'duration_seconds').toFixed(1)}s • {getUsageVal(s.usage, 'input_tokens')} in / {getUsageVal(s.usage, 'output_tokens')} out tokens
                                        </p>
                                    </div>
                                    <div style={{ color: 'var(--gold-primary)', fontWeight: '700' }}>
                                        ${calculateCost(s.usage).toFixed(4)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;
