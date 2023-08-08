//setting up PC1
const pc1 = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});

pc1.onicecandidate = ({candidate}) => {
  console.log("ice candidate")
  console.log(JSON.stringify(candidate))
  console.log(" NEW ice candidate!! on localconnectio1 reprinting SDP ");
  console.log(JSON.stringify(pc1.localDescription));
};

const sendChannel = pc1.createDataChannel("sendChannel");
sendChannel.onmessage = (e) =>
  console.log("messsage received on pc1 !!!" + e.data);
sendChannel.onopen = (e) => console.log("open data channel pc 1!!!!");
sendChannel.onclose = (e) => console.log("closed data channel pc 1!!!!!!");

document
  .getElementById("startCamera1")
  .addEventListener("click", async (ev) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    document.getElementById("video1").srcObject = stream;

    // for (const track of stream.getTracks()) {
    //   pc1.addTrack(track);
    // }
    pc1.addStream(stream)

    const d = await pc1.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true, // Include video stream in the offer
    });
    await pc1.setLocalDescription(d);
  
  });

pc1.ontrack = (ev) => {
  console.log("getting stream in pc1 and setting in video 2");
  if (ev.streams && ev.streams[0]) {
    document.getElementById("video2").srcObject = ev.streams[0];
  } else {
    let inboundStream = new MediaStream(ev.track);
    document.getElementById("video2").srcObject = inboundStream;
  }
};

document
  .getElementById("setRemoteDescription1")
  .addEventListener("click", async (ev) => {
    const remoteDescElement = document.getElementById("remoteDescription1");
    const text = remoteDescElement.value;
    const sdp = JSON.parse(text);

    remoteDescElement.value = null; //reset html
    await pc1.setRemoteDescription(sdp);
    console.log("remote set in first");
  });

document.getElementById("setMessage1").addEventListener("click", (ev) => {
  const sendMessageElement = document.getElementById("sendMessage1");
  const text = sendMessageElement.value;
  sendMessageElement.value = null; //reset html

  //SEND MESSAGE To other console
  sendChannel.send(text);
});

//--------------------------------------------------------------------

// setting up PC2
const pc2 = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});

pc2.onicecandidate = ({candidate}) => {
  console.log("ice candidate")
  console.log(JSON.stringify(candidate))
  console.log(" NEW ice candidate!! on localconnection 2 reprinting SDP ");
  console.log(JSON.stringify(pc2.localDescription));
};

pc2.ondatachannel = (e) => {
  const receiveChannel = e.channel;
  receiveChannel.onmessage = (e) =>
    console.log("messsage received on pc2!!!" + e.data);
  receiveChannel.onopen = (e) => console.log("open on pcc2!!!!");
  receiveChannel.onclose = (e) => console.log("closed! on pc2 !!!!!");
  pc2.channel = receiveChannel;
};

document
  .getElementById("setRemoteDescription2")
  .addEventListener("click", async (ev) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    document.getElementById("video2").srcObject = stream;
    // for (const track of stream.getTracks()) {
    //   pc2.addTrack(track);
    // }
    pc2.addStream(stream)

    const remoteDescElement = document.getElementById("remoteDescription2");
    const text = remoteDescElement.value;
    const sdp = JSON.parse(text);

    remoteDescElement.value = null; //reset html

    await pc2.setRemoteDescription(sdp);
    
    const d = await pc2.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true, // Include video stream in the offer
    });
    await pc2.setLocalDescription(d);
    
  });

pc2.ontrack = (ev) => {
  console.log("getting stream in pc2 and setting in video 1");
  if (ev.streams && ev.streams[0]) {
    document.getElementById("video1").srcObject = ev.streams[0];
  } else {
    let inboundStream = new MediaStream(ev.track);
    document.getElementById("video1").srcObject = inboundStream;
  }
};

document.getElementById("setMessage2").addEventListener("click", (ev) => {
  const sendMessageElement = document.getElementById("sendMessage2");
  const text = sendMessageElement.value;
  sendMessageElement.value = null; //reset html

  //SEND MESSAGE To other console
  pc2.channel.send(text);
});
