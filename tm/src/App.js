import mylogo from './transmogrify.jpg';
import './App.css';
import './tm.css';
import './trcss.css';
import { useState } from 'react';
import Transmogrify from './tm';

function App() {
  const [whereTo, setWhereTo] = useState('home');
  return (
    <div>
      {whereTo === 'home' ?
        <header>
          <div className="App-header">
            <img src={mylogo} className="App-logo" alt="logo" />
          </div>
          <div className='App-under-logo'>
            <p>An original word game by Tile Runner</p>
            <p>Make one move at a time to transmogrify to target.</p>
            <button onClick={() => {setWhereTo('game');}}>Play !</button>
          </div>
        </header>
      :
        <header>
          <Transmogrify setWhereTo={setWhereTo}/>
        </header>
      }
    </div>
  );
}

export default App;
