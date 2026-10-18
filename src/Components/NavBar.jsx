import "./NavBar.css";

function NavBar({ user, loadingUser, onLogOut }) {
  return (
    <div className="navBar">
      <h1>Task Management</h1>

      <div className="nav-user">
        {loadingUser ? (
          <span>Loading profile...</span>
        ) : (
          <>
            <img
              src={user?.profilePic || "/default-avatar.png"}
              alt="Profile"
              className="nav-profile-image"
            />

            <span>{user?.name || "User"}</span>
          </>
        )}

        <button onClick={onLogOut}>Logout</button>
      </div>
    </div>
  );
}

export default NavBar;