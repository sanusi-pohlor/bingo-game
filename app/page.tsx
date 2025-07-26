"use client";

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);

  const [winningRows, setWinningRows] = useState<Set<number>>(new Set());
  const [winningCols, setWinningCols] = useState<Set<number>>(new Set());
  const [winningDiagonals, setWinningDiagonals] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (score === rows) {
      setShowModal(true);
      if (canvasRef.current) {
        const myConfetti = confetti.create(canvasRef.current, {
          resize: true,
          useWorker: true,
        });
        myConfetti({
          particleCount: 100,
          spread: 160,
        });
      }
    }
  }, [score, rows]);

  const [manualInputMode, setManualInputMode] = useState(false);
  const [assignedNumbers, setAssignedNumbers] = useState<number[]>(Array(rows * cols).fill(0));
  const [confirmedManualNumbers, setConfirmedManualNumbers] = useState<number[]>([]);
  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkWinningConditions();
  }, [selectedButtons]);

  useEffect(() => {
    handleShuffle();
  }, []);

  interface ShuffleArray {
    (array: number[]): number[];
  }

  const shuffleArray: ShuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const renderButtons = () => {
    const buttons = [];

    if (manualInputMode) {
      const handleButtonClick = (index: number) => {
        setAssignedNumbers((prevAssigned: number[]) => {
          const newAssigned: number[] = [...prevAssigned];
          if (newAssigned[index] !== 0) {
            // If already assigned, unassign it
            newAssigned[index] = 0;
          } else {
            // If not assigned, assign the next available number
            let nextNum = 1;
            const assignedSet = new Set(newAssigned.filter(num => num !== 0));
            while (assignedSet.has(nextNum)) {
              nextNum++;
            }
            newAssigned[index] = nextNum;
          }
          return newAssigned;
        });
      };

      const numbersToDisplay = confirmedManualNumbers.length > 0 ? confirmedManualNumbers : assignedNumbers;

      let currentButtonIndex = 0;
      for (let i = 0; i < rows; i++) {
        const rowButtons = [];
        for (let j = 0; j < cols; j++) {
          const index = currentButtonIndex++;
          const buttonContent = numbersToDisplay[index] !== 0 ? numbersToDisplay[index] : '';
          
          const isSelected = selectedButtons.has(`${i}-${j}`);
          const isWinningRow = winningRows.has(i);
          const isWinningCol = winningCols.has(j);
          const isWinningDiagonal = winningDiagonals.has(`${i}-${j}`);


          rowButtons.push(
            <button
              key={`${i}-${j}`}
              className={`w-16 h-16 m-1 rounded flex items-center justify-center ${
                isWinningRow || isWinningCol || isWinningDiagonal
                  ? 'bg-green-500 text-white'
                  : isSelected
                  ? 'bg-red-500 text-white'
                  : confirmedManualNumbers.length > 0
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-black'
              }`}
              onClick={() => {
                if (confirmedManualNumbers.length > 0) {
                  handleSelectionClick(`${i}-${j}`);
                } else {
                  handleButtonClick(index);
                }
              }}
              disabled={confirmedManualNumbers.length > 0 && isSelected}
            >
              {buttonContent}
            </button>
          );
        }
        buttons.push(
          <div key={i} className="flex">
            {rowButtons}
          </div>
        );
      }
    } else {
      let numberIndex = 0;

      for (let i = 0; i < rows; i++) {
        const rowButtons = [];
        for (let j = 0; j < cols; j++) {
          const buttonKey = `${i}-${j}`;
          const isSelected = selectedButtons.has(buttonKey);
          const isWinningRow = winningRows.has(i);
          const isWinningCol = winningCols.has(j);
          const isWinningDiagonal = winningDiagonals.has(buttonKey);
          rowButtons.push(
            <button
              key={buttonKey}
              className={`w-16 h-16 m-1 rounded flex items-center justify-center ${
                isWinningRow || isWinningCol || isWinningDiagonal
                  ? 'bg-green-500 text-white'
                  : isSelected
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
              onClick={() => handleSelectionClick(buttonKey)}
            >
              {shuffledNumbers[numberIndex++]}
            </button>
          );
        }
        buttons.push(
          <div key={i} className="flex">
            {rowButtons}
          </div>
        );
      }
    }
    return buttons;
  };

  const handleSelectionClick = (key: string) => {
    setSelectedButtons((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      return newSelected;
    });
  };

  const checkWinningConditions = () => {
    let newScore = 0;
    const newWinningRows = new Set<number>();
    const newWinningCols = new Set<number>();
    const newWinningDiagonals = new Set<string>();

    // Check for winning rows
    for (let i = 0; i < rows; i++) {
      let isWinningRow = true;
      for (let j = 0; j < cols; j++) {
        if (!selectedButtons.has(`${i}-${j}`)) {
          isWinningRow = false;
          break;
        }
      }
      if (isWinningRow) {
        newWinningRows.add(i);
        newScore++;
      }
    }

    // Check for winning columns
    for (let j = 0; j < cols; j++) {
      let isWinningCol = true;
      for (let i = 0; i < rows; i++) {
        if (!selectedButtons.has(`${i}-${j}`)) {
          isWinningCol = false;
          break;
        }
      }
      if (isWinningCol) {
        newWinningCols.add(j);
        newScore++;
      }
    }

    // Check for winning diagonals
    let isWinningDiagonal1 = true;
    for (let i = 0; i < rows; i++) {
      if (!selectedButtons.has(`${i}-${i}`)) {
        isWinningDiagonal1 = false;
        break;
      }
    }
    if (isWinningDiagonal1) {
      for (let i = 0; i < rows; i++) {
        newWinningDiagonals.add(`${i}-${i}`);
      }
      newScore++;
    }

    let isWinningDiagonal2 = true;
    for (let i = 0; i < rows; i++) {
      if (!selectedButtons.has(`${i}-${rows - 1 - i}`)) {
        isWinningDiagonal2 = false;
        break;
      }
    }
    if (isWinningDiagonal2) {
      for (let i = 0; i < rows; i++) {
        newWinningDiagonals.add(`${i}-${rows - 1 - i}`);
      }
      newScore++;
    }

    setWinningRows(newWinningRows);
    setWinningCols(newWinningCols);
    setWinningDiagonals(newWinningDiagonals);
    setScore(newScore);
  };

  const handleConfirmManualInput = () => {
    setConfirmedManualNumbers([...assignedNumbers]);
  };

  const handleShuffle = () => {
    const totalNumbers = rows * cols;
    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    setShuffledNumbers(shuffleArray(numbers));
    setSelectedButtons(new Set());
    setWinningRows(new Set());
    setWinningCols(new Set());
    setWinningDiagonals(new Set());
    setScore(0);
    setShowModal(false);
  };

  const generateGridOptions = () => {
    const options = [];
    for (let i = 3; i <= 8; i++) {
      options.push(<option key={`${i}x${i}`} value={`${i}x${i}`}>{`${i}x${i}`}</option>);
    }
    return options;
  };

  interface GridChangeEvent extends React.ChangeEvent<HTMLSelectElement> {}

  interface GridChangeHandler {
    (e: GridChangeEvent): void;
  }

  const handleGridChange: GridChangeHandler = (e) => {
    const [newRows, newCols]: [number, number] = e.target.value.split('x').map(Number) as [number, number];
    setRows(newRows);
    setCols(newCols);
    setAssignedNumbers(Array(newRows * newCols).fill(0)); // Reset assigned numbers on grid size change
    setManualInputMode(false); // Exit manual input mode on grid size change
    setConfirmedManualNumbers([]); // Reset confirmed numbers on grid size change
    setSelectedButtons(new Set()); // Reset selected buttons on grid size change
    setWinningRows(new Set()); // Reset winning rows on grid size change
    setWinningCols(new Set());
    setWinningDiagonals(new Set());
    setScore(0);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-8">Bingo Game at Home</h1>

      <div className="mb-8">
        <label htmlFor="gridSize" className="mr-2 text-1xl font-bold">เลือกขนาดตาราง:</label>
        <select
          id="gridSize"
          aria-label="Grid Size"
          title="Grid Size"
          value={`${rows}x${cols}`}
          onChange={handleGridChange}
          className="border p-1 w-32 text-black"
        >
          {generateGridOptions()}
        </select>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Score: {score}</h1>
      </div>

      <div className="flex flex-col">
        {renderButtons()}
      </div>

      <div className="flex mt-8">
        {!manualInputMode && (
          <button
            onClick={handleShuffle}
            className="px-4 py-2 bg-green-500 text-white rounded w-40 mr-2"
          >
            สุ่มตัวเลขใหม่
          </button>
        )}
        <button
          onClick={() => {
            setManualInputMode(!manualInputMode);
            setAssignedNumbers(Array(rows * cols).fill(0)); // Reset assigned numbers when toggling mode
            setConfirmedManualNumbers([]); // Reset confirmed numbers when toggling mode
            setSelectedButtons(new Set()); // Reset selected buttons when toggling mode
          }}
          className={`px-4 py-2 rounded w-40 ${manualInputMode ? 'bg-red-500' : 'bg-purple-500'} text-white`}
        >
          {manualInputMode ? 'ออก' : 'เลือกตัวเลขเอง'}
        </button>
      </div>

      {manualInputMode && confirmedManualNumbers.length === 0 && (
        <div className="flex flex-col items-center">
          <button
            onClick={handleConfirmManualInput}
            className={`mt-4 px-4 py-2 text-white rounded w-40 ${
              assignedNumbers.every(num => num !== 0) ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!assignedNumbers.every(num => num !== 0)}
          >
            เสร็จสิ้นการเลือก 
          </button>
          {!assignedNumbers.every(num => num !== 0) && (
            <p className="text-red-500 mt-2">ยังเลือกตัวเลขไม่ครบ</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-4xl font-bold mb-4">You Win!</h2>
            <canvas ref={canvasRef} width={400} height={400} />
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}