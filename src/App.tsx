import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronRight,
  Download,
  Upload,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { vocab } from "./vocab";



const FlashcardApp = () => {
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("flashcards");
    return saved ? JSON.parse(saved) : vocab;
  });
  const [currentSection, setCurrentSection] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizProgress, setQuizProgress] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startWithSpanish, setStartWithSpanish] = useState(() => {
    const saved = localStorage.getItem("startWithSpanish");
    return saved ? JSON.parse(saved) : false;
  });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [revealEnglish, setRevealEnglish] = useState(true);
  const [revealSpanish, setRevealSpanish] = useState(false);
  const [blurredCells, setBlurredCells] = useState(() => {
    const initialBlur = {};
    Object.entries(initialSections).forEach(([section, cards]) => {
      initialBlur[section] = cards.map(() => true);
    });
    return initialBlur;
  });
  const [viewMode, setViewMode] = useState("sections"); // Added mode switcher state

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem("startWithSpanish", JSON.stringify(startWithSpanish));
  }, [startWithSpanish]);

  useEffect(() => {
    const savedProgress = localStorage.getItem("quizProgress");
    if (savedProgress) {
      setQuizProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quizProgress", JSON.stringify(quizProgress));
  }, [quizProgress]);

  const handleExport = () => {
    const dataStr = JSON.stringify(sections);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    const exportFileDefaultName = "flashcards.json";

    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setSections(imported);
      } catch (error) {
        alert("Invalid file format");
      }
    };

    reader.readAsText(file);
  };

  const toggleBlurColumn = (column) => {
    if (column === "english") {
      setRevealEnglish((prev) => !prev);
    } else if (column === "spanish") {
      setRevealSpanish((prev) => !prev);
    }
  };

  const toggleCellBlur = (section, index) => {
    setBlurredCells((prev) => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = !updatedSection[index];
      return {
        ...prev,
        [section]: updatedSection,
      };
    });
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => setViewMode("sections")}
      >
        Return to Sections View
      </Button>
      {Object.entries(sections).map(([section, cards]) => (
        <div key={section} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{section}</h2>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">English</th>
                <th className="border border-gray-300 p-2">Spanish</th>
              </tr>
              <tr>
                <th className="border border-gray-300 p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBlurColumn("english")}
                  >
                    {revealEnglish ? "Blur All" : "Reveal All"}
                  </Button>
                </th>
                <th className="border border-gray-300 p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBlurColumn("spanish")}
                  >
                    {revealSpanish ? "Blur All" : "Reveal All"}
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, index) => (
                <tr key={card.id}>
                  <td
                    className={`border border-gray-300 p-2 cursor-pointer ${
                      revealEnglish || !blurredCells[section][index]
                        ? ""
                        : "blur-sm"
                    }`}
                    onClick={() => toggleCellBlur(section, index)}
                  >
                    {card.english}
                  </td>
                  <td
                    className={`border border-gray-300 p-2 cursor-pointer ${
                      revealSpanish || !blurredCells[section][index]
                        ? ""
                        : "blur-sm"
                    }`}
                    onClick={() => toggleCellBlur(section, index)}
                  >
                    {card.spanish}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  const renderSectionsView = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="main"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.1 }}
        className="flex flex-col items-center justify-center min-h-screen p-4"
      >
        <Button variant="outline" onClick={() => setViewMode("table")}>
          Table View
        </Button>
        <div className="flex justify-between w-full max-w-md mb-4 items-center">
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("file-input").click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          {Object.entries(sections).map(([name, cards]) => {
            const learned = cards.filter((c) => c.learned).length;
            const quizProgressData = quizProgress[name] || {};

            return (
              <Card key={name} className="p-4 cursor-pointer hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div onClick={() => setCurrentSection(name)}>
                    <h2 className="text-lg font-semibold">{name}</h2>
                    <p className="text-sm text-gray-600">
                      {learned}/{cards.length} learned
                    </p>
                    {quizProgressData.started && (
                      <div className="mt-2 w-full bg-gray-200 h-2">
                        <div
                          className={`h-2 ${
                            quizProgressData.completed
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${
                              (quizProgressData.score / cards.length) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <Button onClick={() => startQuiz(name)}>Start Quiz</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="p-4">
      {viewMode === "sections" && renderSectionsView()}
      {viewMode === "table" && renderTableView()}
    </div>
  );
};

export default FlashcardApp;
