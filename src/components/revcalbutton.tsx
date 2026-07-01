function RevCalAllButton() {
    const handleClick = async () => {
        try {
            const res = await fetch("https://api-amava.up.railway.app/revcalall", {
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
