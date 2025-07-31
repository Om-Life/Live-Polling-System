import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { pollAPI } from "../utils/api";
import clock from "../assets/clock.png";
import PollOption from "./PollOption";

const StudentQuePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { on, off, emit } = useSocket();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [poll, setPoll] = useState(location.state?.poll || null);
  const [timer, setTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Get current poll if not provided
    if (!poll) {
      getCurrentPoll();
    } else {
      setTimer(poll.timeRemaining || poll.duration || 60);
    }

    // Socket listeners
    const handleVoteConfirmed = (data) => {
      setSubmitted(true);
      setResults(data.results);
    };

    const handlePollEnded = (data) => {
      setSubmitted(true);
      setResults(data.results);
      setTimeout(() => {
        navigate('/PreQuestion');
      }, 5000);
    };

    const handleNewPoll = (pollData) => {
      setPoll(pollData);
      setTimer(pollData.timeRemaining || pollData.duration || 60);
      setSubmitted(false);
      setResults(null);
      setSelectedOption(null);
    };

    const handleKickedOut = () => {
      logout();
      navigate('/kick-out');
    };

    on('vote_confirmed', handleVoteConfirmed);
    on('poll_ended', handlePollEnded);
    on('new_poll', handleNewPoll);
    on('kicked_out', handleKickedOut);

    return () => {
      off('vote_confirmed', handleVoteConfirmed);
      off('poll_ended', handlePollEnded);
      off('new_poll', handleNewPoll);
      off('kicked_out', handleKickedOut);
    };
  }, [user, poll, navigate, logout, on, off]);

  useEffect(() => {
    if (timer > 0 && !submitted && poll) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !submitted) {
      setSubmitted(true);
    }
  }, [timer, submitted, poll]);

  const getCurrentPoll = async () => {
    try {
      const response = await pollAPI.getCurrent();
      const pollData = response.data.poll;
      setPoll(pollData);
      setTimer(pollData.timeRemaining || pollData.duration || 60);
      setSubmitted(pollData.hasVoted || false);
      if (pollData.hasVoted) {
        setResults(pollData.results);
      }
    } catch (error) {
      console.error('Get current poll error:', error);
      if (error.response?.status === 404) {
        navigate('/PreQuestion');
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedOption || !poll) return;
    
    setLoading(true);
    const selectedOptionText = poll.options.find(opt => 
      opt.text === selectedOption
    )?.text;
    
    if (selectedOptionText) {
      emit('vote', {
        pollId: poll.id,
        selectedOption: selectedOptionText
      });
    }
    setLoading(false);
  };

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-5 sora">
        <p className="text-black font-semibold text-2xl">Loading poll...</p>
      </div>
    );
  }

  const displayResults = submitted && results;
  const totalVotes = displayResults ? results.reduce((sum, opt) => sum + opt.votes, 0) : 0;

  return (
    <div className="min-h-screen bg-white relative px-4 py-10 sora">
      <div className="max-w-xl w-full mx-auto pt-14">
        {/* Question Number above the box */}
        <div className="flex justify-start items-center gap-9">
          <div className="text-black font-semibold text-xl mb-5">
            Question
          </div>
          <div className="flex space-x-2 items-center mb-5">
            <img src={clock} className="h-5 w-5" />
            <div className={`font-medium ${timer <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
              {`${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(
                timer % 60
              ).padStart(2, "0")}`}
            </div>
          </div>
        </div>
        
        {/* Question Box */}
        <div className="border border-[#AF8FF1] rounded-lg overflow-hidden shadow">
          <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] px-4 py-3">
            <span className="text-white font-semibold text-sm">
              {poll.question}
            </span>
          </div>

          <div className="p-4 mt-4">
            {poll.options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  if (!submitted && !loading) setSelectedOption(option.text);
                }}
                className={`cursor-pointer ${
                  selectedOption === option.text
                    ? "ring ring-[#8F64E1] bg-white"
                    : ""
                } rounded-sm mb-2`}
                style={{ transition: "background 0.2s, box-shadow 0.2s" }}
              >
                {displayResults ? (
                  <PollOption
                    option={{ 
                      id: index + 1, 
                      text: option.text, 
                      votes: results.find(r => r.text === option.text)?.votes || 0,
                      totalVotes 
                    }}
                    showPercentage={true}
                  />
                ) : (
                  <div
                    className={`relative border border-[#F6F6F6] rounded-sm overflow-hidden mb-2 ${
                      selectedOption === option.text ? "bg-white" : "bg-[#F6F6F6]"
                    }`}
                  >
                    <div className="absolute top-0 left-0 h-full  transition-all duration-300"></div>
                    <div className="relative z-10 flex justify-between items-center px-4 py-2 border border-transparent rounded-md">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full ${
                            selectedOption === option.text
                              ? "bg-[#8F64E1] text-white"
                              : "bg-[#8D8D8D] text-white"
                          } flex items-center justify-center text-sm font-bold`}
                        >
                          {index + 1}
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            selectedOption === option.text
                              ? "text-black"
                              : "text-[#2E2E2E]"
                          }`}
                        >
                          {option.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ask new question button */}
        <div className="flex justify-end mb-6 mt-8 gap-4">
          {!submitted && selectedOption && (
            <button
              className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white text-sm font-medium px-14 py-3 rounded-full shadow"
              onClick={handleSubmit}
              disabled={loading || submitted}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
        
        {submitted && (
          <div className="flex justify-center items-center mt-8">
            <span className="text-black text-lg font-medium text-center">
              {displayResults 
                ? "Results are live! Wait for the teacher to ask a new question..." 
                : "Answer submitted! Wait for results..."
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuePage;
