import { useState } from "react";
function Login({onLoginSucess}) {
    const [form, setForm] = useState({
        email: "",
        password: ""
    })

    const [loading, setLoading] = useState(false);
    const [message,setMessage]=useState("");

     function handleChange(e){
        const{name,value}=e.target;
        

        setForm(prev=>({
            ...prev,
            [name]:value
        }))

     }
           async function handleSubmit(e){
                e.preventDefault();
                setLoading(true);
                 setMessage("login started");
                try{
                        const response= await fetch("http://localhost:5000/login",{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(form)
                })
               console.log(response.status);
               console.log(response.ok);
               
                const data= await response.json();
                console.log(data);

                if(response.ok){
                   setMessage("login sucessful");
                   console.log("execution is started ")
                   localStorage.setItem("token",data.token);
                   onLoginSucess();

                   setForm({
                    email:"",
                    password:""
                   })
                }else{
                    setMessage(data.message || "failed to logging")
                }
                }catch(err){
                    setMessage(err.message ||"netWork issue" );
                }
                  finally{
                    setLoading(false);
                  }
            }
console.log("Current message:", message);
    return (<>

        <form   onSubmit={handleSubmit}>

          <label htmlFor="email" >email</label>
          <input type="email" value={form.email} name="email" id="email" placeholder="Enter your Email" required onChange={handleChange} />

           <label htmlFor="password" >password</label>
          <input type="password" name="password" value={form.password} id="password" placeholder="Enter your password" onChange={handleChange} required />

              <button  type="submit" disabled={loading}> {loading ? "logging" :" login"} </button>
        </form>

           <h1>{message}</h1>

    </>)
}

export default Login;