import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sessionAPI } from "../utils/api";
import BadgeStar from "./BadgeStar";

const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const roleOptions = [
    {
      id: "student",
      title: "I'm a Student",
      description:
        "Participate in live polls, answer questions in real-time, and track your responses instantly.",
    },
    {
      id: "teacher",
      title: "I'm a Teacher",
      description:
        "Create engaging polls, receive student responses live, and visualize results instantly.",
    },
  ];

  const handleContinue = () => {
    if (selectedRole === "teacher") {
      setShowSessionForm(true);
    } else {
      navigate('/student');
    }
  };

  const createSession = async () => {
    if (!sessionName.trim()) {
      setError("Please enter a session name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First create session
      const sessionResponse = await sessionAPI.create({
        name: sessionName.trim(),
        description: "",
        maxParticipants: 100,
        allowMultipleTeachers: false,
        settings: {
          allowChat: true,
          allowAnonymousVoting: false,
          showLiveResults: true,
          autoEndPolls: true
        }
      });

      const session = sessionResponse.data.session;
      
      // Then join as teacher (this should happen automatically but let's be explicit)
      const loginResult = await login("Teacher", "teacher", session.code);
      
      if (loginResult.success) {
        navigate('/teacher');
      } else {
        setError(loginResult.error);
      }
    } catch (error) {
      console.error('Create session error:', error);
      setError(error.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  if (showSessionForm) {
    return (
      <main className="bg-white flex flex-col items-center justify-center min-h-screen px-4 relative">
        <div className="absolute top-6 sm:top-10">
          <BadgeStar />
        </div>

        <div className="mt-[100px] text-center max-w-2xl space-y-3 px-2">
          <h1 className="text-2xl sm:text-4xl font-normal text-black sora">
            Create a <span className="font-semibold">New Session</span>
          </h1>
          <p className="text-[#666] text-base sm:text-lg font-normal sora">
            Enter a name for your polling session to get started
          </p>
        </div>

        <div className="mt-10 w-full max-w-md space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="text-left">
            <label
              htmlFor="sessionName"
              className="block mb-2 text-sm sm:text-base font-medium text-black"
            >
              Session Name
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              placeholder="Math Quiz Session"
              className="w-full px-4 py-3 sm:py-3.5 text-base sm:text-lg rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowSessionForm(false)}
              className="flex-1 py-3 sm:py-4 text-base sm:text-lg rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={createSession}
              disabled={loading}
              className="flex-1 py-3 sm:py-4 text-base sm:text-lg rounded-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white flex flex-col items-center justify-center min-h-screen px-4 relative">
      <div className="absolute top-6 sm:top-10">
        <BadgeStar />
      </div>

      <div className="mt-[100px] text-center max-w-2xl space-y-3 px-2">
        <h1 className="text-2xl sm:text-4xl font-normal text-black sora">
          Welcome to the{" "}
          <span className="font-semibold">Live Polling System</span>
        </h1>
        <p className="text-[#666] text-base sm:text-lg font-normal sora">
          Please select the role that best describes you to begin using the live
          polling system
        </p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-6 mt-10 justify-center items-center w-full px-2">
        {roleOptions.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`w-full sm:w-[350px] h-auto sm:h-[143px] rounded-xl cursor-pointer transition-all p-5 border ${
              selectedRole === role.id
                ? "border-2 border-[#7565D9]"
                : "border border-[#F2F2F2]"
            }`}
          >
            <h2 className="text-lg sm:text-[23px] font-semibold text-black mb-2 sora">
              {role.title}
            </h2>
            <p className="text-[#454545] text-sm sm:text-base font-normal sora">
              {role.description}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        className="mt-10 sm:mt-14 w-full max-w-[234px] h-[52px] sm:h-[58px] rounded-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-base sm:text-lg font-semibold text-white hover:opacity-90 transition sora"
      >
        Continue
      </button>
    </main>
  );
};

export default LandingPage;
