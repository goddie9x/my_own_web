const Schedule = require('../models/Schedule');
const { multipleMongooseToObjects, mongooseToObject } = require('../../utils/mongoose');

class ScheduleController {
    index(req, res, next) {
        Schedule.find({}).sort({ dayOfWeek: "asc", partOfDay: "asc" })
            .then(schedules => {
                schedules = multipleMongooseToObjects(schedules);

                schedules = schedules.map(function(schedule) {
                    let dayStart = new Date(schedule.dayStart);
                    let dayEnd = new Date(schedule.dayEnd);

                    schedule.dayStart = `${dayStart.getDate()}/${dayStart.getMonth()}/${dayStart.getFullYear()}`;
                    schedule.dayEnd = `${dayEnd.getDate()}/${dayEnd.getMonth()}/${dayEnd.getFullYear()}`;
                    return schedule;
                });
                res.render('schedules/stored', { schedules });
            })
            .catch(next);
    }
    create(req, res, next) {
        res.render('schedules/create');
    }
    stored(req, res, next) {
        let rawSchedule = {...req.body };
        let dayOfWeek = rawSchedule.dayOfWeek;
        let schedules = [];

        if (Array.isArray(dayOfWeek)) {
            let temp = {...rawSchedule };
            dayOfWeek.forEach((day) => {
                temp.dayOfWeek = day;
                temp.dayStart = Date.parse(temp.dayStart);
                temp.dayEnd = Date.parse(temp.dayEnd);
                schedules.push(temp);
            });
        } else {
            rawSchedule.dayStart = Date.parse(rawSchedule.dayStart);
            rawSchedule.dayEnd = Date.parse(rawSchedule.dayEnd);

            schedules.push(rawSchedule);
        }

        Schedule.insertMany(schedules)
            .then(() => {
                res.redirect('/schedules/stored');
            })
            .catch(next);
    }
    manager(req, res, next) {
        Schedule.find({}).sort({ dayOfWeek: "asc", partOfDay: "asc" })
            .then(schedules => {
                schedules = multipleMongooseToObjects(schedules);

                schedules = schedules.map(function(schedule) {
                    let dayStart = new Date(schedule.dayStart);
                    let dayEnd = new Date(schedule.dayEnd);

                    schedule.dayStart = `${dayStart.getDate()}/${dayStart.getMonth()}/${dayStart.getFullYear()}`;
                    schedule.dayEnd = `${dayEnd.getDate()}/${dayEnd.getMonth()}/${dayEnd.getFullYear()}`;
                    return schedule;
                });
                res.render('schedules/manager', { schedules });
            })
            .catch(next);
    }
    modify(req, res, next) {
        let id = req.params.id;
        Schedule.findOne({ '_id': id })
            .then(schedule => {

                res.render('schedules/modify', mongooseToObject(schedule));
            })
            .catch(next);
    }
    delete(req, res, next) {
        let id = req.params.id;
        Schedule.delete({ '_id': id })
            .then(() => {
                res.redirect('/schedules/stored');
            })
            .catch(next);
    }
    update(req, res, next) {
        let id = req.params.id;
        let rawSchedule = {...req.body };
        let dayOfWeek = rawSchedule.dayOfWeek;

        if (Array.isArray(dayOfWeek)) {
            let schedules = [];
            let temp = {...rawSchedule };

            dayOfWeek.forEach((day, index) => {
                if (index == 0) {
                    temp._id = id;
                    temp.dayOfWeek = day;
                    temp.dayStart = Date.parse(temp.dayStart);
                    temp.dayEnd = Date.parse(temp.dayEnd);
                } else {
                    delete temp._id;
                    temp.dayOfWeek = day;
                    temp.dayStart = Date.parse(temp.dayStart);
                    temp.dayEnd = Date.parse(temp.dayEnd);
                    schedules.push(temp);
                }
                let updateASchedule = Schedule.updateOne(schedules[0]._id, schedules[0]);
                let createSchedules = Schedule.insertMany(schedules);
                Promise.all(updateASchedule, createSchedules)
                    .then(() => {
                        res.redirect('/schedules/stored');
                    })
                    .catch(next);
            });
        } else {
            rawSchedule.dayStart = Date.parse(rawSchedule.dayStart);
            rawSchedule.dayEnd = Date.parse(rawSchedule.dayEnd);

            Schedule.updateOne({ '_id': id }, rawSchedule)
                .then(() => {
                    res.redirect('/schedules/stored');
                })
                .catch(next);
        }
    }
}

module.exports = new ScheduleController