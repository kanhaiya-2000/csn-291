import React, { useEffect, useState,useContext } from "react";
import { connect } from "../../utils/fetchdata";
import { BookmarkIcon, FilledBookmarkIcon } from "../../Icons";
import {ThemeContext} from "../../context/ThemeContext";
import {logout} from "../home/Home";
import { toast } from "react-toastify";

const SavedComplaints = ({ isSaved, postId }) => {
  const [savedState, setSaved] = useState(isSaved);
  let {theme} = useContext(ThemeContext);
  theme = `${theme.primaryColor}`;
  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleToggleSave = () => {
    if (savedState) {
      setSaved(false);
      try{
      connect(`/complain/${postId}/toggleSave`);
      }
      catch(err){
        err.logout&&logout();
        return toast.error(err.message);
      }
    } else {
      setSaved(true);
      try{
      connect(`/complain/${postId}/toggleSave`);
      }
      catch(err){
        err.logout&&logout();
        return toast.error(err.message);
      }
    }
  };

  if (savedState) {
    return <FilledBookmarkIcon fill={theme} onClick={handleToggleSave} />;
  }

  if (!savedState) {
    return <BookmarkIcon fill={theme} onClick={handleToggleSave} />;
  }
};

export default SavedComplaints;