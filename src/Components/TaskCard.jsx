import { useEffect, useState } from "react";
import "./TaskCard.css";

import TaskItem from "./TaskItem.jsx";
import AddTask from "./AddTask.jsx";
import Button from "./Button.jsx";
import UpdateTask from "./UpdateTask.jsx";
import apiRequest from "../Api.js";

function TaskCard() {
     const [loading, setLoading] = useState(false);
     const [taskList, setTaskList] = useState([]);
     const [filter, setFilter] = useState("all");
     const [editing, setEditing] = useState(null);
     const [error, setError] = useState("");
     const [search, setSearch] = useState("");
     const [debounce, setDebounce] = useState("");
     const [page, setPage] = useState(1);
     const [limit] = useState(5);
     const [totalPage, setTotalPage] = useState(1);
     const [priority,setPriority]=useState("all");

     async function fetchList() {
          setLoading(true);
          setError("");
          try {

               // const response = await fetch("http://localhost:5000/tasks", {
               //      method: "GET",
               //      headers: {
               //           "Content-Type": "application/json",
               //           "Authorization": `Bearer ${token}`
               //      }
               // })


               const params = new URLSearchParams();
               if (debounce.trim()) {
                    params.set("search", debounce.trim());
               }

               if (filter !== "all") {
                    params.set("status", filter);
               }
               if(priority!=="all"){
                    params.set("minPriority",priority);
               }
               params.set("page", page);
               params.set("limit", limit);
               const queryString = params.toString();


               const response = await apiRequest(queryString ? `/tasks?${queryString}` : "/tasks");




               const result = await response.json();

               if (response.ok) {
                    setTaskList(
                         result.data
                    )

                    setTotalPage(result.pagination.totalPages);
                    // setError(" fetched sucessfully");
               } else {

                    setError(result.message || "failed to fetch");


               }

          } catch (err) {
               setError(err.message ||
                    "request is afiled"
               )
          }
          finally {
               setLoading(false);
          }
     }







     // Effect 1: debounce search input
     useEffect(() => {
          const timer = setTimeout(() => {
               setDebounce(search);
          }, 500);

          return () => clearTimeout(timer);
     }, [search]);

     // Effect 2: fetch when debounce or page changes
     useEffect(() => {
          // Reset page only when search changes, not when page changes
          setPage(1);
     }, [debounce]);

     useEffect(() => {
          fetchList();
     }, [debounce, page,filter,priority]);


     async function addTask(task) {



          setError("");
          try {
               // const response = await fetch("http://localhost:5000/tasks", {
               //      method: "POST",
               //      headers: {
               //           "Content-Type": "application/json",
               //           "Authorization": `Bearer ${token}`
               //      },
               //      body: JSON.stringify({

               //           task,
               //           status: "pending",
               //           priority: 3
               //      })
               // });

               const response = await apiRequest("/tasks",
                    "POST",
                    {

                         task,
                         status: "pending",
                         priority: 3
                    })
               const data = await response.json();

               if (response.ok) {
                    // setTaskList(prev => ([
                    //      ...prev,
                    //      data
                    // ]))
                    await fetchList();
                    //     setError("added sucessfully");
               } else {


                    setError(data.message);



               }
          } catch (error) {
               setError(error.message);
          }
     }


     async function handleDelete(id) {
          setError("");

          try {
               const response = await apiRequest(
                    `/tasks/${id}`,
                    "DELETE"
               );

               if (response.ok) {
                    if (taskList.length === 1 && page > 1) {
                         setPage(prev => prev - 1);
                    } else {
                         await fetchList();
                    }
               } else {
                    setError("Failed to delete task");
               }
          } catch (err) {
               setError(err.message);
          }
     }
     async function handleComplete(_id) {

          setError("");
         
          const currStatus = taskList.find(task => task._id === _id);
          if (!currStatus) return;
          const newStatus = currStatus.status === "complete" ? "pending" : "complete";

          try {
               // const response = await fetch(`http://localhost:5000/tasks/${_id}`, {
               //      method: "PATCH",
               //      headers: {
               //           "Content-Type": "application/json",
               //           "Authorization": `Bearer ${token}`
               //      },
               //      body: JSON.stringify(
               //           { status: newStatus }

               //      )
               // });

               const response = await apiRequest(`/tasks/${_id}`,
                    "PATCH",
                    { status: newStatus }
               )

               const data = await response.json();
               if (response.ok) {
                    // setTaskList(
                    //      prevTask => prevTask.map(task =>
                    //           task._id === _id ? { ...task, status: newStatus } : task
                    //      )
                    // )
                     await fetchList();
                    //  setError("succesful update");
               } else {


                    setError(data.message);


               }

          } catch (error) {
               setError(error.message);
          }


     }

     async function handleUpdate(updatetask) {


          setError("");

          try {
               // const response = await fetch(`http://localhost:5000/tasks/${updatetask._id}`, {
               //      method: "PATCH",
               //      headers: {
               //           "Content-Type": "application/json",
               //           "Authorization": `Bearer ${token}`

               //      },
               //      body: JSON.stringify(updatetask)
               // })

               const response = await apiRequest(`/tasks/${updatetask._id}`,
                    "PATCH",
                    { task: updatetask.task }
               )

               const data = await response.json();
               if (response.ok) {
                    setTaskList(prevTask => prevTask.map((el) => el._id === data._id ? data : el))
                    // setError("succesful updation");
                    setEditing(null);
               } else {

                    setError(data.message);


               }

          } catch (err) {
               setError(err.message);
          }

     }

     const taskFilter = taskList;

     function handleEdit(task) {
          setEditing(task);
     }


     return (

          <>

               <div className="search">
                    <input value={search} placeholder="Enter to saerch" type="text" onChange={(e) => setSearch(e.target.value)} />
               </div>
               <div className="priority-range">
                    <label htmlFor="priority" >minPriority</label>
                <select id="priority" value={priority} onChange={(e)=>{
                    setPriority(e.target.value);
                    setPage(1);
                }} >

  <option value="all">priorty all</option>
                <option value="1">priorty 1</option>
                <option value="2">priorty 2</option>
                <option value="3">priorty 3</option>
                <option value="4">priorty 4</option>
                <option value="5">priorty 5</option>

                </select>
                
                 
              

               </div>

               <div className="TaskCard">
                    {loading ? (
                         <p>Loading tasks...</p>
                    ) : error ? (
                         <p>{error}</p>
                    ) : taskFilter.length === 0 ? (
                         <p>No tasks found.</p>
                    ) : (
                         taskFilter.map((el) =>
                              editing?._id === el._id ? (
                                   <UpdateTask
                                        task={el}
                                        key={el._id}
                                        onUpdate={handleUpdate}
                                   />
                              ) : (
                                   <TaskItem
                                        task={el}
                                        onDelete={handleDelete}
                                        onComplete={handleComplete}
                                        onUpdate={handleEdit}
                                        key={el._id}
                                   />
                              )
                         )
                    )}
               </div>
               <div className="paging" >

                    <button onClick={() => setPage(prev => prev - 1)} disabled={page === 1} >previous</button>
                    <span> page {page} of {totalPage} </span>

                    <button disabled={page >= totalPage} onClick={() => setPage(prev => prev + 1)}>next</button>

               </div>
               <AddTask onAdd={addTask} />


               <Button variant={filter === "all" ? "active" : "all"}
                    onClick={() => {
                         setFilter("all");
                         setPage(1);
                    }

                    }
               >All</Button>
               <Button variant={filter === "pending" ? "active" : "pending"} onClick={() => {
                    setFilter("pending");
                    setPage(1);
               }} >pending</Button>
               <Button variant={filter === "complete" ? "active" : "complete"} onClick={() => { setFilter("complete"); setPage(1); }} >complete</Button>
          </>
     )


}
export default TaskCard;