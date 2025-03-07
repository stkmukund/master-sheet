'use client'
import { useEffect } from 'react';

const CustomCursor: React.FC = () => {
    useEffect(() => {
        const cursor = document.getElementById('cursor') as HTMLElement;
        const body = document.body; // Reference to the body element

        // Function to handle mouse movement
        const handleMouseMove = (e: MouseEvent) => {
            if (cursor) {
                cursor.style.top = `${e.pageY + 2}px`; // Set the cursor's Y position
                cursor.style.left = `${e.pageX + 15}px`; // Set the cursor's X position
            }
        };

        // Function to handle mouse detection
        const handleMouseEnter = () => {
            body.style.cursor = 'none'; // Hide the default system cursor
            if (cursor) {
                cursor.style.display = 'block'; // Show the custom cursor
            }
        };

        const handleMouseLeave = () => {
            body.style.cursor = 'default'; // Enable the default system cursor
            if (cursor) {
                cursor.style.display = 'none'; // Hide the custom cursor
            }
        };

        // Attach mousemove event listener to track mouse movements
        document.addEventListener('mousemove', handleMouseMove);

        // Detect mouse entering and leaving the window
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup the event listeners when the component unmounts
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div id="cursor" className="cursor" style={{ display: 'none' }}>
            <img src="/cursor.png" alt="cursor" />
        </div>
    );
};

export default CustomCursor;
