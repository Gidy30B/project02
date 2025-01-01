import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBrjvw6-rfs9BPsdD30kAjIQ-m2mQejKyo",
    authDomain: "medplus-supat-af28f.firebaseapp.com",
    projectId: "medplus-supat-af28f",
    storageBucket: "medplus-supat-af28f.appspot.com",
    messagingSenderId: "399287117531",
    appId: "1:399287117531:web:6a3cb397b9933e9cd78efe",
    measurementId: "G-D0187ZL711"
  };

   if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
    }
  
    export{firebase};