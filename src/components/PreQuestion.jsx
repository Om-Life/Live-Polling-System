import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import BadgeStar from "./BadgeStar";
import spinner from "../assets/spinner.png";

const PreQuestion = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { on, off } = useSocket();
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Listen for new polls
    const handleNewPoll = (pollData) => {
      console.log('New poll received:', pollData);
      navigate('/sque', { state: { poll: pollData } });
    };

    const handleKickedOut = () => {
      logout();
      navigate('/kick-out');
    };

    const handleConnect = () => {
      setConnecting(false);
    };

    on('new_poll', handleNewPoll);
    on('kicked_out', handleKickedOut);
    on('connect', handleConnect);

    // Check for existing active poll
    setTimeout(() => setConnecting(false), 2000);

    return () => {
      off('new_poll', handleNewPoll);
      off('kicked_out', handleKickedOut);
      off('connect', handleConnect);
    };
  }, [user, navigate, logout, on, off]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-5">
      <BadgeStar />
      <img src={spinner} className="animate-spin h-10 w-10" alt="Loading" />
      <p className="text-black font-semibold text-[33px] text-center sora">
        {connecting ? 'Connecting...' : 'Wait for the teacher to ask questions...'}
      </p>
      {user && (
        <p className="text-gray-500 text-lg sora">
          Welcome, {user.name}!
        </p>
      )}
    </div>
  );
};

export default PreQuestion;
