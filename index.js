require('cross-fetch/polyfill');
const fs = require('fs');
const { Api, MobileApi, Sport } = require('endomondo-api-handler');
const { DateTime } = require('luxon');
const util = require('util');

const api = new Api();
const mobileApi = new MobileApi();

// FILL YOUR CREDINTIONALS !!!
const email = 'YOUR-EMAIL';
const passwd = 'YOUR-PASSWORD';

const baseDir = './tracks';

const createSubDir = (subDir) => {
    const path = baseDir + '/' + subDir; 
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

(async () => {
    await Promise.all([
        api.login(email, passwd),
        mobileApi.login(email, passwd),
    ]);

    const filter = {    
        sport: Sport.RUNNING,
        after: DateTime.fromISO('2016-01-01T00:00:00.000'),
        before: DateTime.fromISO('2020-12-31T23:59:59.999')
    }
    await api.processWorkouts(filter, async (workout) => {
        console.log(workout.toString());
        const year = workout.getStart().year.toString();
        const month = workout.getStart().month.toString().padStart(2, '0');
        const day = workout.getStart().day.toString().padStart(2, '0');
        const id = workout.getId().toString();
        if (workout.hasGPSData()) {
            createSubDir(year);
            createSubDir(year + '/' + month);
            const fileName = util.format('%s-%s-%s-%s', year, month, day, id);
            fs.writeFileSync(`${baseDir}/${year}/${month}/${fileName}.gpx`, await api.getWorkoutGpx(workout.getId()), 'utf8');
            fs.writeFileSync(`${baseDir}/${fileName}.gpx`, await api.getWorkoutGpx(workout.getId()), 'utf8');
        }
    });
})();