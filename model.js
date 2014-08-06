/* global data, delapouite */
// prepare data

// remove april fool
delete data.languages['en-PI'];
delete data.languages['xx-LC'];
delete data.languages['xx-ZB'];

// main counter
var total = {
	releasedCourses: data.directions.length,
	coursesCount: 0,
	phases: {
		1: 0,
		2: 0,
		3: 0,
		// phase 4 is a finished tree
		4: 0
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
	total.phases[dir.phase] += 1;
});

// total xp and levels per lang
var tos = {};
Object.keys(delapouite).forEach(function(from) {
	Object.keys(delapouite[from]).forEach(function(to) {
		var dela = delapouite[from][to];
		var course = courses[from][to];
		if (!tos[to]) {
			tos[to] = {
				totalXp: 0,
				currentXp: 0,
				ceilXp: 0,
				currentLevel: 0
			};
			total.xp += +dela.xp;
		}
		if (+tos[to].totalXp < dela.xp) {
			tos[to].totalXp = dela.xp;
		}
		if (dela.currentLevel) {
			tos[to].currentXp = dela.levelProgress.split('/')[0];
			tos[to].ceilXp = dela.levelProgress.split('/')[1];
			tos[to].currentLevel = dela.currentLevel;
		}

		// augment course
		course.finished = dela.finished;
		course.total = dela.total;
		course.gold = dela.gold;
		course.words = dela.words;
		course.date = dela.date;

		// augment total
		if (course.finished === course.total) {
			total.phases[4] += 1;
		}
		total.finished += dela.finished;
		total.total += dela.total;
		total.gold += dela.gold;
	});
});

// reorder langs
var langs = Object.keys(data.languages);
langs.sort(function(a, b) {
	var aLength = courses[a] ? Object.keys(courses[a]).length : 0;
	var bLength = courses[b] ? Object.keys(courses[b]).length : 0;
	var aXp = tos[a] && tos[a].totalXp ? tos[a].totalXp : 0;
	var bXp = tos[b] && tos[b].totalXp ? tos[b].totalXp : 0;
	return (aLength * 1e6 + aXp) - (bLength * 1e6 + bXp);
});
langs.reverse();

total.coursesCount = langs.length * (langs.length - 1);
