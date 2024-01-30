import React from "react";
import ProfileCard from "./ProfileCard";

function TopComponent() {
  return (
    <>
      <div className="header">
        {/*<!--Content before waves--> */}
        <div className="inner-header flex">
          <ProfileCard
            header="Anita Fakhari"
            underHeaderTxt="my one and only"
            text1="Will You be my valentine?"
            text2="Do you need pros and cons?"
            city="Stockholm"
            followers="80K"
            likes="803K"
            photos="1.4K"
          ></ProfileCard>
        </div>

        {/*<!--Waves Container--> */}
      </div>
      {/*<!--Header ends--> */}

      {/*<!--Content starts--> */}
      
      {/*<!--Content ends--> */}
    </>
  );
}

export default TopComponent;
