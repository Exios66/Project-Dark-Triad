import './Home.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        document.body.classList.toggle('dark-mode', savedDarkMode);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        document.body.classList.toggle('dark-mode', newDarkMode);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div id="content">
            <header>
                <h1>Dark Triad Assessments</h1>
                <button id="menuToggle" aria-label="Toggle Menu" onClick={toggleMenu}>☰</button>
            </header>
            <nav id="mainNav" className={menuOpen ? 'open' : ''}>
                <ul>
                    <li><Link to="/assessments">Assessments</Link></li>
                    <li><Link to="/literature">Literature Review</Link></li>
                    <li><Link to="/background">Background & History</Link></li>
                    <li><Link to="/psychometric">Psychometric Calculator</Link></li>
                </ul>
            </nav>
            <main>
                <section id="assessments">
                    <h2>Available Assessments</h2>
                    {/* Add assessment links here */}
                </section>
                {/* Add other main content sections here */}
            </main>
            <footer>
                <button id="showScientificArticles">Scientific Articles</button>
                <p>&copy; 2023 Dark Triad Assessments. All rights reserved.</p>
            </footer>
            <button id="darkModeToggle" onClick={toggleDarkMode} aria-label="Toggle Dark Mode">
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
        </div>
    );
};

export default Home;

// If it exists and you don't need the CSS, remove this line.
// If you do need the CSS, we'll create the file.