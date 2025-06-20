import React from 'react';
import './AnimatedGifs.css'; // Import the CSS file for GIF animations

const AnimatedGifs = () => {
    return (
        <>
            <img
                className="top-gif"
                src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGF3cnJtcXNjYXBrbGJnbXZ2aXVlNmM0NjE4NTFodmdsb3VlZmhxZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/7jvG2FrLJOpaF5ly2t/giphy.gif"
                alt="Top Animated GIF"
            />
            <img
                className="middle-gif"
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnJ0cnJqanYxZjk2NjJ3eDE4Ynl4em00N2c5bmFoZTdtaG1mdnFqaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/CqqoH4JuOV80JZbpju/giphy.gif"
                alt="Middle Animated GIF"
            />
            <img
                className="bottom-gif"
                src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExamoxcWpyczlkOGRhMmVsaTd5djYweW90ZDF1a3hwMTF4bnlleW02cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/VsqcvWheUtmsJEokL5/giphy.gif"
                alt="Bottom Animated GIF"
            />
        </>
    );
};

export default AnimatedGifs;