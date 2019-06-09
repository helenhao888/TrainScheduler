var train={
    trainName:"",
    destination:"",
    firstTime:"",
    frequency:0,
    dataAdded:0
}

var query;
var nextArl;
var minAwy;
var tdTrain;
// var childArr=[];

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
  var ref=database.ref();

  initializeFun();
  
  function initializeFun(){
    nextArl="";
    minAwy=0;
  }

//   $('#datetimepicker3').datetimepicker({
//     format: 'LT',
//     use24hours: true
// });

//Validate the input fields. 
function validate(){
 
    console.log("validate train text",train.trainName);
    if( train.trainName === "" ) {
        
        alert( "Please provide the train name!" );
        $("#train-name").focus() ;
        return false;
     }

     if( train.destination === "" ) {
        alert( "Please provide the train destination!" );
        $("#destination").focus() ;
        return false;
     }
     //add check valid time ??????
     if( train.firstTime === "" ) {
        alert( "Please provide the first train time");
        $("#first-train-time").focus() ;
        return false;
     }

     if( train.frequency === "" ) {
        alert( "Please provide the train frequency!" );
        $("#frequency").focus() ;
        return false;
     }
     
     return true;
     
}

//Create Firebase event for adding train to the database and a row in the html when a user adds an entry
ref.on("child_added", function(snap) {

    if (snap.val() != null){
       retrieveData (snap);    
    }
    

}, function(errorObject) {
    console.log("The add failed: " + errorObject.code);
})   

ref.on("value",function(snapshot){
    console.log("snap value change",snapshot.val());
    if (snapshot.val() != null){
       retrieveData(snapshot);
    }

})

ref.on("child_removed",function(childsnap){

    console.log("deleted",childsnap.val());
    $(".trainlist").empty();

}, function(errorObject) {
    console.log("The delete failed: " + errorObject.code);
})   

$("#submit").on("click",function(event){
    event.preventDefault();
       
    // Get the input values   
    train.trainName=$("#train-name").val().trim();
    train.destination=$("#destination").val().trim();
    train.firstTime=moment($("#first-train-time").val().trim(),"LT").format("X");
    train.frequency=$("#frequency").val().trim();

    //if the input fileds pass the validation, add them to the database 
    if(validate()) {
 
        train.dataAdded=firebase.database.ServerValue.TIMESTAMP;
        
        //store to firebase
        database.ref().push(train);

        //empty the text fields under add train card
        $("#train-name").val("");
        $("#destination").val("");
        $("#first-train-time").val("");
        $("#frequency").val("");
    }
})

$(document).on("click",".editTrain",updateTrainFunc);

function updateTrainFunc(){
    console.log("this",$(this).parent());
    var trainTdName=$(this).parent().find(".trName").text();
    console.log("train",$(this).parent().find(".trName"));
    tdTrain = $(this).parent();
    var query = ref.orderByChild('trainName').equalTo(trainTdName); 
    
    console.log("query",query);
    query.on("value", function(snapshot) {
             console.log("get snapshot before update",snapshot)});
}

$(document).on("click",".deleteTrain",deleteTrainFunc);

function deleteTrainFunc(){

    var trainTd=$(this).parent().find(".trainName").text();
               
    // Delete the record whose trainName equal to trainTd 
    ref.orderByChild("trainName").on("value",function(snapshot){
     snapshot.forEach(child => {
        if(child.val().trainName===trainTd){
            ref.child(child.key).remove();
        }else{
            childArr.push(child.key);}
        }
        )
    });

}

function retrieveData (snapshot){
    console.log("retrieve snap",snapshot.val());
    var trName = snapshot.val().trainName;
    var dest = snapshot.val().destination; 
    var firstT = snapshot.val().firstTime;
    var freqT = snapshot.val().frequency;    
    
    calculateTime(firstT,freqT);  


    var deleteIcon =$("<i>").text("delete").addClass("fa fa-trash-o ");
    var deleteLink=$("<a>").attr("href","#").addClass("deleteTrain").html(deleteIcon);

    var editIcon=$("<i>").text("edit").addClass("fa fa-pencil ");
    var editLink = $("<a>").attr("href","#").addClass("editTrain").html(editIcon);

    //check if firebase has an existing record , error
    
    //create a table row under the tablelist (current tain schedule)
    var trainData =$("<tr>").addClass("trainTr").attr("name",trName);
    trainData.append( $("<td>").text(trName).addClass("trainName"),
                    $("<td>").text(dest),
                    $("<td>").text(freqT),
                    $("<td>").text(nextArl),
                    $("<td>").text(minAwy),editLink,deleteLink);                
    $(".trainlist").append(trainData);
    console.log("trainlist",$(".trainlist"));
}

// function deleteData(snapdata){

//     console.log("name" ,snapdata.trainName);
//     var className = snapdata.trainName;
//     console.log("tdtrain",tdTrain);
//     console.log("find td class ",tdTrain.find(className));
//     tdTrain.find(".className").empty();
//     //find class = ""snapdata.trainName , then empty
// }


function calculateTime(time,freq){
    var firstTimeCon=moment.unix(time).format("HH:mm"); 
    var firstTimeComp=moment(firstTimeCon,"HH:mm"); 
    var currentTime = moment();
    var timeDiff = currentTime.diff((firstTimeComp),"minutes");

    //if current time less than the first train time, the next arrival time is the first train time
    if((timeDiff)<=0){
        nextArl=firstTimeCon;
        minAwy=0-timeDiff;
    }else{
        minAwy=timeDiff % freq ;
        nextArl=moment(currentTime.add(minAwy,"minutes")).format("HH:mm");   
    }
}
       // const updates = {};
//  updates[child.key] = null;
    //  eventNameRef.update(updates);
 
// First argument must be a valid event type = "value", "child_added", "child_removed", "child_changed", or "child_moved".