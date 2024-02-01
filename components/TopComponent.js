import React from "react";
import ProfileCard from "./ProfileCard";

function TopComponent() {
  return (
    <>
      <div className="header">
        {/*<!--Content before waves--> */}
        <div className="inner-header flex">
          <ProfileCard />
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
