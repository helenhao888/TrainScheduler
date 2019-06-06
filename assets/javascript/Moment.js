var train={
    name:"",
    dest:"",
    firstT:"",
    freqT:0,
    nextAr:"",
    minAway:0
}

// Initialize Firebase

const firebaseConfig = {
    apiKey: "AIzaSyCkWy-_QQbtoQTGXGYp2ZbsJrWvl8UgVbA",
    authDomain: "trainscheduler-e9fdf.firebaseapp.com",
    databaseURL: "https://trainscheduler-e9fdf.firebaseio.com",
    projectId: "trainscheduler-e9fdf",
    storageBucket: "trainscheduler-e9fdf.appspot.com",
    messagingSenderId: "784656685324",
    appId: "1:784656685324:web:71533bc4dfe42c5c"
  };

  firebase.initializeApp(firebaseConfig);

  // Create a variable to reference the database.
  var database=firebase.database();

//   $('#datetimepicker3').datetimepicker({
//     format: 'LT',
//     use24hours: true
// });

// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update your page in real-time when the firebase database changes.
database.ref().on("value", function(snapshot) {


 //check if firebase has an existing record , update it
 
 //create a table row under the tablelist (current tain schedule)
 

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
})   

$("#submit").on("click",function(event){
    event.preventDefault();

    // Get the input values
    var trName=$("#train-name").val().trim();
    var dest=$("#destination").val().trim();
    var firstTime=$("#first-train-time").val().trim();
    var freq=$("#frequency").val().trim();
    console.log("name",trName);

// CONVERT to UNIX  time format
// add timestamp

    //store to firebase
    database.ref().set({
        trainName:trName,
        destination:dest,
        firstTrainTime:firstTime,
        frequency:freq
    })
})