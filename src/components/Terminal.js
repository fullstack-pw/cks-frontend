const Terminal = ({ terminalUrl }) => {
    if (!terminalUrl) return null;

    return (
        <iframe
            src={terminalUrl}
            className="w-full h-full border-0 bg-black"
            allow="clipboard-write; clipboard-read"
        />
    );
};

export default Terminal;
