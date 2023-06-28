import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ModelGUI from './pages/ModelGUI';
import "./app.css"

function App() {

  return (
    <Router>
        <Routes>
          <Route exact path='/' element={<Home/>} />
          <Route path='/model' element={<ModelGUI />} />
        </Routes>
    </Router>
  );
}

export default App
