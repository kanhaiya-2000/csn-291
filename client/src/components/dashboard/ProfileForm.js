import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import Button from "../../styles/Button";
import Avatar from "../../styles/Avatar";
import modify from "../../hooks/Modify";
import { UserContext } from "../../context/UserContext";
import { uploadImage,connect} from "../../utils/fetchdata";
import imageCompression from 'browser-image-compression';

export const Wrapper = styled.div`
  padding: 1rem;
  img {
    cursor: pointer;
    margin-right: 40px;
  }
  .input-group {
    margin-top: 1.5rem;
  }
  .input-group > label {
    display: inline-block;
    width: 100px;
  }
  input,
  textarea {
    padding: 0.4rem 1rem;
    font-family: "Fira Sans", sans-serif;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.borderColor};
    width: 350px;
  }
  .textarea-group {
    display: flex;
  }
  .change-avatar {
    display: flex;
  }
  input[id="change-avatar"],
  input[id="change-avatar-link"] {
    display: none;
  }
  span {
    color: ${(props) => props.theme.blue};
    cursor: pointer;
  }
  button {
    margin-top: 1.5rem;
    margin-left: 6.25rem;
    margin-bottom: 1rem;
  }
  @media screen and (max-width: 550px) {
    width: 98%;
    .input-group {
      display: flex;
      flex-direction: column;
    }
    label {
      padding-bottom: 0.5rem;
      font-size: 1rem;
    }
    button {
      margin-left: 0;
    }
  }
  @media screen and (max-width: 430px) {
    input,
    textarea {
      width: 99%;
    }
  }
`;

const ProfileForm = () => {
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);
  const [newAvatar, setNewAvatar] = useState("");

  const fullname = modify(user.fullname||"");
  const username = modify(user.username||"");
  const bio = modify(user.bio||"");
  const website = modify(user.website||"");
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
  const handleImageUpload = (e) => {
    if (e.target.files[0]&&e.target.files[0].type.split('/')[0]==='image') {
      imageCompression(e.target.files[0],options).then((cf)=>uploadImage(cf)).then((res) =>
        setNewAvatar(res.secure_url)
      ).catch((err)=>{
        return toast.error(err.message);
      });
    }
  };

  const handleEditProfile = (e) => {
    e.preventDefault();

    if (!fullname.value) {
      return toast.error("The name field should not be empty");
    }

    if (!username.value) {
      return toast.error("The username field should not be empty");
    }

    const body = {
      fullname: fullname.value,
      username: username.value,
      bio: bio.value,
      website: website.value,
      avatar: newAvatar || user.avatar,
    };

    connect("/user", { method: "PUT", body })
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("userdetail", JSON.stringify(res.data));
        history.push(`/${body.username || user.username}`);
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <Wrapper>
      <form onSubmit={handleEditProfile}>
        <div className="input-group change-avatar">
          <div>
            <label htmlFor="change-avatar">
              <Avatar
                lg
                src={newAvatar ? newAvatar : user.avatar}
                alt="avatar"
              />
            </label>
            <input
              id="change-avatar"
              accept="image/*"
              type="file"
              onChange={handleImageUpload}
            />
          </div>
          <div className="change-avatar-meta">
            <h2>{user.username}</h2>
            <label htmlFor="change-avatar-link">
              <span>Change Profile Photo</span>
            </label>
            <input
              id="change-avatar-link"
              accept="image/*"
              type="file"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="bold">Name</label>
          <input
            type="text"
            value={fullname.value}
            onChange={fullname.onChange}
          />
        </div>

        <div className="input-group">
          <label className="bold">Username</label>
          <input
            type="text"
            value={username.value}
            onChange={username.onChange}
          />
        </div>
        
        <div className="input-group">
          <label className="bold">Website</label>
          <input
            type="text"
            value={website.value}
            onChange={website.onChange}
          />
        </div>

        <div className="input-group textarea-group">
          <label className="bold">Bio</label>
          <textarea
            cols="10"
            value={bio.value}
            onChange={bio.onChange}
          ></textarea>
        </div>

        <Button>Submit</Button>
      </form>
    </Wrapper>
  );
};

export default ProfileForm;