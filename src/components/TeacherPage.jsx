import React, { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import BadgeStar from "./BadgeStar";

const TeacherPage = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { value: "", isCorrect: false },
    { value: "", isCorrect: false },
  ]);
  const [duration, setDuration] = useState("60");

  const handleOptionChange = (index, newValue) => {
    const updated = [...options];
    updated[index].value = newValue;
    setOptions(updated);
  };

  const handleCorrectChange = (index, isCorrect) => {
    const updated = [...options];
    updated[index].isCorrect = isCorrect;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, { value: "", isCorrect: false }]);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex flex-col items-center sora">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-left">
          <div className="flex items-center rounded-full w-fit">
            <BadgeStar />
          </div>
        </div>

        <div className="text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-normal">
            Let’s <span className="font-semibold">Get Started</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            you’ll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>
        </div>

        {/* Question Input */}
        <div className="space-y-2 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="font-semibold text-black">
              Enter your question
            </label>
            <div className="relative w-fit">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="border cursor-pointer rounded px-6 py-2 text-sm focus:outline-none bg-[#F2F2F2] appearance-none"
              >
                <option value="30">30 seconds</option>
                <option value="45">45 seconds</option>
                <option value="60">60 seconds</option>
                <option value="90">90 seconds</option>
                <option value="120">120 seconds</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaCaretDown className="text-[#480FB3]" />
              </div>
            </div>
          </div>
          <textarea
            className="w-full h-24 p-3 bg-[#F2F2F2] rounded-md focus:outline-none resize-none"
            maxLength={100}
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="text-right text-sm text-gray-400">
            {question.length}/100
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="font-semibold">Edit Options</h2>
            <h2 className="font-semibold">Is it Correct?</h2>
          </div>

          {options.map((opt, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-[#8F64E1] text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <input
                className="flex-1 bg-[#F2F2F2] rounded-md px-4 py-2 focus:outline-none"
                placeholder={`Option ${index + 1}`}
                value={opt.value}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              <div className="flex items-center gap-4 ml-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={opt.isCorrect}
                    onChange={() => handleCorrectChange(index, true)}
                    className="accent-[#8F64E1]"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={!opt.isCorrect}
                    onChange={() => handleCorrectChange(index, false)}
                    className="accent-[#8F64E1]"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
          ))}

          {/* Add Option */}
          {options.length < 5 && (
            <button
              onClick={addOption}
              className="text-[#7765DA] cursor-pointer border border-[#7765DA] rounded-lg px-4 py-2.5 text-sm mt-2"
            >
              + Add More option
            </button>
          )}
        </div>
      </div>{" "}
      <hr className="w-full border-gray-200 my-10" />
      <div className="w-full max-w-3xl">
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white font-semibold rounded-full hover:opacity-90 transition">
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
