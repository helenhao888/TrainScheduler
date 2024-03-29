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
var actionFlg="";
var trainKey="";
var database,ref;
var trainTd ="";
var onValueChange;


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


  initializeFun();

  //Initialize variables and database
  function initializeFun(){
    nextArl="";
    minAwy=0;
    actionFlg="";
    trainKey="";
    trainTd ="";

    firebase.initializeApp(firebaseConfig);
    // Create a variable to reference the database.
    database=firebase.database();
    ref=database.ref();

    $(".updateTrain").hide();
  }


//Validate the input fields can't be space
function validate(){
     
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
     
     if( train.firstTime === ""  ) {
        alert( "Please provide the first train time");
        $("#first-train-time").focus() ;
        return false;
     } else{
        var formats="HH:mm";
        var check= moment(train.firstTime,formats,true).isValid();
        
        if(!check){            
            alert("Please input a valid time, format (HH:mm) Military time");
            $("#first-train-time").focus() ;
            return false;
        }          
     }

     if( train.frequency === "" ) {
        alert( "Please provide the train frequency!" );
        $("#frequency").focus() ;
        return false;
     }
     
     return true;
     
}

// Create Firebase event for adding train to the database and a row in the html when a user adds an entry
ref.on("child_added", function(snap) {
  
    actionFlg="add";
    if (snap.val() != null){
       retrieveData (snap);    
    }   
}, function(errorObject) {
    console.log("The add failed: " + errorObject.code);
})   

//Any data change on database , call the function
ref.on("value",function(snapshot){
    
    //only when there are data (has child) in database and the action is delete or update, retrieve the data of each child    
    if ((snapshot.val() != null ) && (actionFlg==="delete"||actionFlg==="update")){
         
        snapshot.forEach(function(childSnapshot) {            
            retrieveData(childSnapshot);
        });       
    }

}, function(errorObject) {
    console.log("The retrieve data failed: " + errorObject.code);
})  


ref.on("child_removed",function(childsnap){
    
    //empty all train information under the train time table,will retrieve again
    $(".trainlist").empty();
    actionFlg="delete";
    $(".addTrain").show();   
    $(".updateTrain").hide(); 


}, function(errorObject) {
    console.log("The delete failed: " + errorObject.code);
})   

ref.on("child_changed",function(childsnap){
    
    actionFlg="update";
    //empty all train information under the train time table,will retrieve again
    $(".trainlist").empty();    
    $(".addTrain").show();   
    $(".updateTrain").hide(); 
   
}, function(errorObject) {
    console.log("The update failed: " + errorObject.code);
})  


//when the add train submit button is clicked, call the function
 $(document).on("click","#submit",function(event){
     
    event.preventDefault();
    
    // Get the input values   
    train.trainName=$("#train-name").val().trim();
    train.destination=$("#destination").val().trim();
    train.firstTime=$("#first-train-time").val().trim();
    train.frequency=$("#frequency").val().trim();
    //remove leading zeros
    train.frequency=parseInt(train.frequency,10);

    //if the input fileds pass the validation, add them to the database 
    if(validate()) {
        train.firstTime=moment($("#first-train-time").val().trim(),"HH:mm").format("X");        
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

//when click the edit icon , call the updateTrainFunc function to update train information
$(document).on("click",".editTrain",updateTrainFunc);

//update train information based on the screen input
function updateTrainFunc(){
       
    trainTd=$(this).parent().find(".trainName").text();           
          
    //define the listener
    onValueChange = function(snapshot){    
        
     snapshot.forEach(child => {         
        //find the child whose trainName equals to the edited one
        if(child.val().trainName===trainTd){
            
            trainKey=child.key;
            train=child.val();
            var fTimeCon=moment.unix(train.firstTime).format("HH:mm"); 
            $(".addTrain").hide();
            $(".updateTrain").show();
            //set the edit train card's value from database(object train)
            $("#train-name-u").val(train.trainName);
            $("#destination-u").val(train.destination);
            $("#first-train-time-u").val(fTimeCon);
            $("#frequency-u").val(train.frequency);
        }
        })
    }
    //open the listener
    ref.on("value",onValueChange);
}
//when edit train info , once click submit button , call the function
$(document).on("click","#submitUp",function(event){
    
    event.preventDefault();
    //close the listener 
    ref.off("value",onValueChange);
    
    //get the updated train info from screen input
    train.trainName=$("#train-name-u").val().trim();
    train.destination=$("#destination-u").val().trim();
    train.firstTime=$("#first-train-time-u").val().trim();    
    train.frequency=$("#frequency-u").val().trim();
    //remove leading zeros
    train.frequency=parseInt(train.frequency,10);
    //call validate to check the update inputs are valid, then  update the database
    var valResult=validate();
    if(valResult){
        train.firstTime=moment($("#first-train-time-u").val().trim(),"HH:mm").format("X"); 
        train.dataAdded=firebase.database.ServerValue.TIMESTAMP;        
        var updates={};
        //move the updated train to updates object with the updated child's key 
        updates[trainKey]=train;    
        //updated database
        ref.child(trainKey).update(train);
    }

})   

//when click delete Train icon, call deleteTrainFunc function
$(document).on("click",".deleteTrain",deleteTrainFunc);

//delete selected train information
function deleteTrainFunc(){
    
    //get the train name to be deleted
    var trainTd=$(this).parent().find(".trainName").text();
               
    // Delete the record whose trainName equal to trainTd 
    ref.orderByChild("trainName").on("value",function(snapshot){
     snapshot.forEach(child => {
        if(child.val().trainName===trainTd){
        //delete the record from database       
            ref.child(child.key).remove();
        }
        })
    });
}

//retrieve the data from database
function retrieveData (snapshot){
  
    var trName = snapshot.val().trainName;
    var dest = snapshot.val().destination; 
    var firstT = snapshot.val().firstTime;
    var freqT = snapshot.val().frequency;    
    
    calculateTime(firstT,freqT); 
    //create delete and edit icons
    var deleteIcon =$("<i>").text("delete").addClass("fa fa-trash-o ");
    var deleteLink=$("<a>").attr("href","#").addClass("deleteTrain").html(deleteIcon);

    var editIcon=$("<i>").text("edit").addClass("fa fa-pencil ");
    var editLink = $("<a>").attr("href","#").addClass("editTrain").html(editIcon);
   
    //create a table row under the tablelist (current tain schedule)
    var trainData =$("<tr>").addClass("trainTr").attr("name",trName);
    trainData.append( $("<td>").text(trName).addClass("trainName"),
                    $("<td>").text(dest),
                    $("<td>").text(freqT),
                    $("<td>").text(nextArl),
                    $("<td>").text(minAwy),editLink,deleteLink);                
    $(".trainlist").append(trainData);
  
}

//based on first time and frequency to calculate the next Arrival time and time away
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
        minAwy=freq-timeDiff % freq ;
        nextArl=moment(currentTime.add(minAwy,"minutes")).format("HH:mm");   
    }
    
}
    