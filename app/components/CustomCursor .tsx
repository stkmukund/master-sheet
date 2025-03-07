'use client'
import { useEffect } from 'react';

const CustomCursor: React.FC = () => {
    useEffect(() => {
        const cursor = document.getElementById('cursor') as HTMLElement; // TypeScript cast to HTMLElement

        const handleMouseMove = (e: MouseEvent) => { // MouseEvent type for event
            if (cursor) {
                cursor.style.top = `${e.pageY + 10}px`; // Set the cursor's Y position
                cursor.style.left = `${e.pageX + 20}px`; // Set the cursor's X position
            }
        };

        // Attach mousemove event listener when component mounts
        document.addEventListener('mousemove', handleMouseMove);

        // Cleanup the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <div id="cursor" className="cursor">
        <img src="/cursor.png" alt="cursor" />
    </div>;
};

export default CustomCursor;
