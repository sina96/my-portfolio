import React, { useState } from "react";
import styles from "./ProfileCard.module.css";
import { FcPlus,  FcMinus  } from "react-icons/fc";

function ProfileCard(props) {
  const [response, setResponse] = useState("");
  
  return (
    <div className={styles.cardContainer}>
      
      <h1 className={styles.boldText}>
        {props.header}<br></br> <span className={styles.normalText}>{props.underHeaderTxt}</span>
      </h1>
      <h2 className={styles.normalText}>{props.text1}</h2>
      <h2 className={styles.normalText}>{props.text2}</h2>
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
          <h2 className={styles.smallerText}>I do anything for you</h2>
        </div>
        <div className={styles.followers}>
          <h1 className={styles.boldText}>
              <FcMinus />
          </h1>
          <h2 className={styles.smallerText}>i love u a little too much</h2>
        </div>
        <div className={styles.followers}>
          <h1 className={styles.boldText}>
              <FcMinus />
          </h1>
          <h2 className={styles.smallerText}>obsessed w you</h2>
        </div>
      </div>
      <h2 className={styles.normalText}>{props.city}</h2>
      <h2 className={styles.normalText}>{props.city}</h2>
      <h2 className={styles.normalText}>{props.city}</h2>
    </div>
  );
}

export default ProfileCard;
