import startOfDay from 'date-fns/startOfDay';
import startOfHour from 'date-fns/startOfHour';
import startOfMinute from 'date-fns/startOfMinute';

function roundUpDate(date: Date | number, type: 'day' | 'hour' | 'minute'): Date {
  const newDate = new Date(date);
  const newDateTime = newDate.getTime();
  if (type === 'day' && startOfDay(newDate).getTime() !== newDateTime) {
    newDate.setHours(0, 0, 0, 0);
    newDate.setDate(newDate.getDate() + 1);
  } else if (type === 'hour' && startOfHour(newDate).getTime() !== newDateTime) {
    newDate.setHours(newDate.getHours() + 1, 0, 0, 0);
  } else if (type === 'minute' && startOfMinute(newDate).getTime() !== newDateTime) {
    newDate.setMinutes(newDate.getMinutes() + 1, 0, 0);
  }

  return newDate;
}

function roundDownDate(date: Date | number, type: 'day' | 'hour' | 'minute'): Date {
  const newDate = new Date(date);
  const newDateTime = newDate.getTime();
  if (type === 'day' && startOfDay(newDate).getTime() !== newDateTime) {
    newDate.setHours(0, 0, 0, 0);
    newDate.setDate(newDate.getDate());
  } else if (type === 'hour' && startOfHour(newDate).getTime() !== newDateTime) {
    newDate.setHours(newDate.getHours(), 0, 0, 0);
  } else if (type === 'minute' && startOfMinute(newDate).getTime() !== newDateTime) {
    newDate.setMinutes(newDate.getMinutes(), 0, 0);
  }

  return newDate;
}

export { roundUpDate, roundDownDate };
