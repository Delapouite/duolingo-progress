var el = document.createElement.bind(document);
var table = el('table');
var flagsRow = el('tr');
var cornerLegend = el('th');
var legend = el('div');

var createFlagCell = function(lang, top) {
	var flagCell = el('th');
	var flag = el('div');
	flag.alt = flag.title = data.languages[lang].name;
	flag.className = 'flag flag-' + lang;
	flagCell.appendChild(flag);
	if (top) {
		var xp = el('div');
		xp.textContent = (tos[lang] || 0) + 'XP';
		flagCell.appendChild(xp);
	}
	return flagCell;
};

var createCell = function(from, to) {
	var cell = el('td');
	if (from === to) {
		cell.className = 'impossible';
	} else if (directions[from] && directions[from][to]) {
		var dir = directions[from][to];
		cell.className = 'phase' + dir.phase;
		phases[dir.phase] += 1;
		var content = '';
		if (dir.phase === 1) {
			content = 2 * Math.round(dir.progress) + '%<br>';
		}
		if (dir.learner_count) {
			content += dir.learner_count.learner_string + '<br>';
		}
		// personal data
		var p = delapouite[from] && delapouite[from][to];
		if (p) {
			if (p.finished === p.total) {
				cell.className = 'phase4';
				phases[4] += 1;
			}
			content += p.finished + '/' + p.total + '<br>';
			content += p.words + 'w<br>';
		}
		// link
		var cellLink = el('a');
		cellLink.innerHTML = content;
		cellLink.href = 'http://incubator.duolingo.com/courses/' + to + '/' + from + '/status';
		cell.appendChild(cellLink);
	}
	cell.dataset.from = from;
	cell.dataset.to = to;
	return cell;
};

// top header
cornerLegend.innerHTML = 'To ><br>From';
flagsRow.appendChild(cornerLegend);
languages.forEach(function(k) {
	var flagCell = createFlagCell(k, true);
	flagsRow.appendChild(flagCell);
});
table.appendChild(flagsRow);
// body
languages.forEach(function(from) {
	// left header
	var row = el('tr');
	var flagCell = createFlagCell(from);
	row.appendChild(flagCell);
	// cells
	languages.forEach(function(to) {
		var cell = createCell(from, to);
		row.appendChild(cell);
	});
	table.appendChild(row);
});
document.body.appendChild(table);

legend.className = 'legend';
legend.textContent = data.directions.length + '/' + totalCombos + ' combos - Last update: 2014-05-28';
document.body.appendChild(legend);

// legend
Object.keys(phases).forEach(function(phase) {
	var l = el('div');
	l.className = 'legend phase' + phase;
	l.textContent = phases[phase] + ' courses in phase ' + phase;
	document.body.appendChild(l);
});

// symmetrical hover
var hovered, couple;
table.addEventListener('mouseover', function(evt) {
	var target;
	if (evt.target.tagName.toLowerCase() === 'td') {
		target = evt.target;
	} else if (evt.target.tagName.toLowerCase() === 'a') {
		target = evt.target.parentElement;
	}
	if (!target) {
		return;
	}

	if(hovered) {
		couple.classList.remove('highlighted');
		hovered.classList.remove('highlighted');
	}
	hovered = target;
	couple = table.querySelector('td[data-from="' + hovered.dataset.to + '"][data-to="' + hovered.dataset.from + '"]');
	hovered.classList.add('highlighted');
	couple.classList.add('highlighted');
});

Object.keys(delapouite).forEach(function(from) {
	Object.keys(delapouite[from]).forEach(function(to) {
		var p = delapouite[from][to];
		var gold = (p.gold / p.total) * 100;
		var finished = Math.floor(p.finished / p.total * 100);
		var totalBar = el('div');
		var goldBar = el('span');
		goldBar.classList.add('bar', 'phase4');
		goldBar.style.width = gold + '%';
		var finishedBar = el('span');
		finishedBar.classList.add('bar', 'phase3');
		finishedBar.style.width = finished - gold + '%';
		var title = el('h4');
		title.textContent = from + ' > ' + to + ' : ' + p.finished + '/' + p.total + ' (' +p.gold + ') - ' + (new Date(p.date)).toISOString();

		totalBar.appendChild(goldBar);
		totalBar.appendChild(finishedBar);
		document.body.appendChild(title);
		document.body.appendChild(totalBar);
	});
});
