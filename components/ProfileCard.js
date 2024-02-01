import React, { useState, useEffect } from "react";
import styles from "./ProfileCard.module.css";
import { FcPlus, FcMinus } from "react-icons/fc";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";

function ProfileCard(props) {
  const [response, setResponse] = useState("");
  const [noBtnClickedCount, setNoBtnClickedCount] = useState(0);

  useEffect(() => {
    console.log(response);
  }, [response]);

  useEffect(() => {
    console.log(noBtnClickedCount);
  }, [noBtnClickedCount]);

  const handleYesBtnClicked = () => {
    setResponse("YES");
    setNoBtnClickedCount(0);
  };

  const handleNoBtnClicked = () => {
    setResponse("NO");
    setNoBtnClickedCount((prev) => prev + 1);
  };

  return (
    <div className={styles.cardContainer}>
      {response === "" && (
        <>
          <h1 className={styles.boldText}>
            Anita Fakhari
            <br></br> <span className={styles.normalText}>my one and only</span>
          </h1>
          <h2 className={styles.normalText}>Will You be my valentine?</h2>
          <Image src="/assets/proposal-cat.jpg" fluid />
          <h2 className={styles.normalText}>Do you need pros and cons?</h2>
          <div className={styles.socialContainer}>
            <div className={styles.followers}>
              <h1 className={styles.boldText}>
                <FcPlus />
              </h1>
              <h2 className={styles.smallerText}>i loooove you</h2>
            </div>
            <div className={styles.followers}>
              <h1 className={styles.boldText}>
                <FcPlus />
              </h1>
              <h2 className={styles.smallerText}>gib massagies</h2>
            </div>
            <div className={styles.followers}>
              <h1 className={styles.boldText}>
                <FcMinus />
              </h1>
              <h2 className={styles.smallerText}>obsessed w you too much</h2>
            </div>
            <div className={styles.followers}>
              <h1 className={styles.boldText}>
                <FcMinus />
              </h1>
              <h2 className={styles.smallerText}>am a poopoohead</h2>
            </div>
          </div>
          <h2 className={styles.normalText}>Pretty please?</h2>
        </>
      )}

      {response === "NO" && noBtnClickedCount === 1 && (
        <>
          <h1 className={styles.boldText}>
            Anita Fakhari
            <br></br> <span className={styles.normalText}>my one and only</span>
          </h1>
          <h2 className={styles.normalText}>ಠ_ಠ</h2>
          <h2 className={styles.normalText}>
            That no btn is just fake, you misclicked right?
          </h2>
          <Image src="/assets/angry-cat-meme.gif" fluid />
          <h2 className={styles.normalText}>here pick again </h2>
        </>
      )}

      {response === "NO" && noBtnClickedCount === 2 && (
        <>
          <h1 className={styles.boldText}>
            Anita Fakhari
            <br></br> <span className={styles.normalText}>my one and only</span>
          </h1>
          <h2 className={styles.normalText}>(;﹏;)</h2>
          <h2 className={styles.normalText}>
            Baby are you really saying no????
          </h2>
          <Image src="/assets/dog-trist.gif" fluid />
          <h2 className={styles.normalText}>dont forget how much i love you</h2>
        </>
      )}

      {response === "NO" && noBtnClickedCount >= 3 && (
        <>
          <h1 className={styles.boldText}>
            Anita Fakhari
            <br></br> <span className={styles.normalText}>my one and only</span>
          </h1>
          <h2 className={styles.normalText}>(ಥ﹏ಥ)</h2>
          <h2 className={styles.normalText}>nooooo bbyy please say yessssss</h2>
          <Image src="/assets/banana-cat-cry.gif" fluid />
          <h2 className={styles.normalText}>
            Imma sit here and cry until i get a yes
          </h2>
        </>
      )}

      {response === "YES" && (
        <>
          <h1 className={styles.boldText}>
            Anita Fakhari
            <br></br> <span className={styles.normalText}>my one and only</span>
          </h1>
          <h2 className={styles.normalText}>♡ヾ(●ω●)ノ♡</h2>
          <h2 className={styles.normalText}>omg babyy i am the luckiest!!!!</h2>
          <Image src="/assets/happy-cat-happy-happy-cat.gif" fluid />
          <h2 className={styles.normalText}>
            love you so much my prettiest valentine!!
          </h2>
          <h2 className={styles.normalText}>
           see you soon eshgham mwah ❤️
          </h2>
        </>
      )}

      {response != "YES" && (
        <>
          <div className={styles.socialContainer}>
            <div className={styles.followers}>
              <Button variant="success" onClick={() => handleYesBtnClicked()}>
                YES!!!!!
              </Button>{" "}
            </div>
            <div className={styles.followers}>
              <Button variant="danger" onClick={() => handleNoBtnClicked()}>
                no ew lol
              </Button>{" "}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileCard;
