function RevCalAllButton() {
    const handleClick = async () => {
        try {
            const res = await fetch("http://localhost:51483/revcalall", {
                method: "POST"
            });
            const data = await res.json();
            console.log("Revenue Calc Results:", data);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        <button onClick={handleClick}>
            Calculate Revenue for All
        </button>
    );
}

export default RevCalAllButton;
