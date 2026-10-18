import Button from"./Button.jsx";
import {useState} from "react";
function UpdateTask({task,onUpdate}){

    const[updateTask,setUpdate]=useState("")
    function handleUpdate(e){
        e.preventDefault();
        if(!updateTask.trim()) return;
        onUpdate({...task,task:updateTask});
    }

return(
    <>
    <form onSubmit={handleUpdate}>

<input type="text" value={updateTask} placeholder="update task" onChange={(e)=>setUpdate(e.target.value)} />
<Button variant="edit" type="submit" >save </Button>
    </form>



    </>
)

}

export default UpdateTask;