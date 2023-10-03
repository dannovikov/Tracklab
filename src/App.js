import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Track from './Track/track';


function App() {
    const [tracks, setTracks] = useState([]);
    const [trackIDCounter, setTrackIDCounter] = useState(0);
    const [allPlaying, setAllPlaying] = useState(false);
    const [soloActivated, setSoloActivated] = useState(false);
    const [soloTrackID, setSoloTrackID] = useState(-1);

    const registerTrack = useCallback((track) => {
        setTracks(prevTracks => {
            return prevTracks.map(t => {
                if (t.id === track.id) {
                    return { ...t, ...track };
                }
                return t;
            });
        });
    }, []);

    const addNewTrack = useCallback(() => {
        setTrackIDCounter(trackIDCounter + 1);
        setTracks(tracks => [...tracks, { id: trackIDCounter, audioFile: 'test_audio/Tequila.mp3' }]);
    });

    const removeTrack = useCallback((id) => {
        setTracks(tracks => tracks.filter(track => track.id !== id));

        if (trackIDCounter === id) {
            setTrackIDCounter(trackIDCounter - 1);
        }

        if (soloTrackID === id) {
            setSoloActivated(false);
            setSoloTrackID(-1);
        }

    });

    const solo = useCallback((id) => {
        if (!soloActivated || soloTrackID !== id) {
            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i].id !== id) { 
                    // Mute all other tracks
                    tracks[i].setIsMuted(true);
                    tracks[i].setIsSolo(false);
                } else { 
                    // Unmute the soloed track
                    tracks[i].setIsMuted(false);
                    tracks[i].setIsSolo(true);
                }
            }
            // remember which track is soloed
            setSoloActivated(true);
            setSoloTrackID(id);
        } else {
            // Unsolo all tracks
            // TODO: Keep track of which tracks were muted before solo activated,
            // those should remain muted.

            for (let i = 0; i < tracks.length; i++) {
                tracks[i].setIsMuted(false);
                tracks[i].setIsSolo(false);
            }
            setSoloActivated(false);
            setSoloTrackID(-1);
        }
    });

    const playAll = useCallback(() => {
        if (allPlaying) {
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].waveSurferRef.current.pause();
                tracks[i].setIsPlaying(false);
            }
            setAllPlaying(false);
        } else {
            for (let i = 0; i < tracks.length; i++) {
                if (!tracks[i].isMuted()) {
                    tracks[i].waveSurferRef.current.play();
                    tracks[i].setIsPlaying(true);
                }
            }
            setAllPlaying(true);
        }
    });

    const setPlayHeadToStart = useCallback(() => {
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].waveSurferRef.current.seekTo(0);
        }
    });


    return (
        <div className="App">
            {tracks.map(track => (
                <Track key={track.id} id={track.id} audioFile={track.audioFile} solo={solo} registerTrack={registerTrack} />
            ))}
            <button className="rewind" onClick={setPlayHeadToStart}>&lt;&lt;</button>
            <button className="playall" onClick={playAll}>{allPlaying ? 'Pause All' : 'Play All'}</button>
            <button className="addtrack" onClick={addNewTrack}>Add Track</button>
        </div>
    );
}

export default App;
