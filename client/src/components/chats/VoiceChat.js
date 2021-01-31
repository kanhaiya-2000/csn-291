import React, { useContext,useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { ActivityIcon, CallEndIcon, CallMicIcon, CallMicSlashIcon, CallRestartIcon } from "../../Icons";
import call from "../../assets/call.mp3";
import reconnecting from "../../assets/reconnecting.mp3";
import { connect } from "../../utils/fetchdata";
import { logout } from "../home/Home";
import {CallRoom,setMediaBitrate} from "./VideoChat";

const VoiceChat =()=>{
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
    const [micon,setMicOn] = useState(true);
    const [othermicoff,setMicOff] = useState(false);
    const token = localStorage.getItem('accesstoken');    
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
        window.timeout&&clearTimeout(window.timeout);window.timeout = null;
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
            window.timeout&&clearTimeout(window.timeout);
            window.timeout = null;
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
            i.sdp = setMediaBitrate(i.sdp,"audio",20);                 
            Socket.emit("sdp", { sdp: i, id: Socket.id,target:window.othersocketid});
        })
        }
    }    

      
      useEffect(() => {
        makeSocketConnection();
      })
    const handle = ()=>{
        document.getElementsByClassName('actions2')[0].style.display = 'flex';
        if(window.tt)
         clearTimeout(window.tt);
        window.tt = setTimeout(()=>{
           // fade(document.getElementsByClassName('actions')[0]);
           document.getElementsByClassName('actions2')[0].style.display = 'none';
        },5000);
        
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
        Socket&&Socket.emit("startcall",{video:false,from:JSON.parse(localStorage.getItem('userdetail'))._id,to:uid});
        setShowEnd(true);
        setCallOnProgress(false);
        setStatus("calling...");
        setMicOff(false);
       }
    
    
    useEffect(()=>{        
        if(document.getElementsByTagName('nav')[0]&&document.getElementsByTagName('nav')[0].parentElement!="undefined")
            document.getElementsByTagName('nav')[0].parentElement.style.display="none";                
        
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
            navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,sampleRate:5,noiseSuppression:!0}}).then(function(t){                
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
                Socket&&!window.offertaker&&Socket.emit('startcall',{video:false,from:JSON.parse(localStorage.getItem('userdetail'))._id,to:uid});
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
        });
        
        Socket&&Socket.on('noresponse',function(){
            window.timeout&&clearTimeout(window.timeout);window.timeout = null;
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
               handleCallEnd(false);
               document.body.click();
            }
        });
        Socket&&Socket.on("changesocketid",function(data){
            if(uid==data.uid){
                window.othersocketid = data.newid;
            }
        })
        Socket&&Socket.on('failedcall',function(){
            if(status=="call ended")
                return;
            if(window.callring){
                window.callring.pause();
                window.callring = null;
            }
            setStatus("call failed");
            window.timeout&&clearTimeout(window.timeout);window.timeout = null;
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
            await window.peer.setRemoteDescription(new RTCSessionDescription(e.sdp));
            await window.peer.createAnswer().then(async function (i) {
                await window.peer.setLocalDescription(new RTCSessionDescription(i));
                i.sdp = setMediaBitrate(i.sdp,"audio",20);
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
            await window.peer.setRemoteDescription(new RTCSessionDescription(e.sdp));
        })
        Socket&&Socket.on('callrejected',function(data){           
            if(uid==data){
                if(status=="call ended")
                    return;
                setStatus('call rejected');
                if(window.callring){
                    window.callring.pause();
                    window.callring = null;
                }
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
                Socket.off("changesocketid");
                Socket.off("sdp");
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
            <h2 style={{marginLeft:"10px"}}>Allow Microphone permission </h2>
            <span style={{fontSize:"12px",marginTop:"12px"}}>To deliver your voice,you must grant access to your microphone before starting call</span>
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
         <div className="middle">
            <img src={detail?.avatar} className="avatar"/>
            {callonprogress&&othermicoff&&<div className="mic-icon3" style={{margin:"auto"}}><CallMicSlashIcon/></div>}
            <h3 className="name">{detail?.name}</h3>
            {!callonprogress &&<div className="callstatus">{status}</div>}
        </div>
        
        <div className="footercall">
            <div className="actions2">              
               {showcallendicon&& <div className="btn" onClick={handleMicToggle}>{micon?<CallMicIcon/>:<CallMicSlashIcon/>}</div>}
               {showcallendicon? <div className="btn" onClick={handleCallEnd} style={{background:"#f00"}}><CallEndIcon/></div>:<div className="btn" id="restart" style={{background:"#0f0"}} onClick={handleCallRestart}><CallRestartIcon/></div>}
            </div>
            <div className="self" style={{display:"none"}}>               
             <audio id="self" autoPlay muted></audio>
             <audio id="remote" autoPlay></audio>
            </div>
        </div>

    </div>
    </CallRoom>
  
}

export default VoiceChat;