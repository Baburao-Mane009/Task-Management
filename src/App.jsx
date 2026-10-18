

import { useEffect, useState } from "react";
import NavBar from "./Components/NavBar";
import TaskCard from "./Components/TaskCard";
import SideBar from "./Components/SideBar";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import apiRequest from "./Api.js";
import "./App.css";

function App() {
  const [isLogdin, setIsLogdin] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (!isLogdin) {
      setUser(null);
      return;
    }

    let cancelled = false;

    async function fetchUser() {
      setLoadingUser(true);

      try {
        const response = await apiRequest("/me");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user");
        }

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load user:", error.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [isLogdin]);


   function handleProfileUpdate(updatedUser){
    setUser(updatedUser);
   }

  function handleLogOut() {
    localStorage.removeItem("token");
    setUser(null);
    setIsLogdin(false);
  }

  function handleLoginSuccess() {
    setIsLogdin(true);
  }

  return (
    <>
      {isLogdin ? (
        <>
          <NavBar
            user={user}
            loadingUser={loadingUser}
            onLogOut={handleLogOut}
          />

          <div className="main-content">
            <SideBar />

            <div>
              {user && (
                <section className="profile-section">
                  <img
                    src={
                      user.profilePic ||
                      "/default-avatar.png"
                    }
                    alt="Profile"
                    className="profile-image"
                  />

                  <label htmlFor="profile-upload" className="change-profile-btn" >update profile photo </label>
                  <input  id="profile-upload" type="file" accept="images/*" hidden ></input>
                  
                       <button >updateProfilr pic </button>
                  <div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                  </div>
                </section>
              )}

              <TaskCard />
            </div>
          </div>
        </>
      ) : (
        <>
          <SignUp />
          <Login onLoginSucess={handleLoginSuccess} />
        </>
      )}
    </>
  );
}

export default App;