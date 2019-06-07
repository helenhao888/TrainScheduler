var train={
    trainName:"",
    destination:"",
    firstTime:"",
    frequency:0,
    dataAdded:0
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

//Create Firebase event for adding train to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function(snapshot) {

 console.log("snap",snapshot.val());
 var trName = snapshot.val().trainName;
 var dest = snapshot.val().destination; 
 var firstT = snapshot.val().firstTime;
 var freq = snapshot.val().frequency;
 var nextArl;
 var minAwy;
 
 var firstTimeCon=moment.unix(firstT).format("HH:mm");
 console.log("first ",firstTimeCon);
 var firstTimeComp=moment(firstTimeCon,"HH:mm");
 
 var currentTime = moment();
 console.log("current time",currentTime);
 var timeDiff = currentTime.diff((firstTimeComp),"minutes");

 console.log("diff",timeDiff);

//if current time less than the first train time, the next arrival time is the first train time
if((timeDiff)<=0){
    nextArl=firstTimeCon;
    minAwy=0-timeDiff;
}else{
    minAwy=timeDiff % freq ;
    nextArl=moment(currentTime.add(minAwy,"minutes")).format("HH:mm");
    
}
 

 //check if firebase has an existing record , error
 
 //create a table row under the tablelist (current tain schedule)
 var trainData =$("<tr>").append($("<td>").text(trName),
                                 $("<td>").text(dest),
                                 $("<td>").text(freq),
                                 $("<td>").text(nextArl),
                                 $("<td>").text(minAwy));                
 $(".trainlist").append(trainData);

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
})   

$("#submit").on("click",function(event){
    event.preventDefault();
       
    // Get the input values   
    train.trainName=$("#train-name").val().trim();
    train.destination=$("#destination").val().trim();
    train.firstTime=moment($("#first-train-time").val().trim(),"LT").format("X");
    train.frequency=$("#frequency").val().trim();
    console.log("first time",train.firstTime);
 
    train.dataAdded=firebase.database.ServerValue.TIMESTAMP;
    
    //store to firebase
    database.ref().push(train);
})



// First argument must be a valid event type = "value", "child_added", "child_removed", "child_changed", or "child_moved".