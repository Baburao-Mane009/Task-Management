const mongoose=require("mongoose");
const User =require("./User.js");



const TaskSchema=new mongoose.Schema({

    task:{
        type:String,
        required:[true,"The value is required"],
        trim:true,
        minLength:[3,"The task should atleast 3 charcter "],
        maxLength:[50 ,"the task should not contain more than 50 character"]
    },                      //validation is applied here like type od task and status should be string and required;
    status:{
        type:String,
         default:"pending",
         
              enum:{
                values:["pending","complete"],
                 message: "value either be pending or complete "
              }
       ,
        trim:true
    },

    priority:{
        type:Number,
        required:true,
        min:[1,"priority should atleast one"],
        max:[5,"the priority should less than 5"]
    }
    ,createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
}
   
},

{
        timestamps:true
    })

module.exports= mongoose.model("Task",TaskSchema);
