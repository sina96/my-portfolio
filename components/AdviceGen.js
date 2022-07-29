import React, { useState, useEffect } from "react";
import axios from "axios";

function AdviceGen() {
  const [advice, setAdvice] = useState("");
  useEffect(() => {
    // Run! Like go get some data from an API.
    axios
      .get("https://api.adviceslip.com/advice")
      .then((response) => {
        setAdvice(response.data.slip.advice);
      })

      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      {advice.length != 0 ? (
        <div className="quoteContainer">
          <h5>Random Advice:</h5>
          <p className="quote">{advice}</p>
        </div>
      ) : (
        <p></p>
      )}
      
    </>
  );
}

export default AdviceGen;
