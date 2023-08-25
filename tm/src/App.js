import mylogo from './transmogrify.jpg';
import './App.css';
import './tm.css';
import './trcss.css';
import { useState } from 'react';
import Transmogrify from './tm';
import ReactPlayer from 'react-player';

function App() {
  const [whereTo, setWhereTo] = useState('home');
  return (
    <div>
      {whereTo === 'home' ?
        <header>
          <div className="App-header">
            <img src={mylogo} className="App-logo" alt="logo" />
          </div>
          <table>
            <tr className='App-under-logo'>
              <td>
              <a href="http://www.scrabbleplayers.org"><img border="0" src="http://www.scrabbleplayers.org/pix/logo-only-160px.png" alt="[NASPA Logo]"/></a>
              <p>NWL20 lexicon used with permission from NASPA</p>
              </td>
              <td>
                <p>An original word game by Tile Runner</p>
                <p>Make one move at a time to transmogrify to target.</p>
                <button onClick={() => {setWhereTo('game');}}>Play !</button>
              </td>
              <td>
                <ReactPlayer url='https://youtu.be/FCM47cG31uY' width='70%' height='70%'/>
              </td>
            </tr>
          </table>
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
