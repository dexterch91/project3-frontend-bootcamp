import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
  } from "@mediapipe/tasks-vision";
import { Typography } from '@mui/material';

function PoseProcessing() {
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(null);
  const [disabledVideoButton,setDisabledVideoButton] = useState(true);
  const [videoHeight] = useState("360px");
  const [videoWidth] = useState("480px");
  const [canvasCtx, setCanvasCtx] = useState(null);
  const [lastVideoTime, setLastVideoTime] = useState(-1); //initialize lastVideoTime
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);
  // Define the state variable to hold the array of points
  const [points, setPoints] = useState(Array(33).fill({ x: 0, y: 0, z: 0 }));
  const [keyRoi, setKeyRoi] = useState([])

  useEffect(() => {
    async function createPoseLandmarker() {
        console.log("Loading Model")
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      const newPoseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      setPoseLandmarker(newPoseLandmarker);
      setDisabledVideoButton(false); //allow user to click


    }

    createPoseLandmarker();
  }, []);

  //Effect that only executes when the state of the webcam running changes
  useEffect(()=>{
    console.log(`UseEffect: ${webcamRunning}`)
    // Function to run MediaPipe Pose Estimation

    const constraints = {
        video: true
      };

  
    
   function predictWebcam() {
    if (canvasRef.current && videoRef.current) {
      const videoTime = videoRef.current.currentTime; //Reset new videoref time
              
          // Continue with detection after setting options
          if (lastVideoTime !== videoTime) {
            setLastVideoTime(videoTime);
            poseLandmarker.detectForVideo(videoRef.current, performance.now(), (result) => {
              const canvasCtx = canvasRef.current.getContext("2d");
              const drawingUtils = new DrawingUtils(canvasCtx);
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            //   console.log(result.landmarks.length !== 0 )
            //   console.log(result.landmarks.length !== 0 ? result.landmarks[0][0].z : null) //printing out the human pose
              //Update the coordinates for the pose
              setPoints(result.landmarks.length !== 0 ? result.landmarks[0] : null)

            //Drawing of the landmarks
              for (const landmark of result.landmarks) {
                //Draw dots
                drawingUtils.drawLandmarks(landmark, {
                    color:"#000000",
                    radius: 1
                });
                canvasCtx.font = "12px Arial";
                //Draw connectors
                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: "#1877F2" });
                //Label the key points
                for (const [index, element] of landmark.entries()) {
                    // console.log(index, element.x, element.y)
                    canvasCtx.strokeText(index, (element.x)*canvasRef.current.width, element.y*canvasRef.current.height); //plot the numbers
                  }
                
            }
              canvasCtx.restore();
            });
          }
  
    }
    setCanvasCtx(canvasCtx)
    console.log(`Webcam: ${webcamRunning}`)
    
    //To have additional conditions to check if the video feed is running
    if(videoRef.current && !videoRef.current.paused){ 
        window.requestAnimationFrame(predictWebcam);
    }

    else{
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        console.log(canvasCtx)
        console.log(canvasRef.current.width, canvasRef.current.height);
    }
    
  };

    // Function to start the webcam
    const startWebcam = () => {
        navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            videoRef.current.srcObject = stream;
            console.log("Add listener")
            videoRef.current.addEventListener("loadeddata", predictWebcam);

        })
        .catch((error) => {
            console.error("Error accessing webcam:", error);
        });
    };

    // Function to stop the webcam
    const stopWebcam = () => {
        // Remove the loadeddata event listener
        console.log("Remove listener")
        videoRef.current.removeEventListener("loadeddata", predictWebcam);
      
        // Stop video tracks associated with the stream
        if (videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach((track) => {
            track.stop();
          });
      
          // Release access to the camera
          videoRef.current.srcObject = null;
          setLastVideoTime(-1)
        }
      };

      console.log(`Webcam-Post: ${webcamRunning}`)

    if (webcamRunning===true){
        // Check if webcam access is supported.
        const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
        if (hasGetUserMedia()) {
            startWebcam()
          } else {
            console.warn("getUserMedia() is not supported by your browser");
          }        
    }
    
    if (webcamRunning===false){
        console.log("Stopping Webcam")
        stopWebcam()
        
        
    }

    // Define a cleanup function to stop the webcam when unmounting
  return () => {
    console.log("Unmounting")
    stopWebcam(); // Stop the webcam when the component unmounts
  };
    
  }, [webcamRunning])



  //Button and state toggling
  function enableCam() {
    if (!poseLandmarker) {//if the pose landmarks not loaded, don't enableCam
      console.log("Wait! poseLandmaker not loaded yet.");
      return;
    }


    //Toggle Effect
    if (webcamRunning === true) {
      setWebcamRunning(false);
      console.log(webcamRunning)
      console.log("Web Off");
      enableWebcamButtonRef.current.innerText = "ENABLE PREDICTIONS";
      
    
    } else {
      setWebcamRunning(true);
      console.log(webcamRunning)
      console.log("Web On");
      enableWebcamButtonRef.current.innerText = "DISABLE PREDICTIONS";

    }    

}

  
  
  

  return (
    <div>
      <h1>Hello, World!</h1>
      <Button  disabled={disabledVideoButton} ref={enableWebcamButtonRef} variant="contained" id="webcamButton" onClick={enableCam}>  
        {webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS"}
      </Button>
      <p>This is a generic React component.</p>      
      <video
        ref={videoRef}
        id="webcam"
        autoPlay
        width={videoWidth}
        height={videoHeight}
      ></video>

      <canvas
        ref={canvasRef}
        id="output_canvas"
        className="output_canvas"
        width={videoWidth}
        height={videoHeight}
      ></canvas>

      <Typography>{points === null ? "No objects detected" :  `NOSE - X: ${points[0].x.toFixed(2)}, Y: ${points[0].y.toFixed(2)}, Z:${points[0].z.toFixed(2)}`}</Typography>
    </div>
  );
}

export default PoseProcessing;