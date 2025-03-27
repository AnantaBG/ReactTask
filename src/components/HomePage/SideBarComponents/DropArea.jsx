/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Card } from "flowbite-react";
import { useState } from "react";

const DropArea = ({ onDrop, targetCategory, children }) => {
    const [isHovering, setIsHovering] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedItemId = e.dataTransfer.getData('taskId');
        onDrop(targetCategory);
        setIsHovering(false); // Reset hover state after drop
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsHovering(true); // Set hover state when dragging over
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsHovering(false); // Reset hover state when dragging leaves
    };


    const cardStyle = {
        transition: "transform 0.2s ease-in-out", // Smooth transition
        transform: isHovering ? "scale(1.05)" : "scale(0.95)", // Scale up on hover
    };

    return (
        <Card className="md:max-h-20" style={cardStyle}> {/* Apply dynamic style */}
            <div
                className="border-dashed border-2 rounded p-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave} // Add onDragLeave
            >
                {children}
            </div>
        </Card>
    );
};

export default DropArea;