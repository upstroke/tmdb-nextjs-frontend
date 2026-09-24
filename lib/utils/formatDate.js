/**
 * Checks whether a value consists exclusively of digits and optionally has a fixed length.
 *
 * @param {string} value - String to check.
 * @param {number} [expectedLength] - Expected length.
 * @returns {boolean}
 */
function isDigits(value, expectedLength) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (expectedLength !== undefined && value.length !== expectedLength) return false;
  return [...value].every((char) => char >= '0' && char <= '9');
}

/**
 * Splits an ISO date string into date and optional time components.
 *
 * Only accepts complete ISO dates in the format `YYYY-MM-DD` with optional
 * time component. Incomplete values like `YYYY` or `YYYY-MM` are discarded.
 *
 * @param {string} dateString
 * @returns {{year: number, month: number, day: number, timePart: string | undefined} | null}
 */
function parseIsoDateParts(dateString) {
  if (!dateString.includes('-')) return null;

  const [datePart, timePart] = dateString.split('T');
  const dateSegments = datePart.split('-');

  if (dateSegments.length !== 3) return null;

  const [year, month, day] = dateSegments;

  if (!isDigits(year, 4) || !isDigits(month, 2) || !isDigits(day, 2)) return null;

  const yearNum = Number(year);
  const monthNum = Number(month);
  const dayNum = Number(day);

  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;

  return { year: yearNum, month: monthNum, day: dayNum, timePart };
}

/**
 * Checks whether an optional ISO time component has a valid structure.
 *
 * @param {string | undefined} timePart
 * @returns {boolean}
 */
function isValidTimePart(timePart) {
  if (!timePart) return true;

  const normalizedTime = timePart.endsWith('Z') ? timePart.slice(0, -1) : timePart;

  let timeWithoutZone = normalizedTime;
  const plusIndex = normalizedTime.indexOf('+');
  if (plusIndex > -1) {
    timeWithoutZone = normalizedTime.slice(0, plusIndex);
  } else {
    const lastMinusIndex = normalizedTime.lastIndexOf('-');
    if (lastMinusIndex > 1) {
      timeWithoutZone = normalizedTime.slice(0, lastMinusIndex);
    }
  }

  const timeSegments = timeWithoutZone.split(':');
  if (timeSegments.length < 2 || timeSegments.length > 3) return false;

  const [hours, minutes, secondsWithMs] = timeSegments;
  const seconds = secondsWithMs?.split('.')[0];

  if (
    !isDigits(hours, 2) ||
    !isDigits(minutes, 2) ||
    (seconds !== undefined && !isDigits(seconds, 2))
  ) {
    return false;
  }

  const hoursNum = Number(hours);
  const minutesNum = Number(minutes);
  const secondsNum = seconds !== undefined ? Number(seconds) : 0;

  return (
    hoursNum >= 0 && hoursNum <= 23 &&
    minutesNum >= 0 && minutesNum <= 59 &&
    secondsNum >= 0 && secondsNum <= 59
  );
}

/**
 * Checks whether a parsed Date object exactly matches the original calendar date.
 * Prevents automatic rolling of invalid date values, e.g. `2024-02-30` to `2024-03-01`.
 *
 * @param {Date} date
 * @param {{year: number, month: number, day: number}} parts
 * @returns {boolean}
 */
function isSameCalendarDate(date, parts) {
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() + 1 === parts.month &&
    date.getDate() === parts.day
  );
}

/**
 * Checks whether a string is a strict ISO 8601 date and returns a valid Date object.
 *
 * @param {string} dateString
 * @returns {Date | null}
 */
function parseStrictIsoDate(dateString) {
  const parts = parseIsoDateParts(dateString);
  if (!parts) return null;
  if (!isValidTimePart(parts.timePart)) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  if (!isSameCalendarDate(date, parts)) return null;

  return date;
}

/**
 * Formats a date string depending on the specified locale.
 *
 * Accepts complete ISO dates like `2024-01-15` or `2024-01-15T10:00:00Z`.
 * Invalid or incomplete values like `2024`, `2024-01`, `2024-02-30` are
 * returned unchanged as fallback.
 *
 * @param {string} dateString - Date string in ISO format.
 * @param {string} [locale] - BCP 47 locale, e.g. `de-DE` or `en-US`.
 * @returns {string} Formatted date string or original value as fallback.
 */
export function formatDate(
  dateString,
  locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en-US'
) {
  if (!dateString) return '';

  const isoDate = parseStrictIsoDate(dateString);
  if (isoDate) {
    return new Intl.DateTimeFormat(locale).format(isoDate);
  }

  const fallbackDate = new Date(dateString);
  if (Number.isNaN(fallbackDate.getTime())) return dateString;

  return new Intl.DateTimeFormat(locale).format(fallbackDate);
}
