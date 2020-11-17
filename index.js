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

(async () => {
    await Promise.all([
        api.login(email, passwd),
        mobileApi.login(email, passwd),
    ]);
    const res = await api.get('rest/session');    
    console.log('user-session', res);

    const { workouts } = await api.getWorkouts({
        after: DateTime.fromObject({
            year: 2020,
            month: 11,
            day: 1,
        }),
        limit: 10,
    });
    console.log(workouts);

    const filter = {    
        sport: Sport.RUNNING,
        after: DateTime.fromISO('2020-10-01T00:00:00.000'),
        before: DateTime.fromISO('2020-12-31T23:59:59.999')
    }
    await api.processWorkouts(filter, async (workout) => {
        console.log(workout.toString());
        if (workout.hasGPSData()) {
            const fileName = util.format('%s-%s-%s-%s',
                workout.getStart().year.toString(),
                workout.getStart().month.toString().padStart(2, '0'),
                workout.getStart().day.toString().padStart(2, '0'),
                workout.getId().toString()
            );
            fs.writeFileSync(`tracks/${fileName}.gpx`, await api.getWorkoutGpx(workout.getId()), 'utf8');
            // fs.writeFileSync(`tmp/${workout.getId()}.gpx`, await api.getWorkoutGpx(workout.getId()), 'utf8');
        }
    });

    // await api.processWorkouts({}, async (workout) => {
    //     console.log(workout.toString());
    //     if (workout.hasGPSData()) {
    //         fs.writeFileSync(`tmp/${workout.getId()}.gpx`, await api.getWorkoutGpx(workout.getId()), 'utf8');
    //     }
    // });

})();

// await api.processWorkouts({
//     sport: SPORTS.RUNNING,
//     after: DateTime.fromISO('2017-01-01T00:00:00.000'),
//     before: DateTime.fromISO('2017-12-31T23:59:59.999'),
// }, (workout) => {
//     ...
// });

// (async () => {
//     await api.login(LOGIN, PASSWORD);
//     await api.processWorkouts({}, (workout) => {
//         console.log(workout.toString());
//         if (workout.hasGPSData()) {
//             fs.writeFileSync(`tmp/${workout.getId()}.gpx`, workout.toGpx(), 'utf8');
//         }
//     });
// })();