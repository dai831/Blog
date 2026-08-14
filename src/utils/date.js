import dayjs from 'dayjs';

// 日期的转化
export default function formattedDate(isoString) {
    return dayjs(isoString).format('YYYY-MM-DD HH:mm:ss');
}

