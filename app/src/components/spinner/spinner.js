import React from "react";

const Spinner = ({ active }) => {
  return (
    <div className={active ? "spinner active" : "spinner"}>
      <div uk-spinner="ration: 3"></div>
    </div>
  );
};

export default Spinner;
