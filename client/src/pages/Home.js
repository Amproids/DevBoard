function Home() {
    return (
        <div>
            <section className="hero">
                <h1>DevBoard</h1>
                <p>
                    A development board task manager built with the MERN stack
                </p>
                <p>
                    Streamline your development workflow with kanban-style
                    project management and real-time team collaboration.
                </p>
                <button>Get Started</button>
            </section>

            <section className="features">
                <h2>Built for Developers</h2>
                <div className="feature-grid">
                    <div>
                        <h3>📋 Kanban Boards</h3>
                        <p>Organize tasks with drag-and-drop boards</p>
                    </div>
                    <div>
                        <h3>⚡ Real-time Sync</h3>
                        <p>See updates instantly with Socket.io</p>
                    </div>
                    <div>
                        <h3>👥 Team Collaboration</h3>
                        <p>Work together seamlessly</p>
                    </div>
                </div>
            </section>

            <section className="tech-stack">
                <h2>Tech Stack</h2>
                <p>
                    <strong>Frontend:</strong> React, Socket.io, React DnD,
                    Tailwind CSS
                </p>
                <p>
                    <strong>Backend:</strong> Node.js, Express, MongoDB,
                    Socket.io
                </p>
            </section>
        </div>
    );
}

export default Home;