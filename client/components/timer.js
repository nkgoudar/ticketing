import { useEffect, useState } from "react";

const Timer = ({expiryTime, expiredMessage}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(expiryTime) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);


  if (expiredMessage && timeLeft < 0) {
    return <div>{expiredMessage}</div>;
  }
  
  return <span>
    {timeLeft >= 0 ? timeLeft : 0}
  </span>
}

export default Timer;