import { useState } from 'react'
import './App.css'
import Home from './components/Home';
import ProgramDetails from './components/ProgramDetails';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <>
        <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/program_details" element={<ProgramDetails />} />
              <Route
                        path="*"
                        element={
                            <>
                                <h1>No Found Route</h1>
                            </>
                        }
                    />
          </Routes>
      </Router>
    </>
  )
}

export default App
