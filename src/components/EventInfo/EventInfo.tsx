import React, { useState } from 'react';
import dayjs from 'dayjs';
import sv from 'dayjs/locale/sv';
import Countdown from 'react-countdown';

interface EventInfoProps {
  gameType: string;
  startTime: string;
}

const EventInfo = ({ gameType, startTime }: EventInfoProps) => {
  // Calculate the difference between start time and current time in milliseconds
  const [timeDifference] = useState<number>(
    dayjs(startTime).diff(dayjs(), 'milliseconds') || 0
  );

  const CountdownRenderer = ({
    days,
    hours,
    minutes,
    seconds,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    return (
      <div className='text-md font-medium'>
        {`${days} ${days === 1 ? 'dag' : 'dagar'} 
          ${hours} ${hours === 1 ? 'timme' : 'timmar'} 
          ${minutes} ${minutes === 1 ? 'minut' : 'minuter'} 
          ${seconds} ${seconds === 1 ? 'sekund' : 'sekunder'}
        `}
      </div>
    );
  };

  return (
    <div className='flex flex-col items-center p-4 space-y-2'>
      <h1 className='text-4xl font-normal capitalize'>{gameType}</h1>
      <h2 className='text-2xl font-normal capitalize'>
        {dayjs(startTime).locale(sv).format('dddd HH:mm')}
      </h2>
      <Countdown
        date={Date.now() + timeDifference}
        renderer={CountdownRenderer}
        className='text-md font-medium'
      />
    </div>
  );
};

export default EventInfo;
