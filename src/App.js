import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Track from './Track/track';



// This is the import statements to make firebase work
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


// This is the key
const firebaseConfig = {
    apiKey: "AIzaSyBwZZ2QtjU0OivX0PTgSmJlDwg2JsVcYPA",
    authDomain: "loopnote-7cd85.firebaseapp.com",
    projectId: "loopnote-7cd85",
    storageBucket: "loopnote-7cd85.appspot.com",
    messagingSenderId: "342468166695",
    appId: "1:342468166695:web:cd8edfa9558969e315ba02",
    measurementId: "G-E8TJGBFT9K"
};

// This is the initializing the firebase to work
// Currently no structure, BUT the firebase key corresponds and does NOT cause error
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)



function App() {
    const [tracks, setTracks] = useState([]);
    const [trackIDCounter, setTrackIDCounter] = useState(0);
    const [allPlaying, setAllPlaying] = useState(false);
    const [soloActivated, setSoloActivated] = useState(false);
    const [soloTrackID, setSoloTrackID] = useState(-1);
    const [globalVolume, setGlobalVolume] = useState(0.5);

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

    const handleGlobalVolume = useCallback((e) => {
        // for (let i = 0; i < tracks.length; i++) {
        //     var currentVolume = tracks[i].waveSurferRef.current.getVolume();
        //     tracks[i].waveSurferRef.current.setVolume(e.target.value);
        //     tracks[i].setVolume(e.target.value);
        // }
        setGlobalVolume(e.target.value);
    });


    return (
        <div className="App">
            {tracks.map(track => (
                <Track key={track.id} id={track.id} audioFile={track.audioFile} solo={solo} registerTrack={registerTrack} globalVolume={globalVolume} />
            ))}
            <button className="rewind" onClick={setPlayHeadToStart}>&lt;&lt;</button>
            <button className="playall" onClick={playAll}>{allPlaying ? 'Pause All' : 'Play All'}</button>
            <button className="addtrack" onClick={addNewTrack}>Add Track</button>
            <input id="global-volume" orient="horizontal" type="range" min="0" max={"1"} step="0.1" onChange={handleGlobalVolume} defaultValue={globalVolume} />
        </div>
    );
}

export default App;
