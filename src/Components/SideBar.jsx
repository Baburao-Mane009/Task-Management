import "./SideBar.css";
function SideBar({activeSection ,onSectionChange}){

   const sections=[{label:"DashBoard"  ,value:"dashboard"},
    {label:"Profile"  ,value:"profile"},
    {label:"Tasks"  ,value:"tasks"},
    {label:"Completed"  ,value:"completed"}
   ]

    return (
 
        <div className="SideBar">
          <ul className="Unorder">
             {
              sections.map((el)=>(
                <li key={el.label} onClick={()=>(onSectionChange(el.value))}  className={
              activeSection === el.value ? "active-section" : ""
            } >{el.label}</li>
              ))
             }

            </ul> 


        </div>
        
        
    )
}
export default SideBar;