import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Track from './Track/track';
import { getDatabase, ref, set, get } from "firebase/database";



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

//creating databse with db


// function to write data
async function writeProjectData(title, projectId, duration, songs) {
    const db = getDatabase();
    try {
        await set(ref(db, projectId), {
            projectId: {
                Title: title,
                Duration: duration,
                songs: songs
            }
        });
        console.log('Data written successfully.');
    } catch (error) {
        console.error('Error writing data:', error);
    }
}
// giving trivial example to see if works
const projectId = 'uniqueProjectId';
const title = 'Project Title';
const duration = '3:30';
const songs = {
    'song1': {
        id: 'song1',
        title: 'Song Title 1',
        duration: '3:30',
        audio_mp3: 'song1.mp3'
    },
    'song2': {
        id: 'song2',
        title: 'Song Title 2',
        duration: '4:15',
        audio_mp3: 'song2.mp3'
    }
    // Add more song objects as needed
};
//Chat gpt says this probably works


//Going to try and read now
async function displayProjectData(projectId) {
    const db = getDatabase();
    const projectRef = ref(db, projectId);

    try {
        const snapshot = await get(projectRef);
        if (snapshot.exists()) {
            // Project data exists, you can access it from the snapshot
            const projectData = snapshot.val();
            console.log('Project Data:', projectData);
            // Here, you can use projectData to display the information in your UI
        } else {
            // Project data does not exist for the specified project ID
            console.log('No data found for the specified project ID.');
        }
    } catch (error) {
        // Handle error while fetching project data
        console.error('Error getting project data:', error);
    }
}

// Call the function to display project data for a specific project ID

async function fetchdata() {
    await writeProjectData(title, projectId, duration, songs)
    await displayProjectData(projectId);
}
fetchdata()



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

    ///
    ///

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
