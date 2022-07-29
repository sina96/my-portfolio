import React from "react";
import styles from "./ProfileCard.module.css";
import { FaGithub } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { IoLogoWhatsapp, IoLogoLinkedin } from "react-icons/io";

function ProfileCard(props) {
  return (
    <div className={styles.cardContainer}>
      <header>
        <img src="/assets/avatar-bw.jpg" alt={props.name} />
      </header>
      <h1 className={styles.boldText}>
        {props.name} <span className={styles.normalText}>{props.age}</span>
      </h1>
      <h2 className={styles.normalText}>{props.occupation}</h2>
      <h2 className={styles.normalText}>{props.city}</h2>
      <div className={styles.socialContainer}>
        <div className={styles.followers}>
          <h1 className={styles.boldText}>
            <a href="https://www.linkedin.com/in/sina-bastani" target="_blank" rel="noopener noreferrer">
              <IoLogoLinkedin />
            </a>
          </h1>
          <h2 className={styles.smallerText}>Linkedin</h2>
        </div>
        <div className={styles.followers}>
          <h1 className={styles.boldText}>
            <a href="mailto:sina.bastani@zingtongroup.com?cc=s.bastani96@gmail.com" target="_blank" rel="noopener noreferrer">
              <MdMail />
            </a>
          </h1>
          <h2 className={styles.smallerText}>Mail</h2>
        </div>
        <div className={styles.followers}>
          <h1 className={styles.boldText}>
            <a href="https://wa.me/46700128299" target="_blank" rel="noopener noreferrer">
              <IoLogoWhatsapp />
            </a>
          </h1>
          <h2 className={styles.smallerText}>Whatsapp</h2>
        </div>
        <div className={styles.likes}>
          <h1 className={styles.boldText}>
            <a href="https://github.com/sina96" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
          </h1>
          <h2 className={styles.smallerText}>Github</h2>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
