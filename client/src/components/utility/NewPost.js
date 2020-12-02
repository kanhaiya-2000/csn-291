import React, { useContext, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Modal from "../posts/Modal";
import Modify from "../../hooks/Modify";
import { FeedContext } from "../../context/FeedContext";
import { connect, uploadImage } from "../../utils/fetchdata";
import { NewPostIcon } from "../../Icons";
import {logout} from "../home/Home";

const NewPostWrapper = styled.div`
  .newpost-header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }
  .newpost-header h3:first-child {
    color: ${(props) => props.theme.red};
  }
  h3 {
    cursor: pointer;
  }
  .newpost-header h3:last-child {
    color: ${(props) => props.theme.blue};
  }
  textarea {
    height:50px !important;
    width:100%;
		position:absolute;
		bottom:0px;
    font-family: "Fira Sans", sans-serif;
    font-size: 1rem;
    padding: 0.5rem 1rem;    
    resize: none;
  }
  .modal-content {
    width: 700px;
  }
  @media screen and (max-width: 780px) {
    .modal-content {
      width: 90vw;
    }
  }
`;

const NewPost = (props) => {
  const { feed, setFeed } = useContext(FeedContext);
  const [showModal, setShowModal] = useState(false);
  const caption = Modify("");
  const [preview, setPreview] = useState("");
  const [postImage, setPostImage] = useState("");

  const handleUploadImage = (e) => {
    if (e.target.files[0]&&e.target.files[0].type.split('/')[0]==='image') {      
        setPreview(URL.createObjectURL(e.target.files[0]));
        setShowModal(true);     

      uploadImage(e.target.files[0]).then((res) => {
        setPostImage(res.secure_url);
      });
    }
    else{
      return toast.error('Please upload a valid image file');
    }
  };

  const handleSubmitPost = () => {
    if (!caption.value) {
      return toast.error("Please write something");
    }

    setShowModal(false);

    const tags = caption.value
      .split(" ")
      .filter((caption) => caption.startsWith("#"));

    const cleanedCaption = caption.value
      .split(" ")
      .filter((caption) => !caption.startsWith("#"))
      .join(" ");

    caption.setValue("");

    const newPost = {
      caption: cleanedCaption,
      files: [postImage],
      isPrivate:false,
      tags,
    };

    connect(`/complain`, { body: newPost }).then((res) => {
      const post = res.data;
      post.isLiked = false;
      post.isSaved = false;
      post.isMine = true;
      setFeed([post, ...feed]);
      window.scrollTo(0, 0);
      toast.success("Your post has been submitted successfully");
    }).catch(err=>{
      err.logout&&logout();
    });
  };

  return (
    <NewPostWrapper>
      <label htmlFor="upload-post">
        <NewPostIcon fill={props.theme.primaryColor}/>
      </label>
      <input
        id="upload-post"
        type="file"
        onChange={handleUploadImage}
        accept="image/*"
        style={{ display: "none" }}
      />
      {showModal && (
        <Modal>
          <div className="modal-content">
            <div className="newpost-header">
              <h3 onClick={() => setShowModal(false)}>Cancel</h3>
              <h3 onClick={handleSubmitPost}>Post</h3>
            </div>
            {preview && (
              <img className="post-preview" src={preview} alt="preview" />
            )}
            <div style={{position:"sticky",bottom:"0px"}}>
              <textarea
                placeholder="Add caption"
                value={caption.value}
                onChange={caption.onChange}
              />
            </div>
          </div>
        </Modal>
      )}
    </NewPostWrapper>
  );
};

export default NewPost;