/* global data, user */
// prepare data

// remove april fool
delete data.languages['en-PI'];
delete data.languages['xx-LC'];
delete data.languages['xx-ZB'];

// main counter
var total = {
	releasedCourses: data.directions.length,
	coursesCount: 0,
	tos: {},
	phases: {
		// incubator phases
		1: 0,
		2: 0,
		3: 0,
		// started tree
		4: 0,
		// finished tree
		5: 0
	},
	xp: 0,
	// skills
	finished: 0,
	total: 0,
	gold: 0
};

// data from duo incubator
var courses = {};
data.directions.forEach(function(dir) {
	var from = dir.from_language_id;
	var to = dir.learning_language_id;

	var fromCourses = courses[from];
	if (!fromCourses) {
		fromCourses = {};
	}
	fromCourses[to] = dir;
	courses[from] = fromCourses;
	// incubator phases
	total.phases[dir.phase] += 1;
});

// total xp and levels per lang
Object.keys(user).forEach(function(from) {
	Object.keys(user[from]).forEach(function(to) {
		var u = user[from][to];
		var course = courses[from][to];
		if (!total.tos[to]) {
			total.tos[to] = {
				totalXp: 0,
				currentXp: 0,
				ceilXp: 0,
				currentLevel: 0
			};
			total.xp += +u.xp;
		}
		if (+total.tos[to].totalXp < u.xp) {
			total.tos[to].totalXp = u.xp;
		}
		if (u.currentLevel) {
			total.tos[to].currentXp = u.levelProgress.split('/')[0];
			total.tos[to].ceilXp = u.levelProgress.split('/')[1];
			total.tos[to].currentLevel = u.currentLevel;
		}

		// augment course
		course.finished = u.finished;
		course.total = u.total;
		course.gold = u.gold;
		course.words = u.words;
		course.date = u.date;

		// augment total
		total.phases[4] += 1;
		if (course.finished === course.total) {
			total.phases[5] += 1;
		}
		total.finished += u.finished;
		total.total += u.total;
		total.gold += u.gold;
	});
});

// reorder langs
var langs = Object.keys(data.languages);
langs.sort(function(a, b) {
	var aLength = courses[a] ? Object.keys(courses[a]).length : 0;
	var bLength = courses[b] ? Object.keys(courses[b]).length : 0;
	var aXp = total.tos[a] && total.tos[a].totalXp ? total.tos[a].totalXp : 0;
	var bXp = total.tos[b] && total.tos[b].totalXp ? total.tos[b].totalXp : 0;
	// weight
	return (aLength * 1e6 + aXp) - (bLength * 1e6 + bXp);
});
langs.reverse();

total.coursesCount = langs.length * (langs.length - 1);
