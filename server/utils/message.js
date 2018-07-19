const moment = require('moment');

const generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment(moment().valueOf()).format('h:mm a')
    }
}
const generateLocationMessage = (from, lt, ln) => {
    return {
        from,
        url: `https://www.google.com/maps?q=${lt}${ln}`,
        createdAt: moment(moment().valueOf()).format('h:mm a')
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}