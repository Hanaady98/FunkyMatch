const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    width: "100&",
    backgroundColor: "ffffff", // Light blue background
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  p1: {
    height: "80%",
    width: "90%",
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "row",
    margin: "auto",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Ubuntu', sans-serif",
    flexWrap: "wrap",
  },
  d1: {
    height: "100%",
    width: "35%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  d2: {
    height: "100%",
    width: "65%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  sub: {
    height: "20%",
    width: "90%",
    backgroundColor: "antiquewhite",
    borderRadius: "10px",
    display: "flex",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    boxShadow:
      "6px 6px 10px -1px rgba(0,0,0,0.15), -6px -6px 10px -1px rgba(0, 0, 0, 0.7)",
  },
  info: {
    height: "92%",
    width: "95%",
    backgroundColor: "antiquewhite",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    justifyContent: "space-evenly",
    boxShadow:
      "6px 6px 10px -1px rgba(0,0,0,0.15), -6px -6px 10px -1px rgba(0, 0, 0, 0.7)",
  },
  cir: {
    height: "100%",
    width: "35%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: "60px",
    width: "60px",
    border: "2px solid rgb(101, 100, 100)",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.6em",
    backgroundColor: "rgb(173, 216, 230)", // Light blue background
  },
  content: {
    height: "100%",
    width: "65%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "black",
  },
  head: {
    fontSize: "15px",
    fontWeight: 800,
  },
  about: {
    fontSize: "12px",
    fontWeight: 500,
    color: "rgb(84, 83, 83)",
  },
  title: {
    fontSize: "17px",
    fontWeight: 800,
  },
  words: {
    fontSize: "13px",
    fontWeight: 400,
    color: "grey",
  },
  inputRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontFamily: "'Ubuntu', sans-serif",
    color: "rgb(100, 149, 237)", // Light blue text color
    fontWeight: 600,
    border: "2px solid rgb(173, 216, 230)", // Light blue border
    borderRadius: "10px",
    marginBottom: "10px",
    width: "100%",
  },
  full: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  button: {
    height: "40px",
    width: "140px",
    borderRadius: "500px",
    border: "none",
    backgroundColor: "rgb(100, 149, 237)", // Light blue background
    fontWeight: 600,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    boxShadow: "3px 3px 8px rgba(0, 0, 0, 0.2)", // Added box shadow
  },
  credit: {
    color: "#121212",
    textAlign: "center",
    marginTop: "10px",
    fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
  },
  heart: {
    color: "#000",
    fontSize: "20px",
  },
  link: {
    textDecoration: "none",
    color: "#121212",
    fontWeight: 800,
  },
  icon: {
    fontSize: "1.6em",
  },
};

// Media queries for responsiveness
const mediaQueries = `
  @media (max-width: 900px) {
    .p1 {
      flex-direction: column;
      height: auto;
      width: 90%;
    }
    .d1, .d2 {
      width: 100%;
    }
    .sub {
      width: 100%;
      margin-bottom: 20px;
    }
    .inputRow {
      flex-direction: column;
    }
    .inputRow input {
      width: 100%;
    }
  }
`;

// Add media queries to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = mediaQueries;
document.head.appendChild(styleSheet);

export default styles;
