import React, { useContext,useState,useEffect } from "react";
import styled from "styled-components";
import {useParams } from "react-router-dom";
import call from "../../assets/call.mp3";
import reconnecting from "../../assets/reconnecting.mp3";
import { SocketContext } from "../../context/SocketContext";
import { ActivityIcon, CallEndIcon, CallMicIcon, CallMicSlashIcon, CallRestartIcon,CallVideoIcon, CallVideoSlashIcon, ScreenShare, StopScreenShare } from "../../Icons";
import { connect } from "../../utils/fetchdata";
import { logout } from "../home/Home";

export const setMediaBitrate = (sdp,media,bitrate)=>{
    var lines = sdp.split("\n");
    var line = -1;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("m=" + media) === 0) {
            line = i;
            break;
        }
    }
    if (line === -1) {
        return sdp;
    }
    line++;
    // Skip i and c lines
    while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
        line++;
    }

    // If we're on a b line, replace it
    if (lines[line].indexOf("b") === 0) {
        lines[line] = "b=AS:" + bitrate;         
        return lines.join("\n");
    }

    // Add a new b line
    console.log("Adding new b line before line", line);
    var newLines = lines.slice(0, line);
    newLines.push("b=AS:" + bitrate);    
    newLines = newLines.concat(lines.slice(line, lines.length));
    return newLines.join("\n");
}
export const CallRoom = styled.div`
width:100%;
height:100%;
position:absolute;
left:0px;
top:0px;
right:0px;
bottom:0px;

nav{
    display:none !important;
}

.footercall{
    width:100%;
    position:fixed;
    bottom:0;
}
#self{
    height:120px;
    width:120px;
    bject-fit:cover;
    float:right;
    transform:scale(-1,1);
}
.actions{
	position: fixed;
	bottom: 16px;
	display: flex;
	flex-wrap: nowrap;
	width: 280px;
    left: calc(50% - 140px);
    z-index:5;
}
.actions2{
	position: fixed;
	bottom: 16px;
	display: flex;
	flex-wrap: nowrap;
    width: 180px;
    justify-content:space-around;
    left: calc(50% - 90px);
    z-index:5;
}
.enlarge{    
        transform: scale(1.3);
        position: relative;
        top: 10px;
        left: 10px;
    
}
.avatar{
    margin-left:10px;
    margin-bottom:20px;
    object-fit:cover;
    width:96px;
    height:96px;
    border-radius:100%;
}
*{
    color:white;
}
.callroom{
    width:100%;
    height:100%;
    padding-top:140px;
    background:black;
}
.callstatus{
    font-size:13px;
}
h3,h2{
    font-weight:bold;
}
.remote-video{
    width:100%;
    height:100%;
}
.btn {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: gray;	
	margin: 10px;
}
    
.info{
    padding-top:100px !important;
}
#remote{
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
}
.mic-icon3 svg{    
    transform: scale(0.8);
    width: 48px;
    height: 48px;
    fill: #fff;
    position: relative;    
    z-index: 5;
    top:-90px;
    background:black;
    border-radius:50%;
    left:5px;
   
}
.mic-icon svg{    
    transform: scale(0.8);
    width: 48px;
    height: 48px;
    fill: #fff;
    position: fixed;
    right: 70px;
    z-index: 5;
    bottom: 30px;
}
.mic-icon2 svg{    
    transform: scale(0.8);
    width: 48px;
    height: 48px;
    fill: #fff;
    position: fixed;
    right: 50%;
    z-index: 5;
    bottom: 50%;
}
#restart{
    margin:auto;
    transform:scale(1.2);
}
#restart svg {
	position: relative;
	top: 14px;
	left: 14px;
	transform: scale(1.2);
	fill: white;
}
.middle{
    display:flex !important;
    justify-content:center !important;   
    align-items:center !important;
    flex-direction:column;
    margin-top:50px;
}
`;

const VideoChat = () => {
    const { uid } = useParams();
    const [status, setStatus] = useState("calling...");    
    const [loading,setLoading] = useState(true);
    const [err,setErr] = useState(""); 
    const configuration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "turn:numb.viagenie.ca", credential: "muazkh", username: "webrtc@live.com" },
            { urls: "turn:numb.viagenie.ca", credential: "1234567890", username: "leapkk58@gmail.com" },
        ],
    };   
    const { Socket, setSocket } = useContext(SocketContext);  
    const [detail,setDetail] = useState('');
    const [showcallendicon,setShowEnd] = useState(true);
    const [videoon,setVideoOn] = useState(true);
    const [micon,setMicOn] = useState(true);
    const [othermicoff,setMicOff] = useState(false);
    const token = localStorage.getItem('accesstoken');
    const [screensharing,setScreenSharing] = useState(false);
    const [callonprogress, setCallOnProgress] = useState(false);
    const [callState, setCallState] = useState("TAKE_CAM_PERMISSION");    
    const makeSocketConnection = () => {
        if (token && !Socket) {
          if (Socket.connected)
            return;
          Socket.connect();
          Socket.on("connect", () => {
            setSocket(Socket);
            Socket.emit("changesocketid",{from:JSON.parse(localStorage.getItem('userdetail'))._id,to:uid});            
    
          })
    
          Socket.on('disconnect', () => {
            setSocket(null);
            //toast.error('Socket disconnected');                
            setTimeout(makeSocketConnection, 1000);
          })
        }
      };
      const handleCallEnd = (initiator=true,statust="")=>{
        window.timeout&&clearTimeout(window.timeout);
        window.timeout=null;
        if(window.callring){
            window.callring.pause();
            window.callring = null;
        }       
        if(initiator&&(status=="ringing..."||status=="calling...")){
            Socket&&Socket.emit("callaborted",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id});
            if(statust)
                setStatus(statust);
            else
                setStatus('call ended');
            window.peer.close();
            setShowEnd(false);
            setCallOnProgress(false);
            handle();
            window.close();
            return;
        }
        setStatus('call ended');
        window.peer.close();
        setShowEnd(false);
        setCallOnProgress(false);
        handle();
        Socket&&initiator&&Socket.emit("endcall",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id});
        window.close();
                
    }
      const handleWebRTC = async ()=>{
        window.peer = new window.RTCPeerConnection(configuration);
        window.callstarted = false;
        if(window.offertaker){
            setStatus('connecting...');
        }       
        
        if(window.peer){
        window.peer.onicecandidate = (i) => {            
            Socket&&i.candidate&&Socket.emit("candidate", { id: Socket.id,target:window.othersocketid, candidate: { sdpMLineIndex: i.candidate.sdpMLineIndex, candidate: i.candidate.candidate }})
        };
        window.peer.oniceconnectionstatechange = ()=>{
            const k = async function(){
                if(window.peer.iceConnectionState=="connected"){
                    if(window.reconnecting){
                        window.reconnecting.pause();
                        window.reconnecting = null;
                    }                   
                    return;
                }
                else{
                    if(window.timecount>6){
                        handleCallEnd(true,"Failed to reconnect");
                        return;
                    }
                    else{
                        setTimeout(k,2000);                        
                    }
                }
                
                if(!window.timecount){
                    window.timecount = 1;
                }
                else{
                    window.timecount++;
                }
                 if(window.peer.iceConnectionState=="failed"||window.peer.iceConnectionState=="disconnected"){
                    console.log("Retry connecting...");
                    
                 if(!window.reconnecting){
                     window.reconnecting = new Audio(reconnecting);
                     window.reconnecting.play();
                     window.reconnecting.loop = true;
                 }
                 await window.peer.createOffer({ iceRestart: true }).then(async function(i){
                     await window.peer.setLocalDescription(new RTCSessionDescription(i)); 
                     i.sdp = setMediaBitrate(i.sdp,"audio",20);            
                     Socket.emit("sdp", { sdp: i, id: Socket.id,target:window.othersocketid});
             })
         }
         
     }
        k();
    }
        window.peer.ontrack = (i)=>{
            console.log("Track received",i);
            window.callstarted = true;
            window.timeout&&clearTimeout(window.timeout);window.timeout=null;
            document.getElementById('remote').srcObject = i.streams[0];
        }
    }
    window.stream.getTracks().forEach(function (i) {
        window.peer.addTrack(i, window.stream);
    })
        if(window.offertaker){
            console.log("offer sent");
            setCallOnProgress(true);
            window.timeout = setTimeout(function(){!window.callstarted&&(handleCallEnd(true,"call failed"))},10000);
           await window.peer.createOffer({ iceRestart: true }).then(async function(i){
            await window.peer.setLocalDescription(new RTCSessionDescription(i)); 
            console.log("sdp",i);
            i.sdp = setMediaBitrate(setMediaBitrate(i.sdp,"video",400),"audio",20);           
            Socket.emit("sdp", { sdp: i, id: Socket.id,target:window.othersocketid});
        })
        }
    }    

      
      useEffect(() => {
        makeSocketConnection();
      })
    const handle = ()=>{
        if(!document.getElementsByClassName('actions')[0]){
            return;
        }
        document.getElementsByClassName('actions')[0].style.display = 'flex';
        if(window.tt)
         clearTimeout(window.tt);
        window.tt = setTimeout(()=>{
           // fade(document.getElementsByClassName('actions')[0]);
           document.getElementsByClassName('actions')[0].style.display = 'none';
        },5000);
        
    }
    const handleScreenShare = async ()=>{        
        if(!screensharing){
            try{
            const i = (await navigator.mediaDevices.getDisplayMedia({video:{cursor:"always"}})).getVideoTracks()[0];
            window.stream.getVideoTracks().forEach(e=>e.stop())
            window.stream.removeTrack(window.stream.getVideoTracks()[0]);
            window.stream.addTrack(i);
            setScreenSharing(!screensharing);
            window.peer.getSenders().find(function (e) {return e.track.kind == i.kind}).replaceTrack(i); 
            }
            catch(e){
                const i = (await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,maxBitrate:70,facingMode:"user",frameRate:14}})).getVideoTracks()[0];
            window.stream.getVideoTracks().forEach(e=>e.stop())
            window.stream.removeTrack(window.stream.getVideoTracks()[0]);
            window.stream.addTrack(i);
            window.peer.getSenders().find(function (e) {return e.track.kind == i.kind}).replaceTrack(i);
            setScreenSharing(screensharing); 
            }         
        }
        else{
            const i = (await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,maxBitrate:70,facingMode:"user",frameRate:14}})).getVideoTracks()[0];
            window.stream.getVideoTracks().forEach(e=>e.stop())
            window.stream.removeTrack(window.stream.getVideoTracks()[0]);
            window.stream.addTrack(i);
            window.peer.getSenders().find(function (e) {return e.track.kind == i.kind}).replaceTrack(i);
            setScreenSharing(!screensharing); 
        }
    }
    
    const handleMicToggle = ()=>{
        setMicOn(!micon);
        Socket&&Socket.emit("micaction",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id,micon:micon});
        window.stream.getAudioTracks().forEach(function(t){
            t.enabled = !micon;
        })
    }
    const handleCallRestart = ()=>{
        handleWebRTC();
        setShowEnd(true);
        setCallOnProgress(false);
        setStatus("calling...");
        setMicOff(false);
        Socket&&Socket.emit("startcall",{video:true,from:JSON.parse(localStorage.getItem('userdetail'))._id,to:uid});      

    }
    const handleVideoToggle = ()=>{
        setVideoOn(!videoon);
        window.stream.getVideoTracks().forEach(function(t){
            t.enabled = !videoon;
        });
    }
    
    useEffect(()=>{
        
        if(document.getElementsByTagName('nav')[0].parentElement)
            document.getElementsByTagName('nav')[0].parentElement.remove();                
        
        connect('/chat/getdetail/'+uid).then((detail)=>{
            setDetail(detail.data);
            setTimeout(()=>{setLoading(false)},2000);
            
        }).catch(err=>{
            err.logout&&logout();
            setCallState("BAD_REQUEST");
            setErr({message:err.message,header:"Unexpected error"});
            setLoading(false);            
        })
        window.addEventListener('click',handle);
        window.addEventListener('touchstart',handle);
        window.addEventListener("beforeunload",handleCallEnd);
       // window.addEventListener('mousemove',handle);
       
    },[])
    useEffect(()=>{
        if("mediaDevices" in navigator&&"getUserMedia" in navigator.mediaDevices&&window.RTCPeerConnection){            
            navigator.mediaDevices.getUserMedia({video:{width:640,height:480,maxBitrate:70,facingMode:"user",frameRate:14},audio:{echoCancellation:!0,sampleRate:5,noiseSuppression:!0}}).then(function(t){                
                window.stream = t;
                setCallState("CALLING");
            }).catch(err=>{
                setErr({message:err.message,header:"Unable to access webcam or mic"});
                Socket&&Socket.emit("callaborted",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id});
                setCallState("ACCESS_ERR");
            })
        }
            else{
               setCallState("NOT_SUPPORTED");
            }
    },[])
    useEffect(()=>{
        const te = setInterval(()=>{
            if(document.getElementById('self')){
                clearInterval(te);
                handle();                
                document.getElementById('self').srcObject = window.stream;                
                Socket&&!window.offertaker&&Socket.emit('startcall',{video:true,from:JSON.parse(localStorage.getItem('userdetail'))._id,to:uid});
                if(!window.offertaker)
                    setTimeout(function(){
                        handleWebRTC();
                    },2000) 
                else
                   handleWebRTC();                               
                
            }

        },1000);
    },[])
    useEffect(()=>{
        Socket&&Socket.on('receivedresponse',function(data){
            if(uid==data){
                if(showcallendicon){
                    if(!window.callring){
                    window.callring = new Audio(call);
                    window.callring.play();
                    window.callring.loop = true;
                    }
                    setStatus("ringing...");
                }
            }
        });
        Socket&&Socket.on("micaction",function(data){
            console.log(data);
            if(data.from==uid)
                setMicOff(data.micon);
        })
        Socket&&Socket.on('getcallrequest',function(data){
            return;
        });
        Socket&&Socket.on('err',function(){
            setErr({header:"Unexpected error",message:"Request could not be processed"});
        })
        Socket&&Socket.on("changesocketid",function(data){
            if(uid==data.uid){
                window.othersocketid = data.newid;
            }
        })
        Socket&&Socket.on('noresponse',function(){
            setStatus('No Answer');            
            setShowEnd(false);
            if(window.callring){
                window.callring.pause();
                window.callring = null;
            }
            window.peer&&window.peer.close();
            document.body.click();
        });
        Socket&&Socket.on("endcall",function(data){
            if(data.from==uid){
               handleCallEnd(false,"call ended");
               document.body.click();
            }
        })
        Socket&&Socket.on('failedcall',function(){
            if(status=="call ended")
                return;
            setStatus("call failed");
            if(window.callring){
                window.callring.pause();
                window.callring = null;
            }
            window.timeout&&clearTimeout(window.timeout);window.timeout=null;
            setShowEnd(false);
            window.peer&&window.peer.close();
            document.body.click();
        });
        Socket&&Socket.on("sdp",async function(e){
            if(status=="call ended"){
                Socket&&Socket.emit("callaborted",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id});
                return;
            }
            window.othersocketid = e.id;
            setCallOnProgress(true);
            if(window.callring){
                window.callring.pause();
                window.callring = null;
            }
            console.log("sdp received");
            console.log("remote-sdp",e.sdp); 
            await window.peer.setRemoteDescription(new RTCSessionDescription(e.sdp));
            await window.peer.createAnswer().then(async function (i) {
                await window.peer.setLocalDescription(new RTCSessionDescription(i));
                console.log("answer",i);
                i.sdp = setMediaBitrate(setMediaBitrate(i.sdp,"video",400),"audio",20);              
                Socket.emit("answer", { sdp: i, id: Socket.id,target:window.othersocketid});
            });
        })
        Socket&&Socket.on('candidate',async function(e){
            if(status=="call ended"){
                Socket&&Socket.emit("callaborted",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id});
                return;
            }
            console.log("ice candidate added");            
            window.peer&&(await window.peer.addIceCandidate(new RTCIceCandidate(e.candidate)));
        })
        Socket&&Socket.on('answer',async function (e){
            if(status=="call ended"){
                Socket&&Socket.emit("callaborted",{to:uid,from:JSON.parse(localStorage.getItem("userdetail"))._id});
                return;
            }
            console.log("answer received");
            console.log("remote-ans",e.sdp);
            await window.peer.setRemoteDescription(new RTCSessionDescription(e.sdp));
        })
        Socket&&Socket.on('callrejected',function(data){
            if(uid==data){
                if(status=="call ended")
                    return;
                if(window.callring){
                    window.callring.pause();
                    window.callring = null;
                }
                setStatus('call rejected');
                setShowEnd(false);
                document.body.click();
            }
        })
        return ()=>{
            if(Socket){
                Socket.off("callrejected");
                Socket.off("answer");
                Socket.off("endcall");
                Socket.off("micaction");
                Socket.off("sdp");
                Socket.off("changesocketid");
                Socket.off("failedcall");
                Socket.off("err");
                Socket.off("receivedresponse");
                Socket.off("getcallrequest");
                Socket.off("noresponse");
            }
        }
    },[Socket,status])
    if(loading){
        return <CallRoom><div className="callroom">
            <div className="middle">
                <div><ActivityIcon/></div>
                <div style={{marginLeft:"10px"}}>Loading...</div>
            </div>
        </div>
        </CallRoom>
    }
    if(callState=="TAKE_CAM_PERMISSION"){
        return <CallRoom><div className="callroom">
        <div className="middle info" style={{maxWidth:"400px",padding:"0 10px",margin:"auto",textAlign:"center"}}>            
            <h2 style={{marginLeft:"10px"}}>Allow Microphone and webcam permission </h2>
            <span style={{fontSize:"12px",marginTop:"12px"}}>To deliver your video and audio,you must grant access to webcam and microphone before starting call</span>
        </div>
    </div>
    </CallRoom>
    }
    if(callState=='NOT_SUPPORTED'){
        return <CallRoom><div className="callroom">
        <div className="middle" style={{maxWidth:"400px",padding:"0 10px",margin:"auto",textAlign:"center"}}>            
            <h2 style={{marginLeft:"10px"}}>Your Browser does not support call </h2>
            <span style={{fontSize:"12px",marginTop:"12px"}}>Kindly use browser like chrome,firefox,opera,edge </span>
        </div>
    </div>
    </CallRoom>
    }
    if(err){
        return <CallRoom><div className="callroom">
        <div className="middle info" style={{maxWidth:"400px",padding:"0 10px",margin:"auto",textAlign:"center"}}>            
            <h2 style={{marginLeft:"10px"}}>{err.header} </h2>
            <span style={{fontSize:"12px",marginTop:"12px"}}>{err.message}</span>
        </div>
    </div>
    </CallRoom>
    }
    
    return <CallRoom>
        <div className="callroom">
        {!callonprogress && <div className="middle">
            <img src={detail?.avatar} className="avatar"/>
            <h3 className="name">{detail?.name}</h3>
            <div className="callstatus">{status}</div>
        </div>}
        {callonprogress && <div className="remote-video">
        {(othermicoff)&&(<div className="mic-icon2"><CallMicSlashIcon/></div>)}
            <video id="remote"  autoPlay playsInline></video>
        </div>
        }
        <div className="footercall">
            <div className="actions">
               {showcallendicon&&<div className="btn" onClick={handleScreenShare}>{!screensharing?<ScreenShare/>:<StopScreenShare/>}</div>}
               {showcallendicon&&<div className="btn" onClick={handleVideoToggle}>{videoon?<CallVideoIcon/>:<CallVideoSlashIcon/>}</div>}
               {showcallendicon&& <div className="btn" onClick={handleMicToggle}>{micon?<CallMicIcon/>:<CallMicSlashIcon/>}</div>}
               {showcallendicon? <div className="btn" onClick={handleCallEnd} style={{background:"#f00"}}><CallEndIcon/></div>:<div className="btn" id="restart" style={{background:"#0f0"}} onClick={handleCallRestart}><CallRestartIcon/></div>}
            </div>
            <div className="self">
                {!micon&&<div className="mic-icon" style={{margin:"auto"}}><CallMicSlashIcon/></div>}
             <video id="self" autoPlay muted playsInline style={{transform:`${screensharing?"scale(1,1)":"scale(-1,1)"}`}}></video>
            </div>
        </div>

    </div>
    </CallRoom>
  
}

export default VideoChat;