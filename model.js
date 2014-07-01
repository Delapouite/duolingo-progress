// prepare data

// remove april fool
delete data.languages['en-PI'];
delete data.languages['xx-LC'];
delete data.languages['xx-ZB'];

var phases = {
	1: 0,
	2: 0,
	3: 0,
	// phase 4 is a finished tree
	4: 0
};

var directions = {};
data.directions.forEach(function(dir) {
	var from = directions[dir.from_language_id];
	if (!from) {
		from = {};
	}
	from[dir.learning_language_id] = dir;
	directions[dir.from_language_id] = from;
	phases[dir.phase] += 1;
});

// total xp and levels per lang
var tos = {};
Object.keys(delapouite).forEach(function(from) {
	Object.keys(delapouite[from]).forEach(function(to) {
		var dela = delapouite[from][to];
		var dir = directions[from][to];
		if (!tos[to]) {
			tos[to] = {
				totalXp: 0,
				currentXp: 0,
				ceilXp: 0,
				currentLevel: 0
			};
		}
		if (+tos[to].totalXp < dela.xp) {
			tos[to].totalXp = dela.xp;
		}
		if (dela.currentLevel) {
			tos[to].currentXp = dela.levelProgress.split('/')[0];
			tos[to].ceilXp = dela.levelProgress.split('/')[1];
			tos[to].currentLevel = dela.currentLevel;
		}

		dir.finished = dela.finished;
		dir.total = dela.total;
		dir.gold = dela.gold;
		dir.words = dela.words;
		dir.date = dela.date;
		if (dir.finished === dir.total) {
			phases[4] += 1;
		}
	});
});

// reorder languages
var languages = Object.keys(data.languages);
languages.sort(function(a, b) {
	var aLength = directions[a] ? Object.keys(directions[a]).length : 0;
	var bLength = directions[b] ? Object.keys(directions[b]).length : 0;
	var aXp = tos[a] && tos[a].totalXp ? tos[a].totalXp : 0;
	var bXp = tos[b] && tos[b].totalXp ? tos[b].totalXp : 0;
	return (aLength * 1e6 + aXp) - (bLength * 1e6 + bXp);
});
languages.reverse();

var totalCombos = languages.length * (languages.length - 1);
