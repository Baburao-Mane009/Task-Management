import Button from "./Button";
import {useState} from "react";



function AddTask({onAdd}){


    const[ task ,setAddList]=useState("");

    function handleAdd(e){
        e.preventDefault();
        if(!task.trim()) return;
        onAdd(task);
        setAddList("");
    }
    return(
        <div>
   <form onSubmit={handleAdd}>
  
    <input type="text" value={task} onChange={(e)=>setAddList(e.target.value)} placeholder="enter text"  />

    <Button type="submit"> submit </Button>
   </form>

        </div>
    )
}
export default AddTask;