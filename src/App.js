import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Track from './Track/track';

// importing functions we need from the SDKs we need 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";


// we need firestore so importing here 
// we are suppose to use firebase as a base in sum instances like in the initializeApp, but it isnt working idk 
import firebase from 'firebase/app'; // Import the core Firebase module


// we are configuring our unique database
const firebaseConfig = {
    apiKey: "AIzaSyBwZZ2QtjU0OivX0PTgSmJlDwg2JsVcYPA",
    authDomain: "loopnote-7cd85.firebaseapp.com",
    projectId: "loopnote-7cd85",
    storageBucket: "loopnote-7cd85.appspot.com",
    messagingSenderId: "342468166695",
    appId: "1:342468166695:web:cd8edfa9558969e315ba02",
    measurementId: "G-E8TJGBFT9K"
  };

// here we initialize our firebase 
// chatgpt says we should do firebase.initializeApp, but this doesnt work so idk
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const database = getDatabase(app);





// // This portion below will cover how to add songs to DB 
// // we set a variable to the function that calls on firestore 
// const firestore = firebase.firestore();
// // here we create a new song doc with a unique ID 
// const newSongRef = firestore.collection('songs').doc();
// const songData= {
//     Title: 'Song title',
//     Duration: '3:30',
//     Audio_file: 'song-url.mp3'
// };

// // Set the data for the new song document
// // Using the set method we will be adding the song files into the db 
// newSongRef.set(songData)
//   .then(() => {
//     console.log('Song added to Firestore!');
//   })
//   .catch((error) => {
//     console.error('Error adding song: ', error);
//   });





// //   In order to call data from the DB we use the get method
// const songCollection= firestore.collection('songs');
// // Get all documents in the 'songs' collection
// songCollection.get()
//   .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       // Access the data for each song document
//       const songData = doc.data();
//       console.log('Song Data:', songData);
//     });
//   })
//   .catch((error) => {
//     console.error('Error getting songs: ', error);
//   });


// //   In order to realtime update data/songfiles from the DB we use the onSnapshot method
// const songRef = firestore.collection('songs').doc('your-song-id');
// // Listen for changes to the song document
// songRef.onSnapshot((doc) => {
//   if (doc.exists) {
//     const songData = doc.data();
//     console.log('Song Data Updated:', songData);
//     // Update your React component's state with the new data
//   } else {
//     console.log('Song document does not exist.');
//   }
// });


function App() {
    const [tracks, setTracks] = useState([]);
    const [trackIDCounter, setTrackIDCounter] = useState(0);
    const [allPlaying, setAllPlaying] = useState(false);
    const [soloActivated, setSoloActivated] = useState(false);
    const [soloTrackID, setSoloTrackID] = useState(-1);
    const [globalVolume, setGlobalVolume] = useState(0.5);

    // potential useful variables below, not entirely sure yet
    // const db= firebase.database()
    // const firestore = firebase.firestore(); //kevin and ines added this supposed to be able to use the realtime database


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
                <Track key={track.id} id={track.id} audioFile={track.audioFile} solo={solo} registerTrack={registerTrack} globalVolume={globalVolume}/>
            ))}
            <button className="rewind" onClick={setPlayHeadToStart}>&lt;&lt;</button>
            <button className="playall" onClick={playAll}>{allPlaying ? 'Pause All' : 'Play All'}</button>
            <button className="addtrack" onClick={addNewTrack}>Add Track</button>
            <input id="global-volume" orient="horizontal" type="range" min="0" max={"1"} step="0.1" onChange={handleGlobalVolume} defaultValue={globalVolume} />
        </div>
    );




}

export default App;
