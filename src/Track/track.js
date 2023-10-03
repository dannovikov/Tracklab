import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Draggable from 'react-draggable';
import './track.css';

const Track = ({ id, audioFile, solo, registerTrack}) => {
    const waveSurferRef = useRef(null);
    const waveFormRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSolo, setIsSolo] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => { // Initalize Track
        waveSurferRef.current = WaveSurfer.create({
            container: waveFormRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            interact: false,
            
        });

        waveSurferRef.current.load(audioFile);
        
        console.log('registering track', id)
        registerTrack({id: id,
                    audioFile: audioFile,
                    waveSurferRef: waveSurferRef,
                    isSolo: () => isSolo, 
                    setIsSolo: setIsSolo,
                    isMuted: () => isMuted,
                    setIsMuted: setIsMuted,
                    isPlaying: isPlaying,
                    setIsPlaying: setIsPlaying
        });

    }, []);

    useEffect(() => { // Handle Mute
        waveSurferRef.current.setMuted(isMuted);
        if (isMuted) {
            waveSurferRef.current.setOptions({
                waveColor: 'grey',
                progressColor: 'darkgrey'
            });
        } else {
            waveSurferRef.current.setOptions({
                waveColor: 'violet',
                progressColor: 'purple'
            });
        }
    }, [isMuted])

    const toggleMute = () => {
        waveSurferRef.current.setMuted(!isMuted);
        setIsMuted(!isMuted);
    };

    const toggleSolo = () => {
        // Handle solo logic
        solo(id);
        setIsSolo(!isSolo);
    };

    const handleVolume = (e) => {
        waveSurferRef.current.setVolume(e.target.value);
    };


    const handlePlay = () => {
        waveSurferRef.current.playPause();
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="track"> 
            <div className="track-controls">
                <div className="track-control-buttons">
                    <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
                    <button onClick={toggleSolo}>{isSolo ? 'Unsolo' : 'Solo'}</button>
                    <button onClick={handlePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
                </div>
                <input className="volume-slider" type="range" orient="vertical" min="0" max="1" step="0.1" onChange={handleVolume} />
            </div>
            <div className="waveform-container">
                <Draggable bounds="parent">
                    <div id="waveform" ref={waveFormRef}></div>
                </Draggable>
            </div>
        </div>
    );
};

export default Track;
