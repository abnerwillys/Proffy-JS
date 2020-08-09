const Database = require('./database/db')

const { subjects, weekdays, getSubject, convertHoursToMinutes } = require('./usefuls/format')

function pageLanding(request, response) {
  return response.render('index.html')
}

async function pageStudy(request, response) {
  const filters = request.query

  if (!filters.subject || !filters.weekday || !filters.time) {
    return response.render('study.html', { filters, subjects, weekdays })
  }
  
  const timeToMinutes = convertHoursToMinutes(filters.time)

  const query = `
    SELECT classes.*, proffys.*
    FROM proffys
    JOIN classes ON (classes.proffy_id = proffys.id)
    WHERE EXISTS (
      SELECT class_schedule.*
      FROM class_schedule
      WHERE class_schedule.class_id = classes.id
      AND class_schedule.weekday = ${filters.weekday}
      AND class_schedule.time_from <= ${timeToMinutes}
      AND class_schedule.time_to > ${timeToMinutes}
    )
    AND classes.subject = ${filters.subject}
  `

  try {
    const db = await Database
    const proffys = await db.all(query)

    proffys.map((proffy) => {
      proffy.subject = getSubject(proffy.subject)
    })

    return response.render('study.html', { proffys, filters, subjects, weekdays })
  
  } catch (error) {
    console.log(error)
  }
}

function pageGiveClasses(request, response) {
  return response.render('give-classes.html', { subjects, weekdays })
}

async function saveClasses(request, response) {
  const createProffy = require('./database/createProffy')
  
  const {
    name,
    avatar,
    whatsapp,
    bio,
    subject,
    cost,
    weekday,
    time_from,
    time_to,
  } = request.body
  
  const proffyValue = {
    name,
    avatar,
    whatsapp,
    bio,
  }

  const classValue = {
    subject,
    cost,
  }

  const classScheduleValues = weekday.map((weekday, index) => {
    return {
      weekday,
      time_from: convertHoursToMinutes(time_from[index]),
      time_to: convertHoursToMinutes(time_to[index])
    }
  })

  try {
    const db = await Database
    await createProffy(db, { proffyValue, classValue, classScheduleValues })
    
    let queryString = "?subject=" + subject
    queryString += "&weekday=" + weekday[0]
    queryString += "&time=" + time_from[0]

    return response.redirect('/study' + queryString)
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  pageLanding,
  pageStudy,
  pageGiveClasses,
  saveClasses
}