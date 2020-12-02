import React, { useContext, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Modal from "../posts/Modal";
import modify from "../../hooks/Modify";
import { FeedContext } from "../../context/FeedContext";
import {ThemeContext} from "../../context/ThemeContext";
import { connect, uploadImage } from "../../utils/fetchdata";
import { NewPostIcon } from "../../Icons";
import Button from "../../styles/Button";
import {logout} from "../home/Home";
import { useHistory } from "react-router-dom";
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
    height: 100%;
    width: 100%;
    font-family: "Fira Sans", sans-serif;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    resize: none;
  }
  svg{   
    fill:${(props)=>props.theme.primaryColor};
    
    margin:auto;
  }
  .element {
    padding: 15px;
    align-self: center;
    margin-left: -65px;
    margin-top: 17px;
  }
  .input-group {
    margin-top: 1.5rem;
  }
  input,textarea{
    background: ${(props)=>props.theme.inputBg};
    color:${(props)=>props.theme.primaryColor};
  }
  label{
    transform:scale(2);
    margin-top:10px;
  }
  .modal-content {
    width: 700px;
  }
  .input{
    padding: 0.4rem 1rem;
    font-family: "Fira Sans", sans-serif;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.borderColor};
  }
  .wrapper{
    padding:1rem;
  }
  
  input[type="checkbox"]{
    background:${(props)=>props.theme.inputBg};
    margin-right:15px;
  }
  
  @media screen and (max-width: 780px) {
    .modal-content {
      width: 90vw;
    }
    .taginp{
      width:70% !important;
      max-width:300px !important;
    }
  }
`;

const CreateNew = () => {
  const { feed, setFeed } = useContext(FeedContext);
  const history = useHistory();
  const [privates,setprivates] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [description,setDescription] = useState(false);
  const detail = modify("");
  const tag = modify("");
  const [publicTags,setPublicTags] = useState([]);
  const [privatesTags,setprivatesTags] = useState([]);
  const {theme} = useContext(ThemeContext);
  const [preview, setPreview] = useState("");
  const [postImage, setPostImage] = useState("");

  const addTags = ()=>{
    if((privates&&privatesTags.includes(tag.value))||(!privates&&publicTags.includes(tag.value)))
        return toast.error("Already added to tag list");
    connect(`/user/${tag.value}`,{method:"POST"}).then(()=>{
      tag.setValue("");
      toast.success("Added to tag");
    if(privates)
      setprivatesTags([...privatesTags,tag.value]);
    else
      setPublicTags([...publicTags,tag.value]);
  }).catch(err=>{
    if(err){
      toast.error("this username is not accessible.Check your connection and type correct username")
    }
  })
}
  const handleUploadImage = (e) => {
    if (e.target.files[0]&&e.target.files[0].type.split('/')[0]==='image') {  
      toast.success('uploading your pic...');    
      uploadImage(e.target.files[0]).then((res) => {
        setPreview(true);
        setPostImage(res.secure_url);
      }).catch((err)=>{
        toast.error("error in uploading pic")
      });
    }
    else {
      return toast.error("Kindly upload a pic preferably of format jpeg,jpg ,png or webp");
    }
  };
 const switchTag = ()=>{
  tag.setValue("");
  setprivates(!privates);
 }
 const Nextpart = ()=>{
  if(preview){   
    return  setDescription(true);
  }
  else
   return toast.error("Kindly add a pic")
  }
  const handleSubmitPost = () => {
    if (!detail.value) {
      return toast.error("Please add detail of your complain");
    }
     if(!postImage){
       return toast.error("please Add a pic");

     }
    
    if(privates&&privatesTags.length===0){
      return toast.error("Please add tags of those who should see this complain");
    }
    setShowModal(false);   
    const newPost = {
      caption: detail.value,
      files: [postImage],
      isPrivate:privates,
      tags:privates?privatesTags:publicTags,
      accessibility:privates?privatesTags:[]
    };


    connect(`/complain`, { body: newPost }).then((res) => {
      const post = res.data;
      post.isLiked = false;
      post.isSaved = false;
      post.isMine = true;
      setFeed([post, ...feed]);
      window.scrollTo(0, 0);
      history.push('/');
      toast.success("Your complain has been submitted successfully");
    }).catch(err=>{
      toast.error(err.message);
      err.logout&&logout();
    });
  };

  return (
    <NewPostWrapper>      
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
              <h3 onClick={() =>{history.push('/')}}>Cancel</h3>
              {!description&&<h3 onClick={Nextpart}>Next</h3>}
              {description&&<h3 onClick={handleSubmitPost}>Post</h3>}              
            </div>
            {preview ? (
              <div className="wrapper">              
              <div className="input-group">
              Add details<br/>              
              <textarea
                className="input"
                placeholder="Mandatory field"
                value={detail.value}
                onChange={detail.onChange}
              />
              </div>
              <div className="input-group">
              <input
                type="checkbox"                
                onChange={switchTag}
            />Make your complaint private
            </div>
            {
              privates&&(
                <div className="input-group">
               Add username who should see this
               <br/> <input 
                  type="text"
                  className="input taginp"
                  placeholder="Mandatory field" 
                  value={tag.value} 
                  onChange={tag.onChange}/>
                  <Button className="btn" onClick={addTags}>Add</Button>
                </div>
              )
            }{
              !privates&&(
                <div className="input-group">
                  Tag people
                  <br/> <input 
                  type="text"
                  className="input taginp"
                  placeholder="optional field" 
                  value={tag.value} 
                  onChange={tag.onChange}/>
                  <Button className="btn" onClick={addTags}>Add</Button>
                </div>               
              )
            }          
              </div>
            ):(
                <div style={{padding:"10px",width:"100%",display:"flex",marginLeft:"20px",marginTop:"20px",justifyContent:"center",paddingTop:"15px"}}>
                <label htmlFor="upload-post">
                  <NewPostIcon theme={theme}/>
               </label>
               <div className="element">
               Add photo
               </div>
               </div>
              )
            }
            <div>
              
            </div>
          </div>
        </Modal>
      )}
    </NewPostWrapper>
  );
};

export default CreateNew;