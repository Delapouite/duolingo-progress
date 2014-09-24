/* global data, user */
// prepare data

// remove april fool
delete data.languages['en-PI'];
delete data.languages['xx-LC'];
delete data.languages['xx-ZB'];

// 2 structures for courses
var courses = {
	// alias from duo incubator
	list: data.directions,
	tree: {}
};

// main counters
var total = {
	froms: {},
	tos: {},
	xp: 0,
	// skills
	finished: 0,
	total: 0,
	gold: 0
};

// augment courses list and build courses tree
courses.list.forEach(function(course) {
	// aliases
	var from = course.from = course.from_language_id;
	var to = course.to = course.learning_language_id;

	// prepare tos
	if (!total.froms[from]) {
		total.froms[from] = {
			totalXp: 0,
			bestLevel: 0
		};
	}
	if (!total.tos[to]) {
		total.tos[to] = {
			totalXp: 0,
			bestLevel: 0
		};
	}

	// fuse user data
	if (user[from] && user[from][to]) {
		var u = user[from][to];
		// skills
		course.finished = u.finished;
		course.total = u.total;
		course.gold = u.gold;
		// all skills finished
		if (course.finished && course.finished === course.total) {
			course.completed = true;
		}

		// levels
		course.currentLevel = u.currentLevel;
		course.xp = u.xp;
		course.currentXp = u.currentXp;
		course.ceilXp = u.ceilXp;

		course.words = u.words;
		course.date = u.date;

		// lang totals
		total.froms[from].totalXp += +u.xp;
		total.tos[to].totalXp += +u.xp;
		if (+u.currentLevel > total.froms[from].bestLevel) {
			total.froms[from].bestLevel = +u.currentLevel;
		}
		if (+u.currentLevel > total.tos[to].bestLevel) {
			total.tos[to].bestLevel = +u.currentLevel;
		}

		// skills
		total.finished += u.finished;
		total.total += u.total;
		total.gold += u.gold;
		total.xp += +u.xp;
	}

	// build tree

	// 1 lvl branch
	var fromCourses = courses.tree[from];
	if (!fromCourses) {
		fromCourses = {};
	}

	// 2 lvl branch
	fromCourses[to] = course;
	courses.tree[from] = fromCourses;
});

// reorder langs
var langs = Object.keys(data.languages);
langs.sort(function(a, b) {
	var aLength = courses.tree[a] ? Object.keys(courses.tree[a]).length : 0;
	var bLength = courses.tree[b] ? Object.keys(courses.tree[b]).length : 0;
	var aXp = total.tos[a] && total.tos[a].totalXp ? total.tos[a].totalXp : 0;
	var bXp = total.tos[b] && total.tos[b].totalXp ? total.tos[b].totalXp : 0;
	// weight
	return (aLength * 1e6 + aXp) - (bLength * 1e6 + bXp);
});
langs.reverse();
