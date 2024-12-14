import { useEffect, useRef, useState } from "react"

function MagnifierFlat({ loading }: { loading: boolean }) {
    const [animationTrigger, setAnimationTrigger] = useState("");
    const [animationState, setAnimationState] = useState("");
    const iconRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (loading && iconRef.current) {
            setAnimationTrigger('loop');
            setAnimationState('loop-spin');
            const mouseEnterEvent = new MouseEvent("mouseenter", {
                bubbles: true,
                cancelable: true,
            });
            setTimeout(() => {
                iconRef.current.dispatchEvent(mouseEnterEvent);
            }, 100)
        } else {
            setAnimationTrigger('');
            setAnimationState('');
        }
    }, [loading])

    return (
        <lord-icon
            ref={iconRef}
            src="https://cdn.lordicon.com/yudxjmzy.json"
            trigger={animationTrigger}
            {...(animationState && { state: animationState })}
            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
        ></lord-icon>
    )
}

export default MagnifierFlat