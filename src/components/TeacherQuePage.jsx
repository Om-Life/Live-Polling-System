import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { pollAPI } from "../utils/api";
import PollOption from "./PollOption";
import eye from "../assets/eye.png";

const TeacherQuePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { on, off, emit } = useSocket();
  
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/');
      return;
    }

    getCurrentPoll();

    // Socket listeners
    const handlePollUpdate = (data) => {
      setResults(data.results);
    };

    on('poll_update', handlePollUpdate);

    return () => {
      off('poll_update', handlePollUpdate);
    };
  }, [user, navigate, on, off]);

  const getCurrentPoll = async () => {
    try {
      const response = await pollAPI.getCurrent();
      const pollData = response.data.poll;
      setPoll(pollData);
      
      // Convert options to results format
      const initialResults = pollData.options.map((option, index) => ({
        id: index + 1,
        text: option.text,
        votes: option.votes || 0
      }));
      setResults(initialResults);
    } catch (error) {
      console.error('Get current poll error:', error);
      if (error.response?.status === 404) {
        navigate('/teacher');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndPoll = async () => {
    try {
      await pollAPI.end();
      navigate('/teacher');
    } catch (error) {
      console.error('End poll error:', error);
    }
  };

  const totalVotes = results.reduce((sum, opt) => sum + opt.votes, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-5 sora">
        <p className="text-black font-semibold text-2xl">Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-5 sora">
        <p className="text-black font-semibold text-2xl">No active poll found</p>
        <button
          onClick={() => navigate('/teacher')}
          className="px-6 py-3 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white font-semibold rounded-full"
        >
          Create New Poll
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative px-4 py-10 sora">
      {/* Top-right absolute button */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={() => navigate('/poll-hist')}
          className="flex items-center gap-2 cursor-pointer bg-[#8F64E1] text-white text-sm font-medium px-5 py-2 rounded-full shadow"
        >
          <img src={eye} className="h-5 w-5" />
          View Poll history
        </button>
      </div>
      
      <div className="max-w-xl w-full mx-auto pt-14">
        {/* Question Number above the box */}
        <div className="text-black font-semibold text-xl mb-5">
          Current Poll - {totalVotes} votes
        </div>
        
        {/* Question Box */}
        <div className="border border-[#AF8FF1] rounded-lg overflow-hidden shadow">
          <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] px-4 py-3">
            <span className="text-white font-semibold text-sm">
              {poll.question}
            </span>
          </div>

          <div className="p-4 mt-4">
            {results.map((option) => (
              <PollOption key={option.id} option={{ ...option, totalVotes }} />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end mb-6 mt-8 gap-4">
          <button
            onClick={handleEndPoll}
            className="flex items-center gap-2 cursor-pointer bg-red-500 text-white text-sm font-medium px-5 py-3 rounded-full shadow hover:bg-red-600"
          >
            End Poll
          </button>
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white text-sm font-medium px-5 py-3 rounded-full shadow"
          >
            + Ask new question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherQuePage;
