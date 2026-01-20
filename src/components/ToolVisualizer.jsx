import React, { useEffect, useRef } from 'react';

const ToolVisualizer = ({ events }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);

    return (
        <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2>Activity Logs</h2>
            <div className="tool-log" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                {events.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '20%', color: 'var(--text-muted)' }}>
                        <p style={{ fontStyle: 'italic' }}>Awaiting initial request...</p>
                    </div>
                )}
                {events.map((event, index) => (
                    <ToolEntry key={index} event={event} />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

const ToolEntry = ({ event }) => {
    const { tool, data } = event;

    // Status color mapping to theme
    let statusColor = 'var(--gold-primary)';
    if (data.status === 'completed') statusColor = 'var(--success-emerald)';
    if (data.status === 'failed') statusColor = 'var(--error-rose)';
    if (data.status === 'started') statusColor = 'var(--gold-soft)';

    return (
        <div className="tool-entry" style={{ borderLeftColor: statusColor }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="tool-name" style={{ color: statusColor, textTransform: 'capitalize' }}>
                    {tool.replace(/_/g, ' ')}
                </span>
                <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: `${statusColor}22`,
                    color: statusColor,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }}>
                    {data.status}
                </span>
            </div>
            <pre style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {JSON.stringify(omitStatus(data), null, 2)}
            </pre>
        </div>
    );
};

function omitStatus(data) {
    const { status, ...rest } = data;
    return rest;
}

export default ToolVisualizer;
