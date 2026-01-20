import React, { useEffect } from 'react';
import { useIsSpeaking, useParticipants, ParticipantContext, VideoTrack, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

const AgentAvatar = () => {
    const participants = useParticipants();
    const agent = participants.find(p => !p.isLocal);

    // Find the agent's video track - look for ANY remote participant's camera track
    const tracks = useTracks([Track.Source.Camera]);
    const agentVideoTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);

    useEffect(() => {
        if (tracks.length > 0) {
            console.log("Detected tracks:", tracks.map(t => ({ identity: t.participant.identity, source: t.source })));
        }
    }, [tracks]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            borderRadius: '24px',
            color: 'white',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {agentVideoTrack ? (
                <div style={{ width: '100%', height: '100%', position: 'relative', animation: 'fadeIn 1s ease' }}>
                    <VideoTrack
                        trackRef={agentVideoTrack}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 12px',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--gold-primary)'
                    }}>
                        AI Avatar • Live
                    </div>
                </div>
            ) : agent ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
                    <ParticipantContext.Provider value={agent}>
                        <MicIconWithSpeakingState />
                    </ParticipantContext.Provider>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Reservation Concierge</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Video Synchronizing...</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            position: 'relative'
                        }}
                    >
                        <MicSvg color="var(--gold-primary)" />
                        <div className="ringing-pulse" style={{ animationDelay: '0s' }}></div>
                    </div>
                    <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)', fontSize: '1.5rem' }}>Waiting for Agent</h3>
                </div>
            )}
        </div>
    );
};

const MicIconWithSpeakingState = () => {
    const isSpeaking = useIsSpeaking();

    return (
        <>
            <div
                style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: isSpeaking ? 'var(--gold-primary)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: isSpeaking ? '0 0 50px rgba(212, 175, 55, 0.4)' : 'none',
                    position: 'relative'
                }}
            >
                <MicSvg color={isSpeaking ? '#000' : 'var(--gold-primary)'} />
                {isSpeaking && (
                    <div
                        className="ringing-pulse"
                        style={{ border: '2px solid var(--gold-primary)', animationDuration: '1.5s' }}
                    ></div>
                )}
            </div>
        </>
    );
};

const MicSvg = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

export default AgentAvatar;
