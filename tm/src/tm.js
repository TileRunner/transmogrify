import { useState } from "react";
import { countSwaps, areAnagrams, isDrop, isWordValid, getTransmogrifyValidNextWords } from './wordfunctions';

const Transmogrify = ({setWhereTo}) => {
    const [numMoves, setNumMoves] = useState(2);
    const baseurl = (process.env.NODE_ENV === 'production' ? 'https://webappscrabbleclub.azurewebsites.net/api/Values' : 'https://localhost:55557/api/Values');
    const numMovesArray = [2,3,4,5,6,7,8,9];
    const [puzzle, setPuzzle] = useState({});
    const [nextWord, setNextWord] = useState('');
    const [downWords, setDownWords] = useState([]); // Users words going down from the start word
    const [validNextDownWords, setValidNextDownWords] = useState([]); // Valid next words in down direction
    const [upWords, setUpWords] = useState([]); // Users words going up from the target word
    const [validNextUpWords, setValidNextUpWords] = useState([]); // Valid next words in up direction
    const [solved, setSolved] = useState(false);
    const [solving, setSolving] = useState(false);
    const callForPuzzle = async() => {
        let data = {};
        let validDownWords = [];
        let validUpWords = [];
        let newSolving = false;
        try {
            let url = `${baseurl}/transmogrify/generatepuzzle?minMoves=${numMoves}`;
            const response = await fetch(url);
            data = await response.json();
            if (data.value.fail) {
                data.notes = ["The cat had a hairball!", data.value.fail];
            } else {
                validDownWords = await getTransmogrifyValidNextWords(data.value.startWord);
                validUpWords = await getTransmogrifyValidNextWords(data.value.targetWord);
                newSolving = true;    
            }
        } catch (error) {
            data.notes = ["Problem with the server. Sorry about that."];
            console.log(error);
        }
        if (data.notes) {
            alert(data.notes);
            return;
        }
        setPuzzle(data.value);
        setDownWords([]);
        setValidNextDownWords(validDownWords);
        setUpWords([]);
        setValidNextUpWords(validUpWords);
        setNextWord('');
        setSolved(false);
        setSolving(newSolving);
    }
    const resetEnteredWords = async() => {
        let validDownWords = await getTransmogrifyValidNextWords(puzzle.startWord);
        let validUpWords = await getTransmogrifyValidNextWords(puzzle.targetWord);
        setDownWords([]);
        setValidNextDownWords(validDownWords);
        setUpWords([]);
        setValidNextUpWords(validUpWords);
        setNextWord('');
    }
    const quitThisPuzzle = () => {
        setSolving(false);
    }
    const acceptThisWord = async(w) => {
        let newNextWord = w.toUpperCase();
        setNextWord(newNextWord);
        await acceptTheNextWord(newNextWord);
    }
    const acceptTheNextWord = async(newWord) => {
        // Is the word valid in the down direction?
        let prevWord = (downWords.length === 0 ? puzzle.startWord : downWords[downWords.length - 1]);
        newWord = newWord.toUpperCase();
        if (validMove(prevWord, newWord)) {
            if (!await isWordValid(newWord)) {
                alert(`${newWord} is not a valid word`);
            } else {
                let wordBelowNewWord = (upWords.length === 0 ? puzzle.targetWord : upWords[0]);
                let newDownWords = [...downWords];
                newDownWords.push(newWord);
                if (validMove(newWord, wordBelowNewWord)) {
                    setDownWords(newDownWords);
                    setNextWord('');    
                    setSolved(true);
                } else {
                    let validNextWords = await getTransmogrifyValidNextWords(newWord); // lower case valid next words
                    setValidNextDownWords(validNextWords);
                    setDownWords(newDownWords);
                    setNextWord('');    
                }
            }
        } else {
            // Is the word valid in the up direction?
            prevWord = (upWords.length === 0 ? puzzle.targetWord : upWords[0]);
            if (validMove(prevWord, newWord)) {
                if (!await isWordValid(newWord)) {
                    alert(`${newWord} is not a valid word`);
                } else {
                    let wordAboveNewWord = (downWords.length === 0 ? puzzle.startWord : downWords[downWords.length-1]);
                    let newUpWords = [newWord,...upWords];
                    if (validMove(newWord, wordAboveNewWord)) {
                        setUpWords(newUpWords);
                        setNextWord('');    
                        setSolved(true);
                    } else {
                        let validNextWords = await getTransmogrifyValidNextWords(newWord); // lower case valid next words
                        setValidNextUpWords(validNextWords);
                        setUpWords(newUpWords);
                        setNextWord('');   
                    }
                }
            } else {
                alert('Only anagrams, drops, swaps and inserts allowed.');
            }
        }
    }
    const validMove = (prevWord="", newWord="") => {
        prevWord = prevWord.trim().toLowerCase();
        newWord = newWord.trim().toLowerCase();
        if (prevWord === newWord) {
            return false;
        }
        return (areAnagrams(prevWord, newWord)
            || countSwaps(prevWord, newWord) === 1
            || isDrop(prevWord, newWord)
            || isDrop(newWord, prevWord)
        );
    }
    const GameStartSection = <div className="tm_numMovesDiv">
        <h3>Number Of Moves</h3>
        {numMovesArray.map((n) => (
            <button className={`tm_${n === numMoves ? 'numMovesSelected' : 'numMovesUnselected'}`}
                key={`chooseNumMoves${n}`}
                onClick={() => { setNumMoves(n); } }
            >{n}
            </button>
        ))}
        <div className="tm_startPuzzleDiv">
            <button key="startPuzzle" className="trButton" onClick={() => { callForPuzzle(); } }>
                Start Puzzle
            </button>
        </div>
    </div>;
    const PuzzleSection = <div className="tm_puzzleDiv">
        <span>{puzzle.startWord}</span>
        <span>to</span>
        <span>{puzzle.targetWord}</span>
        <br/>
        <span>Target:</span>
        <span>{numMoves}</span>
        <span>moves</span>
    </div>;
    const SolutionSection = <div className="tm_solutionOuterDiv">
        <div className="tm_solutionDiv">
            {puzzle && puzzle.startWord && <table>
                <tbody>
                    <tr>
                        <td><span className="tm_arrow">↧</span>{puzzle.startWord}</td>
                    </tr>
                    {downWords.map((w,i) => (
                        <tr key={`userDownWord${i}`}>
                            <td><span className="tm_arrow">↧</span>{w}</td>
                        </tr>
                    ))}
                    {!solved && <tr>
                        <td>
                            <span className="tm_nextword">&nbsp;{nextWord}&nbsp;</span>
                        </td>
                    </tr>}
                    {upWords.map((w,i) => (
                        <tr key={`userUpWord${i}`}>
                            <td>{w}<span className="tm_arrow">↥</span></td>
                        </tr>
                    ))}
                    <tr>
                        <td>{puzzle.targetWord}<span className="tm_arrow">↥</span></td>
                    </tr>
                </tbody>
            </table>}
        </div>
        {puzzle && puzzle.startWord && !solved && <div className="tm_validwordsdiv">
            <p>Valid down words</p>
            {validNextDownWords.map((w,i) => (
                <span key={`validdownword${i}`}
                onClick={() => {
                    acceptThisWord(w);
                }}>{w}{i + 1 === validNextDownWords.length ? '' : ','}&nbsp;</span>
            ))}
            <p>Valid up words</p>
            {validNextUpWords.map((w,i) => (
                <span key={`validupword${i}`}
                onClick={() => {
                    acceptThisWord(w);
                }}>{w}{i + 1 === validNextUpWords.length ? '' : ','}&nbsp;</span>
            ))}
            <p>Click Your Chosen Next Word</p>
        </div>}
        {solved ?
            <p className="tm_congrats">👏🏽 Solved in {downWords.length + upWords.length + 1} moves 👏🏽</p>
        :
            <div>
                <div className="tm_lastbuttons">
                    {downWords.length + upWords.length > 0 &&
                    <button onClick={() => {resetEnteredWords();}}
                    data-toggle="tooltip" title="Remove all enter words"
                    >
                        RESET
                    </button>}
                    <button onClick={() => {alert('Valid next word options:\nSwap one letter, e.g. CAT to COT\nDrop one letter, e.g. SWIG to WIG\nInsert one letter, e.g. MAT to MATH, or HIP to WHIP\nAnagram, e.g. ACT to CAT');}}
                    data-toggle="tooltip" title="Show instructions"
                    >
                        HELP
                    </button>
                    <button className="tm_quit" onClick={() => {quitThisPuzzle();}}
                    data-toggle="tooltip" title="Quit this puzzle. You can start another."
                    >
                        QUIT
                    </button>
                </div>
            </div>
        }
    </div>;
    const MainSection = <table>
        <tbody>
            {(solved || !solving) && <tr><td>{GameStartSection}</td></tr>}
            {puzzle && puzzle.startWord && <tr><td>{PuzzleSection}</td></tr>}
            <tr><td>{SolutionSection}</td></tr>
        </tbody>
    </table>;
    return (
        <div className="trBackground">
            <div className="trTitle">
                Transmogrify
                <button className="trButton" onClick={() => {setWhereTo('home');}}>
                    <i className="material-icons" data-toggle="tooltip" title="Home">home</i>
                </button>
            </div>
            {MainSection}
            <div>
                {puzzle && puzzle.notes && puzzle.notes.length > 0 &&
                <div className="trDanger">
                    {puzzle.notes.map((n,i) => (
                        <p key={`note${i}`}>{n}</p>
                    ))}
                </div>
                }
            </div>
        </div>
    );
}

export default Transmogrify;