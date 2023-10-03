import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Draggable from 'react-draggable';
import './track.css';

const Track = ({ id, audioFile, solo, registerTrack, globalVolume}) => {
    const waveSurferRef = useRef(null);
    const waveFormRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSolo, setIsSolo] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);

    useEffect(() => { // Initalize Track
        waveSurferRef.current = WaveSurfer.create({
            container: waveFormRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            interact: false,
            volume: volume,
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
                    setIsPlaying: setIsPlaying,
                    setVolume: setVolume
        });

    }, []);

    useEffect(() => { // Handle Mute by reacting to isMuted state change
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
        waveSurferRef.current.setVolume(e.target.value * globalVolume);
        setVolume(e.target.value);
    };

    useEffect(() => {
        waveSurferRef.current.setVolume(volume * globalVolume);
    }, [globalVolume]);


    const handlePlay = () => {
        waveSurferRef.current.playPause();
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="track"> 
            <div className="track-controls">
                <div className="track-control-buttons">
                    <button className={isMuted ? 'pushed' : 'unpushed'}onClick={toggleMute}>Mute</button>
                    <button className={isSolo ? 'pushed' : 'unpushed'}onClick={toggleSolo}>Solo</button>
                    <button className={isPlaying ? 'pushed' : 'unpushed'}onClick={handlePlay}>Play</button>
                </div>
                <input className="volume-slider" type="range" orient="vertical" min="0" max="1" step="0.1" onChange={handleVolume} defaultValue={volume} />
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
