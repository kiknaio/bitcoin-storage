const firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBkVRg-6j-RWPTE3KJOaKUCh9F4sLMIT6g",
  authDomain: "bitcoin-save.firebaseapp.com",
  databaseURL: "https://bitcoin-save.firebaseio.com",
  storageBucket: "bitcoin-save.appspot.com"
};
firebase.initializeApp(config);


exports.savePrivateKey = (privateKey, id) => {
  firebase.database().ref(id).set({ privateKey })
  const privateKeyLibrary = firebase.database().ref(id);
  privateKeyLibrary.on('value', snapshot => console.log(snapshot.val()));
}