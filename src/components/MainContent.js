import React, { useState, useEffect } from "react";
import Video from "./Video.js";
import getVideoDetails from "../api/getVideoDetails.js";
import EditControls from "./EditControls.js";
import VideoSuggestions from "./VideoSuggestions.js";
import getGif from "../api/getGif.js";
import "../styles/MainContent.css";
import LoadingGif from "../static/loading.gif";
import Loader from "react-loader-spinner";

const MainContent = ({ videosList }) => {
    const [showEditControls, setShowEditControls] = useState(false);
    const [videoDetails, setVideoDetails] = useState({
        video: null,
        videoDuration: 0, // Duration of original video
        start: 0, // Start Time of Video Clip set by User
        videoClipDuration: 0, // Clip duration set by user
        isPreview: false, // whether to show preview in Video Component
        shouldCreateGif: false, // whether to convert to gif?
    });

    const getDurationInSeconds = (duration) => {
        // e.g. duration = "PT11M52S", "PT1H33M1S"
        let ans = 0;
        const list = duration.split(/PT|H|M|S/);
        list.shift();
        list.pop();
        let mul = 1;
        list.reverse().forEach((element) => {
            ans = ans + mul * element;
            mul = mul * 60;
        });
        return ans;
    };

    useEffect(() => {
        // Getting Video Details of the video to be played inside the Video Component
        getVideoDetails(
            {
                key: process.env.REACT_APP_YT_API_KEY,
                id: videosList[0].id.videoId,
            },
            (videoDetailsResponse) => {
                const videoDuration = getDurationInSeconds(
                    videoDetailsResponse.contentDetails.duration
                );
                setVideoDetails((prev) => {
                    return {
                        ...prev,
                        video: videosList[0],
                        videoDuration: videoDuration,
                        videoClipDuration: videoDuration,
                    };
                });
            }
        );
    }, [videosList]);

    /**
     * This useEffect have 4 dependency item, though we care about only shouldCreateGif.
     */
    useEffect(() => {
        if (videoDetails.shouldCreateGif === true) {
            const videoId = videoDetails.video.id.videoId;
            const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
            getGif(
                {
                    watchUrl: watchUrl,
                    seekingTime: videoDetails.start,
                    duration: videoDetails.videoClipDuration,
                },
                () => {
                    // This Function will be called by getGif ffter Gif is Downloaded.
                    setVideoDetails((prev) => {
                        return { ...prev, shouldCreateGif: false };
                    });
                }
            );
        }
    }, [
        videoDetails.shouldCreateGif,
        videoDetails.video,
        videoDetails.start,
        videoDetails.videoClipDuration,
    ]);

    return (
        <>
            {videoDetails.video === null ? (
                <div className="MainContentLoading">
                    <img src={LoadingGif} className='MainContentLoader' alt="Loading..." />
                </div>
            ) : videoDetails.shouldCreateGif === true ? (
                <div className="MainContentLoading">
                <Loader type="Bars" color="red" secondaryColor="black" height={40} width={40} />
                <p>Making Gif in Progress...</p>
                </div>
            ) : (
                <div className="MainContent">
                    <Video
                        videoDetails={videoDetails}
                        setVideoDetails={setVideoDetails}
                        showEditControls={showEditControls}
                        setShowEditControls={setShowEditControls}
                    />
                    {showEditControls === false ? (
                        <VideoSuggestions videosList={videosList} setVideoDetails={setVideoDetails}/>
                    ) : (
                        <EditControls
                            videoDetails={videoDetails}
                            setVideoDetails={setVideoDetails}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default MainContent;
