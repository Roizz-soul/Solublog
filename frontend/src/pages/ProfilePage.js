// src/pages/ProfilePage.js
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const ProfilePage = () => {
  const { user, userToken } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    user_name: user?.user_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profile_picture: user?.profile_picture || "",
    occupation: user?.occupation || "",
    interests: user?.interests || "",
    skills: user?.skills || "",
    social_links: user?.social_links || "",
    portfolio: user?.portfolio || "",
  });

  // Load user data from server
  const fetchUserData = async () => {
    try {
      const response = await api.get("/users/me", {
        headers: { "X-Token": userToken },
      });
      setProfileData(response.data);
    } catch (error) {
      setError("fect first user error");
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    if (value.trim !== "") {
      profileData[name] = value;
    }
    //setProfileData({ ...profileData, [name]: value });
    console.log(profileData);
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    profileData[name] = e.target.files[0];
    console.log(profileData);
    //setProfileData({ ...profileData, profile_picture: e.target.files[0] });
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    Object.keys(profileData).forEach((key) => {
      formData.append(key, profileData[key] === null ? "" : profileData[key]);
    });
    //const data = Object.fromEntries(formData.entries());
    //console.log(data);

    try {
      const response = await api.post(
        `/users/me/${user._id}`,
        formData,
        //Object.fromEntries(formData.entries()),
        {
          headers: {
            "X-Token": userToken,
            //data: formData,
            //"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          },
          data: formData,
        }
      );
      console.log("here");
      setSuccess(response.data.message);
      setIsEditing(false);
      // useEffect(() => {
      //   fetchUserData();
      // }, []); // Reload profile data to reflect changes
    } catch (error) {
      setError(error);
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src={`http://172.29.247.203:5000/${profileData.profile_picture}`}
          alt="Profile"
        />
        <h1>{profileData.full_name}</h1>
        <p>{profileData.bio}</p>
      </div>

      {error ? (
        <p className="error">{error}</p>
      ) : (
        <p className="error">{success}</p>
      )}
      <div className="profile-content">
        {isEditing ? (
          <form>
            <div className="profile-section">
              <label>Full Name:</label>
              <input type="text" name="full_name" onChange={handleChange} />
            </div>
            <div className="profile-section">
              <label>Username:</label>
              <input
                type="text"
                name="user_name"
                placeholder={profileData.user_name}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Bio:</label>
              <textarea
                name="bio"
                placeholder={profileData.bio}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Profile Picture:</label>
              <input
                type="file"
                name="profile_picture"
                onChange={handleFileChange}
              />
            </div>
            <div className="profile-section">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                placeholder={profileData.location}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Occupation:</label>
              <input
                type="text"
                name="occupation"
                placeholder={profileData.occupation}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Interests:</label>
              <input
                type="text"
                name="interests"
                placeholder={profileData.interests}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Skills:</label>
              <input
                type="text"
                name="skills"
                placeholder={profileData.skills}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Social Links:</label>
              <input
                type="text"
                name="social_links"
                placeholder={profileData.social_links}
                onChange={handleChange}
              />
            </div>
            <div className="profile-section">
              <label>Portfolio:</label>
              <input
                type="text"
                name="portfolio"
                placeholder={profileData.portfolio}
                onChange={handleChange}
              />
            </div>
            <button
              type="button"
              className="save-changes-button"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <div className="profile-section">
              <h2>About Me</h2>
              <p>{profileData?.bio || ""}</p>
            </div>
            <div className="profile-section">
              <h2>Location</h2>
              <p>{profileData.location}</p>
            </div>
            <div className="profile-section">
              <h2>Occupation</h2>
              <p>{profileData.occupation}</p>
            </div>
            <div className="profile-section">
              <h2>Interests</h2>
              <p>{profileData.interests}</p>
            </div>
            <div className="profile-section">
              <h2>Skills</h2>
              <p>{profileData.skills}</p>
            </div>
            <div className="profile-section">
              <h2>Social Links</h2>
              <p>{profileData.social_links}</p>
            </div>
            <div className="profile-section">
              <h2>Portfolio</h2>
              <p>{profileData.portfolio}</p>
            </div>
            <button
              className="edit-profile-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
