/** @jsx React.DOM */

// const colors

var GOLD = '#FFC200';
var BLUE = '#1493D1';
var WHITE = '#FFF';

// cell components

var ProgressBar = React.createClass({
	getBackgroundGradient: function(stops, direction) {
		direction = direction || 'to right';

		var gradient = stops.reduce(function(a, b) {
			var color = b;
			var percentage = '';
			// long form
			if (typeof b[1] == 'number') {
				color = b[0];
				percentage = ' ' + b[1] + '%';
			}

			return a + ', ' + color + percentage;
		}, direction);

		return 'linear-gradient(' + gradient + ')';
	},
	render: function() {
		var style = {
			backgroundImage: this.getBackgroundGradient(this.props.stops),
		};

		return (
			<div className="progress" style={style} title={this.props.title}>
				{this.props.content}
			</div>
		);
	}
});

var Skills = React.createClass({
	render: function() {
		var total = this.props.total;
		if (!total) {
			return <div className="skills"></div>
		}

		var date = '';
		if (this.props.date) {
			date = new Date(this.props.date);
			date = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
		}

		var gold = this.props.gold;
		var finished = this.props.finished;

		// percentages
		var goldP = Math.floor(gold / total * 100);
		var finishedP = Math.floor(finished / total * 100);

		// gradient
		var stops = [
			GOLD,
			[GOLD, goldP],
			[BLUE, goldP],
			[BLUE, finishedP],
			[WHITE, finishedP],
			WHITE
		];

		gold = gold ? (<span className="gold">{gold}</span>) : '';

		return (
			<div className="skills">
				<ProgressBar stops={stops} title={date + ' ' + goldP + '% ' + finishedP + '%'}/>
				{gold} {finished}/{total}
			</div>
		);
	}
});

// cells

var TotalCell = React.createClass({
	render: function() {
		var total = this.props.total;

		return (
			<th>
				<div className="total-xp">{total.xp} XP</div>
				<Skills finished={total.finished} total={total.total} gold={total.gold} date={total.date}/>
			</th>
		);
	}
});

var Cell = React.createClass({
	getCombo: function() {
		if (this.props.from <= this.props.to) {
			return this.props.from + this.props.to;
		}
		return this.props.to + this.props.from;
	},
	handleMouseEnter: function() {
		var event = new CustomEvent('cellEnter', {
			detail: {
				combo: this.getCombo()
			}
		});
		document.dispatchEvent(event);
	},
	handleMouseLeave: function() {
		var event = new CustomEvent('cellLeave', {
			detail: {
				combo: this.getCombo()
			}
		});
		document.dispatchEvent(event);
	},
	highlight: function(event) {
		if (event.detail.combo != this.getCombo())
			return;
		this.setState({
			highlighted: true
		});
	},
	unHighlight: function(event) {
		if (event.detail.combo != this.getCombo())
			return;
		this.setState({
			highlighted: false
		});
	},
	getInitialState: function() {
		return {
			highlighted: false
		};
	},
	componentDidMount: function() {
		document.addEventListener('cellEnter', this.highlight);
		document.addEventListener('cellLeave', this.unHighlight);
	},
	componentWillUnmount: function() {
		document.removeEventListener('cellEnter', this.highlight);
		document.removeEventListener('cellLeave', this.unHighlight);
	},
	render: function() {
		var from = this.props.from;
		var to = this.props.to;
		var course = this.props.course || {};

		var className = '';
		if (from == to) {
			className = 'impossible';
		} else if (course.phase) {
			className = 'phase' + course.phase;
		}
		if (this.state.highlighted) {
			className += ' highlighted';
		}
		if (course.completed) {
			className += ' owl owl-' + to;
		}

		var percentage;
		if (course.phase === 1) {
			percentage = <div className="percentage">{2 * Math.round(course.progress)}%</div>
		}
		var learners;
		if (course.learner_count) {
			learners = <div className="learners">{course.learner_count.learner_string}</div>
		}
		var words;
		if (course.words) {
			words = <div className="words">{course.words}w</div>
		}

		return (
			<td onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={className}>
				<a href={'http://incubator.duolingo.com/courses/' + to + '/' + from + '/status'}>
					{percentage}
					{learners}
					<Skills finished={course.finished} total={course.total} gold={course.gold} date={course.date}/>
					{words}
				</a>
			</td>
		);
	}
});

var FlagCell = React.createClass({
	render: function() {
		var lang = this.props.lang;

		return (
			<th>
				<div className={'flag flag-' + lang} title={lang}/>
			</th>
		);
	}
});

var ToCell = React.createClass({
	render: function() {
		if (!this.props.to) {
			return <th></th>
		}
		var lang = this.props.lang;
		var to = this.props.to;

		percent = Math.floor(to.currentXp / to.ceilXp * 100);
		content = to.currentXp + '/' + to.ceilXp;
		// gradient
		var stops = [
			GOLD,
			[GOLD, percent],
			[WHITE, percent],
			WHITE
		];

		return (
			<th>
				<div className="to">
					<div>{to.totalXp} XP</div>
					<div>Level {to.currentLevel}</div>
					<ProgressBar stops={stops} content={content}/>
				</div>
			</th>
		);
	}
});

// rows

// in header
var TosRow = React.createClass({
	render: function() {
		var tos = this.props.total.tos;

		return (
			<tr className="flags-row">
				<TotalCell total={this.props.total}/>
				{this.props.langs.map(function(lang) {
					return <ToCell key={lang} lang={lang} to={tos[lang]}/>
				})}
			</tr>
		);
	}
});

// in header
var FlagsRow = React.createClass({
	render: function() {
		return (
			<tr className="flags-row">
				<th>
					<div>To ></div>
					<div>From</div>
					<div>^</div>
				</th>
				{this.props.langs.map(function(lang) {
					return <FlagCell key={lang} lang={lang}/>
				})}
			</tr>
		);
	}
});

var Row = React.createClass({
	render: function() {
		var from = this.props.lang;
		var courses = this.props.courses || {};

		return (
			<tr>
				<FlagCell key={from} lang={from}/>
				{this.props.langs.map(function(to) {
					return <Cell key={from + to} from={from} to={to} course={courses[to]}/>
				})}
			</tr>
		);
	}
});

var GridHeader = React.createClass({
	render: function() {
		return (
			<thead>
				<FlagsRow langs={this.props.langs}/>
				<TosRow langs={this.props.langs} total={this.props.total}/>
			</thead>
		);
	}
});

// above the grid
var Phase = React.createClass({
	render: function() {
		var phase = this.props.phase;
		var coursesCount = this.props.courses.filter(function(course) {
			// TODO
			return course.phase == phase || (course.finished && phase == 4) || (course.completed && phase == 5);
		}).length;
		return (
			<div className={'phase' + phase}>
				{coursesCount} courses in phase {phase}
			</div>
		);
	}
});

// legend + table
var Grid = React.createClass({
	render: function() {
		var langs = this.props.langs;
		var courses = this.props.courses;
		var total = this.props.total;

		return (
			<div>
				<div className="legend">
					<div>{courses.list.length}/{langs.length * (langs.length - 1)} courses</div>
					{[1, 2, 3, 4, 5].map(function(phase) {
						return <Phase key={phase} phase={phase} courses={courses.list}/>
					})}
				</div>
				<table>
					<GridHeader langs={langs} total={total}/>
					<tbody>
						{langs.map(function(lang) {
							return <Row key={lang} lang={lang} langs={langs} courses={courses.tree[lang]}/>
						})}
					</tbody>
				</table>
			</div>
		);
	}
});

// bootstrap from globals in model.js
React.renderComponent(
	<Grid langs={langs} courses={courses} total={total}/>,
	document.body
);
