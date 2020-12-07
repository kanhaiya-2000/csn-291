import React,{Suspense} from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// main route
import Nav from "./components/utility/Nav";
import Container from "./styles/Container";
import Home from "./components/home/Home";
import Dashboard from "./components/dashboard/Dashboard";
import Highlight from "./components/posts/Highlight";
import Notification from "./components/notice/Notification";
import Loader from "./components/utility/Loader";
import Post from "./components/posts/Post";
import EditProfile from "./components/dashboard/EditProfile";
import CreateNew from './components/new/CreateNew';
//import io from "socket.io-client";
import ReportPost from "./components/posts/ReportPost";
import Homechat from "./components/chats/Homechat";
import Mainchat from "./components/chats/Mainchat";
import NewChat from "./components/chats/NewChat";

const Routing = () => {
  
  return (
    <Router>
      <Suspense fallback={Loader}>
      <Nav />
      <Container>
        <Switch>
        <Route 
            path="/chat/inbox" 
            component={(props)=><Homechat {...props} key={window.location.pathname}/>}/>
          <Route
            path="/chat/t/:roomid" 
            component={(props)=><Mainchat {...props} key={window.location.pathname}/>}/>
            <Route path="/chat/new" component={NewChat} />
          <Route path="/highlight" component={Highlight} />
          <Route path="/accounts/new" component={CreateNew} />
          <Route path="/accounts/notifications" component={Notification} />
          <Route path="/p/:postId" component={Post} />
          <Route path="/report/:postId" component={ReportPost}/>
          <Route path="/accounts/edit" component={EditProfile} />          
          <Route path="/:username" component={Dashboard} />
          <Route path="/" component={Home} />
          
        </Switch>
      </Container>
      </Suspense>
    </Router>
  );
};

export default Routing;