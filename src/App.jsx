import React, { useState, useEffect } from 'react';
import { LiveKitRoom, useRoomContext, BarVisualizer, VoiceAssistantControlBar, useVoiceAssistant, ConnectionQualityIndicator, useConnectionState, useLocalParticipant, RoomAudioRenderer, useParticipants, useTracks } from '@livekit/components-react';
import { RoomEvent, ConnectionState, Track } from 'livekit-client';
import '@livekit/components-styles';

import AgentAvatar from './components/AgentAvatar';
import ToolVisualizer from './components/ToolVisualizer';
import Summary from './components/Summary';
import Analytics from './components/Analytics';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;
const LIVEKIT_TOKEN = import.meta.env.VITE_LIVEKIT_TOKEN;

function App() {
    const [token, setToken] = useState(LIVEKIT_TOKEN);
    const [url, setUrl] = useState(LIVEKIT_URL);
    const [summary, setSummary] = useState(null);
    const [isJoining, setIsJoining] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        // Fallback or override from URL params if needed
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");
        if (t) setToken(t);
        const u = params.get("url");
        if (u) setUrl(u);
    }, []);

    const handleJoin = () => {
        if (!token || !url) {
            setErrorMessage("Connection credentials (URL/Token) are missing. Please check your environment variables.");
            return;
        }
        setErrorMessage(null);
        setIsJoining(true);
    };

    return (
        <div style={{ height: '100vh', width: '100%', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {isJoining ? (
                <>
                    <header className="app-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
                        <h1 className="app-title" style={{ fontSize: '2rem' }}>Marriot Kochi</h1>
                    </header>
                    <LiveKitRoom
                        token={token}
                        serverUrl={url}
                        connect={true}
                        video={true}
                        audio={true}
                        onConnected={() => console.log("CONNECTED TO ROOM")}
                        onDisconnected={() => setIsJoining(false)}
                        onError={(err) => {
                            console.error("CONN ERROR", err);
                            setErrorMessage(err.message);
                            setIsJoining(false);
                        }}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
                    >
                        <RoomAudioRenderer />
                        <MainLayout onSummaryReceived={(val) => {
                            setSummary(val);
                            setIsJoining(false);
                        }} />
                    </LiveKitRoom>
                </>
            ) : (
                <main className="welcome-container">
                    <h1 className="welcome-logo">Marriot Kochi</h1>
                    <p className="welcome-tagline">Luxury Concierge & Reservations</p>

                    <div className="welcome-card">
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)', fontSize: '2.2rem', marginBottom: '0.8rem' }}>Welcome</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Experience seamless, premium reservations with our AI Concierge.</p>
                        </div>

                        {errorMessage && (
                            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--error-rose)', color: 'var(--error-rose)', marginBottom: '1.5rem' }}>
                                {errorMessage}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={handleJoin} style={{ padding: '1.4rem 4rem', fontSize: '1.2rem' }}>
                                Start Reservation
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                onClick={() => setShowAnalytics(true)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'underline' }}
                            >
                                Operational Cost Analytics
                            </button>
                        </div>
                    </div>
                </main>
            )}
            {summary && <Summary content={summary} onClose={() => setSummary(null)} />}
            {showAnalytics && <Analytics onClose={() => setShowAnalytics(false)} />}
        </div>
    );
}

function MainLayout({ onSummaryReceived }) {
    const room = useRoomContext();
    const [toolEvents, setToolEvents] = useState([]);
    const [isConnecting, setIsConnecting] = useState(true);
    const { state, audioTrack, agent } = useVoiceAssistant();
    const { localParticipant } = useLocalParticipant();
    const connectionState = useConnectionState();

    // Monitor for the agent's presence and video track
    const participants = useParticipants();
    const agentParticipant = participants?.find(p => !p.isLocal);
    const tracks = useTracks([Track.Source.Camera]);
    const agentVideoTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);

    useEffect(() => {
        // If we have an agent and they are subscribed (video or audio ready)
        if (agentParticipant && (agentVideoTrack || audioTrack)) {
            // Give it a tiny buffer to ensure smooth transition
            const timer = setTimeout(() => setIsConnecting(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [agentParticipant, agentVideoTrack, audioTrack]);

    useEffect(() => {
        if (!room) return;

        const onData = (payload, participant, kind) => {
            const str = new TextDecoder().decode(payload);
            try {
                const data = JSON.parse(str);
                if (data.type === "tool_call") {
                    setToolEvents(prev => [...prev, data]);
                } else if (data.type === "summary") {
                    // Trigger parent component handler to show summary and disconnect
                    if (onSummaryReceived) onSummaryReceived(data.content);
                }
            } catch (e) {
                console.error("Data parse error", e);
            }
        };

        room.on(RoomEvent.DataReceived, onData);
        return () => {
            room.off(RoomEvent.DataReceived, onData);
        };
    }, [room, onSummaryReceived]);

    return (
        <div className="container" style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            {isConnecting && (
                <div className="connecting-overlay">
                    <div className="ringing-icon">
                        <div className="ringing-pulse"></div>
                        <div className="ringing-pulse"></div>
                        <PhoneIcon color="var(--gold-primary)" />
                    </div>
                    <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)', fontSize: '1.8rem' }}>Connecting to Marriot Kochi...</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Our AI Concierge is preparing for your call</p>
                </div>
            )}

            <div className="card avatar-section">
                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                    <ConnectionQualityIndicator participant={localParticipant} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: connectionState === ConnectionState.Connected ? 'var(--success-emerald)' : 'var(--error-rose)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {connectionState}
                    </span>
                </div>

                <AgentAvatar />

                {/* Audio Visualizer only */}
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    opacity: 0.8
                }}>
                    {audioTrack && <BarVisualizer trackRef={audioTrack} barCount={15} height={40} />}
                </div>
            </div>

            <div className="card tool-visualizer-section">
                <ToolVisualizer events={toolEvents} />
            </div>

            <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                <VoiceAssistantControlBar controls={{ leave: true, mic: true, camera: false, screenShare: false }} />
            </div>
        </div>
    );
}

const PhoneIcon = ({ color }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

export default App;
